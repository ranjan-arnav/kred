from fastapi import APIRouter
from models import AnalysisRequest
from services.ml_model import predict_credit_score, FEATURE_NAMES
from services.cam_generator import generate_cam_content
import uuid

router = APIRouter(prefix="/api/analyze", tags=["Recommendation Engine"])

# Default financial profile — used ONLY when no financial data is provided
DEFAULT_FEATURES = {
    "dscr": 1.45, "current_ratio": 1.24, "debt_to_equity": 1.8,
    "ebitda_margin": 18.2, "revenue_growth_yoy": 14.5, "pat_margin": 8.6,
    "interest_coverage": 3.8, "cheque_bounce_rate": 2.1, "od_utilization": 62,
    "cash_deposit_concentration": 15, "gst_variance_pct": 12.5,
    "itc_mismatch_pct": 8.0, "promoter_holding_pct": 68, "years_in_business": 15,
    "cibil_score": 745, "industry_risk_score": 42, "asset_coverage_ratio": 1.9,
    "working_capital_days": 58, "export_revenue_pct": 22, "capex_to_revenue": 7.5
}


@router.post("")
async def generate_recommendation(request: AnalysisRequest):
    company_name = request.company_name

    # Merge user-provided data with defaults
    features = DEFAULT_FEATURES.copy()
    if request.financial_data:
        features.update(request.financial_data)

    # 1. Run ML Scoring Pipeline (XGBoost + SHAP + Five Cs)
    ml_result = predict_credit_score(features)

    # 2. Build context for LLM Judge
    insight_context = ""
    if request.insights:
        insight_context = "Primary Field Insights from Credit Officer:\n- " + "\n- ".join(request.insights)

    shap_summary = "\n".join([
        f"  {'↑' if s['type']=='positive' else '↓'} {s['feature']}: {s['value']} (impact: {s['impact']})"
        for s in ml_result["shap_values"][:6]
    ])

    full_context = f"""
    Company: {company_name}
    ML Credit Score: {ml_result['credit_score']}/900 (Grade: {ml_result['grade']} — {ml_result['grade_description']})
    Probability of Default: {ml_result['pd_probability']*100:.1f}%
    
    Five Cs Assessment:
      Character: {ml_result['five_c']['character']}/100
      Capacity:  {ml_result['five_c']['capacity']}/100
      Capital:   {ml_result['five_c']['capital']}/100
      Collateral:{ml_result['five_c']['collateral']}/100
      Conditions:{ml_result['five_c']['conditions']}/100
    
    Top SHAP Feature Drivers:
{shap_summary}
    
    ML Decision: {ml_result['decision']['verdict']}
    Suggested Limit: {ml_result['decision']['suggested_limit']}
    Suggested Rate:  {ml_result['decision']['suggested_rate']}
    
    {insight_context}
    """

    # 3. Multi-Agent Debate: DEMO MODE — instant text from ML metrics (no LLM calls)
    print(f"⚡ [Analysis API] DEMO MODE — generating instant response for {company_name}")
    bull_response = (
        f"The company demonstrates a credit score of {ml_result['credit_score']}/900 with "
        f"DSCR of {features.get('dscr', 'N/A')}x and revenue growth of "
        f"{features.get('revenue_growth_yoy', 'N/A')}%. Promoter holding at "
        f"{features.get('promoter_holding_pct', 'N/A')}% shows management commitment. "
        f"EBITDA margins remain healthy at {features.get('ebitda_margin', 'N/A')}% with "
        f"Interest Coverage at {features.get('interest_coverage', 'N/A')}x, well above the 2.0x threshold."
    )
    bear_response = (
        f"Caution warranted: GST variance of {features.get('gst_variance_pct', 'N/A')}% "
        f"and cheque bounce rate of {features.get('cheque_bounce_rate', 'N/A')}% indicate "
        f"potential cash flow stress. OD utilization at {features.get('od_utilization', 'N/A')}% "
        f"is elevated. ITC mismatch of {features.get('itc_mismatch_pct', 'N/A')}% and "
        f"debt-to-equity of {features.get('debt_to_equity', 'N/A')}x warrant close monitoring."
    )
    judge_response = (
        f"VERDICT: {ml_result['decision']['verdict']}. With a credit score of "
        f"{ml_result['credit_score']}/900 (Grade: {ml_result['grade']}) and probability of "
        f"default at {ml_result['pd_probability']*100:.1f}%, the risk-return profile supports "
        f"the Relationship Manager's position with standard conditions. "
        f"Proposed limit of {ml_result['decision']['suggested_limit']} at "
        f"{ml_result['decision']['suggested_rate']} is appropriate. Key conditions: "
        f"quarterly DSCR covenant at 1.20x minimum, OD utilization cap at 80%, and annual stock audit."
    )
    verdict = ml_result["decision"]["verdict"]

    # 4. Generate CAM content — DEMO MODE: instant fallback, no LLM
    print(f"⚡ [Analysis API] DEMO MODE — generating instant CAM for {company_name}")
    cam_content = generate_cam_content(
        company_name=company_name,
        ml_result=ml_result,
        input_features=features,
        bull_argument=bull_response,
        bear_argument=bear_response,
        judge_reasoning=judge_response,
        due_diligence_notes=request.insights if request.insights else [],
    )

    print(f"✅ [Analysis API] Complete! Returning payload to dashboard.")
    return {
        "session_id": str(uuid.uuid4()),
        "company": company_name,
        "model_metrics": {
            "score": ml_result["credit_score"],
            "grade": ml_result["grade"],
            "grade_description": ml_result["grade_description"],
            "pd_probability": ml_result["pd_probability"],
            "five_c": ml_result["five_c"]
        },
        "shap_values": ml_result["shap_values"],
        "committee_decision": {
            "verdict": verdict,
            "suggested_limit": ml_result["decision"]["suggested_limit"],
            "suggested_rate": ml_result["decision"]["suggested_rate"],
            "risk_premium_bps": ml_result["decision"]["risk_premium_bps"],
            "judge_reasoning": judge_response,
            "bull_argument": bull_response,
            "bear_argument": bear_response
        },
        "cam_content": cam_content,
        "input_features": features
    }
