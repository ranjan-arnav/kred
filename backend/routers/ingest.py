from fastapi import APIRouter, UploadFile, File, HTTPException
import fitz  # PyMuPDF
import re
import io
import traceback

router = APIRouter(prefix="/api/ingest", tags=["Ingestor"])

# Indian financial regex patterns
PATTERNS = {
    "amounts_crore": r'(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?\s*(?:Cr(?:ore)?|Crores)',
    "amounts_lakh": r'(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?\s*(?:L(?:akh)?|Lakhs|Lac)',
    "amounts_general": r'(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?',
    "pan": r'\b[A-Z]{5}\d{4}[A-Z]\b',
    "gstin": r'\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d][A-Z]\b',
    "cin": r'\b[LU]\d{5}[A-Z]{2}\d{4}(?:PLC|PTC|FLC|GAP|NPL|OPC)\d{6}\b',
    "dates": r'\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{1,2}[\s,]+\d{4})\b',
    "percentages": r'\b\d+(?:\.\d+)?%',
    "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    "phone": r'(?:\+91[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5}|\d{3}[\s-]\d{3}[\s-]\d{4})',
}

# Risk keywords for Indian corporate context
RISK_KEYWORDS = [
    "default", "npa", "non-performing", "wilful defaulter", "fraud",
    "litigation", "nclt", "insolvency", "ibc", "ed probe",
    "enforcement directorate", "arrest", "scam", "circular trading",
    "revenue inflation", "gst mismatch", "itc mismatch",
    "cheque bounce", "cheque dishon", "overdue", "past due",
    "restructuring", "one-time settlement", "ots", "write-off",
    "rating downgrade", "negative outlook", "watch list",
    "contingent liability", "related party", "diversion of funds",
    "siphoning", "money laundering", "benami", "shell company"
]

POSITIVE_KEYWORDS = [
    "growth", "expansion", "profit", "dividend", "order book",
    "capacity utilization", "export", "market share", "rating upgrade",
    "positive outlook", "stable outlook", "aaa", "aa+", "aa",
    "debt reduction", "cash surplus", "revenue increase",
    "crisil", "icra", "care", "investment grade"
]

FINANCIAL_TERMS = [
    "revenue", "turnover", "sales", "ebitda", "ebit", "pat", "pbt",
    "net profit", "gross profit", "operating profit", "cash flow",
    "debt", "equity", "net worth", "total assets", "current assets",
    "current liabilities", "working capital", "dscr", "debt service",
    "interest coverage", "current ratio", "quick ratio", "roe", "roa",
    "debt equity", "d/e ratio", "promoter holding", "shareholding",
    "depreciation", "amortization", "capex", "capital expenditure"
]


def extract_financial_figures(text: str) -> list:
    """Extract monetary amounts with context."""
    figures = []
    for match in re.finditer(r'(.{0,60})((?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d+)?(?:\s*(?:Cr(?:ore)?s?|L(?:akh)?s?|Lac))?)', text, re.IGNORECASE):
        context = match.group(1).strip()
        amount = match.group(2).strip()
        # Clean context
        context = re.sub(r'\s+', ' ', context)
        if len(context) > 5:
            figures.append({"context": context[-50:], "amount": amount})
    return figures[:20]  # Top 20


def classify_document(text: str) -> str:
    """Classify document type from content."""
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["annual report", "board of directors", "statutory audit", "notes to accounts"]):
        return "ANNUAL_REPORT"
    elif any(kw in text_lower for kw in ["sanction letter", "credit facility", "loan agreement", "term loan"]):
        return "SANCTION_LETTER"
    elif any(kw in text_lower for kw in ["bank statement", "account statement", "transaction history", "opening balance"]):
        return "BANK_STATEMENT"
    elif any(kw in text_lower for kw in ["gst return", "gstr", "gstin", "tax invoice"]):
        return "GST_FILING"
    elif any(kw in text_lower for kw in ["legal notice", "court order", "nclt", "arbitration"]):
        return "LEGAL_DOCUMENT"
    elif any(kw in text_lower for kw in ["balance sheet", "profit and loss", "income statement", "financial statement"]):
        return "FINANCIAL_STATEMENT"
    else:
        return "GENERAL_DOCUMENT"


def detect_risk_signals(text: str) -> list:
    """Find risk keywords in document text."""
    text_lower = text.lower()
    found = []
    for kw in RISK_KEYWORDS:
        if kw in text_lower:
            # Find context around the keyword
            idx = text_lower.index(kw)
            start = max(0, idx - 40)
            end = min(len(text), idx + len(kw) + 40)
            context = text[start:end].strip()
            context = re.sub(r'\s+', ' ', context)
            found.append({"keyword": kw, "context": context, "severity": "HIGH" if kw in ["default", "fraud", "wilful defaulter", "ed probe", "arrest"] else "MEDIUM"})
    return found


def detect_positive_signals(text: str) -> list:
    """Find positive indicators in document text."""
    text_lower = text.lower()
    found = []
    for kw in POSITIVE_KEYWORDS:
        if kw in text_lower:
            idx = text_lower.index(kw)
            start = max(0, idx - 40)
            end = min(len(text), idx + len(kw) + 40)
            context = text[start:end].strip()
            context = re.sub(r'\s+', ' ', context)
            found.append({"keyword": kw, "context": context})
    return found


@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Read file into memory
        contents = await file.read()
        pdf_bytes = io.BytesIO(contents)
        
        # Open with PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # Extract text from all pages
        full_text = ""
        page_texts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            full_text += text + "\n"
            if text.strip():
                page_texts.append({
                    "page": page_num + 1,
                    "chars": len(text),
                    "preview": text[:200].strip()
                })
        
        doc.close()
        
        # Run all extraction patterns
        extracted = {}
        for name, pattern in PATTERNS.items():
            matches = list(set(re.findall(pattern, full_text, re.IGNORECASE)))
            if matches:
                extracted[name] = matches[:10]
        
        # Classify document type
        doc_type = classify_document(full_text)
        
        # Extract financial figures with context
        financial_figures = extract_financial_figures(full_text)
        
        # Detect risk and positive signals
        risk_signals = detect_risk_signals(full_text)
        positive_signals = detect_positive_signals(full_text)
        
        # Find financial terms mentioned
        mentioned_terms = [t for t in FINANCIAL_TERMS if t in full_text.lower()]
        
        # Build summary stats
        total_chars = len(full_text)
        total_pages = len(page_texts)
        
        return {
            "status": "success",
            "filename": file.filename,
            "document_type": doc_type,
            "stats": {
                "pages_parsed": total_pages,
                "total_characters": total_chars,
                "pages_with_text": len([p for p in page_texts if p["chars"] > 10]),
            },
            "extracted_identifiers": {
                "pan_numbers": extracted.get("pan", []),
                "gstin_numbers": extracted.get("gstin", []),
                "cin_numbers": extracted.get("cin", []),
                "emails": extracted.get("email", []),
                "phones": extracted.get("phone", []),
            },
            "financial_data": {
                "amounts_detected": len(financial_figures),
                "figures": financial_figures,
                "percentages": extracted.get("percentages", []),
                "dates_found": extracted.get("dates", []),
                "financial_terms_mentioned": mentioned_terms,
            },
            "risk_analysis": {
                "risk_signals": risk_signals,
                "positive_signals": positive_signals,
                "risk_count": len(risk_signals),
                "positive_count": len(positive_signals),
            },
            "page_previews": page_texts[:5],
            "full_text_preview": full_text[:2000].strip() if full_text.strip() else "(No extractable text — may be scanned PDF)",
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")


@router.post("/bank")
async def upload_bank_statement(file: UploadFile = File(...)):
    """Upload bank statement (CSV or PDF)."""
    filename = file.filename.lower()
    
    if not (filename.endswith(".csv") or filename.endswith(".pdf")):
        raise HTTPException(status_code=400, detail="CSV or PDF files allowed for bank statements")

    try:
        contents = await file.read()
        
        if filename.endswith(".pdf"):
            # Parse bank statement PDF
            pdf_bytes = io.BytesIO(contents)
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            full_text = ""
            for page in doc:
                full_text += page.get_text("text") + "\n"
            doc.close()
            
            # Extract transaction-related patterns
            amounts = re.findall(r'[\d,]+\.\d{2}', full_text)
            dates = re.findall(PATTERNS["dates"], full_text)
            
            # Look for credit/debit keywords
            credits = len(re.findall(r'\b(?:credit|cr|deposit|neft cr|rtgs cr|imps cr)\b', full_text, re.IGNORECASE))
            debits = len(re.findall(r'\b(?:debit|dr|withdrawal|neft dr|rtgs dr|imps dr|emi|ecs)\b', full_text, re.IGNORECASE))
            bounced = len(re.findall(r'\b(?:bounce|dishon|return|unpaid|insufficient)\b', full_text, re.IGNORECASE))
            
            total_entries = max(len(amounts), 1)
            
            return {
                "status": "success",
                "filename": file.filename,
                "format": "pdf",
                "parsing_summary": {
                    "total_transactions_detected": total_entries,
                    "credit_entries": credits,
                    "debit_entries": debits,
                    "cheque_bounces_detected": bounced,
                    "date_range": f"{dates[0]} to {dates[-1]}" if len(dates) >= 2 else "N/A",
                },
                "reconciliation": {
                    "total_credits_detected": credits,
                    "total_debits_detected": debits,
                    "bounce_rate": f"{round(bounced / total_entries * 100, 1)}%" if bounced > 0 else "0%",
                    "od_utilization": "Analysis requires structured data",
                },
                "text_preview": full_text[:1500].strip(),
            }
        else:
            # CSV parsing
            text = contents.decode("utf-8", errors="ignore")
            lines = text.strip().split("\n")
            return {
                "status": "success", 
                "filename": file.filename,
                "format": "csv",
                "parsing_summary": {
                    "total_rows": len(lines) - 1,
                    "columns_detected": lines[0] if lines else "N/A",
                },
                "text_preview": text[:1500],
            }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Bank statement parsing failed: {str(e)}")
