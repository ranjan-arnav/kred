import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StepProgress from '../components/StepProgress';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { kredApi } from '../services/api';

const FINANCIAL_FIELDS = [
    { key: 'dscr', label: 'DSCR', placeholder: '1.45', unit: 'x', hint: 'Debt Service Coverage Ratio' },
    { key: 'current_ratio', label: 'Current Ratio', placeholder: '1.24', unit: 'x', hint: '' },
    { key: 'debt_to_equity', label: 'Debt / Equity', placeholder: '1.80', unit: 'x', hint: 'Total Debt to Total Equity' },
    { key: 'ebitda_margin', label: 'EBITDA Margin', placeholder: '18.2', unit: '%', hint: '' },
    { key: 'revenue_growth_yoy', label: 'Revenue Growth (YoY)', placeholder: '14.5', unit: '%', hint: '' },
    { key: 'pat_margin', label: 'PAT Margin', placeholder: '8.6', unit: '%', hint: 'Profit After Tax Margin' },
    { key: 'interest_coverage', label: 'Interest Coverage', placeholder: '3.8', unit: 'x', hint: 'EBIT / Interest Expense' },
    { key: 'cibil_score', label: 'CIBIL Score', placeholder: '745', unit: '', hint: 'Commercial Score (300-900)' },
    { key: 'cheque_bounce_rate', label: 'Cheque Bounce Rate', placeholder: '2.1', unit: '%', hint: 'Inward cheque return rate' },
    { key: 'od_utilization', label: 'OD Utilization', placeholder: '62', unit: '%', hint: 'Overdraft limit usage' },
    { key: 'gst_variance_pct', label: 'GST Variance', placeholder: '12.5', unit: '%', hint: 'GST vs Bank Statement gap' },
    { key: 'promoter_holding_pct', label: 'Promoter Holding', placeholder: '68', unit: '%', hint: '' },
    { key: 'years_in_business', label: 'Years in Business', placeholder: '15', unit: 'yrs', hint: '' },
    { key: 'industry_risk_score', label: 'Industry Risk', placeholder: '42', unit: '/100', hint: 'Higher = riskier' },
    { key: 'asset_coverage_ratio', label: 'Asset Coverage', placeholder: '1.9', unit: 'x', hint: '' },
];

const DueDiligence: React.FC = () => {
    const navigate = useNavigate();
    const { companyName, extractedFinancials, completeStep, setCurrentStep, setDueDiligenceData, setAnalysisData } = useAppContext();

    // Qualitative inputs
    const [factoryVisit, setFactoryVisit] = useState('');
    const [capacityUtil, setCapacityUtil] = useState(75);
    const [mgmtNotes, setMgmtNotes] = useState('');
    const [promoterAssessment, setPromoterAssessment] = useState('Good');
    const [additionalRisks, setAdditionalRisks] = useState('');

    // Financial data — pre-fill from extracted data
    const [financials, setFinancials] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        FINANCIAL_FIELDS.forEach(f => {
            init[f.key] = extractedFinancials[f.key]?.toString() || f.placeholder;
        });
        return init;
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    // Animate pipeline steps while analyzing
    useEffect(() => {
        if (!isAnalyzing) { setActiveStep(0); return; }
        const id = setInterval(() => setActiveStep(s => Math.min(s + 1, 4)), 1400);
        return () => clearInterval(id);
    }, [isAnalyzing]);

    const updateFinancial = (key: string, val: string) => {
        setFinancials(prev => ({ ...prev, [key]: val }));
    };

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        setError('');

        // Collect qualitative insights
        const insights: string[] = [];
        if (factoryVisit.trim()) insights.push(`Factory visit: ${factoryVisit}`);
        if (capacityUtil < 60) insights.push(`WARNING: Factory operating at only ${capacityUtil}% capacity`);
        if (mgmtNotes.trim()) insights.push(`Management interview: ${mgmtNotes}`);
        if (promoterAssessment === 'Concerning') insights.push('RISK: Promoter assessment rated as Concerning');
        if (additionalRisks.trim()) insights.push(`Additional risks: ${additionalRisks}`);

        // Build financial data object
        const financialData: Record<string, number> = {};
        FINANCIAL_FIELDS.forEach(f => {
            const val = parseFloat(financials[f.key]);
            if (!isNaN(val)) financialData[f.key] = val;
        });

        try {
            // Save due diligence data
            setDueDiligenceData({
                factoryVisit,
                capacityUtilization: capacityUtil,
                managementNotes: mgmtNotes,
                promoterAssessment,
                additionalRisks,
                financialOverrides: financialData,
            });

            // Call the analysis API with all collected data
            const result = await kredApi.analyzeCompany(
                companyName || 'Unknown Company',
                insights,
                financialData
            );

            // Store results
            const analysisPayload = {
                ...result,
                company_name: result.company || companyName,
            };
            setAnalysisData(analysisPayload);
            localStorage.setItem('kred_analysis_data', JSON.stringify(analysisPayload));

            // Mark steps 3 and 4 complete
            completeStep(3);
            setCurrentStep(4);
            navigate('/scoring');
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('Analysis failed. Ensure the backend is running on port 8000.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white text-slate-900 font-display min-h-screen flex flex-col overflow-hidden">
            <Header />
            <StepProgress />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-[#FAFAFA]">
                    {/* Page Header */}
                    <div className="border-b-2 border-black bg-white px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="size-10 bg-black text-white flex items-center justify-center">
                                <span className="material-symbols-outlined">fact_check</span>
                            </div>
                            <div>
                                <h1 className="font-display font-black text-2xl tracking-tight uppercase">
                                    Primary Due Diligence
                                </h1>
                                <p className="text-sm text-gray-500 font-mono">
                                    {companyName || 'Company'} • Step 3 of 5 — Qualitative Assessment
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 max-w-6xl mx-auto space-y-8">
                        {/* Section 1: Qualitative Inputs */}
                        <section className="bg-white border-2 border-black p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-[#FF3300]">person_search</span>
                                <h2 className="font-display font-black text-lg uppercase tracking-wide">
                                    Field Observations
                                </h2>
                                <span className="ml-auto font-mono text-xs text-gray-400 bg-[#F4F4F4] px-3 py-1 border">QUALITATIVE</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Factory Visit */}
                                <div className="space-y-2">
                                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Factory / Site Visit Observations
                                    </label>
                                    <textarea
                                        value={factoryVisit}
                                        onChange={e => setFactoryVisit(e.target.value)}
                                        placeholder="e.g., Factory in good condition, machinery well-maintained, 3 production lines active..."
                                        rows={4}
                                        className="w-full border-2 border-gray-200 p-3 font-body text-sm focus:border-black focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Management Interview */}
                                <div className="space-y-2">
                                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Management Interview Notes
                                    </label>
                                    <textarea
                                        value={mgmtNotes}
                                        onChange={e => setMgmtNotes(e.target.value)}
                                        placeholder="e.g., Promoter confident about expansion plans, new orders from Tata group confirmed..."
                                        rows={4}
                                        className="w-full border-2 border-gray-200 p-3 font-body text-sm focus:border-black focus:outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Capacity Utilization */}
                                <div className="space-y-2">
                                    <label htmlFor="capacity-util" className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Observed Capacity Utilization
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            id="capacity-util"
                                            type="range"
                                            min={0}
                                            max={100}
                                            value={capacityUtil}
                                            onChange={e => setCapacityUtil(parseInt(e.target.value))}
                                            className="flex-1 h-2 accent-black"
                                            aria-label="Observed Capacity Utilization"
                                        />
                                        <span className={`font-display font-black text-2xl ${capacityUtil < 40 ? 'text-red-600' : capacityUtil < 60 ? 'text-amber-500' : 'text-green-600'}`}>
                                            {capacityUtil}%
                                        </span>
                                    </div>
                                    {capacityUtil < 40 && (
                                        <p className="text-xs text-red-600 font-mono flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">warning</span>
                                            Critical: Below 40% — will significantly impact risk score
                                        </p>
                                    )}
                                </div>

                                {/* Promoter Assessment */}
                                <div className="space-y-2">
                                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Promoter Background Assessment
                                    </label>
                                    <div className="flex gap-2">
                                        {['Excellent', 'Good', 'Average', 'Concerning'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setPromoterAssessment(opt)}
                                                className={`flex-1 py-2.5 px-3 font-mono text-xs font-bold uppercase border-2 transition-all ${promoterAssessment === opt
                                                    ? opt === 'Concerning'
                                                        ? 'bg-red-600 text-white border-red-600'
                                                        : 'bg-black text-white border-black'
                                                    : 'border-gray-200 hover:border-black'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Risks */}
                                <div className="md:col-span-2 space-y-2">
                                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Additional Risk Factors / Observations
                                    </label>
                                    <textarea
                                        value={additionalRisks}
                                        onChange={e => setAdditionalRisks(e.target.value)}
                                        placeholder="e.g., Pending regulatory clearances, key customer concentration risk, labor disputes..."
                                        rows={3}
                                        className="w-full border-2 border-gray-200 p-3 font-body text-sm focus:border-black focus:outline-none transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Financial Data Input */}
                        <section className="bg-white border-2 border-black p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-[#FF3300]">calculate</span>
                                <h2 className="font-display font-black text-lg uppercase tracking-wide">
                                    Financial Parameters
                                </h2>
                                <span className="ml-auto font-mono text-xs text-gray-400 bg-[#F4F4F4] px-3 py-1 border">
                                    {Object.keys(extractedFinancials).length > 0 ? 'PRE-FILLED FROM DOCS' : 'MANUAL INPUT'}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 mb-4 font-body">
                                These values feed directly into the ML scoring model. Pre-filled values come from uploaded documents — override as needed.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {FINANCIAL_FIELDS.map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500 block" title={field.hint}>
                                            {field.label}
                                        </label>
                                        <div className="flex items-center border-2 border-gray-200 focus-within:border-black transition-colors">
                                            <input
                                                type="text"
                                                value={financials[field.key]}
                                                onChange={e => updateFinancial(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="flex-1 px-2 py-2 text-sm font-mono focus:outline-none w-full min-w-0"
                                            />
                                            {field.unit && (
                                                <span className="text-gray-400 text-xs font-mono px-2 border-l bg-[#F4F4F4]">{field.unit}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-600 p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-600">error</span>
                                <span className="font-mono text-sm text-red-800">{error}</span>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigate('/research')}
                                className="border-2 border-black px-6 py-3 font-mono text-sm font-bold uppercase hover:bg-black hover:text-white transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Research
                            </button>

                            <button
                                onClick={handleRunAnalysis}
                                disabled={isAnalyzing}
                                className={`px-8 py-3.5 font-display font-black text-base uppercase tracking-wider flex items-center gap-3 transition-all ${isAnalyzing
                                    ? 'bg-gray-400 text-white cursor-wait'
                                    : 'bg-[#FF3300] text-white hover:bg-black'
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Running ML Analysis...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">psychology</span>
                                        Run Full Analysis
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Analysis Progress (shown while loading) */}
                        {isAnalyzing && (
                            <div className="bg-black text-white border-2 border-black p-6">
                                <h3 className="font-display font-black text-lg mb-4">ANALYSIS PIPELINE</h3>
                                <div className="space-y-3">
                                    {[
                                        'Loading XGBoost model...',
                                        'Computing SHAP feature attributions...',
                                        'Evaluating Five Cs of Credit...',
                                        'Running Bull/Bear/Judge AI Debate...',
                                        'Generating recommendation...',
                                    ].map((step, i) => (
                                        <div key={i} className={`flex items-center gap-3 font-mono text-sm transition-all duration-300 ${i === activeStep ? 'opacity-100' : i < activeStep ? 'opacity-60' : 'opacity-30'}`}>
                                            <span className={`material-symbols-outlined text-sm ${i === activeStep ? 'text-[#FF3300] animate-spin' : i < activeStep ? 'text-green-400' : 'text-gray-600'}`}>
                                                {i < activeStep ? 'check_circle' : i === activeStep ? 'progress_activity' : 'hourglass_empty'}
                                            </span>
                                            <span className={i <= activeStep ? 'text-white' : 'text-gray-600'}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DueDiligence;
