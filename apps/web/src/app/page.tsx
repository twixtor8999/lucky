import React from 'react';
import { getLiveHomepageData } from './actions/homepage';
import Link from 'next/link';
import { Download, HelpCircle, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import StickyDownloadBar from '@/components/StickyDownloadBar';
import HeroBadges from '@/components/HeroBadges';

export default async function HomePage() {
  const { mainGames: games, starlineGames, jackpotGames } = await getLiveHomepageData();

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

  const marketList = [
    "SHREE GANESH", "OMKAR MORNING", "GOA MORNING", "SRIDEVI",
    "TIME BAZAR", "MADHUR DAY", "GOA DAY", "MILAN DAY",
    "RAJDHANI DAY", "OMKAR DAY", "KALYAN", "SRIDEVI NIGHT",
    "MADHUR NIGHT", "GOA NIGHT", "MILAN NIGHT", "OMKAR NIGHT",
    "RAJDHANI NIGHT", "KALYAN NIGHT", "MAIN BAZAR"
  ];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col font-sans text-gray-900">

      {/* Sticky Floating Download Bar (client component) */}
      <StickyDownloadBar />

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
          <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-gray-300 h-full">
            <Link href="/" className="flex flex-col items-center justify-center text-[#ff4b4b] transition-colors relative h-full">
              <span>Home</span>
              <span className="w-1 h-1 rounded-full bg-[#ff4b4b] absolute bottom-4"></span>
            </Link>

            <div className="relative group h-full flex items-center">
              <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <span>Jodi Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </div>
              <div className="absolute top-[64px] -left-4 bg-[#111] border border-gray-800 rounded-b-xl shadow-2xl w-48 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col max-h-[70vh] overflow-y-auto no-scrollbar">
                {marketList.map((item, idx) => (
                  <Link key={idx} href={`/chart/jodi/${item.toLowerCase().replace(/ /g, '-')}`} className="px-4 py-2.5 hover:bg-gray-800 text-gray-400 hover:text-white text-xs uppercase whitespace-nowrap transition-colors">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative group h-full flex items-center">
              <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <span>Pana Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </div>
              <div className="absolute top-[64px] -left-4 bg-[#111] border border-gray-800 rounded-b-xl shadow-2xl w-48 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col max-h-[70vh] overflow-y-auto no-scrollbar">
                {marketList.map((item, idx) => (
                  <Link key={idx} href={`/chart/pana/${item.toLowerCase().replace(/ /g, '-')}`} className="px-4 py-2.5 hover:bg-gray-800 text-gray-400 hover:text-white text-xs uppercase whitespace-nowrap transition-colors">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative group h-full flex items-center">
              <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <span>Starline Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </div>
              <div className="absolute top-[64px] -left-4 bg-[#111] border border-gray-800 rounded-b-xl shadow-2xl w-56 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col max-h-[70vh] overflow-y-auto no-scrollbar">
                <Link href="/chart/starline/all" className="px-4 py-2.5 hover:bg-gray-800 text-[#ff4b4b] font-bold hover:text-[#ff6b6b] text-xs uppercase whitespace-nowrap transition-colors border-b border-gray-800 mb-1">
                  All Starline Pana Charts
                </Link>
                {["10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"].map((item, idx) => (
                  <Link key={idx} href={`/chart/starline/${item.replace(/[: ]/g, '').toLowerCase()}`} className="px-4 py-2.5 hover:bg-gray-800 text-gray-400 hover:text-white text-xs uppercase whitespace-nowrap transition-colors">
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative group h-full flex items-center">
              <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <span>Jackpot Charts</span> <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </div>
              <div className="absolute top-[64px] -left-4 bg-[#111] border border-gray-800 rounded-b-xl shadow-2xl w-56 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col max-h-[70vh] overflow-y-auto no-scrollbar">
                <Link href="/chart/jackpot/all" className="px-4 py-2.5 hover:bg-gray-800 text-[#ff4b4b] font-bold hover:text-[#ff6b6b] text-xs uppercase whitespace-nowrap transition-colors border-b border-gray-800 mb-1">
                  All Jackpot Jodi Charts
                </Link>
                {["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"].map((item, idx) => (
                  <Link key={idx} href={`/chart/jackpot/${item.replace(/[: ]/g, '').toLowerCase()}`} className="px-4 py-2.5 hover:bg-gray-800 text-gray-400 hover:text-white text-xs uppercase whitespace-nowrap transition-colors">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Download Button */}
          <Link
            href="/download"
            className="px-6 py-2 rounded-full text-sm font-medium text-white bg-[#ff4b4b] hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(255,75,75,0.4)]"
          >
            Download Now
          </Link>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section
        className="w-full relative overflow-visible pt-12 pb-20 border-b border-gray-100"
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

            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[12px] sm:text-[14px] font-bold text-gray-800 shadow-lg border border-yellow-200 mb-6 mt-4 md:mt-0 animate-[bounce_3s_infinite] hover:scale-105 transition-transform">
              <img src="https://flagcdn.com/w40/in.png" alt="India Flag" className="w-5 h-3.5 rounded-sm object-cover" />
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

            {/* Animated Badges */}
            <HeroBadges />
          </div>

          {/* Right Image — smaller, contained, no overflow */}
          <div className="flex-shrink-0 mt-6 md:mt-0 flex justify-center md:justify-end relative z-10 md:pr-10">
            <img
              src="/hero-woman.png"
              alt="Lucky 777 Woman"
              className="w-[220px] sm:w-[280px] md:w-[300px] object-contain drop-shadow-xl translate-y-6 md:translate-y-12 animate-float-complex"
            />
          </div>
        </div>

      </section>

      {/* Download APK Pill — sits BELOW the hero, overlapping the border */}
      <div className="relative z-30 flex justify-center w-full px-4 -mt-8">
        <Link href="/download" className="w-full max-w-5xl group cursor-pointer block relative transition-all duration-300 hover:scale-[1.01]">
          <div
            className="w-full h-12 md:h-[56px] rounded-[30px] shadow-sm flex items-center justify-center overflow-hidden relative"
            style={{ backgroundColor: '#e23333' }}
          >
            {/* Animated shimmer on hover */}
            <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none" />
            
            <div className="flex items-center gap-2 text-white font-bold text-[16px] md:text-[18px] relative z-10">
              {/* Android Icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.81.24l-1.89 3.26C15.03 8.44 13.57 8.1 12 8.1c-1.57 0-3.03.34-4.48.85L5.63 5.69c-.16-.3-.52-.39-.81-.24-.29.16-.42.54-.26.85l1.84 3.18C3.52 11.23 1.6 14.36 1.13 18H22.87c-.47-3.64-2.39-6.77-5.27-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
              </svg>
              <span>Download APK</span>
              <Download className="w-4 h-4 md:w-5 md:h-5 ml-1" />
            </div>
          </div>
        </Link>
      </div>

      {/* spacer below the pill */}
      <div className="h-8 bg-white w-full"></div>

      {/* 4. Feature Icons */}
      <section className="w-full py-10 bg-white relative z-10">
        <div className="max-w-5xl mx-auto px-4">

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8 mb-12">
            {[
              { emoji: "⭐", title: "5 STAR", sub: "RATING" },
              { emoji: "📥", title: "SUPER FAST", sub: "WITHDRAWAL" },
              { emoji: "🎧", title: "24/7 VIP", sub: "SUPPORT" },
              { emoji: "🛡️", title: "100%", sub: "SECURE & TRUSTED" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fff5f5] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#ffe8e8] group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <span className="text-4xl sm:text-5xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{f.emoji}</span>
                </div>
                <h4 className="text-[18px] sm:text-[22px] font-black text-[#1b2138] leading-tight">{f.title}</h4>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">{f.sub}</p>
                <div className="flex items-center gap-[4px] mt-1">
                  <div className="w-6 h-[2px] bg-[#e42e2a]"></div>
                  <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                  <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                  <div className="w-[3px] h-[3px] rounded-full bg-[#e42e2a]"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Buttons Container */}
          <div className="w-full max-w-3xl mx-auto border border-[#f4dbdb] rounded-2xl p-2 md:p-3 flex flex-col sm:flex-row gap-2 md:gap-3 bg-white">
            {/* Call Now */}
            <Link href="tel:+919876543210" className="flex-1 block group">
              <div className="w-full h-12 md:h-14 bg-[#de302a] hover:bg-[#c92424] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 text-white shadow-sm cursor-pointer group-hover:shadow-[0_4px_20px_rgba(222,48,42,0.4)] group-hover:scale-[1.02]">
                <Phone className="w-5 h-5 fill-current group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold text-[15px]">Call Now</span>
              </div>
            </Link>

            {/* WhatsApp */}
            <Link href="https://wa.me/919876543210" target="_blank" className="flex-1 block group">
              <div className="w-full h-12 md:h-14 bg-[#1b873b] hover:bg-[#167030] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 text-white shadow-sm cursor-pointer group-hover:shadow-[0_4px_20px_rgba(27,135,59,0.4)] group-hover:scale-[1.02]">
                <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform duration-300" />
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
                <div key={i} className="flex justify-between items-center border border-gray-200 rounded-[10px] py-4 px-5 bg-white shadow-sm hover:border-[#e42e2a]/40 hover:shadow-md transition-all duration-200 group">
                  <span className="text-[16px] md:text-[17px] font-bold text-[#111] group-hover:text-[#e42e2a] transition-colors duration-200">{r.label}</span>
                  <span className="text-[16px] md:text-[17px] font-black text-[#e42e2a]">{r.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Best Games For You */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">
            Best Games for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((market: any) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-gray-300 transition-all duration-200">
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
                  <button className="bg-[#a3a3a3] hover:bg-[#e42e2a] transition-colors text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Play
                  </button>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="p-3 px-4 flex justify-between">
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold">Jodi Chart</button>
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold">Pana Chart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Starline Games */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">Starline Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starlineGames.map((market: any) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">{market.result}</div>
                  </div>
                  <button className="bg-[#a3a3a3] hover:bg-[#e42e2a] transition-colors text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Play
                  </button>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="p-3 px-4 flex justify-start">
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold">Pana Chart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Jackpot Games */}
      <section className="w-full py-8 mx-auto relative z-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[28px] md:text-[34px] font-black text-[#111] tracking-tight mb-6">Jackpot Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jackpotGames.map((market: any) => (
              <div key={market.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="p-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <h3 className="text-[17px] md:text-[19px] font-black text-[#de302a] tracking-wide">{market.name}</h3>
                      <HelpCircle className="w-3.5 h-3.5 text-[#de302a]" />
                    </div>
                    <div className="text-[20px] md:text-[22px] font-black tracking-widest text-[#111]">{market.result}</div>
                  </div>
                  <button className={`transition-colors text-white rounded-full px-4 py-1.5 text-[12px] font-bold flex items-center gap-1 mt-1 ${market.isSpecial ? 'bg-[#de302a] hover:bg-[#c92424]' : 'bg-[#a3a3a3] hover:bg-[#e42e2a]'}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Play
                  </button>
                </div>
                <div className="w-full h-px bg-gray-100"></div>
                <div className="p-3 px-4 flex justify-start">
                  <button className="border border-[#de302a] text-[#de302a] hover:bg-[#de302a] hover:text-white transition-colors rounded-full px-4 py-1 text-[11px] font-bold">Jodi Chart</button>
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
            <details
              key={i}
              className="bg-white border border-gray-200 p-4 md:p-5 rounded-xl group cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
            >
              <summary className="flex justify-between items-center text-[15px] md:text-[17px] font-medium text-[#111] list-none marker:hidden">
                {faq.q}
                <span className="text-xl font-light text-[#111] group-open:hidden">+</span>
                <span className="text-xl font-light text-[#111] hidden group-open:block">-</span>
              </summary>
              <div className="pt-4 mt-4 border-t border-gray-100 text-gray-600 text-[14px] md:text-[15px] leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 12. Giant Black Footer */}
      <footer className="w-full bg-[#0a0a0a] text-white mt-8 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-[13px] text-gray-400">

          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Jodi Charts</span>
            {marketList.map((item, idx) => (
              <Link key={idx} href={`/chart/jodi/${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Pana Charts</span>
            {marketList.map((item, idx) => (
              <Link key={idx} href={`/chart/pana/${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Starline Charts</span>
            <Link href="/chart/starline/all" className="hover:text-white transition-colors">All Starline Pana Charts</Link>
            {["10:30 AM", "11:30 AM", "12:30 PM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM", "05:30 PM", "06:30 PM", "07:30 PM"].map((item, idx) => (
              <Link key={idx} href={`/chart/starline/${item.replace(/[: ]/g, '').toLowerCase()}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[#e42e2a] font-bold text-[15px] mb-2">Jackpot Charts</span>
            <Link href="/chart/jackpot/all" className="hover:text-white transition-colors">All Jackpot Jodi Charts</Link>
            {["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"].map((item, idx) => (
              <Link key={idx} href={`/chart/jackpot/${item.replace(/[: ]/g, '').toLowerCase()}`} className="hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
              <span className="font-black text-white text-2xl font-sans">L</span>
            </div>
            <span className="font-sans font-black text-3xl italic tracking-tighter text-white">LUCKY777</span>
          </div>

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
