import { getServerSession } from "@/lib/session";
import { Users, ArrowDownToLine, ArrowUpFromLine, Activity } from "lucide-react";

export default async function AdminDashboard() {
  const user = await getServerSession();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-100">Dashboard Overview</h1>
        <div className="bg-surface-elevated border border-surface-border px-4 py-2 rounded-full text-sm font-semibold text-gold-400 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live System
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-card p-6 rounded-xl border border-surface-border shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-surface-elevated opacity-30">
            <Users className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Users</h3>
          <p className="text-4xl font-black text-gray-100">0</p>
        </div>
        
        <div className="bg-surface-card p-6 rounded-xl border border-surface-border shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-surface-elevated opacity-30">
            <ArrowDownToLine className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Pending Deposits</h3>
          <p className="text-4xl font-black text-gold-500">0</p>
        </div>
        
        <div className="bg-surface-card p-6 rounded-xl border border-surface-border shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-surface-elevated opacity-30">
            <ArrowUpFromLine className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Pending Payouts</h3>
          <p className="text-4xl font-black text-emerald-500">0</p>
        </div>
      </div>
      
      <div className="bg-surface-card border border-surface-border rounded-xl p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Welcome to the Command Center</h2>
            <p className="text-gray-400 leading-relaxed max-w-3xl">
              From the menu on the left, you can completely control user balances, verify UTR payments, declare market results manually, and pay out winners. Everything is fully manual and under your complete control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
