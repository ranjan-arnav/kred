from fastapi import APIRouter
from models import ResearchRequest

router = APIRouter(prefix="/api/research", tags=["Research"])

@router.post("")
async def perform_research(request: ResearchRequest):
    company_name = request.company_name

    # DEMO MODE: Return instant hardcoded research data (no live API/LLM calls)
    news_results = [
        {"title": f"{company_name} Q2 FY25 Revenue Up 18% YoY on Strong Export Demand", "snippet": f"Revenues grew 18.2% year-on-year to ₹312 Cr driven by capacity expansion in the Eastern unit. EBITDA margins held at 14.8%.", "url": "#"},
        {"title": f"{company_name} Wins ₹85 Cr Government Tender for Infrastructure Supply", "snippet": "The company has been awarded a 3-year supply contract from NHAI. This adds 28% visibility to FY26 order book.", "url": "#"},
        {"title": f"{company_name} Under Scrutiny for Delayed GST Reconciliation Filing", "snippet": "A compliance notice was issued by the GST department for delayed GSTR-9C filing. Management has filed for extension.", "url": "#"},
        {"title": f"Promoters of {company_name} Increase Stake by 2.3% via Open Market", "snippet": "Promoter group raised holding from 62.4% to 64.7%, signalling confidence. No pledge increase reported.", "url": "#"},
        {"title": f"Rating Agency Maintains {company_name} at BBB+ with Stable Outlook", "snippet": "CRISIL reaffirmed the long-term rating citing adequate liquidity and consistent debt servicing track record.", "url": "#"},
    ]
    mca_results = [
        {"title": f"{company_name} — Annual Return Filed (MCA Portal)", "snippet": "Annual return for FY 2023-24 filed on time. Directors: 7 (3 independent). Authorized Capital: ₹75 Cr. Paid-up: ₹42.5 Cr.", "url": "#"},
        {"title": f"{company_name} Board Resolution — New Term Loan Approval", "snippet": "EGM resolution passed for ₹45 Cr term loan from Punjab National Bank for capacity expansion. Charge registered with MCA.", "url": "#"},
    ]
    legal_results = [
        {"title": f"No Active NCLT / IBC Proceedings for {company_name}", "snippet": "NCLT database search returned no insolvency petitions, winding-up orders, or admitted applications for the entity.", "url": "#"},
        {"title": f"{company_name} vs Reliance Logistics — Arbitration Award Settled", "snippet": "A ₹1.2 Cr arbitration dispute settled amicably in Q3 FY24. No pending court orders.", "url": "#"},
    ]
    sector_results = [
        {"title": "RBI Raises MSME Priority Sector Threshold to ₹50 Cr", "snippet": "New RBI directive expands PSL classification benefits to mid-size manufacturers, improving credit access.", "url": "#"},
        {"title": "Steel & Metal Sector: Input Cost Pressure Easing in H2 FY25", "snippet": "Domestic HRC prices down 8% from peak. Margin recovery expected for downstream manufacturers in next 2 quarters.", "url": "#"},
    ]

    bull_response = (
        f"• Revenue growing at 18% YoY with healthy order book visibility of 28% addition\n"
        f"• Promoter stake increase signals management confidence with zero pledge addition\n"
        f"• CRISIL BBB+ stable outlook — no rating watch or negative action\n"
        f"• MCA filings current; no default in board resolution history\n"
        f"• Government contract win reduces revenue concentration risk"
    )
    bear_response = (
        f"• Minor GST compliance notice for delayed GSTR-9C — not material but needs monitoring\n"
        f"• Arbitration history (now settled) indicates commercial disputes in supply chain\n"
        f"• Sector input cost exposure — any reversal in commodity prices may compress margins\n"
        f"• Moderate revenue concentration in Eastern unit — geographic risk\n"
        f"• Dependent on government/PSU orders which may face budget cut delays"
    )
    sentiment_score = 72
    total_findings = len(news_results) + len(mca_results) + len(legal_results) + len(sector_results)

    return {
        "status": "success",
        "company": company_name,
        "raw_news": news_results,
        "mca_filings": mca_results,
        "legal_records": legal_results,
        "sector_intelligence": sector_results,
        "analysis": {
            "positive_signals": bull_response,
            "risk_signals": bear_response,
            "sentiment_score": sentiment_score
        },
        "sources_searched": len(news_results) + len(mca_results) + len(legal_results) + len(sector_results)
    }
