import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const RiskDNA: React.FC = () => {
    const navigate = useNavigate();
    const { isAnalyzed, analysisData } = useAppContext();

    if (!isAnalyzed) {
        return (
            <div className="bg-white text-slate-900 font-display min-h-screen flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 flex overflow-hidden">
                    <Sidebar active="risk-dna" />
                    <EmptyState
                        icon="fingerprint"
                        title="No Risk Profile Available"
                        description="Run a credit analysis first. The Risk DNA visual fingerprint is generated from the Five Cs assessment, SHAP values, and financial ratios."
                        hint="Go to Dashboard → click a company → Run Analysis → the Risk DNA profile will be generated automatically with DSCR, Current Ratio, EBITDA Margin, and other key metrics."
                        actionLabel="Go to Dashboard"
                        actionPath="/dashboard"
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="bg-white text-slate-900 font-display min-h-screen flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 flex overflow-hidden">
                <Sidebar active="fraud" /> {/* Placeholder for Risk DNA since we mapped 'fraud' to it roughly or need a new active state */}

                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
                    {/* Header Bar */}
                    <header className="h-20 border-b border-black flex items-center justify-between px-8 bg-white shrink-0">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-mono uppercase text-gray-500">
                                <span className="hover:text-[#FF3300] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span>
                                <span>/</span>
                                <span className="hover:text-[#FF3300] cursor-pointer">Borrowers</span>
                                <span>/</span>
                                <span className="text-black font-bold">Files #042</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-extrabold text-black uppercase tracking-tight">Bharat Steelworks Ltd.</h2>
                                <span className="px-2 py-0.5 border border-[#FF3300] text-[#FF3300] text-xs font-bold uppercase tracking-wider bg-[#FF3300]/10">High Velocity Risk</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden xl:block">
                                <p className="text-xs font-mono text-gray-500">LAST UPDATED</p>
                                <p className="text-sm font-bold">OCT 24, 14:32:01 IST</p>
                            </div>
                            <div className="h-10 w-[1px] bg-black mx-2 hidden xl:block"></div>
                            <button className="size-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors">
                                <span className="material-symbols-outlined">print</span>
                            </button>
                            <button className="size-10 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </header>

                    {/* Dashboard Grid Container */}
                    <div className="flex-1 p-8 overflow-y-auto bg-[#F4F4F4]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-0 border border-black h-full min-h-[800px]">

                            {/* QUADRANT 1: IDENTITY */}
                            <div className="border-b border-black lg:border-r p-8 flex flex-col gap-6 relative group bg-white">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-xs font-bold underline decoration-[#FF3300] decoration-2 uppercase">Edit Details</button>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div className="size-24 border border-black p-1 bg-white flex items-center justify-center bg-gray-100">
                                        <span className="material-symbols-outlined text-4xl text-gray-400">factory</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wide mb-2">Manufacturing</span>
                                        <span className="text-xs font-mono text-gray-500">SECTOR ID: MFG-2921</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-6 mt-4">
                                    <div>
                                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">Incorporation Date</p>
                                        <p className="text-lg font-bold text-black tabular-nums">12 AUG 2008</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">CIN / Registration</p>
                                        <p className="text-lg font-bold text-black tabular-nums">L27100MH2008PLC</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">Registered Address</p>
                                        <p className="text-base font-medium text-black leading-snug">Plot No. 42, MIDC Industrial Area, Phase II,<br />Thane Belapur Road, Navi Mumbai, 400705</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">GST Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className="size-2 bg-green-600 rounded-full"></span>
                                            <p className="text-base font-bold text-black uppercase">Active</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-500 uppercase mb-1">Last Audit</p>
                                        <p className="text-base font-bold text-black tabular-nums">FY 2023-24</p>
                                    </div>
                                </div>
                            </div>

                            {/* QUADRANT 2: KEY RATIOS */}
                            <div className="border-b border-black p-8 flex flex-col justify-between bg-white relative">
                                <div className="absolute top-0 right-0 p-4 border-l border-b border-black bg-[#F4F4F4]">
                                    <span className="text-xs font-bold uppercase tracking-wider">Key Metrics (FY24)</span>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mt-6 h-full items-center">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">DSCR</h3>
                                            <span className="text-xs font-bold text-[#FF3300] bg-[#FF3300]/10 px-1">+0.4% YoY</span>
                                        </div>
                                        <p className="text-6xl font-extrabold text-[#FF3300] tracking-tighter tabular-nums leading-none">1.24</p>
                                        <p className="text-xs font-mono text-gray-400 mt-2">Optimal Range: {'>'} 1.25</p>
                                    </div>

                                    <div className="flex flex-col gap-1 pl-8 border-l border-dashed border-gray-300">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">Current Ratio</h3>
                                            <span className="text-xs font-bold text-black bg-gray-100 px-1">-0.1% YoY</span>
                                        </div>
                                        <p className="text-6xl font-extrabold text-black tracking-tighter tabular-nums leading-none">1.50</p>
                                        <p className="text-xs font-mono text-gray-400 mt-2">Optimal Range: {'>'} 1.33</p>
                                    </div>

                                    <div className="flex flex-col gap-1 border-t border-dashed border-gray-300 pt-8">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">EBITDA Margin</h3>
                                        </div>
                                        <p className="text-5xl font-extrabold text-black tracking-tighter tabular-nums leading-none">12.8%</p>
                                    </div>

                                    <div className="flex flex-col gap-1 pl-8 border-l border-t border-dashed border-gray-300 pt-8">
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">Net Leverage</h3>
                                        </div>
                                        <p className="text-5xl font-extrabold text-black tracking-tighter tabular-nums leading-none">3.2x</p>
                                    </div>
                                </div>
                            </div>

                            {/* QUADRANT 3: SHAREHOLDING */}
                            <div className="lg:border-r border-black p-8 bg-white flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold uppercase tracking-tight">Shareholding Pattern</h3>
                                    <button className="p-1 border border-black hover:bg-black hover:text-white">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                    </button>
                                </div>

                                <div className="flex flex-1 items-center justify-center gap-8">
                                    {/* CSS Donut Chart */}
                                    <div className="relative size-48 rounded-full border-[0px] border-black flex items-center justify-center shrink-0 donut-chart">
                                        <div className="absolute bg-white rounded-full size-28 border border-black z-10 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-xs font-mono text-gray-500 uppercase">Total</div>
                                                <div className="text-xl font-bold">100%</div>
                                            </div>
                                        </div>
                                        <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#000000" strokeDasharray="172 251" strokeDashoffset="0" strokeWidth="20"></circle>
                                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#e5e5e5" strokeDasharray="94 251" strokeDashoffset="-172" strokeWidth="20"></circle>
                                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#FF3300" strokeDasharray="47 251" strokeDashoffset="-266" strokeWidth="20"></circle>
                                        </svg>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex items-center justify-between group cursor-pointer border-b border-transparent hover:border-gray-200 pb-1">
                                            <div className="flex items-center gap-3">
                                                <div className="size-4 bg-black border border-black"></div>
                                                <span className="text-sm font-bold uppercase">Promoter Group</span>
                                            </div>
                                            <span className="font-mono font-bold">55%</span>
                                        </div>
                                        <div className="flex items-center justify-between group cursor-pointer border-b border-transparent hover:border-gray-200 pb-1">
                                            <div className="flex items-center gap-3">
                                                {/* Use simple gray bg instead of pattern for React translation simplicity */}
                                                <div className="size-4 bg-gray-200 border border-black border-dashed"></div>
                                                <span className="text-sm font-bold uppercase">Public</span>
                                            </div>
                                            <span className="font-mono font-bold">30%</span>
                                        </div>
                                        <div className="flex items-center justify-between group cursor-pointer border-b border-transparent hover:border-gray-200 pb-1">
                                            <div className="flex items-center gap-3">
                                                <div className="size-4 bg-[#FF3300] border border-black"></div>
                                                <span className="text-sm font-bold uppercase text-[#FF3300]">DII / FII</span>
                                            </div>
                                            <span className="font-mono font-bold text-[#FF3300]">15%</span>
                                        </div>

                                        <div className="mt-2 p-3 bg-[#F4F4F4] border border-dashed border-black">
                                            <p className="text-xs font-mono text-gray-600 leading-tight">
                                                <span className="font-bold text-black">NOTE:</span> Promoter pledge increased by 5% in last quarter.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* QUADRANT 4: FACILITIES (DEBT) */}
                            <div className="p-8 bg-white flex flex-col h-full overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold uppercase tracking-tight">Facilities Tracker</h3>
                                    <div className="text-xs font-mono">INR (Cr)</div>
                                </div>

                                <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase">HDFC Term Loan</span>
                                                <span className="text-xs font-mono text-gray-500">AC: 99281...22</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold tabular-nums">50.00 / 50.00</span>
                                                <span className="text-xs font-bold text-[#FF3300] ml-2">100% UTILIZED</span>
                                            </div>
                                        </div>
                                        <div className="h-4 w-full border border-black bg-[#F4F4F4] relative">
                                            <div className="absolute left-0 top-0 h-full bg-black w-full"></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase">SBI Cash Credit</span>
                                                <span className="text-xs font-mono text-gray-500">AC: 11029...88</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold tabular-nums">12.40 / 20.00</span>
                                                <span className="text-xs font-bold text-black ml-2">62% UTILIZED</span>
                                            </div>
                                        </div>
                                        <div className="h-4 w-full border border-black bg-[#F4F4F4] relative">
                                            <div className="absolute left-0 top-0 h-full bg-black w-[62%]"></div>
                                            <div className="absolute right-[10%] top-[-4px] h-6 w-0.5 bg-[#FF3300]"></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold uppercase">Axis Working Cap</span>
                                                <span className="text-xs font-mono text-gray-500">AC: 44212...01</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold tabular-nums">4.20 / 15.00</span>
                                                <span className="text-xs font-bold text-black ml-2">28% UTILIZED</span>
                                            </div>
                                        </div>
                                        <div className="h-4 w-full border border-black bg-[#F4F4F4] relative">
                                            <div className="absolute left-0 top-0 h-full bg-black w-[28%]"></div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-black flex justify-between items-center">
                                        <span className="text-sm font-bold uppercase">Total Exposure</span>
                                        <span className="text-xl font-extrabold tabular-nums">₹ 85.00 Cr</span>
                                    </div>

                                    <button
                                        onClick={() => navigate('/scoring')}
                                        className="mt-6 w-full py-4 bg-[#FF3300] text-white font-display font-bold uppercase tracking-wider hover:bg-black transition-colors border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none"
                                    >
                                        View Logic Core <span className="material-symbols-outlined align-middle ml-2">account_tree</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RiskDNA;
