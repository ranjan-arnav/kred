import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StepProgress from '../components/StepProgress';
import { useAppContext } from '../context/AppContext';
import { kredApi } from '../services/api';

const Scoring: React.FC = () => {
    const navigate = useNavigate();
    const { companyName, completeStep, setCurrentStep } = useAppContext();
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [benchmarkData, setBenchmarkData] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem("kred_analysis_data");
        if (stored) {
            try {
                setAnalysisData(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored analysis data:", e);
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!analysisData) return;
        const features = analysisData.input_features || {};
        const industry = features.industry || 'Manufacturing';
        kredApi.getSectorBenchmark(industry, features)
            .then(setBenchmarkData)
            .catch(() => {});
    }, [analysisData]);

    const fiveC = analysisData?.model_metrics?.five_c;
    const score = analysisData?.model_metrics?.score;
    const grade = analysisData?.model_metrics?.grade;
    const features = analysisData?.input_features || {};

    // Compute sub-scores from Five Cs (dynamic!)
    const financialHealth = fiveC ? Math.round((fiveC.capacity + fiveC.capital) / 2) : null;
    const marketPosition = fiveC ? Math.round((fiveC.conditions + fiveC.collateral) / 2) : null;
    const mgmtQuality = fiveC?.character ?? null;

    // Liquidity & Solvency derived from actual features
    const liquidityScore = features.current_ratio
        ? Math.min(100, Math.round(features.current_ratio * 50))
        : null;
    const solvencyScore = features.debt_to_equity
        ? Math.min(100, Math.round((3 - Math.min(features.debt_to_equity, 3)) / 3 * 100))
        : null;

    const liquidityLabel = liquidityScore !== null ? (liquidityScore >= 70 ? 'Strong' : liquidityScore >= 40 ? 'Adequate' : 'Critical') : '--';
    const solvencyLabel = solvencyScore !== null ? (solvencyScore >= 70 ? 'Strong' : solvencyScore >= 40 ? 'Adequate' : 'Critical') : '--';

    const handleProceedToResults = () => {
        completeStep(4);
        setCurrentStep(5);
        navigate('/results');
    };

    return (
        <div className="bg-white text-black font-body antialiased overflow-hidden flex flex-col h-screen selection:bg-[#FF3300] selection:text-white">
            <Header />
            <StepProgress />

            <main className="flex-1 flex overflow-hidden">
                <Sidebar />

                {/* Left: Decision Tree Canvas */}
                <section className="flex-1 relative overflow-auto cursor-grab active:cursor-grabbing bg-[#FAFAFA] scoring-canvas-bg">
                    {/* Floating Data Tag */}
                    <div className="absolute top-6 left-6 z-10 bg-white border border-black p-4 shadow-none">
                        <h2 className="font-display font-bold text-lg leading-tight mb-1">{companyName || 'Company Name'}</h2>
                        <div className="font-mono text-xs text-gray-500">ML SCORING ENGINE • STEP 4 OF 5</div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 left-6 z-10 flex flex-col border border-black bg-white">
                        <button onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} title="Zoom In" className="p-2 hover:bg-black hover:text-white transition-colors border-b border-black">
                            <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                        <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))} title="Zoom Out" className="p-2 hover:bg-black hover:text-white transition-colors border-b border-black">
                            <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <button onClick={() => setZoom(1)} title="Reset Zoom" className="p-2 hover:bg-black hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">center_focus_strong</span>
                        </button>
                    </div>
                    <div className="absolute bottom-6 right-6 z-10 font-mono text-[10px] text-gray-400 bg-white border border-gray-200 px-2 py-1">
                        ZOOM: {Math.round(zoom * 100)}%
                    </div>

                    {/* Tree Diagram Container */}
                    <div className="min-w-[1200px] min-h-[800px] p-20 flex items-center justify-center relative zoom-container" style={{ '--zoom': zoom } as React.CSSProperties}>

                        {/* Connectors */}
                        <div className="absolute border border-black z-0 pointer-events-none w-20 h-[170px] top-[300px] left-[320px] border-l-0 border-b-0"></div>
                        <div className="absolute border border-black z-0 pointer-events-none w-20 h-[170px] top-[130px] left-[320px] border-r-0 border-b-0"></div>
                        <div className="absolute border-t border-black z-0 pointer-events-none w-20 top-[300px] left-[320px]"></div>
                        <div className="absolute border-2 border-[#FF3300] z-0 pointer-events-none w-16 h-[80px] top-[140px] left-[580px] border-l-0 border-b-0"></div>
                        <div className="absolute border-2 border-[#FF3300] z-0 pointer-events-none w-16 h-[80px] top-[60px] left-[580px] border-r-0 border-b-0"></div>

                        {/* Root Node */}
                        <div className="absolute left-[100px] top-[260px] z-20">
                            <div className="w-56 bg-white border border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-xs text-gray-500 uppercase">Aggregator</span>
                                    <span className="material-symbols-outlined text-gray-400">functions</span>
                                </div>
                                <div className="font-display font-bold text-xl mb-1">Kred-Score</div>
                                <div className="w-full bg-gray-200 h-1 mt-2 mb-1">
                                    <div className="bg-[#FF3300] h-full score-bar-fill" style={{ '--bar-w': score ? `${Math.round(score / 9)}%` : '0%' } as React.CSSProperties}></div>
                                </div>
                                <div className="flex justify-between font-mono text-xs">
                                    <span>Contribution</span>
                                    <span className="font-bold">100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Level 1: Financial Health (from Capacity + Capital) */}
                        <div className="absolute left-[400px] top-[100px] z-20">
                            <div className="bg-black text-white w-48 border border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer relative">
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-[#FF3300]"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] uppercase text-gray-400">Weighted: 45%</span>
                                    <div className="size-2 rounded-full bg-[#FF3300]"></div>
                                </div>
                                <div className="font-display font-bold text-lg leading-tight">Financial Health</div>
                                <div className="font-mono text-2xl font-medium mt-2 text-white">
                                    {isLoading ? '--' : (financialHealth ?? '--')}
                                    <span className="text-sm text-gray-400">/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Level 1: Market Position (from Conditions + Collateral) */}
                        <div className="absolute left-[400px] top-[270px] z-20">
                            <div className="w-48 bg-white border border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer opacity-60 hover:opacity-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] uppercase text-gray-500">Weighted: 30%</span>
                                </div>
                                <div className="font-display font-bold text-lg leading-tight">Market Position</div>
                                <div className="font-mono text-2xl font-medium mt-2">
                                    {isLoading ? '--' : (marketPosition ?? '--')}
                                    <span className="text-sm text-gray-400">/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Level 1: Management Quality (from Character) */}
                        <div className="absolute left-[400px] top-[430px] z-20">
                            <div className="w-48 bg-white border border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer opacity-60 hover:opacity-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] uppercase text-gray-500">Weighted: 25%</span>
                                </div>
                                <div className="font-display font-bold text-lg leading-tight">Mgmt Quality</div>
                                <div className="font-mono text-2xl font-medium mt-2">
                                    {isLoading ? '--' : (mgmtQuality ?? '--')}
                                    <span className="text-sm text-gray-400">/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Level 2: Liquidity (from Current Ratio) */}
                        <div className="absolute left-[660px] top-[20px] z-20">
                            <div className={`w-44 bg-white border border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer ${liquidityScore !== null && liquidityScore < 50 ? 'border-l-4 border-l-[#FF3300]' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] uppercase text-gray-500">Factor</span>
                                    {liquidityScore !== null && (
                                        <span className={`material-symbols-outlined text-[16px] ${liquidityScore < 50 ? 'text-[#FF3300]' : 'text-green-600'}`}>
                                            {liquidityScore < 50 ? 'warning' : 'check_circle'}
                                        </span>
                                    )}
                                </div>
                                <div className="font-display font-bold text-base leading-tight">Liquidity</div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <div className={`font-mono text-xl font-bold ${liquidityScore !== null && liquidityScore < 50 ? 'text-[#FF3300]' : ''}`}>
                                        {liquidityScore ?? '--'}
                                    </div>
                                    <span className={`text-[10px] font-bold px-1 uppercase ${liquidityLabel === 'Critical' ? 'bg-[#FF3300]/10 text-[#FF3300]' : liquidityLabel === 'Adequate' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {liquidityLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Level 2: Solvency (from D/E Ratio) */}
                        <div className="absolute left-[660px] top-[140px] z-20">
                            <div className="w-44 bg-white border border-black p-3 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-[10px] uppercase text-gray-500">Factor</span>
                                    {solvencyScore !== null && (
                                        <span className={`material-symbols-outlined text-[16px] ${solvencyScore >= 60 ? 'text-green-600' : 'text-amber-500'}`}>
                                            {solvencyScore >= 60 ? 'check_circle' : 'info'}
                                        </span>
                                    )}
                                </div>
                                <div className="font-display font-bold text-base leading-tight">Solvency</div>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <div className="font-mono text-xl font-bold">{solvencyScore ?? '--'}</div>
                                    <span className={`text-[10px] font-bold px-1 uppercase ${solvencyLabel === 'Critical' ? 'bg-[#FF3300]/10 text-[#FF3300]' : solvencyLabel === 'Adequate' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {solvencyLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Right: Score Inspector */}
                <aside className="w-[400px] border-l border-black bg-white flex flex-col z-30 shadow-xl shrink-0">

                    {/* Fixed Score Box */}
                    <div className="p-8 border-b-4 border-black bg-[#F4F4F4] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-[120px]">security</span>
                        </div>
                        <div className="relative z-10">
                            <div className="text-sm font-mono font-bold text-gray-500 tracking-wider mb-2">CREDIT SCORE</div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-display font-black text-8xl tracking-tighter text-black">
                                    {isLoading ? '...' : (score ?? '--')}
                                </span>
                                <span className="font-display font-bold text-2xl text-gray-400">/900</span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="bg-black text-white text-sm font-bold px-3 py-1 font-mono">
                                    RISK GRADE: {isLoading ? '-' : (grade ?? '--')}
                                </span>
                                <span className="text-sm font-medium text-gray-600">
                                    {analysisData?.model_metrics?.grade_description || 'Awaiting Analysis'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SHAP Variables */}
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-black bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-[#FF3300]">account_tree</span>
                                <span className="font-mono text-xs font-bold text-[#FF3300] uppercase">SHAP Feature Attribution</span>
                            </div>
                            <h3 className="font-display font-bold text-2xl">Key Risk Drivers</h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                Top features driving the credit score, ranked by impact magnitude.
                            </p>
                        </div>

                        <div className="flex-1 p-6 bg-white space-y-6">
                            <div>
                                <h4 className="font-mono text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                                    Input Variables (SHAP) <div className="h-px bg-gray-200 flex-1"></div>
                                </h4>

                                <div className="space-y-3">
                                    {isLoading ? (
                                        <div className="text-xs font-mono text-gray-400 animate-pulse">Running ML Pipeline...</div>
                                    ) : !analysisData?.shap_values?.length ? (
                                        <div className="text-xs font-mono text-gray-400">No analysis data available. Run analysis from Due Diligence step.</div>
                                    ) : (
                                        analysisData.shap_values.slice(0, 6).map((shap: any, idx: number) => (
                                            <div key={idx} className={`flex justify-between items-center group cursor-pointer ${shap.type === 'negative' ? 'border-l-2 border-[#FF3300] pl-3 -ml-3 bg-[#FF3300]/5 p-2' : ''}`}>
                                                <div>
                                                    <div className="font-bold text-sm">{shap.feature}</div>
                                                    <div className="text-xs text-gray-500 font-mono" title={shap.desc}>{shap.desc?.substring(0, 30) || ''}...</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-mono font-bold ${shap.type === 'negative' ? 'text-[#FF3300]' : 'text-black'}`}>
                                                        {shap.value}
                                                    </div>
                                                    <div className={`text-[10px] font-bold px-1 inline-block ${shap.type === 'negative' ? 'bg-[#FF3300] text-white' : 'bg-green-100 text-green-800'}`}>
                                                        {shap.type === 'negative' ? `${shap.impact} RISK` : `+${shap.impact} POS`}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Five Cs Summary */}
                            {fiveC && (
                                <div className="pt-4">
                                    <h4 className="font-mono text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                                        Five Cs of Credit <div className="h-px bg-gray-200 flex-1"></div>
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { name: 'Character', val: fiveC.character },
                                            { name: 'Capacity', val: fiveC.capacity },
                                            { name: 'Capital', val: fiveC.capital },
                                            { name: 'Collateral', val: fiveC.collateral },
                                            { name: 'Conditions', val: fiveC.conditions },
                                        ].map(c => (
                                            <div key={c.name} className="flex items-center gap-3">
                                                <span className="font-mono text-xs w-24">{c.name}</span>
                                                <div className="flex-1 h-2 bg-gray-200">
                                                    <div
                                                        className={`h-full five-c-bar ${c.val >= 75 ? 'bg-green-500' : c.val >= 55 ? 'bg-amber-400' : 'bg-[#FF3300]'}`}
                                                        style={{ '--bar-w': `${c.val}%` } as React.CSSProperties}
                                                    ></div>
                                                </div>
                                                <span className="font-mono text-xs font-bold w-10 text-right">{c.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sector Benchmark Panel */}
                            {benchmarkData && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="font-mono text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                                        Sector Benchmark
                                        <span className="text-[9px] bg-black text-white px-1">{benchmarkData.industry}</span>
                                        <div className="h-px bg-gray-200 flex-1"></div>
                                    </h4>
                                    <div className="space-y-3">
                                        {Object.entries(benchmarkData.percentile_rank || {}).slice(0, 5).map(([metric, percentile]: [string, any]) => {
                                            const bm = benchmarkData.benchmarks?.[metric];
                                            const pct = typeof percentile === 'number' ? percentile : 0;
                                            return (
                                                <div key={metric}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-mono text-[10px] uppercase">{metric.replace(/_/g, ' ')}</span>
                                                        <span className={`font-mono text-[10px] font-bold ${pct >= 60 ? 'text-green-600' : pct >= 35 ? 'text-amber-600' : 'text-[#FF3300]'}`}>P{pct}</span>
                                                    </div>
                                                    <div className="relative h-2 bg-gray-100">
                                                        <div className="absolute h-full bg-gray-300 opacity-40 left-1/4 w-1/2"></div>
                                                        <div className={`absolute w-2 h-2 top-0 -translate-x-1/2 benchmark-dot ${pct >= 60 ? 'bg-green-500' : pct >= 35 ? 'bg-amber-400' : 'bg-[#FF3300]'}`} style={{ '--dot-left': `${Math.min(pct, 99)}%` } as React.CSSProperties}></div>
                                                        <div className="absolute h-full w-px bg-black opacity-30 left-1/2"></div>
                                                    </div>
                                                    {bm && <div className="font-mono text-[9px] text-gray-400 mt-0.5">P50: {bm.p50}</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div className="p-6 border-t border-black bg-[#F4F4F4] mt-auto">
                            <button
                                onClick={handleProceedToResults}
                                disabled={!analysisData}
                                className={`w-full h-12 flex items-center justify-center gap-2 font-bold transition-colors group ${analysisData
                                        ? 'bg-black text-white hover:bg-[#FF3300]'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <span>GENERATE CAM REPORT</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            {!analysisData && (
                                <div className="text-center mt-3 text-xs text-amber-600 font-mono">
                                    Complete Due Diligence analysis first
                                </div>
                            )}
                        </div>

                    </div>
                </aside>

            </main>
        </div>
    );
};

export default Scoring;
