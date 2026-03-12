
const TickerTape: React.FC = () => {
    return (
        <div className="h-[40px] bg-black text-white flex items-center overflow-hidden border-b border-black shrink-0 relative z-10">
            <div className="bg-[#FF3300] h-full px-4 flex items-center justify-center font-bold font-mono text-xs shrink-0 z-20 border-r border-white">
                LIVE MARKETS
            </div>

            {/* 
        Tailwind animated marquee.
        Requires custom config in Tailwind but for MVP inline animation or basic flex is fine 
      */}
            <div className="flex animate-[marquee_30s_linear_infinite] items-center gap-12 px-4 font-mono text-xs uppercase tracking-widest whitespace-nowrap">
                <span>NIFTY 50: 19,425 <span className="text-green-400">(+0.4%)</span></span>
                <span>SENSEX: 65,344 <span className="text-red-400">(-0.1%)</span></span>
                <span>USD/INR: 83.12 <span className="text-green-400">(+0.05%)</span></span>
                <span>RELIANCE: 2,341 <span className="text-red-400">(-1.2%)</span></span>
                <span>TATA STEEL: 118 <span className="text-green-400">(+2.4%)</span></span>
                <span>HDFC BANK: 1,530 <span className="text-green-400">(+0.8%)</span></span>
                <span>INFY: 1,450 <span className="text-red-400">(-0.5%)</span></span>

                {/* Duplicate for infinite loop illusion */}
                <span>NIFTY 50: 19,425 <span className="text-green-400">(+0.4%)</span></span>
                <span>SENSEX: 65,344 <span className="text-red-400">(-0.1%)</span></span>
                <span>USD/INR: 83.12 <span className="text-green-400">(+0.05%)</span></span>
                <span>RELIANCE: 2,341 <span className="text-red-400">(-1.2%)</span></span>
                <span>TATA STEEL: 118 <span className="text-green-400">(+2.4%)</span></span>
            </div>
        </div>
    );
};

export default TickerTape;
