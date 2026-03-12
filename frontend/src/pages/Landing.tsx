import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const { setMode, clearSession, setAnalysisData } = useAppContext();

    const handleRealMode = (e: React.FormEvent) => {
        e.preventDefault();
        clearSession();
        setMode('real');
        navigate('/dashboard');
    };

    const handleDemoMode = () => {
        setMode('demo');
        // Pre-load demo data
        const demoData = {
            session_id: 'demo-001',
            company_name: 'Bharat Steelworks Ltd',
            model_metrics: { score: 779, grade: 'A', grade_description: 'Upper Medium', pd_probability: 0.0821 },
            shap_values: [
                { feature: 'Promoter Shareholding (%)', feature_key: 'promoter_holding_pct', value: '68', impact: 105.4, type: 'positive', desc: 'Promoter Shareholding (%)' },
                { feature: 'CIBIL Commercial Score', feature_key: 'cibil_score', value: '745', impact: 88.2, type: 'positive', desc: 'CIBIL Commercial Score (300-900)' },
                { feature: 'Total Debt / Total Equity', feature_key: 'debt_to_equity', value: '1.80', impact: 76.4, type: 'positive', desc: 'Total Debt / Total Equity' },
                { feature: 'EBIT / Interest Expense', feature_key: 'interest_coverage', value: '3.80', impact: 50.3, type: 'positive', desc: 'EBIT / Interest Expense' },
                { feature: 'DSCR', feature_key: 'dscr', value: '1.45', impact: 50.1, type: 'positive', desc: 'Debt Service Coverage Ratio' },
                { feature: 'GST Variance (%)', feature_key: 'gst_variance_pct', value: '12.5', impact: 42.3, type: 'negative', desc: 'GST vs Bank Statement Variance (%)' },
                { feature: 'Cheque Bounce Rate (%)', feature_key: 'cheque_bounce_rate', value: '2.1', impact: 28.7, type: 'negative', desc: 'Inward Cheque Return Rate (%)' },
            ],
            five_cs: { character: 72, capacity: 68, capital: 65, collateral: 58, conditions: 70 },
            committee_decision: {
                verdict: 'CONDITIONAL',
                bull_argument: 'The company demonstrates strong fundamentals with consistent revenue growth of 14.5% YoY, healthy EBITDA margins of 18.2%, and a robust CIBIL score of 745. Promoter holding at 68% shows strong commitment. The DSCR of 1.45x provides adequate debt servicing cushion.',
                bear_argument: 'Key concerns include elevated GST variance of 12.5% indicating potential revenue inflation, cheque bounce rate of 2.1% suggesting emerging cash flow stress, and OD utilization at 62% which is above the comfort threshold of 50%. The working capital cycle of 58 days and ITC mismatch of 8% need close monitoring.',
                judge_verdict: 'CONDITIONAL APPROVE with enhanced monitoring. The strong financial fundamentals and promoter commitment outweigh the operational concerns. However, the GST variance and OD utilization warrant quarterly reviews.',
                confidence: 0.74,
            },
            decision: {
                recommendation: 'CONDITIONAL',
                loan_limit_cr: 15.8,
                interest_rate_pct: 10.25,
                risk_premium_bps: 375,
                conditions: ['Quarterly GST reconciliation review', 'OD utilization monitoring (monthly)', 'Promoter personal guarantee required'],
            },
        };
        // Save demo data to localStorage AND context
        localStorage.setItem('kred_analysis_data', JSON.stringify(demoData));
        localStorage.setItem('kred_company_name', 'Bharat Steelworks Ltd');
        localStorage.setItem('kred_session_id', 'demo-001');
        setAnalysisData(demoData as any);
        // Navigate after state update
        setTimeout(() => navigate('/dashboard'), 50);
    };

    return (
        <div className="bg-white text-black font-body antialiased selection:bg-[#FF3300] selection:text-white h-screen w-full overflow-hidden flex flex-col md:flex-row">
            {/* Left Panel: Brand Hero */}
            <div className="relative w-full md:w-1/2 h-24 md:h-full bg-black flex items-center justify-center md:justify-end border-b-4 md:border-b-0 md:border-r-4 border-black overflow-hidden group">
                <div
                    className="absolute inset-0 opacity-20 landing-grid-bg"
                ></div>

                <h1
                    className="hidden md:block font-display font-black text-[120px] leading-[0.8] tracking-tighter text-white pr-12 select-none uppercase transition-transform duration-75 group-hover:translate-x-2 landing-title-vert"
                >
                    KRED
                </h1>

                <h1 className="md:hidden font-display font-black text-4xl tracking-tighter text-white uppercase">
                    KRED
                </h1>
            </div>

            {/* Right Panel: Interaction Zone */}
            <div className="w-full md:w-1/2 h-full flex flex-col bg-white relative">
                {/* Top Right Meta Info */}
                <div className="absolute top-0 right-0 p-6 md:p-10 flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-black/60">System Status:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-none animate-pulse"></div>
                        <span className="font-mono text-xs font-bold">ONLINE</span>
                    </div>
                </div>

                {/* Login Container Centered */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter mb-2">ANALYST PORTAL</h2>
                            <p className="font-mono text-sm text-gray-500 uppercase tracking-wide">AI-Powered Credit Decisioning Engine</p>
                        </div>

                        {/* Quick Start Guide */}
                        <div className="mb-6 border border-gray-200 p-4 bg-[#FAFAFA]">
                            <p className="font-display font-bold text-xs uppercase tracking-widest text-[#FF3300] mb-3">How It Works</p>
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <span className="font-mono text-xs font-bold bg-black text-white w-5 h-5 flex items-center justify-center shrink-0">1</span>
                                    <p className="font-mono text-xs text-gray-600"><strong>Upload</strong> financial documents (PDF, CSV)</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="font-mono text-xs font-bold bg-black text-white w-5 h-5 flex items-center justify-center shrink-0">2</span>
                                    <p className="font-mono text-xs text-gray-600"><strong>Analyze</strong> — ML model scores the company</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="font-mono text-xs font-bold bg-black text-white w-5 h-5 flex items-center justify-center shrink-0">3</span>
                                    <p className="font-mono text-xs text-gray-600"><strong>Review</strong> SHAP explainability + AI debate</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="font-mono text-xs font-bold bg-black text-white w-5 h-5 flex items-center justify-center shrink-0">4</span>
                                    <p className="font-mono text-xs text-gray-600"><strong>Export</strong> Credit Appraisal Memo (PDF)</p>
                                </div>
                            </div>
                        </div>

                        {/* The Form Box */}
                        <div className="border-4 border-black p-8 md:p-10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <form className="space-y-8" onSubmit={handleRealMode}>
                                {/* Username Field */}
                                <div className="group relative">
                                    <label htmlFor="username" className="block font-display font-bold text-sm uppercase mb-2 tracking-wide group-focus-within:text-[#FF3300]">
                                        Corporate ID
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            placeholder="IC-8842-X"
                                            autoComplete="username"
                                            className="peer block w-full border-0 border-b-2 border-black bg-transparent py-3 px-0 font-mono text-lg text-black focus:border-[#FF3300] focus:ring-0 placeholder:text-gray-300"
                                        />
                                        <span className="material-symbols-outlined absolute right-0 top-3 text-gray-300 peer-focus:text-[#FF3300]">badge</span>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="group relative">
                                    <label htmlFor="password" className="block font-display font-bold text-sm uppercase mb-2 tracking-wide group-focus-within:text-[#FF3300]">
                                        Secure Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="••••••••••••"
                                            className="peer block w-full border-0 border-b-2 border-black bg-transparent py-3 px-0 font-mono text-lg text-black focus:border-[#FF3300] focus:ring-0 placeholder:text-gray-300"
                                        />
                                        <span className="material-symbols-outlined absolute right-0 top-3 text-gray-300 peer-focus:text-[#FF3300]">lock</span>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2 space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleDemoMode}
                                        className="w-full bg-black text-white font-display font-bold text-lg py-5 px-6 uppercase tracking-widest hover:bg-[#FF3300] flex items-center justify-between group/demo transition-colors"
                                    >
                                        <span>View Demo</span>
                                        <span className="material-symbols-outlined group-hover/demo:translate-x-2 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Footer Links */}
                        <div className="mt-6 flex justify-between items-center text-xs font-mono text-gray-400">
                            <span className="text-[#FF3300] font-bold">KRED v2.0</span>
                            <span>Know Your Credits</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Warning Bar */}
                <div className="w-full border-t border-black bg-[#F4F4F4] p-4 text-center md:text-left md:px-10">
                    <p className="font-mono text-[10px] md:text-xs text-gray-500 uppercase">
                        <span className="font-bold text-black mr-2">TIP:</span>
                        Click "Start Analysis" for real ML-powered credit scoring, or "View Demo" to explore with sample data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Landing;
