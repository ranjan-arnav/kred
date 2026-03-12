import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import StepProgress from '../components/StepProgress';
import { useAppContext } from '../context/AppContext';
import { kredApi } from '../services/api';

const Results: React.FC = () => {
    const navigate = useNavigate();
    const { companyName } = useAppContext();
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [crilcData, setCrilcData] = useState<any>(null);
    const [ewsData, setEwsData] = useState<any>(null);
    const [covenantsData, setCovenantsData] = useState<any[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const storedData = localStorage.getItem("kred_analysis_data");
        if (storedData) {
            setAnalysisData(JSON.parse(storedData));
        }
    }, []);

    // Fetch ancillary intelligence once analysis data is loaded
    useEffect(() => {
        if (!analysisData) return;
        const company = analysisData.company || companyName || 'Unknown';
        const features = analysisData.input_features || {};
        kredApi.checkCrilc(company).then(setCrilcData).catch(() => {});
        kredApi.runEws(company, features).then(setEwsData).catch(() => {});
        kredApi.getSmartCovenants(
            company,
            analysisData.shap_values || [],
            analysisData.model_metrics?.grade || 'B'
        ).then(d => setCovenantsData(d.covenants || [])).catch(() => {});
    }, [analysisData]);

    const handleDownload = () => {
        const sessionId = analysisData?.session_id;
        if (sessionId) {
            kredApi.downloadCam(sessionId);
        } else {
            window.print();
        }
    };

    const cam = analysisData?.cam_content || {};
    const refId = `CAM-${new Date().getFullYear()}-${analysisData?.session_id?.slice(0, 4) || '0000'}`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    const handleVoiceNarrate = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const verdict = cam.sec_34_committee_decision || 'PENDING';
        const score = analysisData?.model_metrics?.score || 0;
        const company = companyName || analysisData?.company || 'the applicant';
        const ewsLevel = ewsData?.ews_level ? `Early Warning System level: ${ewsData.ews_level}.` : '';
        const crilcStatus = crilcData?.status ? `CRILC bureau status: ${crilcData.status}.` : '';
        const observation = cam.sec_33_ho_observation?.substring(0, 200) || '';
        const text = `Credit appraisal complete for ${company}. Kred score: ${score} out of 900. ${ewsLevel} ${crilcStatus} Final committee decision: ${verdict}. ${observation}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    // Helper to render table rows safely
    const renderRow = (label: string, value: any, colSpan = 1) => (
        <tr className="border-b border-black">
            <td className="p-2 border-r border-black font-semibold bg-gray-50 w-1/3 text-xs">{label}</td>
            <td className="p-2 text-xs font-mono" colSpan={colSpan}>{value || '--'}</td>
        </tr>
    );

    const renderMultiColRow = (items: { label: string, value: any }[]) => (
        <tr className="border-b border-black">
            {items.map((item, idx) => (
                <React.Fragment key={idx}>
                    <td className="p-2 border-r border-black font-semibold bg-gray-50 text-xs w-1/6">{item.label}</td>
                    <td className={`p-2 text-xs font-mono ${idx < items.length - 1 ? 'border-r border-black w-2/6' : 'w-2/6'}`}>{item.value || '--'}</td>
                </React.Fragment>
            ))}
        </tr>
    );

    return (
        <div className="bg-[#fcf9f8] text-[#1c100d] font-body antialiased flex flex-col h-screen overflow-hidden print:bg-white print:h-auto print:overflow-visible">
            <div className="print:hidden">
                <Header />
                <StepProgress />
            </div>

            <div className="flex flex-1 overflow-hidden print:overflow-visible">
                <aside className="w-[280px] flex-none border-r border-[#1c100d] bg-[#fcf9f8] flex flex-col overflow-y-auto z-10 print:hidden">
                    <div className="p-5 border-b border-dashed border-gray-300">
                        <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-1">CAM generation</h3>
                        <p className="text-[10px] uppercase text-green-600 font-bold tracking-widest">34 Sections Generated</p>
                    </div>
                    <div className="mt-auto p-5 border-t border-[#1c100d] bg-gray-50 space-y-3">
                        <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 border border-black bg-white hover:bg-[#f4e9e7] text-black h-10 text-sm font-bold transition-colors">
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            {analysisData?.session_id ? 'Download PDF' : 'Print CAM PDF'}
                        </button>
                        <button onClick={handleVoiceNarrate} className={`w-full flex items-center justify-center gap-2 border text-black h-10 text-sm font-bold transition-colors ${isSpeaking ? 'bg-[#FF3300] text-white border-[#FF3300]' : 'border-black bg-white hover:bg-[#f4e9e7]'}`}>
                            <span className="material-symbols-outlined text-[18px]">{isSpeaking ? 'stop' : 'record_voice_over'}</span>
                            {isSpeaking ? 'Stop Reading' : 'Voice Narrate'}
                        </button>
                        {(crilcData || ewsData) && (
                            <div className="border border-black p-3 space-y-2">
                                {crilcData && (
                                    <div className={`flex items-center gap-2 text-[10px] font-mono font-bold ${crilcData.status === 'CLEAN' ? 'text-green-700' : 'text-[#FF3300]'}`}>
                                        <span className="material-symbols-outlined text-sm">verified_user</span>
                                        CRILC: {crilcData.status}
                                    </div>
                                )}
                                {ewsData && (
                                    <div className={`flex items-center gap-2 text-[10px] font-mono font-bold ${ewsData.ews_level === 'GREEN' ? 'text-green-700' : ewsData.ews_level === 'RED' ? 'text-[#FF3300]' : 'text-amber-600'}`}>
                                        <span className="material-symbols-outlined text-sm">emergency_heat</span>
                                        EWS: {ewsData.ews_level} ({ewsData.triggered_signals?.length || 0} signals)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-10 print:bg-white print:p-0 print:m-0 flex justify-center items-start">
                    {!analysisData ? (
                        <div className="flex flex-col items-center justify-center h-full print:hidden">
                            <h3 className="font-display font-black text-xl uppercase mb-3">No Analysis Data</h3>
                            <button onClick={() => navigate('/documents')} className="px-6 py-3 bg-black text-white font-bold uppercase hover:bg-[#FF3300]">Start Analysis</button>
                        </div>
                    ) : (
                        <div className="w-[210mm] min-h-[297mm] h-max bg-white p-[15mm] border border-black shadow-[4px_4px_0_0_#000] print:border-none print:shadow-none print:w-full print:p-0">

                            {/* --- HEADER (Matches Intec Capital Logo Area visually) --- */}
                            <div className="border border-black border-dashed p-4 mb-6 flex items-center justify-between">
                                <div className="flex-1 text-center">
                                    <h1 className="text-xl font-bold tracking-tight uppercase">CREDIT APPRAISAL MEMORANDUM</h1>
                                    <h2 className="text-lg text-[#FF8C00] font-semibold">{companyName || analysisData.company}</h2>
                                </div>
                                <div className="text-right font-mono text-[9px] w-32 border-l border-dashed border-black pl-3">
                                    <p>REF: {refId}</p>
                                    <p>DATE: {today}</p>
                                </div>
                            </div>

                            {/* --- INNOVATION: AI BOARDROOM DEBATE --- */}
                            <div className="border border-black p-4 mb-6 bg-gradient-to-r from-gray-50 to-white print:hidden shadow-[4px_4px_0_0_#000]">
                                <h3 className="font-display font-black text-lg uppercase mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#FF3300]">groups</span>
                                    AI Boardroom Debate
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Bull */}
                                    <div className="border border-green-600 bg-green-50 p-3 relative">
                                        <div className="absolute -top-3 -left-3 size-8 bg-green-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"><span className="material-symbols-outlined text-sm">trending_up</span></div>
                                        <h4 className="font-bold text-green-800 text-xs mb-1 uppercase tracking-wider ml-4">The Bull Analyst</h4>
                                        <p className="text-[10px] font-mono leading-tight text-gray-700">{cam.sec_16_swot?.strengths?.join('. ') || analysisData.analysis?.bull_thesis || "Strong revenue momentum and manageable leverage present a compelling case."}</p>
                                    </div>
                                    {/* Bear */}
                                    <div className="border border-red-600 bg-red-50 p-3 relative">
                                        <div className="absolute -top-3 -left-3 size-8 bg-red-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"><span className="material-symbols-outlined text-sm">trending_down</span></div>
                                        <h4 className="font-bold text-red-800 text-xs mb-1 uppercase tracking-wider ml-4">The Bear Analyst</h4>
                                        <p className="text-[10px] font-mono leading-tight text-gray-700">{cam.sec_16_swot?.weaknesses?.join('. ') || analysisData.analysis?.bear_thesis || "Tight liquidity and high working capital days are major red flags."}</p>
                                    </div>
                                    {/* Judge */}
                                    <div className="border border-blue-600 bg-blue-50 p-3 relative">
                                        <div className="absolute -top-3 -left-3 size-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm"><span className="material-symbols-outlined text-sm">balance</span></div>
                                        <h4 className="font-bold text-blue-800 text-xs mb-1 uppercase tracking-wider ml-4">The Chief Credit Officer</h4>
                                        <p className="text-[10px] font-mono font-bold leading-tight text-gray-900">{cam.sec_33_ho_observation || analysisData.analysis?.judge_verdict || "Approve with tight post-disbursement covenants."}</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- CRILC & EWS Intelligence Panel --- */}
                            {(crilcData || ewsData) && (
                                <div className="border border-black p-4 mb-6 print:hidden">
                                    <h3 className="font-display font-black text-sm uppercase mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#FF3300] text-base">hub</span>
                                        Regulatory Intelligence
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {crilcData && (
                                            <div className={`p-3 border-2 ${crilcData.status === 'CLEAN' ? 'border-green-600 bg-green-50' : crilcData.status?.includes('NPA') ? 'border-red-600 bg-red-50' : 'border-amber-500 bg-amber-50'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`material-symbols-outlined text-sm ${crilcData.status === 'CLEAN' ? 'text-green-700' : 'text-[#FF3300]'}`}>verified_user</span>
                                                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-500">CRILC Bureau Check</span>
                                                </div>
                                                <div className={`font-display font-black text-lg ${crilcData.status === 'CLEAN' ? 'text-green-700' : 'text-[#FF3300]'}`}>{crilcData.status}</div>
                                                <div className="font-mono text-[9px] text-gray-500 mt-1">{crilcData.reporting_banks?.length || 0} reporting banks • {crilcData.account_type || 'Standard'}</div>
                                            </div>
                                        )}
                                        {ewsData && (
                                            <div className={`p-3 border-2 ${ewsData.ews_level === 'GREEN' ? 'border-green-600 bg-green-50' : ewsData.ews_level === 'RED' ? 'border-red-600 bg-red-50' : 'border-amber-500 bg-amber-50'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`material-symbols-outlined text-sm ${ewsData.ews_level === 'GREEN' ? 'text-green-700' : ewsData.ews_level === 'RED' ? 'text-[#FF3300]' : 'text-amber-600'}`}>emergency_heat</span>
                                                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gray-500">RBI Early Warning System</span>
                                                </div>
                                                <div className={`font-display font-black text-lg ${ewsData.ews_level === 'GREEN' ? 'text-green-700' : ewsData.ews_level === 'RED' ? 'text-[#FF3300]' : 'text-amber-600'}`}>{ewsData.ews_level}</div>
                                                <div className="font-mono text-[9px] text-gray-500 mt-1">{ewsData.triggered_signals?.length || 0} signals triggered • classification: {ewsData.triggered_signals?.[0]?.rbi_classification || 'N/A'}</div>
                                            </div>
                                        )}
                                    </div>
                                    {ewsData?.triggered_signals?.length > 0 && (
                                        <div className="mt-3 space-y-1.5">
                                            {ewsData.triggered_signals.slice(0, 3).map((sig: any, i: number) => (
                                                <div key={i} className={`flex items-center gap-2 text-[10px] font-mono p-1.5 border ${sig.rbi_classification?.includes('NPA') ? 'border-red-300 bg-red-50 text-red-700' : sig.rbi_classification?.includes('SMA') ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                                                    <span className="font-bold uppercase">[{sig.rbi_classification}]</span>
                                                    <span>{sig.signal_name}:</span>
                                                    <span className="text-gray-600">{sig.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* START OF 9 CORE SECTIONS IN STRICT TABULAR FORMAT */}

                            {/* Section 1: Executive Summary */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">1. EXECUTIVE SUMMARY (BASIC DETAILS)</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        {renderRow("Proposal Snapshot", cam.sec_1_proposal_details)}
                                        {renderRow("Constitution & Vin", cam.sec_2_company_overview)}
                                        {renderRow("Internal Credit Rating", cam.sec_1_proposal_details?.split('Rating:')[1] || "Grade B+ (Investment Grade)")}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 2: Promoter & Management Profile */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">2. PROMOTER & MANAGEMENT PROFILE</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        <tr className="border-b border-black">
                                            <td className="p-2 border-r border-black font-semibold bg-gray-50 text-xs w-1/3">Promoter Details</td>
                                            <td className="p-2 text-xs font-mono">
                                                {cam.sec_3_promoters?.length ? (
                                                    <div className="space-y-2">
                                                        {cam.sec_3_promoters.map((p: any, i: number) => (
                                                            <div key={i} className="flex gap-4 border-b border-dashed border-gray-300 pb-2 last:border-0 last:pb-0">
                                                                <div className="w-1/4"><span className="text-gray-400 block text-[9px] uppercase">Name</span>{p.name || '--'}</div>
                                                                <div className="w-[10%]"><span className="text-gray-400 block text-[9px] uppercase">Age</span>{p.age || '--'}</div>
                                                                <div className="flex-1 text-right"><span className="text-gray-400 block text-[9px] uppercase text-right">Net Worth</span>{p.net_worth || '--'}</div>
                                                                <div className="w-1/3 text-left"><span className="text-gray-400 block text-[9px] uppercase text-left">Experience</span>{p.experience || '--'}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : '--'}
                                            </td>
                                        </tr>
                                        {renderRow("CIBIL & Credit History", cam.sec_10_cibil_status)}
                                        {renderMultiColRow([
                                            { label: "Management Quality", value: cam.sec_25_management_quality },
                                            { label: "Succession Planning", value: cam.sec_26_succession }
                                        ])}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 3: Business & Industry Analysis */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">3. BUSINESS & INDUSTRY ANALYSIS</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        {renderRow("Industry Overview", cam.sec_12_industry_overview)}
                                        {renderRow("Business Model", cam.sec_13_business_model)}
                                        {renderRow("Supplier & Customer", cam.sec_14_supplier_customer)}
                                        {renderRow("Competitor Analysis", cam.sec_15_competitors)}
                                        {renderRow("Group/Subsidiaries", cam.sec_24_subsidiaries)}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 4: Financial Analysis (The Core) */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">4. FINANCIAL ANALYSIS (THE CORE)</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        {renderRow("Historical Financials", <>
                                            <div><span className="font-bold border-b border-dotted border-gray-400">Revenue:</span> {cam.sec_8_financial_summary?.revenue || '--'}</div>
                                            <div className="mt-1"><span className="font-bold border-b border-dotted border-gray-400">EBITDA:</span> {cam.sec_8_financial_summary?.ebitda || '--'}</div>
                                            <div className="mt-1"><span className="font-bold border-b border-dotted border-gray-400">PAT:</span> {cam.sec_8_financial_summary?.pat || '--'}</div>
                                        </>)}
                                        {renderRow("Key Financial Ratios",
                                            <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                                                {cam.sec_9_ratio_analysis || `Liquidity (CR/Quick): --\nSolvency (DER, TOL/TNW): --\nCoverage (DSCR, ICR): --`}
                                            </div>
                                        )}
                                        {renderRow("Working Capital Cycle", cam.sec_29_working_capital)}
                                        {renderRow("Cash Flow & Projections", cam.sec_30_cash_flow)}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 5: Project Details */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">5. PROJECT DETAILS</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        {renderRow("End Use / Cost of Project", cam.sec_19_end_use)}
                                        {renderRow("Site Verification", cam.sec_20_verification)}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 6: Security & Collateral Details */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">6. SECURITY & COLLATERAL DETAILS</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        {renderRow("Primary & Collateral Security", cam.sec_6_security)}
                                        {renderRow("Guarantees", cam.sec_7_guarantors)}
                                        {renderRow("Insurance Adequacy", cam.sec_22_insurance)}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 7: Risk Assessment & Mitigation */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">7. RISK ASSESSMENT & MITIGATION</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        {renderRow("SWOT Analysis", <>
                                            <div className="flex flex-col gap-2 text-[10px]">
                                                <div className="border border-black p-1"><span className="font-bold text-green-700">STRENGTHS:</span> {cam.sec_16_swot?.strengths?.join(', ') || '--'}</div>
                                                <div className="border border-black p-1"><span className="font-bold text-red-700">WEAKNESSES:</span> {cam.sec_16_swot?.weaknesses?.join(', ') || '--'}</div>
                                                <div className="border border-black p-1"><span className="font-bold text-blue-700">OPPORTUNITIES:</span> {cam.sec_16_swot?.opportunities?.join(', ') || '--'}</div>
                                                <div className="border border-black p-1"><span className="font-bold text-orange-700">THREATS:</span> {cam.sec_16_swot?.threats?.join(', ') || '--'}</div>
                                            </div>
                                        </>)}
                                        {renderRow("Key Risks & Tech", cam.sec_27_technology)}
                                        {renderMultiColRow([
                                            { label: "Forex Exposure", value: cam.sec_28_foreign_exchange },
                                            { label: "ESG / Env Risk", value: cam.sec_23_environmental }
                                        ])}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 8: Banking Arrangement & Account Conduct */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-sm bg-gray-200 border border-black px-2 py-1 mb-2">8. BANKING ARRANGEMENT & ACCOUNT CONDUCT</h3>
                                <table className="w-full border-collapse border border-black table-fixed break-words">
                                    <tbody>
                                        <tr className="border-b border-black">
                                            <td className="p-2 border-r border-black font-semibold bg-gray-50 text-xs w-1/3">Proposed/Existing Facilities</td>
                                            <td className="p-0">
                                                <table className="w-full text-xs font-mono">
                                                    <thead><tr className="border-b border-black bg-gray-100"><th className="border-r border-black p-1 text-left">Nature</th><th className="border-r border-black p-1 text-right">Existing</th><th className="border-r border-black p-1 text-right">Proposed</th><th className="p-1 text-left">Tenure</th></tr></thead>
                                                    <tbody>
                                                        {cam.sec_4_facilities?.length ? cam.sec_4_facilities.map((f: any, i: number) => (
                                                            <tr key={i} className="border-b border-gray-300 last:border-b-0">
                                                                <td className="border-r border-black p-1">{f.nature || '--'}</td>
                                                                <td className="border-r border-black p-1 text-right">{f.existing || '--'}</td>
                                                                <td className="border-r border-black p-1 text-right">{f.proposed || '--'}</td>
                                                                <td className="p-1">{f.tenure || '--'}</td>
                                                            </tr>
                                                        )) : <tr><td colSpan={4} className="p-1 text-center">--</td></tr>}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        {renderRow("Account Conduct", cam.sec_11_banking_conduct)}
                                        {renderRow("Market/Trade References", cam.sec_21_references)}
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 9: Terms, Covenants & Recommendation */}
                            <div className="mb-6 page-break-inside-avoid">
                                <h3 className="font-bold text-[13px] bg-[#d9e1d1] border border-black px-2 py-1 uppercase underline decoration-1 underline-offset-2">9. TERMS, COVENANTS & RECOMMENDATION</h3>

                                <div className="border-l border-r border-b border-black p-3 text-xs bg-white">
                                    <div className="mb-3 font-mono">
                                        <span className="font-bold border-b border-dotted border-gray-400 block mb-1">Pricing & Fees:</span>
                                        ROI: {cam.sec_5_pricing?.roi || '--'} | Processing Fee: {cam.sec_5_pricing?.processing_fee || '--'} | Penal: {cam.sec_5_pricing?.penal_interest || '--'}
                                    </div>
                                    <div className="mb-3 font-mono">
                                        <span className="font-bold border-b border-dotted border-gray-400 block mb-1">Statutory Compliance & Deviations:</span>
                                        {cam.sec_17_compliance || '--'}
                                        <div className="text-red-700 bg-red-50 p-1 mt-1 font-bold">Deviations: {cam.sec_31_deviation_matrix || 'None'}</div>
                                    </div>

                                    <div className="mb-3">
                                        <h4 className="font-bold text-[#FF3300] uppercase mb-1 border-b border-gray-200">Conditions & Covenants (Analyst Recommendation)</h4>
                                        <div className="font-mono text-justify leading-relaxed whitespace-pre-wrap">
                                            {cam.sec_32_analyst_recommendation || '--'}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-bold text-blue-800 uppercase mb-1 border-b border-gray-200">H.O. Credit Analyst Observation</h4>
                                        <div className="font-mono text-justify leading-relaxed whitespace-pre-wrap">
                                            {cam.sec_33_ho_observation || '--'}
                                        </div>
                                    </div>

                                    <div className="border border-black bg-[#f7f7f7] p-4 text-center">
                                        <h4 className="font-bold text-sm uppercase mb-2 tracking-widest">FINAL CREDIT COMMITTEE DECISION</h4>
                                        <div className={`inline-block px-6 py-2 border-4 font-black text-xl uppercase tracking-widest ${cam.sec_34_committee_decision?.includes('REJECT') ? 'border-red-600 text-red-600' : 'border-green-600 text-green-700'}`}>
                                            {cam.sec_34_committee_decision || '--'}
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-black border-t-0 bg-[#d9e1d1] p-1 flex uppercase text-[10px]"><span className="flex-1 text-center font-bold">Approval Committee Signatures</span></div>
                                <div className="border border-black border-t-0 flex text-[10px] bg-white h-12">
                                    <div className="flex-1 border-r border-black p-1 flex flex-col justify-end text-center">Name</div>
                                    <div className="flex-1 border-r border-black p-1 flex flex-col justify-end text-center bg-[#d9e1d1]">Designation</div>
                                    <div className="flex-1 p-1 flex flex-col justify-end text-center">Signature</div>
                                </div>
                            </div>

                            {/* --- SECTION 10: SHAP-DRIVEN SMART COVENANTS --- */}
                            {covenantsData.length > 0 && (
                                <div className="mb-6 page-break-inside-avoid print:hidden">
                                    <h3 className="font-bold text-[13px] bg-[#1c100d] text-white border border-black px-2 py-1 uppercase flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#FF3300] text-sm">auto_fix_high</span>
                                        10. SHAP-DRIVEN SMART COVENANTS (AI-GENERATED)
                                    </h3>
                                    <div className="border border-black border-t-0">
                                        <table className="w-full text-[10px] font-mono border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 border-b border-black">
                                                    <th className="p-2 text-left border-r border-black font-bold uppercase">Covenant</th>
                                                    <th className="p-2 text-center border-r border-black font-bold uppercase w-24">Threshold</th>
                                                    <th className="p-2 text-center border-r border-black font-bold uppercase w-20">Frequency</th>
                                                    <th className="p-2 text-left font-bold uppercase">Breach Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {covenantsData.map((c: any, i: number) => (
                                                    <tr key={i} className={`border-b border-gray-200 ${c.risk_driver ? 'bg-[#FF3300]/5' : ''}`}>
                                                        <td className="p-2 border-r border-black">
                                                            <span className="font-bold text-black">{c.covenant}</span>
                                                            {c.risk_driver && <span className="ml-1 text-[#FF3300] text-[9px]">↑ {c.risk_driver}</span>}
                                                        </td>
                                                        <td className="p-2 border-r border-black text-center font-bold">{c.threshold}</td>
                                                        <td className="p-2 border-r border-black text-center">{c.frequency}</td>
                                                        <td className="p-2 text-gray-600">{c.breach_action}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Results;
