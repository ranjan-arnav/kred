from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse
import os
import tempfile
import datetime

router = APIRouter(prefix="/api/cam", tags=["Report Generation"])

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import black, white, red, green, Color
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


ACCENT = Color(1, 0.2, 0, 1)  # #FF3300


def _build_cam_pdf(path: str, data: dict):
    """Generate a professional A4 Credit Appraisal Memo PDF"""
    if not HAS_REPORTLAB:
        with open(path, 'w') as f:
            f.write(f"%%PDF-1.4\n%Credit Appraisal Memo\n%Date: {datetime.date.today()}")
        return

    doc = SimpleDocTemplate(path, pagesize=A4,
                            leftMargin=25*mm, rightMargin=25*mm,
                            topMargin=20*mm, bottomMargin=20*mm)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('Title2', parent=styles['Title'], fontSize=22, spaceAfter=4, textColor=black))
    styles.add(ParagraphStyle('SectionHead', parent=styles['Heading2'], fontSize=13, spaceBefore=16, spaceAfter=6,
                              textColor=ACCENT, borderWidth=0, borderPadding=0))
    styles.add(ParagraphStyle('BodyJ', parent=styles['Normal'], fontSize=10, leading=14, alignment=TA_JUSTIFY))
    styles.add(ParagraphStyle('SmallMono', parent=styles['Normal'], fontSize=8, fontName='Courier', textColor=Color(0.4,0.4,0.4)))

    story = []

    # Header
    story.append(Paragraph("CREDIT APPRAISAL MEMO", styles['Title2']))
    story.append(Paragraph("Strictly Confidential • Internal Use Only", styles['SmallMono']))
    story.append(Spacer(1, 4*mm))
    story.append(HRFlowable(width="100%", thickness=2, color=black))
    story.append(Spacer(1, 3*mm))

    company = data.get("company", "Company Name")
    metrics = data.get("model_metrics", {})
    decision = data.get("committee_decision", {})
    five_c = metrics.get("five_c", {})

    # Metadata table
    meta = [
        ["Borrower", company, "Date", str(datetime.date.today())],
        ["Credit Score", f"{metrics.get('score', 'N/A')}/900", "Grade", metrics.get('grade', 'N/A')],
        ["PD", f"{metrics.get('pd_probability', 0)*100:.1f}%", "Verdict", decision.get('verdict', 'N/A')],
    ]
    t = Table(meta, colWidths=[70, 150, 70, 150])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, Color(0.8,0.8,0.8)),
    ]))
    story.append(t)
    story.append(Spacer(1, 6*mm))

    # Section 1: Executive Summary
    story.append(Paragraph("01 — EXECUTIVE SUMMARY", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=Color(0.8,0.8,0.8)))
    story.append(Spacer(1, 2*mm))
    summary = decision.get("judge_reasoning", "Analysis pending.")
    story.append(Paragraph(summary, styles['BodyJ']))
    story.append(Spacer(1, 4*mm))

    # Section 2: Five Cs Assessment
    story.append(Paragraph("02 — FIVE Cs OF CREDIT", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=Color(0.8,0.8,0.8)))
    story.append(Spacer(1, 2*mm))
    cs_data = [["Dimension", "Score", "Assessment"]]
    for c_name, c_key in [("Character", "character"), ("Capacity", "capacity"),
                           ("Capital", "capital"), ("Collateral", "collateral"), ("Conditions", "conditions")]:
        val = five_c.get(c_key, 0)
        assessment = "Strong" if val >= 75 else ("Adequate" if val >= 55 else "Weak")
        cs_data.append([c_name, f"{val}/100", assessment])
    
    ct = Table(cs_data, colWidths=[120, 80, 240])
    ct.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), Color(0.95, 0.95, 0.95)),
        ('GRID', (0, 0), (-1, -1), 0.5, Color(0.8, 0.8, 0.8)),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(ct)
    story.append(Spacer(1, 4*mm))

    # Section 3: SHAP Feature Attribution
    story.append(Paragraph("03 — KEY RISK DRIVERS (SHAP)", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=Color(0.8,0.8,0.8)))
    story.append(Spacer(1, 2*mm))
    shap_data = [["Feature", "Value", "Impact", "Direction"]]
    for sv in data.get("shap_values", [])[:8]:
        shap_data.append([sv["feature"], sv["value"], f"{sv['impact']:.1f}", sv["type"].upper()])
    st = Table(shap_data, colWidths=[160, 80, 60, 80])
    st.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), Color(0.95, 0.95, 0.95)),
        ('GRID', (0, 0), (-1, -1), 0.5, Color(0.8, 0.8, 0.8)),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(st)
    story.append(Spacer(1, 4*mm))

    # Section 4: Debate Transcript
    story.append(Paragraph("04 — CREDIT COMMITTEE DEBATE", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=Color(0.8,0.8,0.8)))
    story.append(Spacer(1, 2*mm))

    bull = decision.get("bull_argument", "N/A")
    bear = decision.get("bear_argument", "N/A")
    story.append(Paragraph(f"<b>Bull (Relationship Manager):</b> {bull}", styles['BodyJ']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(f"<b>Bear (Risk Officer):</b> {bear}", styles['BodyJ']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(f"<b>Judge (Chief Credit Officer):</b> {summary}", styles['BodyJ']))
    story.append(Spacer(1, 6*mm))

    # Section 5: Recommendation
    story.append(Paragraph("05 — FINAL RECOMMENDATION", styles['SectionHead']))
    story.append(HRFlowable(width="100%", thickness=0.5, color=Color(0.8,0.8,0.8)))
    story.append(Spacer(1, 2*mm))
    rec_data = [
        ["Decision", decision.get("verdict", "N/A")],
        ["Suggested Limit", decision.get("suggested_limit", "N/A")],
        ["Interest Rate", decision.get("suggested_rate", "N/A")],
        ["Risk Premium", f"{decision.get('risk_premium_bps', 0)} bps over Repo Rate"],
    ]
    rt = Table(rec_data, colWidths=[150, 290])
    rt.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, black),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(rt)

    # Footer
    story.append(Spacer(1, 15*mm))
    story.append(HRFlowable(width="100%", thickness=1, color=black))
    story.append(Paragraph(f"Generated by Kred v2.0 • {datetime.date.today()}", styles['SmallMono']))

    doc.build(story)


# In-memory session store for analysis results
_session_store = {}


@router.get("/{session_id}")
async def download_cam(session_id: str, background_tasks: BackgroundTasks):
    """Generate and download a professional CAM PDF, cleaning up the temp file after serving."""
    data = _session_store.get(session_id, {
        "company": "Bharat Steelworks Ltd",
        "model_metrics": {"score": 745, "grade": "A", "grade_description": "Upper Medium", "pd_probability": 0.08,
                          "five_c": {"character": 78, "capacity": 82, "capital": 65, "collateral": 90, "conditions": 70}},
        "shap_values": [],
        "committee_decision": {"verdict": "CONDITIONAL", "suggested_limit": "₹25.0 Cr", "suggested_rate": "9.25%",
                               "risk_premium_bps": 275, "judge_reasoning": "Conditional approval recommended.",
                               "bull_argument": "N/A", "bear_argument": "N/A"}
    })

    # Write to the OS temp directory so it is always cleaned up
    fd, pdf_path = tempfile.mkstemp(suffix=".pdf", prefix=f"kred_cam_{session_id}_")
    os.close(fd)
    _build_cam_pdf(pdf_path, data)
    background_tasks.add_task(os.remove, pdf_path)
    return FileResponse(pdf_path, media_type='application/pdf', filename=f"KRED_CAM_{session_id}.pdf")


@router.post("/store")
async def store_session(data: dict):
    """Store analysis data for PDF generation"""
    sid = data.get("session_id", str(__import__('uuid').uuid4()))
    _session_store[sid] = data
    return {"status": "stored", "session_id": sid}
