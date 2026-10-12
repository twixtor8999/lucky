export function parseSlotMinutes(name: string): number | null {
  const match = name.match(/(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function formatMinutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

export function getISTDateAndTime() {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utcMs + istOffsetMs);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  return { dateStr, currentMinutes, currentTime, istDate };
}

export function getDailyTopWinners(dateStr: string) {
  // Pool of realistic player names
  const namesPool = [
    "Rahul Sharma", "Priya Patel", "Rekha Kumari", "Imran Shaikh", "Komal More",
    "Nilesh Mehta", "Pratap Rajput", "Krupa Vyas", "Amit Singh", "Neha Gupta",
    "Sunil Verma", "Pooja Deshmukh", "Vikram Rathore", "Deepak Joshi", "Anjali Yadav",
    "Sanjay Chawla", "Ramesh Kulkarni", "Kavita Nair", "Manoj Tiwari", "Sneha Roy",
    "Sachin Jadhav", "Preeti Tiwari", "Gaurav Malhotra", "Shweta Pillai", "Rajesh Bansal"
  ];

  // Hash dateStr into a seed number
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) >>> 0;
  }

  function seededRandom(offset: number) {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  }

  // Shuffle names deterministically for today's date
  const shuffledNames = [...namesPool];
  for (let i = shuffledNames.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(i) * (i + 1));
    [shuffledNames[i], shuffledNames[j]] = [shuffledNames[j], shuffledNames[i]];
  }

  // Generate top 10 winners with strictly descending realistic amounts
  const winners = [];
  // Top winner starts around ₹92,000 - ₹99,500
  let currentAmount = 92000 + Math.floor(seededRandom(101) * 7500);

  for (let rank = 1; rank <= 10; rank++) {
    winners.push({
      rank,
      name: shuffledNames[rank - 1],
      amount: currentAmount,
    });
    // Decrease by ₹4,000 to ₹8,500 per step
    const step = 4200 + Math.floor(seededRandom(rank * 13) * 4300);
    currentAmount = Math.max(25000, currentAmount - step);
  }

  return winners;
}

