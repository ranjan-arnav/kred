import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TickerTape from '../components/TickerTape';
import { useNavigate } from 'react-router-dom';
import { kredApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

// Demo-only applications — shown ONLY in demo mode
const DEMO_APPLICATIONS = [
    { id: '#042', name: 'BHARAT STEELWORKS LTD', date: '12 OCT 2023', sector: 'Manufacturing', amount: '₹ 450.0', score: '32/100', status: 'Alert' },
    { id: '#041', name: 'APEX INFRASTRUCTURE', date: '10 OCT 2023', sector: 'Real Estate', amount: '₹ 120.5', score: '88/100', status: 'Ready' },
    { id: '#040', name: 'ZENITH PHARMA', date: '09 OCT 2023', sector: 'Healthcare', amount: '₹ 85.0', score: '--/100', status: 'Processing' },
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { mode, setCompanyName, setCurrentStep, clearSession } = useAppContext();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzingId, setAnalyzingId] = useState('');

    // Risk Pulse: ECG-style heartbeat derived from latest analysis score
    const [pulseOffset, setPulseOffset] = useState(0);
    const pulseAnimRef = useRef<number | null>(null);
    const latestScore = (() => {
        try {
            const d = JSON.parse(localStorage.getItem('kred_analysis_data') || '{}');
            return d?.model_metrics?.score ?? null;
        } catch { return null; }
    })();
    // High-risk = faster, erratic pulse; low-risk = slower, steady
    const isHighRisk = latestScore !== null && latestScore < 450;
    const pulseSpeed = isHighRisk ? 1.8 : 0.9; // px per frame
    const pulseColor = latestScore === null ? '#6b7280' : isHighRisk ? '#FF3300' : '#22c55e';
    const pulseLabel = latestScore === null ? 'NO DATA' : isHighRisk ? 'HIGH RISK' : 'STABLE';

    // ECG waveform path (one cycle, 200px wide): flat → P wave → QRS spike → T wave → flat
    const ECG_POINTS = [
        [0, 40], [20, 40], [25, 36], [30, 40],            // P wave
        [40, 40], [44, 10], [46, 70], [50, 10], [54, 40], // QRS complex
        [60, 40], [68, 30], [80, 40],                      // T wave
        [200, 40]                                          // flat tail
    ];
    const ecgPath = 'M ' + ECG_POINTS.map(([x, y]) => `${x},${y}`).join(' L ');

    useEffect(() => {
        const step = () => {
            setPulseOffset(prev => (prev + pulseSpeed) % 200);
            pulseAnimRef.current = requestAnimationFrame(step);
        };
        pulseAnimRef.current = requestAnimationFrame(step);
        return () => { if (pulseAnimRef.current) cancelAnimationFrame(pulseAnimRef.current); };
    }, [pulseSpeed]);

    const isDemo = mode === 'demo';
    const applications = isDemo ? DEMO_APPLICATIONS : [];

    const handleAnalyze = async (companyName: string, appId: string) => {
        setIsAnalyzing(true);
        setAnalyzingId(appId);
        try {
            setCompanyName(companyName);
            const data = await kredApi.analyzeCompany(companyName);
            localStorage.setItem("kred_session_id", data.session_id);
            localStorage.setItem("kred_analysis_data", JSON.stringify(data));
            await kredApi.storeSession(data);
            navigate('/scoring');
        } catch (error) {
            console.error("Analysis error:", error);
            alert("Analysis failed. Make sure the backend is running.");
        } finally {
            setIsAnalyzing(false);
            setAnalyzingId('');
        }
    };

    const handleNewApplication = () => {
        clearSession();
        setCurrentStep(1);
        navigate('/documents');
    };

    return (
        <div className="bg-white text-slate-900 font-body antialiased min-h-screen flex flex-col overflow-hidden">
            <Header />
            <TickerTape />

            <main className="flex-1 flex overflow-hidden">
                <Sidebar active="dashboard" />

                <div className="flex-1 flex flex-col bg-[#F4F4F4] overflow-hidden relative">

                    {/* Toolbar */}
                    <div className="h-[72px] bg-white border-b border-black flex items-center justify-between px-8 shrink-0">
                        <div className="flex items-center gap-6">
                            <h2 className="font-display font-black text-2xl uppercase text-black">
                                {isDemo ? 'Demo Applications' : 'Credit Applications'}
                            </h2>
                            {isDemo && (
                                <>
                                    <div className="h-8 w-px bg-gray-300"></div>
                                    <span className="font-mono text-xs text-amber-600 bg-amber-50 border border-amber-300 px-3 py-1">
                                        DEMO MODE — Sample Data
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Risk Pulse Widget */}
                        <div className="flex items-center gap-3 border border-black px-4 py-2 bg-black">
                            <div className="flex flex-col">
                                <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-none">System Pulse</span>
                                <span className="font-display font-black text-sm leading-tight mt-0.5 pulse-color" style={{ '--pulse-col': pulseColor } as React.CSSProperties}>
                                    {pulseLabel}
                                </span>
                                {latestScore !== null && (
                                    <span className="font-mono text-[9px] text-gray-500 leading-none">
                                        Score {latestScore}/900
                                    </span>
                                )}
                            </div>
                            <div className="w-[140px] h-10 overflow-hidden relative">
                                <svg viewBox="0 0 140 80" width="140" height="40" preserveAspectRatio="xMidYMid meet">
                                    {/* Render two copies of the ECG path offset for infinite scroll illusion */}
                                    {[0, 200].map(base => (
                                        <path
                                            key={base}
                                            d={ecgPath}
                                            fill="none"
                                            stroke={pulseColor}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            transform={`translate(${base - pulseOffset}, 0) scale(0.7, 1)`}
                                        />
                                    ))}
                                    {/* Glowing dot at the leading edge */}
                                    <circle
                                        cx={(200 - pulseOffset) * 0.7 % 140}
                                        cy={40}
                                        r="3"
                                        fill={pulseColor}
                                        opacity="0.9"
                                    />
                                </svg>
                            </div>
                        </div>

                        <button
                            onClick={handleNewApplication}
                            className="flex items-center gap-2 px-6 py-3 bg-[#FF3300] text-white font-display font-bold text-sm uppercase border border-black hover:bg-black hover:border-black transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Application
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-8">
                        {applications.length === 0 ? (
                            /* Empty state for real mode */
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="bg-white border-2 border-black p-12 max-w-lg text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="size-16 mx-auto bg-black text-white flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-3xl">folder_open</span>
                                    </div>
                                    <h3 className="font-display font-black text-2xl uppercase mb-3">No Active Applications</h3>
                                    <p className="text-gray-600 mb-8 font-body">
                                        Start a new credit appraisal by uploading company documents.
                                        The system will guide you through ingestion, research, due diligence, scoring, and CAM generation.
                                    </p>
                                    <button
                                        onClick={handleNewApplication}
                                        className="px-8 py-4 bg-[#FF3300] text-white font-display font-black text-base uppercase tracking-wider hover:bg-black transition-colors flex items-center gap-3 mx-auto"
                                    >
                                        <span className="material-symbols-outlined">add_circle</span>
                                        Start New Appraisal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Table for demo mode */
                            <div className="border border-black bg-white shadow-sm">
                                <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_80px] border-b border-black bg-[#F4F4F4] sticky top-0 z-10">
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500">ID</div>
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500">Entity Name</div>
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500">Date Rcvd</div>
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500">Sector</div>
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500 text-right">Amount (Cr)</div>
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500 text-center">Risk Score</div>
                                    <div className="p-4 border-r border-black font-display font-extrabold text-xs uppercase tracking-wide text-gray-500">Status</div>
                                    <div className="p-4 font-display font-extrabold text-xs uppercase tracking-wide text-gray-500 text-center">Action</div>
                                </div>

                                {applications.map((app, idx) => (
                                    <div
                                        key={app.id}
                                        onClick={() => handleAnalyze(app.name, app.id)}
                                        className={`grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_80px] border-b border-black h-[60px] cursor-pointer bg-white group transition-colors relative ${isAnalyzing && analyzingId === app.id ? 'bg-yellow-50 animate-pulse' : app.status === 'Alert' ? 'hover:bg-[#FF3300]/5' : 'hover:bg-[#F4F4F4]'
                                            } ${idx === applications.length - 1 ? 'border-b-0' : ''}`}
                                    >
                                        {app.status === 'Alert' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF3300] group-hover:w-2 transition-all"></div>}

                                        <div className={`flex items-center px-4 border-r border-black font-mono text-sm font-medium ${app.status === 'Alert' ? '' : 'text-gray-500'}`}>
                                            {app.id}
                                        </div>
                                        <div className="flex items-center px-4 border-r border-black font-display font-bold text-sm text-black">
                                            {app.name}
                                        </div>
                                        <div className="flex items-center px-4 border-r border-black font-mono text-sm text-gray-600">
                                            {app.date}
                                        </div>
                                        <div className="flex items-center px-4 border-r border-black font-body text-sm text-gray-800">
                                            {app.sector}
                                        </div>
                                        <div className="flex items-center justify-end px-4 border-r border-black font-mono text-sm font-bold text-black">
                                            {app.amount}
                                        </div>
                                        <div className="flex items-center justify-center px-4 border-r border-black">
                                            <div className={`font-mono text-sm font-bold ${app.status === 'Alert' ? 'text-[#FF3300]' :
                                                app.status === 'Ready' ? 'text-green-700' : 'text-gray-400'
                                                }`}>
                                                {app.score}
                                            </div>
                                        </div>
                                        <div className="flex items-center px-4 border-r border-black">
                                            <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold font-mono uppercase tracking-wider border ${app.status === 'Alert' ? 'bg-[#FF3300] text-white border-[#FF3300]' :
                                                app.status === 'Ready' ? 'bg-black text-white border-black' :
                                                    'bg-white text-black border-black'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <button className="size-8 flex items-center justify-center border border-transparent group-hover:border-black group-hover:bg-white text-black transition-all">
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="h-[60px] bg-white border-t border-black flex items-center justify-between px-8 shrink-0">
                        <span className="font-mono text-xs text-gray-500 uppercase">
                            {applications.length > 0 ? `Showing ${applications.length} Application${applications.length > 1 ? 's' : ''}` : 'No applications yet'}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
