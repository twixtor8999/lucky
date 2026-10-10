'use client';

import React from 'react';
import Link from 'next/link';
import { Download, PlayCircle, Trophy, Star, ShieldCheck, ChevronRight, HelpCircle, Phone, Clock, BadgeCheck, MessageCircle, ChevronDown } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export default function HomePage() {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
    audioHaptics.playTap();
  };

  const games = [
    { id: '1', name: 'SHREE GANESH', result: '469-93-256' },
    { id: '2', name: 'OMKAR MORNING', result: '245-11-678' },
    { id: '3', name: 'GOA MORNING', result: '138-20-136' },
    { id: '4', name: 'SRIDEVI', result: '778-25-889' },
    { id: '5', name: 'TIME BAZAR', result: '177-57-179' },
    { id: '6', name: 'MADHUR DAY', result: '270-95-168' },
    { id: '7', name: 'GOA DAY', result: '168-56-767' },
    { id: '8', name: 'MILAN DAY', result: '338-38-668' },
    { id: '9', name: 'RAJDHANI DAY', result: '128-10-668' },
  ];

  const starlineGames = [
    { id: '1', name: '10:30 AM', result: '679-2' },
    { id: '2', name: '11:30 AM', result: '466-6' },
    { id: '3', name: '12:30 PM', result: '119-1' },
    { id: '4', name: '01:30 PM', result: '167-4' },
    { id: '5', name: '02:30 PM', result: '234-9' },
    { id: '6', name: '03:30 PM', result: '270-9' },
    { id: '7', name: '04:30 PM', result: '568-9' },
    { id: '8', name: '05:30 PM', result: '356-4' },
    { id: '9', name: '06:30 PM', result: '158-4' },
  ];

  const jackpotGames = [
    { id: '1', name: '10:00 AM', result: '222' },
    { id: '2', name: '11:00 AM', result: '555' },
    { id: '3', name: '12:00 PM', result: '888' },
    { id: '4', name: '01:00 PM', result: '444' },
    { id: '5', name: '02:00 PM', result: '111' },
    { id: '6', name: '03:00 PM', result: '111' },
    { id: '7', name: '04:00 PM', result: '777' },
    { id: '8', name: '05:00 PM', result: '222' },
    { id: '9', name: '06:00 PM', result: '777' },
    { id: '10', name: '07:00 PM', result: '***', isSpecial: true },
  ];

  const faqs = [
    { q: "What is Lucky777 and what does it provide for satta matka players?", a: "Lucky777 is a premium platform dedicated to providing the fastest and most accurate satta matka results, charts, and guessing forums for players across India." },
    { q: "How does Lucky777 verify the satta matka result before posting it?", a: "We have a dedicated team that verifies results directly from the core markets. Multiple independent sources are cross-checked before any result is published to ensure 100% accuracy." },
    { q: "What is the satta matka live feed on Lucky777 and which markets does it cover?", a: "Our live feed updates in real-time as soon as the market opens or closes. We cover all major markets including Kalyan, Milan, Rajdhani, Main Bazar, Time Bazar, and many more." },
    { q: "How does the satta matka chart on Lucky777 support research?", a: "Our comprehensive Jodi and Pana charts keep historical records dating back years. Players can analyze previous patterns and trends to formulate their own strategies." },
    { q: "What is evidence-based satta matka guessing on Lucky777?", a: "Instead of blind guessing, evidence-based guessing involves using mathematical probabilities and historical chart patterns to predict upcoming numbers, which our community actively discusses." },
    { q: "What is the satta matka open and why do researchers track it on Lucky777?", a: "The 'open' is the first set of numbers declared in a market. Researchers track it closely as it forms the basis for predicting the subsequent 'close' numbers." },
    { q: "What does satka matka satta mean and is it the same as satta matka?", a: "Yes, 'satka matka' is just a common regional mispronunciation and spelling variation of 'satta matka'. They refer to the exact same game." },
    { q: "How deep are the satta matka chart archives on Lucky777?", a: "Our archives are extremely deep, containing complete daily records for major markets spanning several years, allowing for extensive data analysis." },
    { q: "Is Lucky777 free to use for satta matka results and charts?", a: "Yes, viewing live results, historical charts, and reading community guessing is completely free for all users on our platform." },
  ];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col font-sans text-gray-900">
      
      {/* 1. Black Top Nav */}
      <header className="w-full bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <span className="font-black text-white text-xl font-sans">L</span>
            </div>
            <span className="font-sans font-black text-2xl italic tracking-tighter">LUCKY777</span>
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-gray-300">
            <Link href="/" className="flex flex-col items-center text-[#ff4b4b] transition-colors relative">
              <span>Home</span>
              <span className="w-1 h-1 rounded-full bg-[#ff4b4b] absolute -bottom-2"></span>
            </Link>
            
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <span>Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <span>Jodi Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <span>Pana Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <span>Starline Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <span>Jackpot Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              <span>More</span> <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </div>
          </nav>

          {/* Download Button */}
          <Link 
            href="/download"
            onClick={() => audioHaptics.playTap()}
            className="px-6 py-2 rounded-full text-sm font-medium text-white bg-[#ff4b4b] hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(255,75,75,0.4)]"
          >
            Download Now
          </Link>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section 
        className="w-full relative overflow-visible pt-12 pb-24 border-b border-gray-100"
        style={{
          background: `
            radial-gradient(circle at 35% 50%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 50%),
            repeating-conic-gradient(from 0deg at 35% 50%, transparent 0deg 9deg, rgba(255, 255, 255, 0.4) 9deg 18deg),
            linear-gradient(135deg, #fdf1f1 0%, #fae6e6 50%, #f6d5d5 100%)
          `
        }}
      >
        
        {/* Floating Stars */}
        <div className="absolute top-[15%] left-[22%] text-[#ffcb05] z-10 drop-shadow-md">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 0L13.8 10.2L24 12L13.8 13.8L12 24L10.2 13.8L0 12L10.2 10.2L12 0Z" /></svg>
        </div>
        <div className="absolute bottom-[30%] left-[52%] text-[#ffcb05] z-10 drop-shadow-md">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-90"><path d="M12 0L13.8 10.2L24 12L13.8 13.8L12 24L10.2 13.8L0 12L10.2 10.2L12 0Z" /></svg>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center relative z-20 px-4">
          
          {/* Left Text Content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-0 relative z-20 md:pl-20">
            
            {/* Top Badge (India's No.1 Trusted App) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-[10px] sm:text-xs font-bold text-gray-700 shadow-md border border-yellow-100 mb-5">
              <img src="https://flagcdn.com/w20/in.png" alt="India Flag" className="w-4 h-3 rounded-sm object-cover" />
              <span className="tracking-wide">INDIA'S <span className="text-[#e22e28]">NO.1</span> TRUSTED APP</span>
            </div>

            <div className="text-[10px] sm:text-[12px] font-bold text-gray-500 tracking-[0.3em] uppercase mb-1 drop-shadow-sm">
              Welcome To
            </div>
            
            <h1 className="text-7xl sm:text-[90px] leading-[1] font-black text-[#e42e2a] italic tracking-[-0.04em] mb-1" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>
              LUCKY777
            </h1>
            
            <h2 className="text-[42px] sm:text-[54px] leading-[1.1] font-black text-[#e42e2a] italic" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>
              Free ₹100/-
            </h2>
            
            <h3 className="text-[34px] sm:text-[42px] leading-[1.1] font-black text-[#1b2138] italic mb-6" style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.8)' }}>
              Welcome Bonus
            </h3>
            
            {/* Bottom Badge (Min Deposit) */}
            <div className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-white rounded-full text-xs font-bold text-gray-800 shadow-md">
              <span className="text-base">💰</span>
              <span>Min Deposit <span className="text-[#e42e2a]">₹100</span></span>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="flex-1 mt-10 md:mt-0 flex justify-center md:justify-end relative z-10 w-full pointer-events-none md:pr-10">
             <img src="/hero-woman.png" alt="Lucky 777 Woman" className="w-[320px] sm:w-[450px] object-contain drop-shadow-2xl translate-y-6" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        </div>

        {/* 3. Floating Download APK Bar (Full Edge CTA) */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 z-30 flex justify-end w-full pl-4 md:pl-8">
          <Link href="/download" onClick={() => audioHaptics.playTap()} className="w-full max-w-7xl group cursor-pointer block relative ml-auto">
            <div className="w-full h-14 md:h-[72px] rounded-l-full rounded-r-none shadow-[0_10px_30px_rgba(228,46,42,0.3)] flex items-center justify-center overflow-hidden relative border-y-[3px] border-l-[3px] border-white/20"
                 style={{
                   background: 'linear-gradient(90deg, #e42e2a 0%, #e42e2a 60%, #ed5858 100%)'
                 }}>
              
              {/* Animated Sheen Effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
              
              <div className="flex items-center gap-2 text-white font-bold text-[18px] md:text-[20px] tracking-wide relative z-10 pr-4 md:pr-8">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-0.5"><path d="M17.523 15.3414C17.523 15.3414 17.523 15.3414 17.523 15.3414ZM17.4877 15.3768C17.4877 15.3768 17.4877 15.3768 17.4877 15.3768ZM17.6534 14.5366C17.6534 14.5366 17.6534 14.5366 17.6534 14.5366ZM17.8427 15.1114C17.8427 15.1114 17.8427 15.1114 17.8427 15.1114ZM17.4269 15.5398C17.4269 15.5398 17.4269 15.5398 17.4269 15.5398ZM17.5348 15.4241C17.5348 15.4241 17.5348 15.4241 17.5348 15.4241ZM17.1517 15.6565C17.1517 15.6565 17.1517 15.6565 17.1517 15.6565ZM6.50579 15.3768C6.50579 15.3768 6.50579 15.3768 6.50579 15.3768ZM6.84252 15.6565C6.84252 15.6565 6.84252 15.6565 6.84252 15.6565ZM6.16016 15.1114C6.16016 15.1114 6.16016 15.1114 6.16016 15.1114ZM6.34005 14.5366C6.34005 14.5366 6.34005 14.5366 6.34005 14.5366ZM6.47146 15.3414C6.47146 15.3414 6.47146 15.3414 6.47146 15.3414ZM6.55938 15.5398C6.55938 15.5398 6.55938 15.5398 6.55938 15.5398ZM6.46011 15.4241C6.46011 15.4241 6.46011 15.4241 6.46011 15.4241ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM17.1145 13.929C16.8973 13.929 16.7197 13.7513 16.7197 13.5342V12.1158C16.7197 11.8987 16.8973 11.721 17.1145 11.721C17.3316 11.721 17.5093 11.8987 17.5093 12.1158V13.5342C17.5093 13.7513 17.3316 13.929 17.1145 13.929ZM6.88417 13.929C6.66703 13.929 6.48937 13.7513 6.48937 13.5342V12.1158C6.48937 11.8987 6.66703 11.721 6.88417 11.721C7.10132 11.721 7.27898 11.8987 7.27898 12.1158V13.5342C7.27898 13.7513 7.10132 13.929 6.88417 13.929ZM14.9398 9.5085C14.739 9.30771 14.739 8.98155 14.9398 8.78076C15.1406 8.57996 15.4667 8.57996 15.6675 8.78076L16.4828 9.5961C16.6836 9.79689 16.6836 10.1231 16.4828 10.3238C16.282 10.5246 15.9559 10.5246 15.7551 10.3238L14.9398 9.5085ZM8.24492 10.3238C8.04412 10.5246 7.71796 10.5246 7.51717 10.3238C7.31638 10.1231 7.31638 9.79689 7.51717 9.5961L8.33251 8.78076C8.5333 8.57996 8.85946 8.57996 9.06025 8.78076C9.26105 8.98155 9.26105 9.30771 9.06025 9.5085L8.24492 10.3238ZM17.1517 15.6565C16.9404 15.8677 16.634 16 16.3276 16H7.67236C7.36592 16 7.05953 15.8677 6.84824 15.6565C6.63695 15.4452 6.5 15.1388 6.5 14.8324V9.67026C6.5 8.77587 7.22513 8.05073 8.11953 8.05073H15.8805C16.7749 8.05073 17.5 8.77587 17.5 9.67026V14.8324C17.5 15.1388 17.363 15.4452 17.1517 15.6565Z"/></svg>
                Download APK
                <Download className="w-5 h-5 ml-1 opacity-90" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* spacer to accommodate the overlapping absolute button */}
      <div className="h-10 md:h-12 bg-white w-full"></div>

      {/* 4. Feature Icons */}
      <section className="w-full py-10 bg-white relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8 mb-12">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fff5f5] rounded-full flex items-center justify-center mb-3">
                <span className="text-4xl sm:text-5xl drop-shadow-md">⭐</span>
              </div>
              <h4 className="text-[18px] sm:text-[22px] font-black text-[#1b2138] leading-tight">5 STAR</h4>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">RATING</p>
              <div className="flex items-center gap-[4px] mt-1">
                <div className="w-6 h-[2px] bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fff5f5] rounded-full flex items-center justify-center mb-3">
                <span className="text-4xl sm:text-5xl drop-shadow-md">📥</span>
              </div>
              <h4 className="text-[18px] sm:text-[22px] font-black text-[#1b2138] leading-tight whitespace-nowrap">SUPER FAST</h4>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">WITHDRAWAL</p>
              <div className="flex items-center gap-[4px] mt-1">
                <div className="w-6 h-[2px] bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fff5f5] rounded-full flex items-center justify-center mb-3">
                <span className="text-4xl sm:text-5xl drop-shadow-md">🎧</span>
              </div>
              <h4 className="text-[18px] sm:text-[22px] font-black text-[#1b2138] leading-tight">24/7 VIP</h4>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">SUPPORT</p>
              <div className="flex items-center gap-[4px] mt-1">
                <div className="w-6 h-[2px] bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fff5f5] rounded-full flex items-center justify-center mb-3">
                <span className="text-4xl sm:text-5xl drop-shadow-md">🛡️</span>
              </div>
              <h4 className="text-[18px] sm:text-[22px] font-black text-[#1b2138] leading-tight">100%</h4>
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">SECURE & TRUSTED</p>
              <div className="flex items-center gap-[4px] mt-1">
                <div className="w-6 h-[2px] bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
              </div>
            </div>
          </div>

          {/* Contact Buttons Container */}
          <div className="w-full max-w-3xl mx-auto border border-[#f4dbdb] rounded-2xl p-2 md:p-3 flex flex-col sm:flex-row gap-2 md:gap-3 bg-white">
            {/* Call Now */}
            <Link href="tel:+919876543210" className="flex-1 block">
              <div className="w-full h-12 md:h-14 bg-[#de302a] hover:bg-[#c92424] transition-colors rounded-xl flex items-center justify-center gap-2 text-white shadow-sm cursor-pointer">
                <Phone className="w-5 h-5 fill-current" />
                <span className="font-semibold text-[15px]">Call Now</span>
              </div>
            </Link>

            {/* WhatsApp */}
            <Link href="https://wa.me/919876543210" target="_blank" className="flex-1 block">
              <div className="w-full h-12 md:h-14 bg-[#1b873b] hover:bg-[#167030] transition-colors rounded-xl flex items-center justify-center gap-2 text-white shadow-sm cursor-pointer">
                <MessageCircle className="w-5 h-5 fill-current" />
                <span className="font-semibold text-[15px]">WhatsApp</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Today's Top Winners */}
      <section className="w-full bg-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">
            Today's Top Winners
          </h2>
          
          {/* Horizontal Marquee Container (Restricted to container width) */}
          <div className="relative w-full flex overflow-hidden mask-edges pb-2">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
                display: flex;
                width: max-content;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
              .mask-edges {
                mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
              }
            `}} />
            
            <div className="animate-marquee gap-4 pr-4">
              {/* We duplicate the list so the scroll is infinite and seamless */}
              {[
                { rank: 1, name: "Rahul Sharma", amount: 98540 },
                { rank: 2, name: "Priya Patel", amount: 84210 },
                { rank: 3, name: "Rekha Kumari", amount: 65957 },
                { rank: 4, name: "Imran Shaikh", amount: 60304 },
                { rank: 5, name: "Komal More", amount: 51672 },
                { rank: 6, name: "Nilesh Mehta", amount: 51652 },
                { rank: 7, name: "Pratap Rajput", amount: 45616 },
                { rank: 8, name: "Krupa Vyas", amount: 42167 },
                { rank: 9, name: "Amit Singh", amount: 38400 },
                { rank: 10, name: "Neha Gupta", amount: 35200 },
                // Duplicated for infinite effect
                { rank: 1, name: "Rahul Sharma", amount: 98540 },
                { rank: 2, name: "Priya Patel", amount: 84210 },
                { rank: 3, name: "Rekha Kumari", amount: 65957 },
                { rank: 4, name: "Imran Shaikh", amount: 60304 },
                { rank: 5, name: "Komal More", amount: 51672 },
                { rank: 6, name: "Nilesh Mehta", amount: 51652 },
                { rank: 7, name: "Pratap Rajput", amount: 45616 },
                { rank: 8, name: "Krupa Vyas", amount: 42167 },
                { rank: 9, name: "Amit Singh", amount: 38400 },
                { rank: 10, name: "Neha Gupta", amount: 35200 },
              ].map((winner, i) => (
                <div key={i} className="min-w-[160px] md:min-w-[180px] bg-white border border-gray-200 rounded-[10px] p-3 shadow-sm flex flex-col justify-center shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[#e42e2a]">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                    </svg>
                    <span className="text-xs font-black text-gray-800">{winner.rank}</span>
                  </div>
                  <div className="text-[13px] font-black text-[#111] leading-tight mb-0.5">{winner.name}</div>
                  <div className="text-sm font-black text-[#e42e2a]">₹{winner.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Game Rates */}
      <section className="w-full bg-white py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm">
            <h2 className="text-[32px] md:text-[38px] font-black text-[#111] tracking-tight mb-8">
              Game Rates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { label: 'Single Digit', rate: '₹1 KA ₹10' },
                { label: 'Jodi Digit', rate: '₹1 KA ₹100' },
                { label: 'Single Pana', rate: '₹1 KA ₹160' },
                { label: 'Double Pana', rate: '₹1 KA ₹320' },
                { label: 'Triple Pana', rate: '₹1 KA ₹1000' },
                { label: 'Red Brackets', rate: '₹1 KA ₹100' },
                { label: 'Half Sangam A', rate: '₹1 KA ₹1000' },
                { label: 'Half Sangam B', rate: '₹1 KA ₹1000' },
                { label: 'Full Sangam Digits', rate: '₹1 KA ₹10000' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center border border-gray-200 rounded-[10px] py-4 px-5 bg-white shadow-sm hover:border-gray-300 transition-colors">
                  <span className="text-[16px] md:text-[17px] font-bold text-[#111]">{r.label}</span>
                  <span className="text-[16px] md:text-[17px] font-black text-[#e42e2a]">{r.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Best Games For You (Grid) */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">
            Best Games for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((market) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                
                {/* Top Half: Name & Result */}
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">
                      {market.result}
                    </div>
                  </div>
                  <button className="bg-[#a3a3a3] hover:bg-[#8c8c8c] transition-colors text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Play
                  </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100"></div>

                {/* Bottom Half: Chart Buttons */}
                <div className="p-3 px-4 flex justify-between">
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-red-50 transition-colors rounded-full px-4 py-1 text-[11px] font-bold">
                    Jodi Chart
                  </button>
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-red-50 transition-colors rounded-full px-4 py-1 text-[11px] font-bold">
                    Pana Chart
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Starline Games (Grid) */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">
            Starline Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starlineGames.map((market) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                
                {/* Top Half: Name & Result */}
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">
                      {market.result}
                    </div>
                  </div>
                  <button className="bg-[#a3a3a3] hover:bg-[#8c8c8c] transition-colors text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Play
                  </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100"></div>

                {/* Bottom Half: Chart Buttons */}
                <div className="p-3 px-4 flex justify-start">
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-red-50 transition-colors rounded-full px-4 py-1 text-[11px] font-bold">
                    Pana Chart
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Jackpot Games (Grid) */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">
            Jackpot Games
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jackpotGames.map((market) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                
                {/* Top Half: Name & Result */}
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">
                      {market.result}
                    </div>
                  </div>
                  <button className={`transition-colors text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 ${market.isSpecial ? 'bg-[#de302a] hover:bg-[#c92424]' : 'bg-[#a3a3a3] hover:bg-[#8c8c8c]'}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Play
                  </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100"></div>

                {/* Bottom Half: Chart Buttons */}
                <div className="p-3 px-4 flex justify-start">
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-red-50 transition-colors rounded-full px-4 py-1 text-[11px] font-bold">
                    Jodi Chart
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Text Block */}
      <section className="w-full bg-white pb-8 px-4">
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#e42e2a] leading-tight mb-4">
            Satta Matka Chart Today - Jodi & Panel Chart Updated Old Records
          </h2>
          <p className="text-gray-600 text-sm md:text-[15px] leading-relaxed">
            Lucky777 brings the satta matka community a platform built entirely around one principle: every player deserves data they can trust and rely on for accurate results.
          </p>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="w-full max-w-6xl px-4 py-8 mx-auto bg-[#fafafa] md:bg-white">
        <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <React.Fragment key={i}>
              <div 
                onClick={() => toggleFaq(i)}
                className="bg-white border border-gray-200 p-4 md:p-5 rounded-xl flex flex-col cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[15px] md:text-[17px] font-medium text-[#111]">{faq.q}</span>
                  <span className="text-xl font-light text-[#111]">{openFaqIndex === i ? '-' : '+'}</span>
                </div>
                {openFaqIndex === i && (
                  <div className="pt-4 mt-4 border-t border-gray-100 text-gray-600 text-[14px] md:text-[15px] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 12. Giant Black Footer */}
      <footer className="w-full bg-[#0a0a0a] text-white mt-8 pt-12 pb-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-[13px] text-gray-400">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Jodi Charts</span>
            {[
              "SHREE GANESH", "OMKAR MORNING", "GOA MORNING", "SRIDEVI", 
              "TIME BAZAR", "MADHUR DAY", "GOA DAY", "MILAN DAY", 
              "RAJDHANI DAY", "OMKAR DAY", "KALYAN", "SRIDEVI NIGHT", 
              "MADHUR NIGHT", "GOA NIGHT", "MILAN NIGHT", "OMKAR NIGHT", 
              "RAJDHANI NIGHT", "KALYAN NIGHT", "MAIN BAZAR"
            ].map((item, idx) => (
              <Link key={idx} href={`/chart/jodi/${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Pana Charts</span>
            {[
              "SHREE GANESH", "OMKAR MORNING", "GOA MORNING", "SRIDEVI", 
              "TIME BAZAR", "MADHUR DAY", "GOA DAY", "MILAN DAY", 
              "RAJDHANI DAY", "OMKAR DAY", "KALYAN", "SRIDEVI NIGHT", 
              "MADHUR NIGHT", "GOA NIGHT", "MILAN NIGHT", "OMKAR NIGHT", 
              "RAJDHANI NIGHT", "KALYAN NIGHT", "MAIN BAZAR"
            ].map((item, idx) => (
              <Link key={idx} href={`/chart/pana/${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Starline Charts</span>
            <Link href="/chart/starline/all" className="hover:text-white transition-colors">
              All Starline Pana Charts
            </Link>
            {[
              "10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", 
              "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", 
              "06:30 PM", "07:30 PM"
            ].map((item, idx) => (
              <Link key={idx} href={`/chart/starline/${item.replace(/[: ]/g, '').toLowerCase()}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Jackpot Charts</span>
            <Link href="/chart/jackpot/all" className="hover:text-white transition-colors">
              All Jackpot Jodi Charts
            </Link>
            {[
              "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", 
              "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", 
              "06:00 PM", "07:00 PM"
            ].map((item, idx) => (
              <Link key={idx} href={`/chart/jackpot/${item.replace(/[: ]/g, '').toLowerCase()}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

        </div>

        {/* Footer Bottom: Logo & 18+ Warning */}
        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <span className="font-black text-white text-2xl font-sans">L</span>
            </div>
            <span className="font-sans font-black text-3xl italic tracking-tighter text-white">LUCKY777</span>
          </div>

          {/* 18+ Warning (Right Side) */}
          <div className="flex flex-col items-start max-w-xs">
            <div className="relative mb-3">
              <div className="w-12 h-12 rounded-full border-[3px] border-[#e42e2a] flex items-center justify-center">
                <span className="text-[#e42e2a] font-black text-xl">18</span>
              </div>
              <span className="absolute -top-1 -right-2 text-[#e42e2a] font-black text-xl bg-[#0a0a0a] px-0.5">+</span>
            </div>
            <p className="text-[#d1d5db] text-[14px] leading-snug">
              Players need to be 18+ in order to register. Underage gambling is prohibited.
            </p>
          </div>

        </div>
        
        <div className="text-center text-[12px] text-gray-600 mt-12">
          Copyright © 2026 Lucky 777. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
