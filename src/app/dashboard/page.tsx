"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, LogOut, Zap, User, Wallet, TrendingUp } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050810] flex items-center justify-center font-cairo">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </main>
    );
  }

  const userName = user?.user_metadata?.full_name || "مستخدم";
  const userPhone = user?.user_metadata?.phone || "";

  return (
    <main
      className="min-h-screen bg-[#050810] p-4 md:p-6 relative overflow-hidden font-cairo"
      dir="rtl"
    >
      {/* Background effects */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-bold text-sm">{userName}</p>
              <p className="text-slate-500 text-xs" dir="ltr">{userPhone}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Zap className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white mb-1">مرحباً بك في Brixa</h1>
              <p className="text-slate-500 text-sm">تم تسجيل دخولك بنجاح</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-bold">الرصيد</span>
              </div>
              <p className="text-2xl font-black text-white">0.00 <span className="text-sm text-yellow-500">MAD</span></p>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">الأرباح</span>
              </div>
              <p className="text-2xl font-black text-green-500">+0.00 <span className="text-sm">%</span></p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Wallet, label: "إيداع", color: "from-green-400 to-green-600" },
            { icon: TrendingUp, label: "استثمار", color: "from-yellow-400 to-yellow-600" },
            { icon: User, label: "الملف الشخصي", color: "from-blue-400 to-blue-600" },
            { icon: LogOut, label: "الإعدادات", color: "from-purple-400 to-purple-600" },
          ].map((action, index) => (
            <button
              key={index}
              className="bg-[#0a0f1e]/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm font-bold text-center">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-[9px] mt-8 uppercase tracking-widest">
          Brixa © 2026 - All Rights Reserved
        </p>
      </div>
    </main>
  );
}
