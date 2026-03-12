import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { id: 'dashboard', icon: 'dashboard', path: '/dashboard', label: 'Dashboard' },
    { id: 'documents', icon: 'folder_open', path: '/documents', label: 'Upload Docs' },
    { id: 'research', icon: 'travel_explore', path: '/research', label: 'Research Agent' },
    { id: 'due-diligence', icon: 'fact_check', path: '/due-diligence', label: 'Due Diligence' },
    { id: 'scoring', icon: 'psychology', path: '/scoring', label: 'ML Scoring' },
    { id: 'results', icon: 'description', path: '/results', label: 'Results / CAM' },
    { id: 'fraud', icon: 'shield', path: '/fraud', label: 'Fraud Scan' },
    { id: 'risk-dna', icon: 'fingerprint', path: '/risk-dna', label: 'Risk DNA' },
    { id: 'approvals', icon: 'gavel', path: '/approvals', label: 'Approvals' },
];

const Sidebar: React.FC<{ active?: string }> = ({ active }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeId = active || NAV_ITEMS.find(i => i.path === location.pathname)?.id || '';

    return (
        <nav className="w-[80px] bg-white border-r border-black flex flex-col items-center py-6 gap-2 shrink-0">
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    title={item.label}
                    className={`size-12 flex flex-col items-center justify-center transition-colors group relative ${activeId === item.id
                        ? 'text-[#FF3300] bg-[#F4F4F4] border border-black hover:bg-black hover:text-white'
                        : 'text-gray-400 hover:text-black hover:bg-[#F4F4F4] border border-transparent hover:border-black'
                        }`}
                >
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                    </div>
                </button>
            ))}

            <div className="mt-auto">
                <button
                    onClick={() => navigate('/')}
                    title="Logout"
                    className="size-12 flex items-center justify-center text-gray-400 hover:text-[#FF3300] hover:bg-[#F4F4F4] border border-transparent hover:border-[#FF3300] transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
