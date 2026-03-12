
const Header: React.FC = () => {
    return (
        <header className="h-[80px] border-b border-black flex items-center justify-between shrink-0 bg-white z-20 relative">
            <div className="h-full flex items-center px-8 border-r border-black w-[300px] shrink-0">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-black">grid_view</span>
                    <h1 className="font-display font-black text-2xl tracking-tighter leading-none uppercase">KRED</h1>
                </div>
            </div>

            {/* Center Actions / Search */}
            <div className="flex-1 h-full flex items-center px-6">
                <div className="relative w-full max-w-xl">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="SEARCH ENTITY NAME OR ID..."
                        className="w-full bg-[#F4F4F4] border border-transparent focus:border-black focus:ring-0 pl-10 pr-4 py-2 font-mono text-sm uppercase placeholder-gray-400 outline-none transition-colors"
                    />
                </div>
            </div>

            {/* User Profile */}
            <div className="h-full flex items-center px-8 border-l border-black gap-6">
                <div className="flex flex-col items-end">
                    <span className="font-display font-bold text-sm uppercase tracking-tight text-black">Aditya Sharma</span>
                    <span className="font-mono text-xs text-gray-500">SR. RISK ANALYST</span>
                </div>
                <div className="size-10 bg-black text-white flex items-center justify-center font-display font-bold text-lg rounded-none border border-black hover:bg-[#FF3300] transition-colors cursor-pointer">
                    AS
                </div>
            </div>
        </header>
    );
};

export default Header;
