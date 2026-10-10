'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export function FaqSection({ faqs }: { faqs: { q: string, a: string }[] }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
    audioHaptics.playTap();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors shadow-sm">
          <button 
            className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:bg-gray-50 transition-colors"
            onClick={() => toggleFaq(idx)}
          >
            <span className="font-bold text-gray-900 pr-4 leading-snug">{faq.q}</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-180 text-[#e42e2a]' : ''}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 pb-5 pt-1 text-gray-600 leading-relaxed text-[15px] border-t border-gray-50">
              {faq.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
