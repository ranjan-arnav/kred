import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const STEPS = [
    { id: 1, label: 'Data Ingestion', icon: 'upload_file', path: '/documents', desc: 'Upload financials' },
    { id: 2, label: 'Research Agent', icon: 'travel_explore', path: '/research', desc: 'Web intelligence' },
    { id: 3, label: 'Due Diligence', icon: 'fact_check', path: '/due-diligence', desc: 'Qualitative inputs' },
    { id: 4, label: 'Analysis', icon: 'psychology', path: '/scoring', desc: 'ML scoring' },
    { id: 5, label: 'Review', icon: 'rate_review', path: '/results', desc: 'CAM & verdict' },
];

const StepProgress: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep, completedSteps } = useAppContext();

    return (
        <div className="w-full bg-white border-b border-black px-4 py-3 shrink-0">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                {STEPS.map((step, idx) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isCurrent = currentStep === step.id;
                    const isAccessible = isCompleted || isCurrent || step.id <= currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => isAccessible && navigate(step.path)}
                                disabled={!isAccessible}
                                className={`flex items-center gap-2 px-3 py-2 transition-all group relative ${isCurrent
                                        ? 'bg-black text-white'
                                        : isCompleted
                                            ? 'bg-[#F4F4F4] text-black border border-black cursor-pointer hover:bg-black hover:text-white'
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                title={step.desc}
                            >
                                <span className={`material-symbols-outlined text-base ${isCurrent ? 'text-[#FF3300]' : ''}`}>
                                    {isCompleted ? 'check_circle' : step.icon}
                                </span>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">Step {step.id}</span>
                                    <span className="font-display font-bold text-xs uppercase tracking-wide leading-tight">{step.label}</span>
                                </div>
                                {/* Mobile: just show number */}
                                <span className="md:hidden font-mono text-xs font-bold">{step.id}</span>
                            </button>
                            {idx < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-1 ${isCompleted ? 'bg-black' : 'bg-gray-200'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default StepProgress;
