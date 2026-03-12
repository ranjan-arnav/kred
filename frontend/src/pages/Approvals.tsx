import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Approvals: React.FC = () => {
    const navigate = useNavigate();
    const { isAnalyzed, analysisData } = useAppContext();

    if (!isAnalyzed) {
        return (
            <div className="bg-white text-slate-900 font-body antialiased min-h-screen flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 flex overflow-hidden">
                    <Sidebar active="approvals" />
                    <EmptyState
                        icon="gavel"
                        title="No Pending Approvals"
                        description="Run a credit analysis first to generate an approval workflow. The approval chain will appear here once a recommendation is made."
                        hint="Go to Dashboard → click a company → Run Analysis → the approval chain is generated automatically from the AI committee's verdict."
                        actionLabel="Go to Dashboard"
                        actionPath="/dashboard"
                    />
                </main>
            </div>
        );
    }

    const companyName = analysisData?.company_name || 'Unknown Company';
    const verdict = analysisData?.committee_decision?.verdict || 'PENDING';
    const loanAmount = analysisData?.decision?.loan_limit_cr || 0;
    return (
        <div className="bg-white text-black font-body antialiased min-h-screen flex flex-col overflow-hidden">
            <div className="flex flex-col h-screen w-full border-x-4 border-black max-w-[1920px] mx-auto bg-white relative">
                {/* Header */}
                <header className="flex-none flex items-center justify-between border-b-4 border-black h-20 px-8 bg-white z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <span className="material-symbols-outlined text-2xl">grid_view</span>
                        </div>
                        <h1 className="font-display font-black text-3xl tracking-tighter uppercase leading-none">KRED</h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex items-center gap-4 font-mono text-xs border border-black px-3 py-1">
                            <span className="text-gray-500">SYSTEM_STATUS:</span>
                            <span className="flex items-center gap-1 text-green-600">
                                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span> ONLINE
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">LATENCY:</span>
                            <span>12ms</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="font-display font-bold text-sm uppercase">Alexander K.</p>
                                <p className="font-mono text-xs text-gray-500">SR_RISK_ANALYST</p>
                            </div>
                            <div className="w-10 h-10 border-2 border-black rounded-full overflow-hidden bg-gray-100 flex items-center justify-center font-bold">
                                AK
                            </div>
                        </div>
                    </div>
                </header>

                {/* Sub-Header: File Context */}
                <div className="flex-none bg-[#F4F4F4] border-b border-black px-8 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">File Reference</span>
                            <span className="font-display font-bold text-xl">{`BSL-${analysisData?.session_id?.slice(-3) || '001'}`}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div className="flex flex-col">
                            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Entity</span>
                            <span className="font-display font-bold text-xl">{companyName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Total Exposure</span>
                            <span className="font-mono font-bold text-xl tracking-tight">₹{(loanAmount * 100).toLocaleString('en-IN')} Lakhs</span>
                        </div>
                        <div className="bg-[#FF3300] text-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
                            {verdict === 'APPROVE' ? 'Recommended' : verdict === 'REJECT' ? 'Not Recommended' : 'Conditional'}
                        </div>
                    </div>
                </div>

                {/* Main Content Area: Split View */}
                <main className="flex-1 flex overflow-hidden">

                    {/* LEFT PANEL: Approval Chain (Timeline) */}
                    <section className="w-full lg:w-7/12 xl:w-2/3 overflow-y-auto bg-white p-8 lg:p-12 relative border-b lg:border-b-0 lg:border-r border-black">
                        <div className="mb-10 flex items-center justify-between">
                            <h2 className="font-display font-black text-4xl tracking-tight">APPROVAL CHAIN</h2>
                            <span className="font-mono text-xs border border-black px-2 py-1">V.3.2</span>
                        </div>

                        <div className="relative pl-8">
                            {/* Vertical Line */}
                            <div className="absolute left-[27px] top-4 bottom-0 w-px bg-black border-l border-dashed border-gray-400"></div>

                            {/* Step 1: Completed */}
                            <div className="relative flex gap-8 mb-16 group">
                                <div className="absolute -left-12 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center border-2 border-black z-10 shadow-lg">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                </div>
                                <div className="flex-1 border border-gray-200 bg-[#F4F4F4]/30 p-6 hover:border-black transition-colors duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-mono text-xs text-gray-500 mb-1">STEP 01 / INITIATION</p>
                                            <h3 className="font-display font-bold text-lg">Credit Analyst Review</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 bg-black text-white font-mono text-xs font-bold">APPROVED</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs font-display border border-black">RK</div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Rahul Kumar</span>
                                            <span className="font-mono text-xs text-gray-500">Initial assessment complete. Financials verified against MCA.</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base">history_edu</span>
                                            <span className="font-mono text-xs">Signed: 24 Oct, 10:42 AM</span>
                                        </div>
                                        <span className="font-mono text-xs text-gray-400">ID: #SHA-256-AE92</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Completed */}
                            <div className="relative flex gap-8 mb-16 group">
                                <div className="absolute -left-12 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center border-2 border-black z-10 shadow-lg">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                </div>
                                <div className="flex-1 border border-gray-200 bg-[#F4F4F4]/30 p-6 hover:border-black transition-colors duration-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-mono text-xs text-gray-500 mb-1">STEP 02 / RISK ASSESSMENT</p>
                                            <h3 className="font-display font-bold text-lg">Risk Manager Validation</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-2 py-1 bg-black text-white font-mono text-xs font-bold">APPROVED</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs font-display border border-black">SM</div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Sarah Menon</span>
                                            <span className="font-mono text-xs text-gray-500">Sectoral risk is moderate. Collateral coverage is adequate (1.25x).</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base">history_edu</span>
                                            <span className="font-mono text-xs">Signed: 25 Oct, 02:15 PM</span>
                                        </div>
                                        <span className="font-mono text-xs text-gray-400">ID: #SHA-256-BF01</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Current (Active) */}
                            <div className="relative flex gap-8 mb-16 group">
                                <div className="absolute -left-12 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full bg-white text-[#FF3300] flex items-center justify-center border-[3px] border-[#FF3300] z-10 shadow-xl animate-pulse">
                                        <span className="material-symbols-outlined text-3xl">edit_document</span>
                                    </div>
                                </div>
                                <div className="flex-1 border-2 border-[#FF3300] bg-white p-6 shadow-[8px_8px_0px_0px_rgba(255,51,0,0.1)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3300]/5 -z-10 rounded-bl-full"></div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="font-mono text-xs text-[#FF3300] font-bold mb-1 tracking-wider">STEP 03 / FINAL DECISION</p>
                                            <h3 className="font-display font-bold text-2xl">Committee Approval</h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-[#FF3300] text-white font-mono text-xs font-bold animate-pulse">PENDING ACTION</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#F4F4F4] border border-gray-200 p-4 mb-6">
                                        <p className="font-mono text-xs text-gray-500 mb-2">AUTO-GENERATED SUMMARY:</p>
                                        <p className="font-body text-sm leading-relaxed">
                                            Borrower <span className="font-bold">{companyName}</span>: {analysisData?.committee_decision?.judge_verdict || 'Analysis pending...'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#FF3300] text-white flex items-center justify-center font-bold text-sm font-display border border-black">AK</div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base">You (Alexander K.)</span>
                                            <span className="font-mono text-xs text-gray-500">Awaiting your digital signature...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4: Future */}
                            <div className="relative flex gap-8 opacity-40">
                                <div className="absolute -left-12 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full bg-white text-gray-400 flex items-center justify-center border-2 border-gray-300 z-10">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                </div>
                                <div className="flex-1 border border-dashed border-gray-300 p-6">
                                    <p className="font-mono text-xs text-gray-500 mb-1">STEP 04 / DISBURSEMENT</p>
                                    <h3 className="font-display font-bold text-lg text-gray-400">Operations Head</h3>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* RIGHT PANEL: Decision Dock */}
                    <aside className="w-full lg:w-5/12 xl:w-1/3 bg-[#F4F4F4] flex flex-col border-t lg:border-t-0 z-10">
                        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                            <div className="mb-8">
                                <h2 className="font-display font-black text-3xl mb-2">FINAL VERDICT</h2>
                                <p className="text-gray-600 text-sm font-body">Review the summary and append your digital signature to proceed. This action is irreversible.</p>
                            </div>

                            {/* Remarks Input */}
                            <div className="mb-8 group">
                                <label className="block font-mono text-xs font-bold uppercase mb-2 group-focus-within:text-[#FF3300]">Official Remarks</label>
                                <textarea
                                    className="w-full h-32 bg-white border border-black p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#FF3300] focus:border-[#FF3300] transition-all placeholder:text-gray-300"
                                    placeholder="// Type your final observations here..."
                                ></textarea>
                            </div>

                            {/* Digital Signature Block */}
                            <div className="mb-10">
                                <label className="block font-mono text-xs font-bold uppercase mb-2 flex justify-between">
                                    <span>Digital Signature</span>
                                    <span className="text-[#FF3300] flex items-center gap-1 text-[10px]">
                                        <span className="material-symbols-outlined text-sm">vpn_key</span> KEY_VERIFIED
                                    </span>
                                </label>
                                <div className="h-32 bg-white border-2 border-dashed border-black relative flex items-center justify-center overflow-hidden group hover:bg-gray-50 transition-colors cursor-pointer">
                                    <span className="font-mono text-xs text-gray-400 group-hover:hidden absolute">CLICK TO SIGN</span>
                                    <svg className="w-3/4 h-3/4 text-black group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20,60 Q50,10 80,60 T140,60 T180,30" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                        <path d="M40,70 L160,70" stroke="currentColor" strokeDasharray="4 2" strokeWidth="1"></path>
                                    </svg>
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 border-4 border-[#FF3300] rounded-full opacity-20 flex items-center justify-center rotate-[-25deg]">
                                        <span className="font-black text-[#FF3300] text-[10px] uppercase">Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button className="group relative bg-white border border-black h-16 flex items-center justify-center font-display font-bold uppercase tracking-wide hover:bg-gray-100 transition-all">
                                    <span className="material-symbols-outlined mr-2 group-hover:-translate-x-1 transition-transform">keyboard_return</span>
                                    Send Back
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="group relative bg-[#FF3300] hover:bg-red-600 text-white h-16 flex items-center justify-center font-display font-bold uppercase tracking-wide transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    Recommend
                                    <span className="material-symbols-outlined ml-2">gavel</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer Meta */}
                        <div className="p-6 border-t border-gray-300 flex justify-between items-center text-xs font-mono text-gray-400">
                            <span>IP: 192.168.1.42</span>
                            <span>SESSION: #ACTIVE</span>
                        </div>
                    </aside>

                </main>
            </div>
        </div>
    );
};

export default Approvals;
