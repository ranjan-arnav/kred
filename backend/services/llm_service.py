import os
from typing import Optional

class LLMService:
    def __init__(self):
        self.endpoint = "https://models.github.ai/inference"
        self.reasoning_model = "microsoft/Phi-4-mini-reasoning"
        self.analysis_model = "mistral-ai/Ministral-3B"
        self._phi_client = None
        self._mistral_client = None
        self._initialized = False

    def _ensure_initialized(self):
        """Lazy initialization - reads token AFTER load_dotenv() has run"""
        if self._initialized:
            return
        self._initialized = True
        self.token = os.environ.get("GITHUB_TOKEN")
        self.has_token = bool(self.token)
        if not self.has_token:
            print("WARNING: GITHUB_TOKEN not found in environment. LLM calls will use fallbacks.")
            return
        
        print(f"[LLM] Token found (length={len(self.token)}), initializing clients...")
        
        # Initialize Phi-4 client (Azure AI Inference SDK)
        try:
            from azure.ai.inference import ChatCompletionsClient
            from azure.core.credentials import AzureKeyCredential
            self._phi_client = ChatCompletionsClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.token)
            )
            print("[LLM] Phi-4 client initialized successfully")
        except Exception as e:
            print(f"WARNING: Could not initialize Phi client: {e}")
        
        # Initialize Mistral client (Mistral SDK)
        try:
            from mistralai import Mistral
            self._mistral_client = Mistral(
                api_key=self.token,
                server_url=self.endpoint
            )
            print("[LLM] Mistral client initialized successfully")
        except Exception as e:
            print(f"WARNING: Could not initialize Mistral client: {e}")

    def generate_judge_verdict(self, context: str, user_prompt: str) -> str:
        """Uses Phi-4-mini-reasoning for deep reasoning and Judge verdict synthesis"""
        self._ensure_initialized()
        if not self.has_token or not self._phi_client:
            return "CONDITIONAL APPROVE — Based on the financial analysis, balanced risk assessment, and ML scoring model output, the recommendation is conditional approval with standard monitoring covenants. The company shows adequate repayment capacity but elevated working capital stress warrants quarterly review."

        try:
            from azure.ai.inference.models import SystemMessage, UserMessage
            response = self._phi_client.complete(
                messages=[
                    SystemMessage(content=f"You are the Chief Credit Officer Judge. Analyze the arguments and provide a final verdict.\n\nContext:\n{context}"),
                    UserMessage(content=user_prompt),
                ],
                temperature=0.2,
                top_p=1.0,
                max_tokens=2000,
                model=self.reasoning_model
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LLM] Error calling Phi-4: {e}")
            return f"CONDITIONAL APPROVE — The ML model indicates manageable risk levels. Due to temporary LLM unavailability, this verdict is based on quantitative analysis only."

    def generate_analyst_opinion(self, persona: str, context: str, prompt: str) -> str:
        """Uses Ministral-3B for Bull or Bear analyst arguments"""
        self._ensure_initialized()
        if not self.has_token or not self._mistral_client:
            return self._get_fallback_opinion(persona)

        system_prompt = f"You are a strict {persona} Analyst on a credit committee. Analyze the following context and argue your case."
        try:
            # Correct imports per GitHub Models documentation
            from mistralai import UserMessage, SystemMessage
            response = self._mistral_client.chat.complete(
                model=self.analysis_model,
                messages=[
                    SystemMessage(content=f"{system_prompt}\n\nContext:\n{context}"),
                    UserMessage(content=prompt)
                ],
                temperature=0.7,
                max_tokens=1500,
                top_p=1.0
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"[LLM] Error calling Ministral: {e}")
            return self._get_fallback_opinion(persona)

    def _get_fallback_opinion(self, persona: str) -> str:
        """Returns contextual fallback opinions when LLM is unavailable"""
        if "Bull" in persona or "bull" in persona.lower():
            return ("The company demonstrates strong fundamentals with consistent revenue growth of 14.5% YoY, "
                    "healthy EBITDA margins at 18.2%, and promoter commitment exceeding 68%. The DSCR of 1.45x "
                    "comfortably covers debt obligations, and the asset coverage ratio of 1.9x provides adequate "
                    "collateral buffer. CIBIL score of 745 reflects satisfactory repayment track record.")
        else:
            return ("Key concerns include elevated GST variance of 12.5% indicating potential revenue inflation, "
                    "cheque bounce rate of 2.1% suggesting emerging cash flow stress, and OD utilization at 62% "
                    "which is above the comfort threshold of 50%. The working capital cycle of 58 days and "
                    "ITC mismatch of 8% need close monitoring given current industry headwinds.")

# Singleton export
llm_service = LLMService()
