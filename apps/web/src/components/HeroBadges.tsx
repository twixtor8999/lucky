'use client';

import React, { useState, useEffect } from 'react';

const badges = [
  {
    icon: <span className="text-base">💰</span>,
    text: <><span className="text-[#111]">Min Deposit</span> <span className="text-[#e42e2a]">₹100</span></>
  },
  {
    icon: <span className="text-[#e42e2a] font-black">⚡</span>,
    text: <><span className="text-[#e42e2a]">Instant</span> <span className="text-[#111]">Withdrawals</span></>
  },
  {
    icon: <div className="w-2.5 h-2.5 rounded-full bg-[#e42e2a] mr-0.5 animate-pulse"></div>,
    text: <><span className="text-[#111]">Fast Live Results</span></>
  }
];

export default function HeroBadges() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % badges.length);
    }, 2500); // cycle every 2.5s
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-10 relative overflow-hidden flex items-center justify-center min-w-[200px]">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
            idx === currentIndex 
              ? 'opacity-100 translate-y-0' 
              : idx < currentIndex || (currentIndex === 0 && idx === badges.length - 1)
                ? 'opacity-0 -translate-y-full'
                : 'opacity-0 translate-y-full'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white rounded-full text-[14px] font-bold shadow-sm border border-gray-100">
            {badge.icon}
            <span className="tracking-wide">{badge.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
