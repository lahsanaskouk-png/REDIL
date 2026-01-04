'use client'

import { useState, useEffect } from 'react'
import { User, Wallet, Users, Crown, LogOut, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserData({
          ...data,
          email: user.email,
        })
      }
    } catch (err) {
      console.error('Fetch user error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const confirm = window.confirm('هل تريد تسجيل الخروج؟')
    if (!confirm) return

    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">حسابي</h1>
        <p className="text-slate-500 text-sm">معلومات حسابك الشخصية</p>
      </div>

      {/* الأفاتار والاسم */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2rem] p-6 shadow-3xl text-center">
        <div className="inline-block w-24 h-24 bg-yellow-950/30 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-yellow-950" />
        </div>

        <h2 className="text-2xl font-black text-yellow-950 mb-1">
          {userData?.full_name || userData?.username || 'مستخدم'}
        </h2>

        <p className="text-yellow-950/70 text-sm font-bold mb-4">
          {userData?.email}
        </p>

        <div className="inline-block bg-yellow-950/30 px-4 py-2 rounded-xl">
          <p className="text-yellow-950 font-black text-sm">
            {userData?.vip_level || 'مبتدئ'}
          </p>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-5 border border-white/5 shadow-3xl text-center">
          <Wallet className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-bold mb-2">الرصيد</p>
          <p className="text-2xl font-black text-white">
            {(userData?.balance || 0).toFixed(2)}
          </p>
          <p className="text-slate-500 text-xs font-bold mt-1">MAD</p>
        </div>

        <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-5 border border-white/5 shadow-3xl text-center">
          <Users className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-bold mb-2">الإحالات</p>
          <p className="text-2xl font-black text-white">
            {userData?.total_referrals || 0}
          </p>
          <p className="text-slate-500 text-xs font-bold mt-1">شخص</p>
        </div>
      </div>

      {/* معلومات الحساب */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <h2 className="text-lg font-black text-white mb-4">معلومات الحساب</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold text-sm">اسم المستخدم</span>
            <span className="text-white font-bold text-sm">
              {userData?.username || 'غير محدد'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold text-sm">البريد الإلكتروني</span>
            <span className="text-white font-bold text-sm text-left">
              {userData?.email}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold text-sm">كود الإحالة</span>
            <span className="text-yellow-500 font-black text-sm">
              {userData?.referral_code || 'غير محدد'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold text-sm">تاريخ التسجيل</span>
            <span className="text-white font-bold text-sm">
              {userData?.created_at
                ? new Date(userData.created_at).toLocaleDateString('ar')
                : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* المعلومات البنكية */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">المعلومات البنكية</h2>
          <Lock className="w-5 h-5 text-slate-500" />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-4">
          <p className="text-yellow-500 text-xs font-bold text-center">
            المعلومات البنكية للعرض فقط - يمكن للأدمن فقط تعديلها
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-slate-950/50 rounded-2xl">
            <p className="text-slate-400 font-bold text-xs mb-2">البنك</p>
            <p className="text-white font-bold">
              {userData?.bank_name || 'غير محدد'}
            </p>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-2xl">
            <p className="text-slate-400 font-bold text-xs mb-2">رقم الحساب</p>
            <p className="text-white font-bold">
              {userData?.bank_account || 'غير محدد'}
            </p>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-2xl">
            <p className="text-slate-400 font-bold text-xs mb-2">الاسم الحقيقي</p>
            <p className="text-white font-bold">
              {userData?.bank_holder_name || 'غير محدد'}
            </p>
          </div>
        </div>
      </div>

      {/* إحصائيات VIP */}
      {userData?.vip_level && userData?.vip_level !== 'مبتدئ' && (
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-2xl rounded-[2rem] p-6 border border-yellow-500/20 shadow-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-black text-white">حالة VIP</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl">
              <span className="text-slate-300 font-bold text-sm">المستوى</span>
              <span className="text-yellow-500 font-black text-lg">
                {userData.vip_level}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl">
              <span className="text-slate-300 font-bold text-sm">تاريخ البداية</span>
              <span className="text-white font-bold text-sm">
                {userData.vip_started_at
                  ? new Date(userData.vip_started_at).toLocaleDateString('ar')
                  : 'غير محدد'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-500/20 border border-green-500/20 rounded-2xl">
              <span className="text-green-300 font-bold text-sm">إجمالي أرباح VIP</span>
              <span className="text-green-500 font-black text-lg">
                {(userData.vip_earnings || 0).toFixed(2)} MAD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* تسجيل الخروج */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-95"
      >
        <LogOut className="w-5 h-5" />
        تسجيل الخروج
      </button>

      {/* معلومات إضافية */}
      <div className="text-center text-slate-500 text-xs">
        <p className="mb-2">Brixa Platform v1.0</p>
        <p>جميع الحقوق محفوظة © 2026</p>
      </div>
    </div>
  )
}
