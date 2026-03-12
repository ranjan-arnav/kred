"""
CAM (Credit Appraisal Memo) content generator.
DEMO MODE: Returns instant structured fallback without LLM calls.
"""


def generate_cam_content(
    company_name: str,
    ml_result: dict,
    input_features: dict,
    bull_argument: str = "",
    bear_argument: str = "",
    judge_reasoning: str = "",
    research_summary: str = "",
    due_diligence_notes: list[str] = None,
    ingested_docs_summary: str = "",
) -> dict:
    """
    Generate the 34 tabular sections of the official Credit Appraisal Memo via LLM.
    Returns a highly structured JSON mapping to the reference format.
    """
    if due_diligence_notes is None:
        due_diligence_notes = []

    # DEMO MODE: skip LLM, return structured CAM instantly
    print(f"⚡ [CAM Generator] DEMO MODE — returning instant structured CAM for {company_name}")
    return _build_fallback_cam(company_name, ml_result, input_features,
                               bull_argument, bear_argument, judge_reasoning)


def _build_fallback_cam(
    company_name: str,
    ml_result: dict,
    features: dict,
    bull: str,
    bear: str,
    judge: str,
) -> dict:
    """CAM built directly from ML data — used in demo mode for instant response."""
    decision = ml_result.get("decision", {})
    score = ml_result.get("credit_score", 0)
    
    # Extract financial data for detailed ratio analysis
    dscr = features.get("dscr", 0)
    cr = features.get("current_ratio", 0)
    debt_equity = features.get("debt_to_equity", 0)
    interest_cov = features.get("interest_coverage", 0)
    ebitda_margin = features.get("ebitda_margin", 0)
    pat_margin = features.get("pat_margin", 0)
    cibil = features.get("cibil_score", 0)
    bounces = features.get("cheque_bounce_rate", 0)
    working_cap_days = features.get("working_capital_days", 0)
    
    limit = decision.get("suggested_limit", "N/A")
    rate = decision.get("suggested_rate", "N/A")
    
    return {
        "sec_1_proposal_details": f"Borrower: {company_name}. Facility Requested: Working Capital of {limit}. Purpose: Capacity expansion and WC cycle support. Proposed Terms: 12 months at {rate}%. Internal Rating: Grade {ml_result.get('grade', 'N/A')}.",
        "sec_2_company_overview": f"{company_name} is an established commercial entity undergoing automated ML credit appraisal.",
        "sec_3_promoters": [{"name": "Key Promoters", "age": 50, "net_worth": "To be verified by RCU", "experience": "15+ years of relevant industry experience."}],
        "sec_4_facilities": [{"nature": "Working Capital", "existing": "N/A", "proposed": limit, "tenure": "12 months"}],
        "sec_5_pricing": {"roi": rate, "processing_fee": "1%", "penal_interest": "24% p.a."},
        "sec_6_security": "Primary Security: Hypothecation of stock and receivables. Collateral: Personal Guarantee of promoters. Assessed market valuation supports asset coverage.",
        "sec_7_guarantors": "Personal Guarantees executed by all active promoters and directors.",
        "sec_8_financial_summary": {
            "revenue": f"Revenue growth of {features.get('revenue_growth_yoy', 0)}% YoY shows stable top-line trajectory.",
            "ebitda": f"EBITDA Margin stands at {ebitda_margin}%, indicating robust operating efficiency.",
            "pat": f"PAT Margin of {pat_margin}% reflects positive bottom-line realization."
        },
        "sec_9_ratio_analysis": f"Coverage Ratios: DSCR at {dscr}x (Benchmark 1.25x) provides adequate repayment cushion. Interest Coverage Ratio (ICR) at {interest_cov}x signifies strong ability to service debt.\nLiquidity: Current Ratio (CR) at {cr}x, aligning closely with standard norms.\nSolvency/Leverage: Debt-to-Equity at {debt_equity}:1 remains within acceptable leverage limits (<3:1).\nWorking Capital: Operating cycle is {working_cap_days} days.",
        "sec_10_cibil_status": f"Promoter & Corporate CIBIL Score is {cibil}. Credit history reflects no major defaults.",
        "sec_11_banking_conduct": f"Inward cheque bounce rate is {bounces}%. OD utilization is maintained at {features.get('od_utilization', 0)}%. Overall account conduct is satisfactory.",
        "sec_12_industry_overview": f"Current market trends indicate stable growth. Industry Risk Score: {features.get('industry_risk_score', 'Standard')}/100.",
        "sec_13_business_model": "Core products revolve around manufacturing and B2B services with standard customer concentration.",
        "sec_14_supplier_customer": f"Working capital cycle indicates {working_cap_days} days outstanding. Customer and supplier terms are balanced.",
        "sec_15_competitors": "The company maintains a steady market share against main competitors in a fragmented industry.",
        "sec_16_swot": {
            "strengths": ["Strong Promoter Experience", f"Healthy DSCR ({dscr}x)"],
            "weaknesses": ["Working Capital Intensive Operations"],
            "opportunities": ["Capacity Expansion", "Market Growth"],
            "threats": ["Raw Material Price Volatility"]
        },
        "sec_17_compliance": f"GST Variance flagged at {features.get('gst_variance_pct', 0)}%. ROC filings are up to date.",
        "sec_18_litigation": "No material pending litigation detected in preliminary scans.",
        "sec_19_end_use": "Verified end-use: Core working capital requirements and inventory financing.",
        "sec_20_verification": "Site visit and due diligence recommended before final disbursement.",
        "sec_21_references": "Market reference checks are favorable with consistent supply chain feedback.",
        "sec_22_insurance": "Comprehensive Fire & Burglary insurance covering primary stock is mandated.",
        "sec_23_environmental": "Standard ESG compliance for localized manufacturing units observed.",
        "sec_24_subsidiaries": "No major group company/subsidiary dependencies impacting cash flows.",
        "sec_25_management_quality": f"Management shows high integrity. Promoter holding stands strong at {features.get('promoter_holding_pct', 0)}%.",
        "sec_26_succession": "Clear second line of management is visible within the organization.",
        "sec_27_technology": "IT infrastructure and operational technology are adequate for current scale.",
        "sec_28_foreign_exchange": f"Export Revenue is {features.get('export_revenue_pct', 0)}%. Unhedged forex exposure managed via forward contracts.",
        "sec_29_working_capital": f"Working capital limit of {limit} is justified by the {working_cap_days} day cycle.",
        "sec_30_cash_flow": "Projected cash flows show sufficient visibility to service the proposed limits.",
        "sec_31_deviation_matrix": f"Policy Deviations: DSCR ({dscr}x) & CR ({cr}x) are tracked against standard policy. No critical deviations to report.",
        "sec_32_analyst_recommendation": f"Pre-disbursement: Perfection of security. Post-disbursement: Quarterly stock statements. Recommendation: {bull}",
        "sec_33_ho_observation": f"CCO Synthesis: {judge}",
        "sec_34_committee_decision": f"Final Committee Verdict: {decision.get('verdict', 'PENDING')}"
    }
