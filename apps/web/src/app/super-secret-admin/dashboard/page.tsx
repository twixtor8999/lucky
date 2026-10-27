'use client';

import React, { useState, useRef, useEffect } from 'react';
import UsersTab from '@/components/admin/UsersTab';
import DepositsTab from '@/components/admin/DepositsTab';
import MarketManagementTab from '@/components/admin/MarketManagementTab';
import PendingPayoutsTab from '@/components/admin/PendingPayoutsTab';
import WithdrawalsTab from '@/components/admin/WithdrawalsTab';
import SystemSettingsTab from '@/components/admin/SystemSettingsTab';
import BidsExposureTab from '@/components/admin/BidsExposureTab';
import { 
  Users, 
  CreditCard, 
  History, 
  Trophy, 
  Settings, 
  ArrowRightLeft, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', name: 'Users & Bonuses', icon: Users },
    { id: 'bids', name: 'User Bets & Exposure', icon: Layers },
    { id: 'deposits', name: 'Deposit Requests', icon: ArrowRightLeft },
    { id: 'results', name: 'Market Management', icon: History },
    { id: 'payouts', name: 'Pending Payouts', icon: Trophy },
    { id: 'withdrawals', name: 'Withdrawal Requests', icon: CreditCard },
    { id: 'settings', name: 'System Settings', icon: Settings },
  ];

  // Horizontal scroll controls
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag-to-scroll refs
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Mouse wheel horizontal scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
        checkScroll();
      }
    }
  };

  // Button click smooth scroll
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollContainerRef.current?.offsetLeft || 0);
    startScrollLeft.current = scrollContainerRef.current?.scrollLeft || 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = startScrollLeft.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation with Left/Right Scroll Controls & Mousewheel support */}
      <div className="relative mb-8 group">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#e42e2a] hover:bg-gray-50 transition-all cursor-pointer"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex overflow-x-auto gap-2 pb-2.5 border-b border-gray-200 scroll-smooth cursor-grab active:cursor-grabbing select-none"
          style={{ 
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all relative shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-[#e42e2a] text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-[#e42e2a]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.name}</span>
                {tab.id === 'bids' && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" title="Live Exposure Monitoring"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#e42e2a] hover:bg-gray-50 transition-all cursor-pointer"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? (
        <UsersTab />
      ) : activeTab === 'bids' ? (
        <BidsExposureTab />
      ) : activeTab === 'deposits' ? (
        <DepositsTab />
      ) : activeTab === 'results' ? (
        <MarketManagementTab />
      ) : activeTab === 'payouts' ? (
        <PendingPayoutsTab />
      ) : activeTab === 'withdrawals' ? (
        <WithdrawalsTab />
      ) : activeTab === 'settings' ? (
        <SystemSettingsTab />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Users, { className: 'w-8 h-8 text-[#e42e2a]' })}
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.name}
          </h2>
          <p className="text-gray-500 max-w-md">
            This section is currently empty. We will build out the manual controls and data tables for {tabs.find(t => t.id === activeTab)?.name} here.
          </p>
        </div>
      )}
    </div>
  );
}
