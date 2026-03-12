import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { kredApi } from '../services/api';
import EmptyState from '../components/EmptyState';
import React, { useState, useEffect, useRef } from 'react';

const Fraud: React.FC = () => {
    const navigate = useNavigate();
    const { isAnalyzed, analysisData } = useAppContext();
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const hasFetched = useRef(false);

    // Fetch real-time OSINT (guarded to prevent duplicate API calls on re-renders)
    useEffect(() => {
        if (isAnalyzed && !hasFetched.current) {
            hasFetched.current = true;
            const companyName = analysisData?.company || 'Unknown Company';
            setIsSearching(true);
            kredApi.performResearch(companyName)
                .then(res => {
                    setNewsArticles([...(res.raw_news || []), ...(res.mca_filings || []), ...(res.legal_records || [])]);
                })
                .catch(err => console.error('OSINT search failed:', err))
                .finally(() => setIsSearching(false));
        }
    }, [isAnalyzed, analysisData]);

    if (!isAnalyzed) {
        return (
            <div className="bg-white text-black font-body min-h-screen flex flex-col antialiased">
                <header className="flex items-center justify-between border-b-4 border-black h-20 px-8 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <span className="material-symbols-outlined text-2xl">grid_view</span>
                        </div>
                        <h1 className="font-display font-black text-3xl tracking-tighter uppercase">FRAUD SCAN</h1>
                    </div>
                </header>
                <EmptyState
                    icon="shield"
                    title="No Fraud Analysis Available"
                    description="Run a credit analysis first. The forensic fraud detection (Benford's Law, circular trading, GST reconciliation) is generated as part of the analysis pipeline."
                    hint="Go to Dashboard → click a company → Run Analysis → then come back here to see the fraud forensics including revenue reconciliation and transaction anomalies."
                    actionLabel="Go to Dashboard"
                    actionPath="/dashboard"
                />
            </div>
        );
    }

    return (
        <div className="bg-white text-black font-body min-h-screen flex flex-col antialiased selection:bg-[#FF3300] selection:text-white">
            {/* Top Navigation */}
            <header className="flex flex-col w-full z-50 sticky top-0 bg-white">
                {/* Main Header */}
                <div className="flex items-stretch justify-between h-20 border-b border-black">
                    {/* Logo Section */}
                    <div
                        className="flex items-center px-8 border-r border-black min-w-[300px] bg-black text-white cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#FF3300] text-[32px]">dataset</span>
                            <h1 className="font-display font-black text-2xl tracking-tighter uppercase leading-none">
                                KRED
                            </h1>
                        </div>
                    </div>

                    {/* Context Info */}
                    <div className="flex flex-1 items-center px-8 justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Entity</span>
                                <span className="font-display font-bold text-lg uppercase tracking-tight">{analysisData?.company || 'Unknown Company'}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-300 mx-2"></div>
                            <div className="flex flex-col">
                                <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Period</span>
                                <span className="font-mono text-sm font-medium">FY 2023-24 (Q1-Q2)</span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex items-center gap-1">
                            <a className="px-4 py-2 font-mono text-sm hover:bg-[#F4F4F4] hover:text-[#FF3300] transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>DASHBOARD</a>
                            <a className="px-4 py-2 font-mono text-sm hover:bg-[#F4F4F4] hover:text-[#FF3300] transition-colors cursor-pointer" onClick={() => navigate('/documents')}>UPLOAD</a>
                            <a className="px-4 py-2 font-mono text-sm bg-black text-white font-bold cursor-pointer" onClick={() => navigate('/research')}>ANALYSIS</a>
                            <a className="px-4 py-2 font-mono text-sm hover:bg-[#F4F4F4] hover:text-[#FF3300] transition-colors cursor-pointer" onClick={() => navigate('/approvals')}>APPROVALS</a>
                        </nav>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center px-8 border-l border-black gap-4 min-w-[200px] justify-end bg-[#F4F4F4]">
                        <div className="text-right hidden md:block">
                            <div className="font-bold text-sm leading-tight">Sarah Jenkins</div>
                            <div className="font-mono text-xs text-gray-500">Sr. Risk Analyst</div>
                        </div>
                        <div className="size-10 bg-black text-white flex items-center justify-center font-display font-bold text-lg border border-black">
                            SJ
                        </div>
                    </div>
                </div>

                {/* Ticker Tape */}
                <div className="h-8 bg-[#F4F4F4] border-b border-black flex items-center overflow-hidden whitespace-nowrap">
                    <div className="flex animate-[marquee_30s_linear_infinite] gap-8 px-4 font-mono text-xs font-medium w-full">
                        <span>NIFTY 50: <span className="text-green-600">19,425.30 ▲ 0.42%</span></span>
                        <span className="text-gray-400">|</span>
                        <span>SENSEX: <span className="text-green-600">65,344.12 ▲ 0.35%</span></span>
                        <span className="text-gray-400">|</span>
                        <span>USD/INR: <span className="text-red-600">83.12 ▼ 0.05%</span></span>
                        <span className="text-gray-400">|</span>
                        <span>BHARAT STEEL: <span className="text-[#FF3300]">HIGH RISK MOMENTUM</span></span>
                        <span className="text-gray-400">|</span>
                        <span>LAST UPDATED: 14:02:45 IST</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col md:flex-row h-full overflow-hidden">

                {/* Sidebar Controls */}
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black bg-white flex flex-col shrink-0">
                    <div className="p-6 border-b border-black bg-[#F4F4F4]">
                        <h2 className="font-display font-black text-xl uppercase tracking-tighter mb-1">Forensic Lab</h2>
                        <p className="font-mono text-xs text-gray-500">Data Discrepancy Tool v2.4</p>
                    </div>

                    <div className="flex flex-col p-4 gap-4 flex-1">
                        <div className="flex flex-col gap-2">
                            <label className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Comparison Mode</label>
                            <button className="flex items-center justify-between w-full p-4 border border-black bg-black text-white font-bold font-display text-sm tracking-wide shadow-[4px_4px_0px_0px_#FF3300] -translate-y-[2px] -translate-x-[2px] transition-all">
                                <span>GST vs BANK</span>
                                <span className="material-symbols-outlined text-[#FF3300]">bar_chart</span>
                            </button>
                            <button className="flex items-center justify-between w-full p-4 border border-black bg-white text-black font-medium font-display text-sm tracking-wide hover:bg-[#F4F4F4] transition-colors mt-2">
                                <span>SALES vs ITR</span>
                                <span className="material-symbols-outlined text-gray-400">show_chart</span>
                            </button>
                            <button className="flex items-center justify-between w-full p-4 border border-black bg-white text-black font-medium font-display text-sm tracking-wide hover:bg-[#F4F4F4] transition-colors mt-2">
                                <span>DEBTORS vs AGEING</span>
                                <span className="material-symbols-outlined text-gray-400">pie_chart</span>
                            </button>
                        </div>

                        <div className="h-px bg-black my-2"></div>

                        <div className="flex flex-col gap-3">
                            <label className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500">Filters</label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="appearance-none size-5 border border-black checked:bg-[#FF3300] checked:border-[#FF3300] focus:ring-0 focus:ring-offset-0 rounded-none relative after:content-[''] after:absolute after:hidden after:w-1.5 after:h-2.5 after:border-white after:border-r-2 after:border-b-2 after:left-[6px] after:top-[2px] after:rotate-45 checked:after:block"
                                />
                                <span className="font-mono text-sm group-hover:text-[#FF3300]">Show Variance &gt; 10%</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="appearance-none size-5 border border-black checked:bg-black checked:border-black focus:ring-0 focus:ring-offset-0 rounded-none relative after:content-[''] after:absolute after:hidden after:w-1.5 after:h-2.5 after:border-white after:border-r-2 after:border-b-2 after:left-[6px] after:top-[2px] after:rotate-45 checked:after:block"
                                />
                                <span className="font-mono text-sm group-hover:text-[#FF3300]">Include Inter-co Transfers</span>
                            </label>
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="bg-[#F4F4F4] border border-black p-4">
                                <div className="flex items-center gap-2 mb-2 text-[#FF3300] font-bold font-mono text-xs uppercase">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    Critical Alert
                                </div>
                                <p className="font-body text-sm leading-snug">
                                    <span className="font-bold">June turnover mismatch</span> of <span className="bg-[#FF3300] text-white px-1">₹4.2 Cr</span> detected. Bank credits exceed GST declaration by 15%.
                                </p>
                                <button className="mt-3 w-full border border-black bg-white py-2 text-xs font-bold font-mono uppercase hover:bg-black hover:text-white transition-colors">
                                    Flag for Review
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Visualization Area */}
                <section className="flex flex-col flex-1 relative overflow-y-auto w-full">

                    {/* Chart Header */}
                    <div className="p-6 md:px-10 md:pt-8 md:pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter mb-2">Revenue Reconciliation</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border border-black bg-white"></div>
                                    <span className="font-mono text-xs font-bold uppercase">GST Filing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-black"></div>
                                    <span className="font-mono text-xs font-bold uppercase">Bank Credits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#FF3300]"></div>
                                    <span className="font-mono text-xs font-bold uppercase text-[#FF3300]">Variance &gt; 10%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="size-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors">
                                <span className="material-symbols-outlined">zoom_in</span>
                            </button>
                            <button className="size-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors">
                                <span className="material-symbols-outlined">download</span>
                            </button>
                            <button className="h-10 px-4 flex items-center gap-2 justify-center border border-black bg-[#FF3300] text-white font-bold font-mono text-sm hover:bg-black transition-colors uppercase">
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {/* Transaction Anomaly Timeline */}
                    {(() => {
                        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
                        // Deterministic demo data seeded from company name
                        const seed = (analysisData?.company || 'X').charCodeAt(0);
                        const gstData = months.map((_, i) => 8 + ((seed * (i + 3) * 7) % 12));
                        const bankData = months.map((_, i) => gstData[i] + ((seed * (i + 5)) % 6) - 2);
                        const maxVal = Math.max(...gstData, ...bankData, 1);
                        return (
                            <div className="border-b border-black bg-white px-6 md:px-10 py-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-display font-black text-lg uppercase tracking-tighter">Transaction Anomaly Timeline <span className="text-gray-400 font-normal text-sm ml-2">FY 2023–24</span></h3>
                                    <span className="font-mono text-[10px] border border-black px-2 py-1 text-gray-500">GST vs BANK CREDIT (₹ Cr)</span>
                                </div>
                                <div className="flex items-end gap-1.5 h-24">
                                    {months.map((month, i) => {
                                        const variance = Math.abs(bankData[i] - gstData[i]) / gstData[i];
                                        const isAnomaly = variance > 0.1;
                                        return (
                                            <div key={month} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                                                    <div className="bg-black text-white text-[9px] font-mono px-2 py-1 whitespace-nowrap">
                                                        GST: ₹{gstData[i].toFixed(1)}Cr | Bank: ₹{bankData[i].toFixed(1)}Cr
                                                        {isAnomaly && <span className="text-[#FF3300] ml-1">▲ {(variance * 100).toFixed(0)}% VAR</span>}
                                                    </div>
                                                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black"></div>
                                                </div>
                                                {/* Bank bar */}
                                                <div
                                                    className={`w-full transition-all duration-700 anomaly-bar ${isAnomaly ? 'bg-[#FF3300]' : 'bg-black'}`}
                                                    style={{ '--bar-h': `${(bankData[i] / maxVal) * 80}px` } as React.CSSProperties}
                                                ></div>
                                                {/* GST bar (overlaid, lighter) */}
                                                <div
                                                    className="w-full border border-black bg-white/60 absolute bottom-6 anomaly-gst-bar opacity-60"
                                                    style={{ '--gst-h': `${(gstData[i] / maxVal) * 80}px` } as React.CSSProperties}
                                                ></div>
                                                <span className={`font-mono text-[8px] mt-1 ${isAnomaly ? 'text-[#FF3300] font-bold' : 'text-gray-400'}`}>{month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Data Intelligence Split View */}
                    <div className="flex-1 flex flex-col xl:flex-row w-full bg-[#FAFAFA] border-t border-black min-h-[600px]">

                        {/* Live OSINT News Panel */}
                        <div className="flex-[0.8] border-r border-black flex flex-col relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3300]/10 blur-3xl rounded-full"></div>
                            <div className="p-6 md:p-8 flex items-center justify-between border-b border-black bg-white z-10 shrink-0">
                                <div>
                                    <h2 className="font-display font-black text-2xl uppercase tracking-tighter mb-1">Live OSINT Intelligence</h2>
                                    <div className="font-mono text-xs text-[#FF3300] font-bold flex items-center gap-2"><div className="size-2 rounded-full bg-[#FF3300] animate-[pulse_1s_ease-in-out_infinite]"></div> SCANNING GLOBAL WEB SOURCES...</div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 z-10">
                                {isSearching ? (
                                    <div className="flex items-center justify-center h-full flex-col text-gray-400 font-mono text-sm animate-pulse">
                                        <span className="material-symbols-outlined text-4xl mb-4 text-[#FF3300]">radar</span>
                                        Querying Google News & MCA Databases...
                                    </div>
                                ) : newsArticles.length > 0 ? (
                                    newsArticles.map((article: any, i: number) => (
                                        <a key={i} href={article.url} target="_blank" rel="noreferrer" className="block border border-black bg-white hover:border-[#FF3300] shadow-[0_0_0_0_#FFF] hover:shadow-[4px_4px_0_0_#FF3300] transition-all p-4 cursor-pointer group mb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="size-10 bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0 group-hover:bg-[#FF3300] group-hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined">article</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm mb-1 group-hover:text-[#FF3300] transition-colors leading-tight">{article.title}</h3>
                                                    <p className="font-mono text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{article.snippet}</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="text-gray-500 font-mono text-sm">No recent anomalies detected in global news.</div>
                                )}
                            </div>
                        </div>

                        {/* Forensic Circular Trading Graph */}
                        <div className="flex-[1.2] flex flex-col bg-black text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF3300]/10 blur-[100px] rounded-full"></div>

                            <div className="p-6 md:p-8 flex items-center border-b border-gray-800 z-10 bg-black/50 shrink-0">
                                <div>
                                    <h2 className="font-display font-black text-2xl uppercase tracking-tighter mb-1">Entity Risk Graph</h2>
                                    <p className="font-mono text-xs text-gray-400 font-bold tracking-widest uppercase">Detecting Circular Trading Patterns</p>
                                </div>
                                <div className="ml-auto flex flex-col font-mono text-[10px] text-gray-400 border border-gray-800 p-2 bg-gray-900/50">
                                    <div className="flex items-center gap-2 mb-1.5"><span className="size-2 bg-[#FF3300]"></span> High Risk Shell</div>
                                    <div className="flex items-center gap-2 mb-1.5"><span className="size-2 bg-white"></span> Target Entity</div>
                                    <div className="flex items-center gap-2"><span className="block w-4 h-[2px] border-t-2 border-dashed border-[#FF3300]"></span> Suspect Link</div>
                                </div>
                            </div>

                            <div className="flex-1 relative min-h-[400px] z-10 p-8 flex items-center justify-center overflow-hidden">
                                {/* SVG Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                                    <defs>
                                        <linearGradient id="fraud-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#4ade80" />
                                            <stop offset="100%" stopColor="#FF3300" />
                                        </linearGradient>
                                    </defs>
                                    {/* S1 to Target */}
                                    <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="url(#fraud-grad)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                                    {/* V1 to Target */}
                                    <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="white" strokeWidth="1" opacity="0.2" />
                                    {/* C1 to Target */}
                                    <line x1="50%" y1="50%" x2="30%" y2="80%" stroke="#FF3300" strokeWidth="2" />
                                    {/* S1 to C1 (Circular link) */}
                                    <line x1="20%" y1="20%" x2="30%" y2="80%" stroke="#FF3300" strokeWidth="2" strokeDasharray="5 5" opacity="0.5" />
                                </svg>

                                {/* Nodes */}
                                <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer group hover:z-20">
                                    <div className="size-12 bg-[#FF3300] border-2 border-[#FF3300] rounded-none flex items-center justify-center text-white font-bold group-hover:scale-110 shadow-[0_0_30px_rgba(255,51,0,0.5)] transition-all z-10 relative">
                                        <div className="absolute -inset-1 border border-[#FF3300] rounded-full animate-ping opacity-20"></div>
                                        S1
                                    </div>
                                    <div className="bg-gray-900 border border-gray-700 px-3 py-2 text-[10px] font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg absolute top-14">
                                        <strong className="text-white block mb-1 uppercase">Shell Co A</strong>
                                        <span className="text-[#FF3300]">Common Director Hit</span>
                                    </div>
                                </div>

                                <div className="absolute top-[30%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer group hover:z-20">
                                    <div className="size-10 bg-gray-900 border-2 border-gray-700 rounded-none flex items-center justify-center text-gray-400 font-bold group-hover:scale-110 transition-all z-10">V1</div>
                                    <div className="bg-gray-900 border border-gray-700 px-3 py-2 text-[10px] font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg absolute top-12">
                                        <strong className="text-white block mb-1 uppercase">Tata Elevators</strong>
                                        Verified Supplier
                                    </div>
                                </div>

                                <div className="absolute top-[80%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer group hover:z-20">
                                    <div className="size-16 bg-gray-900 border-2 border-[#FF3300] rounded-none flex items-center justify-center text-[#FF3300] font-bold group-hover:scale-110 shadow-[0_0_15px_rgba(255,51,0,0.3)] transition-all animate-[bounce_4s_infinite] z-10">C1</div>
                                    <div className="bg-gray-900 border border-gray-700 px-3 py-2 text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg absolute top-20 text-center">
                                        <strong className="text-white block mb-1 uppercase text-red-500">Key Customer B</strong>
                                        Shared IP Address detected.<br />Suspected funds round-tripping.
                                    </div>
                                </div>

                                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer group hover:z-20">
                                    <div className="size-20 bg-white text-black font-display font-black text-2xl flex items-center justify-center border-4 border-black group-hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)] z-10">
                                        TB
                                    </div>
                                    <div className="bg-white text-black font-bold px-3 py-1 text-xs border border-black shadow-md absolute top-24 whitespace-nowrap uppercase tracking-widest">{analysisData?.company || 'Target Business'}</div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Details Panel (Contextual) */}
                <aside className="hidden xl:flex w-80 border-l border-black bg-white flex-col shrink-0">
                    <div className="p-6 border-b border-black bg-[#F4F4F4]">
                        <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-1">Observation Log</h3>
                        <p className="font-mono text-xs text-gray-500">AI-Generated Insights</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Insight Card 1 */}
                        <div className="relative pl-4 border-l-2 border-[#FF3300]">
                            <div className="absolute -left-[5px] top-0 size-2 bg-[#FF3300] rounded-full"></div>
                            <span className="font-mono text-[10px] text-gray-400 mb-1 block">14 OCT, 10:23 AM</span>
                            <h4 className="font-bold text-sm mb-1">Turnover Inflation Risk</h4>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                                June 2023 shows significant inflow (₹14.7 Cr) not matched by GST filings (₹10.5 Cr).
                            </p>
                            <div className="flex gap-2">
                                <span className="px-1.5 py-0.5 bg-[#F4F4F4] border border-gray-300 text-[10px] font-mono">HIGH RISK</span>
                                <span className="px-1.5 py-0.5 bg-[#F4F4F4] border border-gray-300 text-[10px] font-mono">REVENUE</span>
                            </div>
                        </div>

                        {/* Insight Card 2 */}
                        <div className="relative pl-4 border-l-2 border-gray-300">
                            <div className="absolute -left-[5px] top-0 size-2 bg-gray-300 rounded-full"></div>
                            <span className="font-mono text-[10px] text-gray-400 mb-1 block">14 OCT, 10:24 AM</span>
                            <h4 className="font-bold text-sm mb-1">Consistency Check</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                April, May, July, August, and September show variance &lt; 5%, indicating generally compliant reporting outside of the anomaly month.
                            </p>
                        </div>

                        {/* Insight Card 3 */}
                        <div className="relative pl-4 border-l-2 border-gray-300">
                            <div className="absolute -left-[5px] top-0 size-2 bg-gray-300 rounded-full"></div>
                            <span className="font-mono text-[10px] text-gray-400 mb-1 block">14 OCT, 10:25 AM</span>
                            <h4 className="font-bold text-sm mb-1">Bank Statement Source</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Data pulled from HDFC Bank Operating Account ending in *4492.
                            </p>
                        </div>

                    </div>

                    <div className="p-6 border-t border-black bg-[#F4F4F4] mt-auto">
                        <button className="w-full bg-black text-white font-display font-bold text-sm py-3 px-4 uppercase tracking-wider hover:bg-[#FF3300] transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">add_comment</span>
                            Add Note
                        </button>
                    </div>
                </aside>

            </main>
        </div>
    );
};

export default Fraud;
