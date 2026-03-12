import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    hint: string;
    actionLabel?: string;
    actionPath?: string;
    secondaryLabel?: string;
    secondaryPath?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon, title, description, hint,
    actionLabel, actionPath,
    secondaryLabel, secondaryPath
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 mx-auto mb-6 border-2 border-gray-200 flex items-center justify-center bg-[#F4F4F4]">
                    <span className="material-symbols-outlined text-4xl text-gray-300">{icon}</span>
                </div>
                <h3 className="font-display font-bold text-2xl tracking-tight mb-3">{title}</h3>
                <p className="font-body text-sm text-gray-500 mb-6">{description}</p>

                {/* Hint Box */}
                <div className="border border-gray-200 bg-[#FAFAFA] p-4 mb-6 text-left">
                    <p className="font-mono text-xs text-[#FF3300] font-bold uppercase tracking-widest mb-2">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">lightbulb</span>
                        Tip
                    </p>
                    <p className="font-mono text-xs text-gray-600 leading-relaxed">{hint}</p>
                </div>

                <div className="flex gap-3 justify-center">
                    {actionLabel && actionPath && (
                        <button
                            onClick={() => navigate(actionPath)}
                            className="px-6 py-3 bg-black text-white font-display font-bold text-sm uppercase tracking-wide hover:bg-[#FF3300] transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            {actionLabel}
                        </button>
                    )}
                    {secondaryLabel && secondaryPath && (
                        <button
                            onClick={() => navigate(secondaryPath)}
                            className="px-6 py-3 bg-white text-black font-display font-bold text-sm uppercase tracking-wide border border-black hover:bg-[#F4F4F4] transition-colors"
                        >
                            {secondaryLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
