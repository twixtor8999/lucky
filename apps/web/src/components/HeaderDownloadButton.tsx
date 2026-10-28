'use client';

import React from 'react';
import { usePwa } from '@/components/pwa/PwaManager';
import { audioHaptics } from '@/lib/audio-haptics';

export default function HeaderDownloadButton() {
  const { openInstallModal } = usePwa();

  return (
    <button
      type="button"
      onClick={() => {
        audioHaptics.playTap();
        openInstallModal();
      }}
      className="px-6 py-2 rounded-full text-sm font-medium text-white bg-[#ff4b4b] hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(255,75,75,0.4)] cursor-pointer"
    >
      Download Now
    </button>
  );
}
