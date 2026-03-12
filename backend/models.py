from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CompanyVerifyRequest(BaseModel):
    name: str

class PrimaryInsightRequest(BaseModel):
    insight: str
    company_name: str

class ResearchRequest(BaseModel):
    company_name: str
    cin: Optional[str] = None
    document_context: Optional[str] = None

class AnalysisRequest(BaseModel):
    company_name: str
    financial_data: Optional[Dict[str, Any]] = None
    insights: Optional[List[str]] = []
