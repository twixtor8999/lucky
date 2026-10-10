const fs = require('fs');
const file = 'apps/web/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove 'use client';
content = content.replace(/'use client';\n*/g, '');

// 2. Add import for getLiveHomepageData
content = content.replace(
  /import React from 'react';/,
  "import React from 'react';\nimport { getLiveHomepageData } from './actions/homepage';\nimport { FaqSection } from './FaqSection';"
);

// 3. Remove faq state from HomePage
content = content.replace(/const \[openFaqIndex, setOpenFaqIndex\] = React\.useState<number \| null>\(null\);\n\n  const toggleFaq = \(index: number\) => {\n    setOpenFaqIndex\(openFaqIndex === index \? null : index\);\n    audioHaptics\.playTap\(\);\n  };\n/g, '');

// 4. Change HomePage to async
content = content.replace(/export default function HomePage\(\) {/, 'export default async function HomePage() {\n  const { mainGames: games, starlineGames, jackpotGames } = await getLiveHomepageData();\n');

// 5. Remove hardcoded arrays
content = content.replace(/const games = \[\s*\{ id: '1',[\s\S]*?\];\n\n  const starlineGames = \[\s*\{ id: '1',[\s\S]*?\];\n\n  const jackpotGames = \[\s*\{ id: '1',[\s\S]*?\];\n/g, '');

// 6. Replace Faq render with FaqSection
content = content.replace(/<div className="max-w-3xl mx-auto space-y-4">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/section>/g, '<FaqSection faqs={faqs} />\n        </div>\n      </section>');

fs.writeFileSync(file, content);
