"""
Kred — XGBoost Credit Scoring Engine
Trains on synthetic Indian corporate credit data, provides SHAP explainability,
Five Cs computation, and CIBIL-like 300-900 scoring.
"""
import numpy as np
import pandas as pd
import pickle
import os
import warnings
warnings.filterwarnings("ignore")

try:
    import xgboost as xgb
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    from sklearn.preprocessing import StandardScaler
    from sklearn.calibration import CalibratedClassifierCV
    import shap
    HAS_ML = True
except ImportError:
    HAS_ML = False

# --- Feature definitions ---
FEATURE_NAMES = [
    "dscr", "current_ratio", "debt_to_equity", "ebitda_margin",
    "revenue_growth_yoy", "pat_margin", "interest_coverage",
    "cheque_bounce_rate", "od_utilization", "cash_deposit_concentration",
    "gst_variance_pct", "itc_mismatch_pct",
    "promoter_holding_pct", "years_in_business", "cibil_score",
    "industry_risk_score", "asset_coverage_ratio", "working_capital_days",
    "export_revenue_pct", "capex_to_revenue"
]

FEATURE_DESCRIPTIONS = {
    "dscr": "Debt Service Coverage Ratio",
    "current_ratio": "Current Assets / Current Liabilities",
    "debt_to_equity": "Total Debt / Total Equity",
    "ebitda_margin": "EBITDA / Revenue (%)",
    "revenue_growth_yoy": "Year-on-Year Revenue Growth (%)",
    "pat_margin": "Profit After Tax Margin (%)",
    "interest_coverage": "EBIT / Interest Expense",
    "cheque_bounce_rate": "Inward Cheque Return Rate (%)",
    "od_utilization": "Overdraft Utilization (%)",
    "cash_deposit_concentration": "Cash Deposits as % of Total Credits",
    "gst_variance_pct": "GST vs Bank Statement Variance (%)",
    "itc_mismatch_pct": "GSTR-2A vs 3B ITC Mismatch (%)",
    "promoter_holding_pct": "Promoter Shareholding (%)",
    "years_in_business": "Years Since Incorporation",
    "cibil_score": "CIBIL Commercial Score (300-900)",
    "industry_risk_score": "Sector Risk (0=low, 100=high)",
    "asset_coverage_ratio": "Total Assets / Total Loans",
    "working_capital_days": "Net Working Capital in Days",
    "export_revenue_pct": "Export Revenue as % of Total",
    "capex_to_revenue": "Capital Expenditure / Revenue (%)"
}

RATING_BUCKETS = [
    (850, 900, "AAA", "Prime"), (780, 849, "AA", "High Grade"),
    (720, 779, "A", "Upper Medium"), (660, 719, "BBB", "Investment Grade"),
    (600, 659, "BB", "Speculative"), (500, 599, "B", "Highly Speculative"),
    (300, 499, "CCC", "Distressed")
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), "credit_model.pkl")


def generate_synthetic_dataset(n_samples=5000):
    """Generate realistic synthetic Indian corporate credit data with 5 profiles"""
    np.random.seed(42)
    
    # 5-tier company profiles matching Indian corporate distribution
    profiles = {
        "excellent": {
            "pct": 0.20,  # 20% AAA/AA companies
            "default_prob": 0.02,
            "params": {
                "dscr": 2.2, "cr": 1.9, "de": 0.8, "ebitda": 22, "rev_g": 15,
                "pat": 14, "ic": 6.0, "cb": 0.8, "od": 40, "cd": 8,
                "gst": 2, "itc": 3, "ph": 70, "yib": 20, "cibil": 820,
                "irs": 20, "acr": 2.8, "wcd": 35, "erp": 30, "ctr": 10
            }
        },
        "good": {
            "pct": 0.30,  # 30% A/BBB+ companies
            "default_prob": 0.08,
            "params": {
                "dscr": 1.6, "cr": 1.5, "de": 1.5, "ebitda": 16, "rev_g": 10,
                "pat": 8, "ic": 3.8, "cb": 2.0, "od": 58, "cd": 15,
                "gst": 5, "itc": 7, "ph": 60, "yib": 12, "cibil": 740,
                "irs": 35, "acr": 2.0, "wcd": 55, "erp": 20, "ctr": 7
            }
        },
        "average": {
            "pct": 0.25,  # 25% BBB/BB companies
            "default_prob": 0.25,
            "params": {
                "dscr": 1.2, "cr": 1.15, "de": 2.3, "ebitda": 11, "rev_g": 5,
                "pat": 4, "ic": 2.5, "cb": 3.5, "od": 72, "cd": 20,
                "gst": 10, "itc": 12, "ph": 50, "yib": 8, "cibil": 660,
                "irs": 50, "acr": 1.5, "wcd": 80, "erp": 12, "ctr": 5
            }
        },
        "stressed": {
            "pct": 0.15,  # 15% B companies
            "default_prob": 0.55,
            "params": {
                "dscr": 0.9, "cr": 0.85, "de": 3.5, "ebitda": 6, "rev_g": -2,
                "pat": -1, "ic": 1.3, "cb": 6.0, "od": 88, "cd": 30,
                "gst": 18, "itc": 22, "ph": 40, "yib": 5, "cibil": 560,
                "irs": 68, "acr": 1.0, "wcd": 120, "erp": 5, "ctr": 3
            }
        },
        "distressed": {
            "pct": 0.10,  # 10% CCC/NPA companies
            "default_prob": 0.90,
            "params": {
                "dscr": 0.6, "cr": 0.55, "de": 5.0, "ebitda": 2, "rev_g": -12,
                "pat": -8, "ic": 0.6, "cb": 10.0, "od": 96, "cd": 42,
                "gst": 28, "itc": 35, "ph": 25, "yib": 3, "cibil": 450,
                "irs": 82, "acr": 0.7, "wcd": 170, "erp": 2, "ctr": 2
            }
        }
    }
    
    def gen(n, params):
        data = pd.DataFrame({
            "dscr": np.clip(np.random.normal(params["dscr"], 0.35, n), 0.3, 5.0),
            "current_ratio": np.clip(np.random.normal(params["cr"], 0.3, n), 0.3, 5.0),
            "debt_to_equity": np.clip(np.random.normal(params["de"], 0.6, n), 0.05, 8.0),
            "ebitda_margin": np.clip(np.random.normal(params["ebitda"], 5, n), -20, 45),
            "revenue_growth_yoy": np.random.normal(params["rev_g"], 8, n),
            "pat_margin": np.clip(np.random.normal(params["pat"], 5, n), -25, 35),
            "interest_coverage": np.clip(np.random.normal(params["ic"], 1.5, n), 0.2, 15),
            "cheque_bounce_rate": np.clip(np.random.normal(params["cb"], 2.0, n), 0, 20),
            "od_utilization": np.clip(np.random.normal(params["od"], 15, n), 0, 100),
            "cash_deposit_concentration": np.clip(np.random.normal(params["cd"], 10, n), 0, 70),
            "gst_variance_pct": np.clip(np.random.normal(params["gst"], 5, n), 0, 50),
            "itc_mismatch_pct": np.clip(np.random.normal(params["itc"], 6, n), 0, 60),
            "promoter_holding_pct": np.clip(np.random.normal(params["ph"], 12, n), 10, 100),
            "years_in_business": np.clip(np.random.normal(params["yib"], 5, n), 1, 60).astype(int),
            "cibil_score": np.clip(np.random.normal(params["cibil"], 55, n), 300, 900).astype(int),
            "industry_risk_score": np.clip(np.random.normal(params["irs"], 15, n), 0, 100),
            "asset_coverage_ratio": np.clip(np.random.normal(params["acr"], 0.5, n), 0.3, 6),
            "working_capital_days": np.clip(np.random.normal(params["wcd"], 30, n), -90, 250).astype(int),
            "export_revenue_pct": np.clip(np.random.normal(params["erp"], 12, n), 0, 90),
            "capex_to_revenue": np.clip(np.random.normal(params["ctr"], 4, n), 0, 30),
        })
        # Add realistic correlations: low DSCR → high D/E, low CIBIL → high bounce rate
        noise = np.random.normal(0, 0.1, n)
        data["debt_to_equity"] = np.clip(data["debt_to_equity"] + (1.5 - data["dscr"]) * 0.3 + noise, 0.05, 8.0)
        data["cheque_bounce_rate"] = np.clip(data["cheque_bounce_rate"] + (700 - data["cibil_score"]) * 0.005, 0, 20)
        return data
    
    dfs = []
    for name, profile in profiles.items():
        n = int(n_samples * profile["pct"])
        data = gen(n, profile["params"])
        data["default"] = np.random.choice([0, 1], n, p=[1 - profile["default_prob"], profile["default_prob"]])
        dfs.append(data)
    
    df = pd.concat(dfs, ignore_index=True)
    return df.sample(frac=1, random_state=42).reset_index(drop=True)


def train_model():
    """Train XGBoost model and save to disk"""
    if not HAS_ML:
        print("ML libraries not available. Using mock scoring.")
        return None
    
    print("Generating synthetic Indian corporate credit dataset...")
    df = generate_synthetic_dataset(2000)
    
    X = df[FEATURE_NAMES]
    y = df["default"]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print(f"Dataset: {len(df)} samples, {y.sum()} defaults ({y.mean()*100:.1f}%)")
    
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.5,
        reg_lambda=1.0,
        scale_pos_weight=len(y[y==0]) / max(len(y[y==1]), 1),
        eval_metric="logloss",
        random_state=42,
        use_label_encoder=False
    )
    
    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(model, X_scaled, y, cv=cv, scoring="roc_auc")
    print(f"Cross-validation AUC: {scores.mean():.4f} (+/- {scores.std():.4f})")
    
    model.fit(X_scaled, y)
    
    # Save everything
    artifact = {
        "model": model,
        "scaler": scaler,
        "feature_names": FEATURE_NAMES,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
    }
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(artifact, f)
    
    print(f"Model saved to {MODEL_PATH}")
    return artifact


def load_model():
    """Load trained model from disk, or train if not exists"""
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    else:
        return train_model()


def predict_credit_score(features: dict) -> dict:
    """
    Run credit scoring pipeline:
    1. XGBoost PD prediction  
    2. SHAP feature attribution
    3. CIBIL-like score mapping
    4. Rating grade assignment
    5. Five Cs computation
    """
    artifact = load_model()
    
    if artifact is None or not HAS_ML:
        return _mock_prediction(features)
    
    model = artifact["model"]
    scaler = artifact["scaler"]
    
    # Build feature vector
    X_raw = np.array([[features.get(f, 0) for f in FEATURE_NAMES]])
    X_scaled = scaler.transform(X_raw)
    
    # Probability of default
    pd_prob = model.predict_proba(X_scaled)[0][1]
    
    # Map to 300-900 CIBIL-like score (inverse of PD)
    credit_score = int(900 - (pd_prob * 600))
    credit_score = max(300, min(900, credit_score))
    
    # Rating
    grade, grade_desc = "CCC", "Distressed"
    for low, high, g, d in RATING_BUCKETS:
        if low <= credit_score <= high:
            grade, grade_desc = g, d
            break
    
    # SHAP values
    try:
        explainer = shap.TreeExplainer(model)
        raw_shap = explainer.shap_values(X_scaled)
        
        # Handle different SHAP return formats
        if isinstance(raw_shap, list):
            # Binary classifier returns [class_0_shap, class_1_shap]
            shap_row = raw_shap[1][0] if len(raw_shap) > 1 else raw_shap[0][0]
        elif hasattr(raw_shap, 'values'):
            # SHAP Explanation object (newer versions)
            shap_row = raw_shap.values[0]
        elif raw_shap.ndim == 2:
            shap_row = raw_shap[0]
        else:
            shap_row = raw_shap
        
        shap_results = []
        for i, fname in enumerate(FEATURE_NAMES):
            sv = float(shap_row[i])  # Convert numpy.float32 to Python float
            feat_val = features.get(fname, 0)
            if isinstance(feat_val, float):
                val_str = f"{feat_val:.2f}"
            else:
                val_str = str(feat_val)
            shap_results.append({
                "feature": FEATURE_DESCRIPTIONS.get(fname, fname),
                "feature_key": fname,
                "value": val_str,
                "impact": float(round(abs(sv) * 100, 1)),
                "type": "negative" if sv > 0 else "positive",  # Higher SHAP = higher PD = negative
                "desc": FEATURE_DESCRIPTIONS.get(fname, fname)
            })
        
        shap_results.sort(key=lambda x: x["impact"], reverse=True)
    except Exception as e:
        print(f"SHAP error: {e}")
        import traceback
        traceback.print_exc()
        shap_results = _mock_shap()
    
    # Five Cs
    five_c = _compute_five_cs(features)
    
    # Loan decisioning
    decision = _compute_decision(credit_score, grade, features)
    
    return {
        "credit_score": int(credit_score),
        "pd_probability": float(round(float(pd_prob), 4)),
        "grade": grade,
        "grade_description": grade_desc,
        "shap_values": shap_results,
        "five_c": five_c,
        "decision": decision
    }


def _compute_five_cs(f: dict) -> dict:
    """Compute Five Cs of Credit from features"""
    character = min(100, int(
        (f.get("promoter_holding_pct", 50) * 0.3) +
        (min(f.get("years_in_business", 5), 20) / 20 * 100 * 0.3) +
        ((100 - f.get("gst_variance_pct", 10)) * 0.2) +
        (min(f.get("cibil_score", 650), 900) / 900 * 100 * 0.2)
    ))
    
    capacity = min(100, int(
        (min(f.get("dscr", 1.0), 3.0) / 3.0 * 100 * 0.35) +
        (min(max(f.get("ebitda_margin", 10), 0), 30) / 30 * 100 * 0.25) +
        (min(max(f.get("pat_margin", 5), 0), 20) / 20 * 100 * 0.2) +
        (min(f.get("interest_coverage", 2), 8) / 8 * 100 * 0.2)
    ))
    
    capital = min(100, int(
        ((5 - min(f.get("debt_to_equity", 2), 5)) / 5 * 100 * 0.35) +
        (min(f.get("current_ratio", 1), 3) / 3 * 100 * 0.25) +
        (min(f.get("asset_coverage_ratio", 1.5), 4) / 4 * 100 * 0.2) +
        ((100 - min(f.get("od_utilization", 60), 100)) * 0.2)
    ))
    
    collateral = min(100, int(
        (min(f.get("asset_coverage_ratio", 1.5), 4) / 4 * 100 * 0.5) +
        (min(f.get("current_ratio", 1), 3) / 3 * 100 * 0.3) +
        (min(f.get("promoter_holding_pct", 50), 100) * 0.2)
    ))
    
    conditions = min(100, int(
        ((100 - f.get("industry_risk_score", 40)) * 0.4) +
        (min(max(f.get("revenue_growth_yoy", 5), -10), 30) / 30 * 100 * 0.3) +
        (f.get("export_revenue_pct", 15) * 0.15) +
        ((100 - min(f.get("cheque_bounce_rate", 3) * 10, 100)) * 0.15)
    ))
    
    return {
        "character": character,
        "capacity": capacity,
        "capital": capital,
        "collateral": collateral,
        "conditions": conditions
    }


def _compute_decision(score: int, grade: str, features: dict) -> dict:
    """Compute loan recommendation based on score and grade"""
    ebitda = features.get("ebitda_margin", 12) * features.get("revenue_growth_yoy", 8) / 100 * 10  # Mock EBITDA in Cr
    
    multipliers = {"AAA": 5.0, "AA": 4.0, "A": 3.0, "BBB": 2.5, "BB": 1.5, "B": 0.5, "CCC": 0}
    premiums = {"AAA": 1.50, "AA": 2.00, "A": 2.75, "BBB": 3.75, "BB": 5.50, "B": 8.00, "CCC": 12.00}
    
    mult = multipliers.get(grade, 2.5)
    premium = premiums.get(grade, 3.75)
    repo_rate = 6.50
    
    suggested_limit = round(max(abs(ebitda) * mult, 5), 1)
    suggested_rate = round(repo_rate + premium, 2)
    
    if score >= 720:
        verdict = "APPROVE"
    elif score >= 600:
        verdict = "CONDITIONAL"
    else:
        verdict = "REJECT"
    
    return {
        "verdict": verdict,
        "suggested_limit": f"₹{suggested_limit} Cr",
        "suggested_rate": f"{suggested_rate}%",
        "risk_premium_bps": int(premium * 100),
        "repo_rate": f"{repo_rate}%"
    }


def _mock_prediction(features: dict) -> dict:
    """Fallback when ML libraries are not available"""
    return {
        "credit_score": 720,
        "pd_probability": 0.12,
        "grade": "A",
        "grade_description": "Upper Medium",
        "shap_values": _mock_shap(),
        "five_c": _compute_five_cs(features),
        "decision": {"verdict": "CONDITIONAL", "suggested_limit": "₹15.0 Cr", "suggested_rate": "9.25%", "risk_premium_bps": 275, "repo_rate": "6.50%"}
    }


def _mock_shap():
    return [
        {"feature": "EBITDA Margin", "feature_key": "ebitda_margin", "value": "18.2%", "impact": 42.5, "type": "positive", "desc": "Strong operational efficiency"},
        {"feature": "DSCR", "feature_key": "dscr", "value": "1.45x", "impact": 38.0, "type": "positive", "desc": "Comfortable debt service headroom"},
        {"feature": "GST/Bank Variance", "feature_key": "gst_variance_pct", "value": "15%", "impact": 55.4, "type": "negative", "desc": "Elevated circular trading risk"},
        {"feature": "Cheque Bounce Rate", "feature_key": "cheque_bounce_rate", "value": "2.1%", "impact": 28.0, "type": "negative", "desc": "Cash flow stress indicator"},
        {"feature": "Current Ratio", "feature_key": "current_ratio", "value": "1.24x", "impact": 15.2, "type": "positive", "desc": "Adequate short-term liquidity"},
    ]


# Auto-train on first import if model doesn't exist
if not os.path.exists(MODEL_PATH) and HAS_ML:
    print("First run: Training credit scoring model...")
    train_model()
