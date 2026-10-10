import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Banknote, Landmark, Gift, Settings, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSession();

  if (!user || user.role !== "ADMIN") {
    redirect("/admin-login");
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Users & Bonuses", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "Deposit Requests", href: "/admin/deposits", icon: <CreditCard className="w-5 h-5" /> },
    { label: "Withdrawal Requests", href: "/admin/withdrawals", icon: <Banknote className="w-5 h-5" /> },
    { label: "Market Management", href: "/admin/markets", icon: <Landmark className="w-5 h-5" /> },
    { label: "Pending Payouts", href: "/admin/payouts", icon: <Gift className="w-5 h-5" /> },
    { label: "System Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-gray-200 flex flex-col md:flex-row font-sans">
      <nav className="w-full md:w-64 bg-surface-card border-r border-surface-border p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded bg-gold-500 flex items-center justify-center font-black text-background text-lg shadow-glow-gold">
            L
          </div>
          <span className="text-2xl font-black italic tracking-tighter text-gold-accent">ADMIN 777</span>
        </div>
        
        <ul className="space-y-2 flex-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gold-accent hover:bg-surface-elevated transition-all font-medium"
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-surface-border pt-6">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-crimson-400 hover:text-crimson-500 hover:bg-surface-elevated transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Exit Admin
          </Link>
        </div>
      </nav>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
