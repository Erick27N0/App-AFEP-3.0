import React from "react";
import { Battery, Wifi, Signal, Play } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-2rem)] md:p-8">
      {/* Mobile Device Bezels */}
      <div className="relative w-full max-w-[412px] h-[840px] md:h-[860px] bg-[#1A1D1A] rounded-[48px] p-[12px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-[#3A403A] flex flex-col overflow-hidden">
        
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[110px] h-[28px] bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#111] border border-[#222] mr-8"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#222]"></div>
        </div>

        {/* Side Buttons Mockup */}
        <div className="absolute -left-[5px] top-[140px] w-[5px] h-[50px] bg-[#3A403A] rounded-r-md"></div>
        <div className="absolute -left-[5px] top-[200px] w-[5px] h-[50px] bg-[#3A403A] rounded-r-md"></div>
        <div className="absolute -right-[5px] top-[170px] w-[5px] h-[75px] bg-[#3A403A] rounded-l-md"></div>

        {/* Inner Phone Screen Content */}
        <div className="w-full h-full bg-[#FDFDFB] rounded-[38px] overflow-hidden relative flex flex-col">
          
          {/* Mobile Status Bar */}
          <div className="h-[44px] bg-transparent px-6 flex justify-between items-center text-xs font-semibold text-text-main select-none z-40 pointer-events-none">
            <span className="text-[13px] tracking-tight">09:41</span>
            
            <div className="flex items-center gap-1.5">
              <Signal size={13} className="text-text-main" />
              <Wifi size={13} className="text-text-main" />
              <div className="flex items-center gap-0.5">
                <Battery size={16} className="text-text-main" />
              </div>
            </div>
          </div>

          {/* Interactive Core App Body Container */}
          <div className="flex-1 w-full overflow-y-auto relative flex flex-col bg-[#FDFDFB]">
            {children}
          </div>

          {/* Bottom Virtual Home Indicator (iOS-like) */}
          <div className="h-[20px] bg-transparent flex items-center justify-center z-40 pointer-events-none select-none">
            <div className="w-[120px] h-[5px] bg-text-main/20 rounded-full"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
