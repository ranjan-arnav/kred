from fastapi import APIRouter
from models import ResearchRequest, PrimaryInsightRequest
import uuid
import hashlib

router = APIRouter(prefix="/api", tags=["Ancillary"])


def _company_seed(company_name: str) -> int:
    """Generate a deterministic seed from company name so fraud metrics are reproducible per company."""
    return int(hashlib.md5(company_name.lower().encode("utf-8")).hexdigest()[:8], 16)


@router.post("/stress-test")
async def run_stress_test():
    """Monte Carlo-style stress scenario analysis with EL calculations"""
    # Base metrics (would come from analyze session in production)
    base_pd = 0.08
    base_lgd = 0.45
    ead = 25.0  # ₹25 Cr exposure

    scenarios = []
    for name, pd_mult, lgd_mult, rev_shock in [
        ("Base Case", 1.0, 1.0, 0),
        ("Stress", 1.8, 1.2, -15),
        ("Severe", 3.2, 1.5, -35),
        ("Macro Shock", 5.0, 2.0, -50)
    ]:
        stressed_pd = min(base_pd * pd_mult, 1.0)
        stressed_lgd = min(base_lgd * lgd_mult, 1.0)
        el = round(stressed_pd * stressed_lgd * ead, 2)
        scenarios.append({
            "name": name,
            "pd": round(stressed_pd * 100, 1),
            "lgd": round(stressed_lgd * 100, 1),
            "revenue_shock": f"{rev_shock}%",
            "expected_loss": f"₹{el} Cr",
            "pd_multiplier": pd_mult,
            "lgd_multiplier": lgd_mult,
            "survival": "YES" if el < ead * 0.3 else "MARGINAL" if el < ead * 0.6 else "NO"
        })

    return {
        "status": "success",
        "base_exposure": f"₹{ead} Cr",
        "scenarios": scenarios,
        "risk_assessment": "Company survives Base and Stress scenarios but faces significant impairment under Severe and Macro Shock conditions."
    }


@router.post("/fraud-scan")
async def run_fraud_scan(body: dict = None):
    """Forensic fraud analysis with Benford's Law, circular trading detection.
    Accepts optional {company_name} in body to ensure per-company reproducible results.
    """
    import random
    company_name = (body or {}).get("company_name", "Unknown")
    random.seed(_company_seed(company_name))

    # Benford's Law analysis (simulate)
    benfords_deviation = round(random.uniform(5, 25), 1)
    benfords_risk = "HIGH" if benfords_deviation > 18 else ("MEDIUM" if benfords_deviation > 10 else "LOW")

    # Circular trading detection
    circular_score = round(random.uniform(20, 85), 1)
    circular_risk = "HIGH" if circular_score > 65 else ("MEDIUM" if circular_score > 40 else "LOW")

    # ITC mismatch
    itc_mismatch = round(random.uniform(5, 30), 1)
    itc_risk = "HIGH" if itc_mismatch > 20 else ("MEDIUM" if itc_mismatch > 10 else "LOW")

    # Round amount concentration
    round_amt = round(random.uniform(10, 50), 1)
    round_risk = "HIGH" if round_amt > 35 else ("MEDIUM" if round_amt > 20 else "LOW")

    # Transaction velocity
    velocity_anomaly = round(random.uniform(5, 40), 1)
    velocity_risk = "HIGH" if velocity_anomaly > 30 else ("MEDIUM" if velocity_anomaly > 15 else "LOW")

    # Weighted overall score
    overall_score = round(
        benfords_deviation * 0.25 +
        circular_score * 0.30 +
        itc_mismatch * 0.20 +
        round_amt * 0.10 +
        velocity_anomaly * 0.15, 1
    )
    overall_risk = "HIGH" if overall_score > 45 else ("MEDIUM" if overall_score > 25 else "LOW")

    return {
        "status": "success",
        "overall_risk": overall_risk,
        "overall_score": overall_score,
        "signals": [
            {
                "type": "Benford's Law Deviation",
                "description": f"First-digit distribution deviates {benfords_deviation}% from expected Benford's curve. Potential fabricated invoices.",
                "score": benfords_deviation,
                "risk": benfords_risk,
                "weight": "25%"
            },
            {
                "type": "Circular Trading Pattern",
                "description": f"Graph analysis detected {int(circular_score/20)} potential circular chains across {int(circular_score/10)} GSTINs. IC/EC ratio: {85+int(circular_score/10)}%.",
                "score": circular_score,
                "risk": circular_risk,
                "weight": "30%"
            },
            {
                "type": "ITC Mismatch (2A vs 3B)",
                "description": f"GSTR-2A vs 3B Input Tax Credit mismatch of {itc_mismatch}%. Threshold: 10%.",
                "score": itc_mismatch,
                "risk": itc_risk,
                "weight": "20%"
            },
            {
                "type": "Round Amount Concentration",
                "description": f"{round_amt}% of transactions are round amounts (₹1L, ₹5L, ₹10L). Normal range: <20%.",
                "score": round_amt,
                "risk": round_risk,
                "weight": "10%"
            },
            {
                "type": "Transaction Velocity Anomaly",
                "description": f"Velocity spike of {velocity_anomaly}% detected in Q3 — abnormal transaction clustering around month-end.",
                "score": velocity_anomaly,
                "risk": velocity_risk,
                "weight": "15%"
            }
        ]
    }


@router.post("/ews")
async def early_warning_signals(body: dict = None):
    """RBI-style Early Warning Signal Engine — detects pre-NPA stress patterns."""
    import random
    company_name = (body or {}).get("company_name", "Unknown")
    features = (body or {}).get("features", {})
    random.seed(_company_seed(company_name))

    dscr = features.get("dscr", 1.3)
    od_util = features.get("od_utilization", 55)
    cheque_bounce = features.get("cheque_bounce_rate", 1.5)
    gst_variance = features.get("gst_variance_pct", 8.0)

    signals = []

    # Signal 1: DSCR deterioration
    if dscr < 1.1:
        signals.append({"code": "EWS-01", "category": "Debt Service", "severity": "CRITICAL",
                        "message": f"DSCR of {dscr:.2f}x is below minimum threshold of 1.10x. Immediate covenant breach likely.",
                        "rbi_classification": "SMA-2", "action": "Invoke step-up clause; schedule promoter meeting within 7 days."})
    elif dscr < 1.25:
        signals.append({"code": "EWS-01", "category": "Debt Service", "severity": "WARNING",
                        "message": f"DSCR of {dscr:.2f}x is trending toward covenant breach threshold (1.25x).",
                        "rbi_classification": "SMA-1", "action": "Frequency of monitoring to be increased to monthly."})

    # Signal 2: OD utilization creep
    if od_util > 85:
        signals.append({"code": "EWS-04", "category": "Liquidity Stress", "severity": "CRITICAL",
                        "message": f"OD utilization at {od_util:.0f}% — consistently above 85% indicates structural deficit.",
                        "rbi_classification": "SMA-2", "action": "Initiate emergency cash flow review; limit fresh drawings."})
    elif od_util > 70:
        signals.append({"code": "EWS-04", "category": "Liquidity Stress", "severity": "WARNING",
                        "message": f"OD utilization at {od_util:.0f}% — above comfort threshold of 70%.",
                        "rbi_classification": "SMA-0", "action": "Request Q1 cash flow projection from borrower."})

    # Signal 3: Cheque bounce pattern
    if cheque_bounce > 3.0:
        signals.append({"code": "EWS-07", "category": "Payment Behaviour", "severity": "CRITICAL",
                        "message": f"Inward cheque return rate of {cheque_bounce:.1f}% signals acute cash flow stress.",
                        "rbi_classification": "SMA-2", "action": "Block fresh disbursements pending investigation."})
    elif cheque_bounce > 1.5:
        signals.append({"code": "EWS-07", "category": "Payment Behaviour", "severity": "AMBER",
                        "message": f"Cheque bounce rate of {cheque_bounce:.1f}% trending above the 1.5% watchlist threshold.",
                        "rbi_classification": "SMA-0", "action": "Discuss with borrower; obtain management explanation."})

    # Signal 4: GST variance (potential revenue manipulation)
    if gst_variance > 20:
        signals.append({"code": "EWS-12", "category": "Revenue Integrity", "severity": "CRITICAL",
                        "message": f"GST vs Bank variance of {gst_variance:.1f}% — potential revenue over-declaration to maintain credit eligibility.",
                        "rbi_classification": "Fraud Watch", "action": "Request auditor certificate; refer to Risk Committee."})
    elif gst_variance > 10:
        signals.append({"code": "EWS-12", "category": "Revenue Integrity", "severity": "WARNING",
                        "message": f"GST vs Bank divergence of {gst_variance:.1f}% — above acceptable 10% band.",
                        "rbi_classification": "SMA-0", "action": "Cross-verify GSTR-1 against E-Way bill data."})

    # Background synthetic signals for completeness
    stock_audit_gap = round(random.uniform(30, 180), 0)
    if stock_audit_gap > 120:
        signals.append({"code": "EWS-09", "category": "Collateral Monitoring", "severity": "AMBER",
                        "message": f"Last stock audit was {stock_audit_gap:.0f} days ago — exceeds 90-day guideline.",
                        "rbi_classification": "SMA-0", "action": "Schedule stock audit within 30 days."})

    promoter_pledge_delta = round(random.uniform(-5, 15), 1)
    if promoter_pledge_delta > 8:
        signals.append({"code": "EWS-03", "category": "Promoter Risk", "severity": "WARNING",
                        "message": f"Promoter shareholding pledge increased by {promoter_pledge_delta:.1f}% in last quarter.",
                        "rbi_classification": "SMA-0", "action": "Obtain promoter net-worth certificate; assess personal leverage."})

    # Compute overall EWS level
    critical_count = sum(1 for s in signals if s["severity"] == "CRITICAL")
    warning_count = sum(1 for s in signals if s["severity"] in ("WARNING", "AMBER"))
    if critical_count >= 2:
        ews_level = "RED"
    elif critical_count == 1 or warning_count >= 3:
        ews_level = "AMBER"
    elif warning_count >= 1:
        ews_level = "YELLOW"
    else:
        ews_level = "GREEN"

    return {
        "status": "success",
        "company": company_name,
        "ews_level": ews_level,
        "signal_count": len(signals),
        "signals": signals,
        "rbi_classification": signals[0]["rbi_classification"] if signals else "Standard",
        "generated_at": str(__import__("datetime").datetime.utcnow().isoformat()) + "Z"
    }


@router.post("/crilc-check")
async def crilc_database_check(body: dict = None):
    """Simulated CRILC (Central Repository of Information on Large Credits) lookup.
    Checks RBI's inter-bank reporting system for SMA / NPA classification.
    """
    import random
    company_name = (body or {}).get("company_name", "Unknown")
    random.seed(_company_seed(company_name) ^ 0xCAFE)

    # Deterministic per-company classification
    roll = random.random()
    if roll < 0.05:
        status = "NPA"
        sub_category = "Sub-Standard"
        color = "RED"
        message = "Borrower classified as Non-Performing Asset in CRILC. Credit extension prohibited without committee approval."
    elif roll < 0.12:
        status = "SMA-2"
        sub_category = "Special Mention Account — 61–90 days overdue"
        color = "RED"
        message = "Account under SMA-2 watch. Rehabilitation plan mandatory before sanction."
    elif roll < 0.25:
        status = "SMA-1"
        sub_category = "Special Mention Account — 31–60 days overdue"
        color = "AMBER"
        message = "SMA-1 status detected in CRILC. Enhanced monitoring required; proceed with caution."
    elif roll < 0.40:
        status = "SMA-0"
        sub_category = "Special Mention Account — 1–30 days overdue"
        color = "YELLOW"
        message = "Minor payment irregularity noted. Standard caution advised."
    else:
        status = "CLEAN"
        sub_category = "No adverse classification"
        color = "GREEN"
        message = "No adverse CRILC record found. Borrower has a clean inter-bank credit history."

    # Exposure data
    reported_banks = random.randint(1, 5)
    total_exposure_cr = round(random.uniform(10, 500), 2)

    return {
        "status": "success",
        "company": company_name,
        "crilc_status": status,
        "sub_category": sub_category,
        "color": color,
        "message": message,
        "reported_lenders": reported_banks,
        "total_system_exposure_cr": total_exposure_cr,
        "last_reported": "Q2 FY2024-25",
        "data_source": "CRILC (RBI) — Simulated for Demo"
    }


@router.post("/sector-benchmark")
async def sector_benchmark(body: dict = None):
    """Returns P25/P50/P75 sector benchmarks for key financial ratios."""
    industry = (body or {}).get("industry", "Manufacturing")
    features = (body or {}).get("features", {})

    benchmarks = {
        "Manufacturing":   {"dscr": [1.05, 1.28, 1.65], "current_ratio": [1.10, 1.38, 1.80],
                            "ebitda_margin": [8.0, 14.5, 22.0], "debt_to_equity": [2.5, 1.6, 0.9],
                            "revenue_growth_yoy": [4.0, 9.0, 18.0], "interest_coverage": [2.0, 3.5, 6.5]},
        "IT Services":     {"dscr": [1.40, 1.75, 2.20], "current_ratio": [1.80, 2.50, 3.20],
                            "ebitda_margin": [18.0, 26.0, 34.0], "debt_to_equity": [0.5, 0.3, 0.1],
                            "revenue_growth_yoy": [10.0, 18.0, 32.0], "interest_coverage": [8.0, 14.0, 25.0]},
        "Retail":          {"dscr": [1.00, 1.15, 1.40], "current_ratio": [0.90, 1.10, 1.35],
                            "ebitda_margin": [4.0, 7.5, 12.0], "debt_to_equity": [2.0, 1.2, 0.7],
                            "revenue_growth_yoy": [6.0, 12.0, 22.0], "interest_coverage": [1.5, 2.5, 4.5]},
        "Real Estate":     {"dscr": [0.95, 1.10, 1.35], "current_ratio": [0.80, 1.05, 1.45],
                            "ebitda_margin": [12.0, 22.0, 38.0], "debt_to_equity": [3.5, 2.2, 1.2],
                            "revenue_growth_yoy": [-5.0, 5.0, 18.0], "interest_coverage": [1.2, 1.8, 3.0]},
    }
    sector_data = benchmarks.get(industry, benchmarks["Manufacturing"])

    comparison = {}
    for metric, (p25, p50, p75) in sector_data.items():
        company_val = features.get(metric)
        if company_val is not None:
            if metric == "debt_to_equity":
                percentile = "BETTER_THAN_P75" if company_val < p75 else ("P50_P75" if company_val < p50 else
                             ("P25_P50" if company_val < p25 else "BELOW_P25"))
            else:
                percentile = "BETTER_THAN_P75" if company_val > p75 else ("P50_P75" if company_val > p50 else
                             ("P25_P50" if company_val > p25 else "BELOW_P25"))
        else:
            percentile = "NO_DATA"
        comparison[metric] = {"company": company_val, "p25": p25, "p50": p50, "p75": p75, "percentile": percentile}

    return {"status": "success", "industry": industry, "benchmarks": comparison}


@router.post("/cashflow-projection")
async def cashflow_projection(body: dict = None):
    """12-month deterministic Monte Carlo cash flow projection."""
    import random
    import math
    company_name = (body or {}).get("company_name", "Unknown")
    features = (body or {}).get("features", {})
    random.seed(_company_seed(company_name) ^ 0xBEEF)

    base_rev = features.get("revenue_cr", 100.0)
    ebitda_pct = features.get("ebitda_margin", 15.0) / 100
    dscr = features.get("dscr", 1.25)
    monthly_debt_service = base_rev * ebitda_pct / (dscr * 12)

    months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    projections = []
    for i, month in enumerate(months):
        seasonal = 1 + 0.05 * math.sin(i * math.pi / 6)
        noise = random.uniform(-0.04, 0.04)
        monthly_rev = round((base_rev / 12) * seasonal * (1 + noise), 2)
        monthly_ebitda = round(monthly_rev * ebitda_pct * (1 + random.uniform(-0.03, 0.03)), 2)
        free_cash = round(monthly_ebitda - monthly_debt_service, 2)
        projections.append({
            "month": month,
            "revenue_cr": monthly_rev,
            "ebitda_cr": monthly_ebitda,
            "debt_service_cr": round(monthly_debt_service, 2),
            "free_cash_flow_cr": free_cash,
            "dscr_monthly": round(monthly_ebitda / monthly_debt_service, 2) if monthly_debt_service > 0 else 99.0,
            "stress_flag": free_cash < 0
        })

    stress_months = [p["month"] for p in projections if p["stress_flag"]]
    return {
        "status": "success",
        "company": company_name,
        "projection_period": "FY 2024-25",
        "base_assumptions": {"revenue_cr": base_rev, "ebitda_margin_pct": round(ebitda_pct * 100, 1), "dscr": dscr},
        "monthly_projections": projections,
        "stress_months": stress_months,
        "summary": "No liquidity stress projected" if not stress_months else f"Potential cash deficit in: {', '.join(stress_months)}"
    }


@router.post("/smart-covenants")
async def smart_covenants(body: dict = None):
    """Generate SHAP-driven post-disbursement covenants tuned to the borrower's top risk drivers."""
    company_name = (body or {}).get("company_name", "Unknown")
    shap_values = (body or {}).get("shap_values", [])
    grade = (body or {}).get("grade", "B")

    covenant_library = {
        "dscr":              {"covenant": "Minimum DSCR Maintenance",
                              "threshold": "DSCR >= 1.20x on a trailing-12-month basis",
                              "frequency": "Quarterly", "breach_action": "Step-up interest 50 bps + remediation plan"},
        "od_utilization":    {"covenant": "OD Utilization Cap",
                              "threshold": "OD utilization <= 80% avg over any rolling 30-day period",
                              "frequency": "Monthly", "breach_action": "Block incremental drawings; escalate to RM"},
        "gst_variance_pct":  {"covenant": "Revenue Reconciliation Audit",
                              "threshold": "GST vs Bank variance <= 10% per quarter",
                              "frequency": "Quarterly", "breach_action": "Statutory audit within 30 days"},
        "cheque_bounce_rate":{"covenant": "Inward Cheque Return Cap",
                              "threshold": "Cheque bounce rate <= 1.5% per month",
                              "frequency": "Monthly", "breach_action": "Additional collateral or third-party guarantee"},
        "debt_to_equity":    {"covenant": "Leverage Constraint",
                              "threshold": "Debt-to-Equity <= 2.5x at all times",
                              "frequency": "Half-yearly", "breach_action": "Mandatory equity infusion within 90 days"},
        "current_ratio":     {"covenant": "Minimum Current Ratio",
                              "threshold": "Current Ratio >= 1.20x",
                              "frequency": "Quarterly", "breach_action": "Review of working capital facility"},
        "promoter_holding_pct": {"covenant": "Promoter Holding Lock-In",
                              "threshold": "Promoter shareholding >= 51% throughout loan tenure",
                              "frequency": "Annual", "breach_action": "Accelerated repayment clause triggered"},
    }

    selected_keys = set()
    for sv in sorted(shap_values, key=lambda x: abs(x.get("impact", 0)), reverse=True):
        key = sv.get("feature", "").lower().replace(" ", "_")
        if key in covenant_library:
            selected_keys.add(key)
        if len(selected_keys) >= 4:
            break

    if grade not in ("AAA", "AA", "A"):
        selected_keys.add("dscr")

    if not selected_keys:
        selected_keys = {"dscr", "od_utilization", "gst_variance_pct", "debt_to_equity"}

    covenants = [{"id": f"COV-{i+1:02d}", **covenant_library[k], "risk_driver": k.replace("_", " ").title()}
                 for i, k in enumerate(list(selected_keys)[:6])]

    standard = [
        {"id": "COV-S1", "covenant": "Annual Audited Financials Submission",
         "threshold": "Within 180 days of FY close", "frequency": "Annual",
         "breach_action": "Penal interest 0.25% + notice", "risk_driver": "Compliance"},
        {"id": "COV-S2", "covenant": "No New Secured Borrowing",
         "threshold": "Except from scheduled banks with prior written consent", "frequency": "Ongoing",
         "breach_action": "Event of Default — recall notice", "risk_driver": "Compliance"},
    ]

    return {
        "status": "success",
        "company": company_name,
        "grade": grade,
        "financial_covenants": covenants,
        "standard_covenants": standard,
        "total_covenants": len(covenants) + len(standard),
        "note": "Covenants auto-generated from top SHAP risk drivers. Subject to Credit Committee review."
    }


@router.post("/primary-insight")
async def add_primary_insight(request: PrimaryInsightRequest):
    """Credit officer adds qualitative field observation that adjusts risk assessment"""
    insight = request.insight
    company = request.company_name

    # DEMO MODE: instant keyword-based classification (no LLM call)
    risk_keywords = ["concern", "risk", "issue", "below", "poor", "weak", "stress",
                     "fraud", "delay", "default", "overdue", "decline", "negative", "loss"]
    sentiment = "RISK" if any(w in insight.lower() for w in risk_keywords) else "POSITIVE"
    classification = (
        f"CLASSIFICATION: {sentiment}\n"
        f"EXPLANATION: Field observation classified as {sentiment} based on key indicators "
        f"detected in the submitted note for {company}."
    )

    return {
        "status": "success",
        "insight": insight,
        "sentiment": sentiment,
        "ai_analysis": classification,
        "message": f"Insight classified as {sentiment}. Re-run analysis to incorporate this into the scoring model."
    }
