import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StepProgress from '../components/StepProgress';
import { useNavigate } from 'react-router-dom';
import { kredApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

const Research: React.FC = () => {
    const navigate = useNavigate();
    const { companyName: contextCompany, setCompanyName: setContextCompany, completeStep, setCurrentStep, setResearchData: setContextResearch } = useAppContext();
    const [companyName, setCompanyName] = useState(contextCompany || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isRiskExpanded, setIsRiskExpanded] = useState(false);
    const [researchData, setResearchData] = useState<any>(null);
    const [insight, setInsight] = useState('');
    const [insightResult, setInsightResult] = useState<any>(null);
    const [isSubmittingInsight, setIsSubmittingInsight] = useState(false);
    const [insightError, setInsightError] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
        mca: true, legal: true, gst: true, news: true, sector: true, cibil: true, rbi: true
    });

    const toggleFilter = (key: string) => {
        setActiveFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmitInsight = async () => {
        if (!insight.trim()) return;
        setIsSubmittingInsight(true);
        setInsightError('');
        try {
            const data = await kredApi.addPrimaryInsight(companyName, insight);
            setInsightResult(data);
            setInsight('');
        } catch (error) {
            console.error("Insight error:", error);
            setInsightError('Failed to submit insight. Ensure backend is running.');
        } finally {
            setIsSubmittingInsight(false);
        }
    };

    const handleResearch = async () => {
        setIsLoading(true);
        setContextCompany(companyName);
        try {
            const data = await kredApi.performResearch(companyName);
            setResearchData(data);
            setContextResearch(data);
        } catch (error) {
            console.error("Research error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToDueDiligence = () => {
        completeStep(2);
        setCurrentStep(3);
        navigate('/due-diligence');
    };

    return (
        <div className="bg-white text-slate-900 font-display min-h-screen flex flex-col overflow-hidden">
            <Header />
            <StepProgress />

            {/* Breadcrumb section from this design */}
            <div className="flex items-center justify-between whitespace-nowrap border-b-2 border-black bg-white px-8 py-4 shrink-0 transition-all">
                <div className="flex items-center gap-6">
                    <div className="h-8 w-[2px] bg-slate-200 mx-2"></div>
                    <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Active Investigation</span>
                        <input
                            type="text"
                            className="text-lg font-bold leading-tight outline-none border-b border-dashed border-slate-300 focus:border-black bg-transparent"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            aria-label="Company name under investigation"
                            title="Company name"
                        />
                    </div>
                    <button
                        onClick={handleResearch}
                        disabled={isLoading}
                        className="ml-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase disabled:opacity-50 hover:bg-[#FF3300] transition-colors"
                    >
                        {isLoading ? 'RESEARCHING...' : 'RUN AGENT'}
                    </button>
                </div>
            </div>

            <main className="flex flex-1 overflow-hidden relative">
                <Sidebar active="research" />

                {/* Left Focus Sidebar: Sources Filter */}
                <aside className="w-80 bg-[#F4F4F4] border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
                    <div className="p-6">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-6 font-bold">Data Sources</h3>
                        <div className="space-y-6">

                            {/* Group 1 */}
                            <div>
                                <h4 className="text-sm font-bold mb-3 border-b border-slate-200 pb-2">PUBLIC RECORDS</h4>
                                <div className="space-y-3">
                                    {[{ name: 'MCA Filings', key: 'mca' }, { name: 'Court Records', key: 'legal' }, { name: 'GST Data', key: 'gst' }].map(src => {
                                        const count = researchData?.source_counts?.[src.key] || (researchData ? '--' : '00');
                                        const hasData = count !== '00' && count !== '--' && count > 0;
                                        return (
                                            <label key={src.key} className="flex items-center justify-between group cursor-pointer" onClick={(e) => { e.preventDefault(); toggleFilter(src.key); }}>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" readOnly checked={activeFilters[src.key]} className="appearance-none w-4 h-4 border-2 border-slate-800 checked:bg-[#FF3300] checked:border-[#FF3300]" />
                                                    <span className={`text-sm font-medium transition-colors ${!activeFilters[src.key] ? 'text-slate-400 line-through' : 'group-hover:text-[#FF3300]'}`}>{src.name}</span>
                                                </div>
                                                <span className={`font-mono text-xs px-1.5 py-0.5 ${hasData ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {String(count).padStart(2, '0')}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Group 2 */}
                            <div>
                                <h4 className="text-sm font-bold mb-3 border-b border-slate-200 pb-2">MEDIA & NEWS</h4>
                                <div className="space-y-3">
                                    {[{ name: 'News Articles', key: 'news' }, { name: 'Sector Intel', key: 'sector' }].map(src => {
                                        const count = researchData?.source_counts?.[src.key] || (researchData ? '--' : '00');
                                        const hasData = count !== '00' && count !== '--' && count > 0;
                                        return (
                                            <label key={src.key} className="flex items-center justify-between group cursor-pointer" onClick={(e) => { e.preventDefault(); toggleFilter(src.key); }}>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" readOnly checked={activeFilters[src.key]} className="appearance-none w-4 h-4 border-2 border-slate-800 checked:bg-[#FF3300] checked:border-[#FF3300]" />
                                                    <span className={`text-sm font-medium transition-colors ${!activeFilters[src.key] ? 'text-slate-400 line-through' : 'group-hover:text-[#FF3300]'}`}>{src.name}</span>
                                                </div>
                                                <span className={`font-mono text-xs px-1.5 py-0.5 ${hasData ? 'bg-slate-200 text-black' : 'bg-slate-200 text-slate-500'}`}>
                                                    {String(count).padStart(2, '0')}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Group 3 */}
                            <div>
                                <h4 className="text-sm font-bold mb-3 border-b border-slate-200 pb-2">REGULATORY</h4>
                                <div className="space-y-3">
                                    {[{ name: 'CIBIL Alerts', key: 'cibil' }, { name: 'RBI Defaulters', key: 'rbi' }].map(src => {
                                        const count = researchData?.source_counts?.[src.key] || 0;
                                        const hasData = count > 0;
                                        return (
                                            <label key={src.key} className="flex items-center justify-between group cursor-pointer" onClick={(e) => { e.preventDefault(); toggleFilter(src.key); }}>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" readOnly checked={activeFilters[src.key]} className="appearance-none w-4 h-4 border-2 border-slate-800 checked:bg-[#FF3300] checked:border-[#FF3300]" />
                                                    <span className={`text-sm font-medium transition-colors ${!activeFilters[src.key] ? 'text-slate-400 line-through' : 'group-hover:text-[#FF3300]'}`}>{src.name}</span>
                                                </div>
                                                <span className={`font-mono text-xs px-1.5 py-0.5 ${hasData ? 'bg-[#FF3300] text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {String(count).padStart(2, '0')}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        <div className="mt-12 bg-slate-100 p-4 border border-slate-200">
                            <h4 className="text-xs font-bold uppercase mb-2">Filters Active</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-mono border border-slate-300 bg-white px-1 py-0.5">LAST 6 MONTHS</span>
                                <span className="text-[10px] font-mono border border-slate-300 bg-white px-1 py-0.5">EXCLUDE: DUPLICATES</span>
                            </div>
                        </div>

                        {/* Primary Insight Input */}
                        <div className="mt-6">
                            <h4 className="text-sm font-bold mb-3 border-b border-slate-200 pb-2">PRIMARY INSIGHT</h4>
                            <p className="text-xs text-slate-500 mb-3">Add qualitative field observations from site visits or credit officer notes.</p>
                            <textarea
                                className="w-full border border-black p-3 text-sm font-body resize-none focus:outline-none focus:ring-1 focus:ring-[#FF3300] bg-white"
                                rows={3}
                                placeholder="e.g., Factory visit revealed fully operational 3rd production line..."
                                value={insight}
                                onChange={(e) => setInsight(e.target.value)}
                            />
                            <button
                                onClick={handleSubmitInsight}
                                disabled={isSubmittingInsight || !insight.trim()}
                                className="mt-2 w-full bg-black text-white py-2 text-xs font-bold font-mono uppercase hover:bg-[#FF3300] transition-colors disabled:opacity-50"
                            >
                                {isSubmittingInsight ? 'ANALYZING...' : 'SUBMIT INSIGHT'}
                            </button>
                            {insightError && <p className="text-xs text-[#FF3300] mt-2 font-mono">{insightError}</p>}
                            {insightResult && (
                                <div className={`mt-3 p-3 border ${insightResult.sentiment === 'RISK' ? 'border-[#FF3300] bg-[#FF3300]/5' : 'border-green-500 bg-green-50'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`material-symbols-outlined text-sm ${insightResult.sentiment === 'RISK' ? 'text-[#FF3300]' : 'text-green-600'}`}>
                                            {insightResult.sentiment === 'RISK' ? 'warning' : 'check_circle'}
                                        </span>
                                        <span className="font-mono text-xs font-bold uppercase">{insightResult.sentiment}</span>
                                    </div>
                                    <p className="text-xs text-gray-700 leading-snug">{insightResult.ai_analysis}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Feed Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
                    {/* Sticky Feed Header */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-display font-black text-xl tracking-tight">INTELLIGENCE FEED <span className="text-slate-400 font-normal text-lg ml-2">{researchData ? `${(researchData.raw_news?.length || 0) + (researchData.mca_filings?.length || 0) + (researchData.legal_records?.length || 0) + (researchData.sector_intelligence?.length || 0)} Findings` : 'Awaiting Data'}</span></h2>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-slate-200 hover:border-black uppercase tracking-wider transition-colors">
                                <span className="material-symbols-outlined text-sm">sort</span> Sort by Impact
                            </button>
                            <button
                                onClick={() => navigate('/risk-dna')}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-black text-white hover:bg-[#FF3300] transition-colors uppercase tracking-wider"
                            >
                                <span className="material-symbols-outlined text-sm">science</span> View Risk DNA
                            </button>
                        </div>
                    </div>

                    {/* Feed Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 pb-32 space-y-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <span className="material-symbols-outlined animate-spin text-4xl mb-4">refresh</span>
                                <p className="font-mono text-sm uppercase tracking-widest">Agent is thinking...</p>
                            </div>
                        ) : !researchData ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-4">search</span>
                                <p className="font-mono text-sm uppercase tracking-widest">Run Agent to gather intelligence.</p>
                            </div>
                        ) : (
                            (() => {
                                const allItems = [
                                    ...(activeFilters.news ? (researchData.raw_news || []) : []).map((n: any) => ({ ...n, type: 'NEWS', source: 'NEWS SCRAPER', severity: n.title.toLowerCase().includes('fraud') || n.title.toLowerCase().includes('notice') ? 'CRITICAL' : 'WARNING' })),
                                    ...(activeFilters.mca ? (researchData.mca_filings || []) : []).map((m: any) => ({ ...m, type: 'MCA', source: 'MCA REGISTRY', severity: 'INFO' })),
                                    ...(activeFilters.legal ? (researchData.legal_records || []) : []).map((l: any) => ({ ...l, type: 'LEGAL', source: 'COURT/NCLT DB', severity: 'CRITICAL' })),
                                    ...(activeFilters.sector ? (researchData.sector_intelligence || []) : []).map((s: any) => ({ ...s, type: 'SECTOR', source: 'RBI / REGULATORY', severity: 'INFO' }))
                                ];

                                return allItems.map((news: any, idx: number) => (
                                    <article key={idx} className="group flex gap-6 items-start">
                                        <div className="flex flex-col items-center gap-2 shrink-0 pt-1">
                                            <div className={`size-3 ${news.severity === 'CRITICAL' ? 'bg-[#FF3300]' : news.severity === 'WARNING' ? 'border-2 border-[#FF3300] bg-white' : 'bg-black'} rounded-none`}></div>
                                            <div className="w-px h-full bg-slate-200 group-last:hidden"></div>
                                        </div>
                                        <div className="flex-1 pb-8 border-b border-slate-100 group-last:border-0">
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className={`text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${news.severity === 'CRITICAL' ? 'bg-[#FF3300]' : news.severity === 'WARNING' ? 'border border-[#FF3300] text-[#FF3300] bg-transparent' : 'bg-black'}`}>
                                                    {news.type} - {news.severity}
                                                </span>
                                                <span className="text-xs font-mono text-slate-500">SOURCE: {news.source}</span>
                                            </div>
                                            <a href={news.url} target="_blank" rel="noopener noreferrer" className="block text-xl font-bold mb-3 leading-snug hover:text-[#FF3300] transition-colors cursor-pointer text-black">
                                                {news.title}
                                            </a>
                                            <p className="text-sm text-slate-600 leading-relaxed mb-4">{String(news.snippet || '').replace(/<[^>]*>/g, '')}</p>
                                        </div>
                                    </article>
                                ));
                            })()
                        )}
                    </div>

                    {/* Sticky Footer: The Verdict */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black text-white p-0 border-t-4 border-[#FF3300] z-30 shadow-2xl">
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left: Score — dynamic from research sentiment */}
                            <div className="bg-[#FF3300]/20 md:w-64 p-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3300] font-bold mb-1">Risk Assessment</span>
                                <div className="flex items-baseline gap-2">
                                    {researchData ? (() => {
                                        const score = researchData.analysis?.sentiment_score ?? 50;
                                        const level = score >= 70 ? 'LOW' : score >= 40 ? 'MEDIUM' : 'HIGH';
                                        const lvlNum = score >= 70 ? 1 : score >= 40 ? 2 : score >= 20 ? 3 : 4;
                                        return (
                                            <>
                                                <h2 className={`text-3xl font-black ${level === 'HIGH' ? 'text-[#FF3300]' : level === 'MEDIUM' ? 'text-amber-400' : 'text-green-400'}`}>{level}</h2>
                                                <span className="text-sm font-bold text-white/60">LEVEL {lvlNum}</span>
                                            </>
                                        );
                                    })() : (
                                        <>
                                            <h2 className="text-3xl font-black text-white/30">--</h2>
                                            <span className="text-sm font-bold text-white/30">PENDING</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Middle: AI Summary */}
                            <div className="flex-1 p-5 flex items-start gap-4 h-full">
                                <div className="size-10 shrink-0 bg-white/10 flex items-center justify-center mt-1">
                                    <span className="material-symbols-outlined text-[#FF3300]">psychology</span>
                                </div>
                                <div className="flex-1 min-w-0 pr-4 flex flex-col justify-center h-full">
                                    <span className="text-[10px] font-mono uppercase text-white/50 mb-1 block shrink-0">AI RISK ANALYSIS</span>
                                    <p className="text-sm font-medium leading-relaxed text-white/90 line-clamp-2 md:line-clamp-3 overflow-hidden text-ellipsis">
                                        {researchData ? (researchData.analysis?.risk_signals || researchData.analysis?.summary || 'Analysis complete.').replace(/\*\*/g, '') : "Run intelligence agent to generate risk analysis based on real-time news."}
                                    </p>
                                </div>
                                {researchData && (
                                    <button
                                        onClick={() => setIsRiskExpanded(true)}
                                        className="shrink-0 self-center flex items-center gap-1.5 px-3 py-1.5 border border-[#FF3300]/30 hover:border-[#FF3300] hover:bg-[#FF3300]/10 text-[#FF3300] text-xs font-mono font-bold uppercase transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">open_in_full</span> Read Full Analysis
                                    </button>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="p-4 flex flex-col md:flex-row items-center justify-center gap-4 bg-white/5 border-l border-white/10 shrink-0 w-full md:w-auto">
                                <button className="w-full md:w-auto bg-[#FF3300] hover:bg-red-600 text-white font-bold text-xs uppercase px-6 h-10 tracking-wider transition-colors whitespace-nowrap">
                                    Flag for Review
                                </button>
                                <button
                                    onClick={handleProceedToDueDiligence}
                                    className="w-full md:w-auto border border-white/30 hover:border-white hover:bg-white text-white hover:text-black font-bold text-xs uppercase px-6 h-10 tracking-wider transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                                >
                                    Proceed <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Full-Screen Risk Analysis Overlay */}
                    {isRiskExpanded && researchData && (
                        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-200">
                            <div className="bg-white text-black w-full max-w-4xl max-h-full flex flex-col shadow-2xl relative">
                                <button
                                    onClick={() => setIsRiskExpanded(false)}
                                    className="absolute top-4 right-4 size-10 flex items-center justify-center bg-black text-white hover:bg-[#FF3300] transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>

                                <div className="p-8 border-b-4 border-black shrink-0">
                                    <h2 className="font-display font-black text-3xl uppercase tracking-tighter mb-2">AI Risk Assessment</h2>
                                    <div className="flex items-center gap-4 font-mono text-sm">
                                        <span className="bg-black text-white px-2 py-1">{researchData.company}</span>
                                        <span className="text-[#FF3300] font-bold">
                                            SENTIMENT SCORE: {researchData.analysis?.sentiment_score} / 100
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 overflow-y-auto flex-1 font-body text-base leading-relaxed space-y-6 bg-[#FAFAFA]">
                                    <div>
                                        <h3 className="font-bold text-xl mb-3 text-[#FF3300] flex items-center gap-2">
                                            <span className="material-symbols-outlined">warning</span> Key Negative Signals
                                        </h3>
                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                                            __html: (researchData.analysis?.risk_signals || "").replace(/\*\*(.*?)\*\*/g, '<b class="text-black">$1</b>')
                                        }}></div>
                                    </div>
                                    {researchData.analysis?.positive_signals && (
                                        <div className="mt-8 pt-8 border-t border-dashed border-gray-300">
                                            <h3 className="font-bold text-xl mb-3 text-green-600 flex items-center gap-2">
                                                <span className="material-symbols-outlined">check_circle</span> Mitigants & Positive Signals
                                            </h3>
                                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                                                __html: researchData.analysis.positive_signals.replace(/\*\*(.*?)\*\*/g, '<b class="text-black">$1</b>')
                                            }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};

export default Research;
