'use client'

import { useState, useEffect } from 'react'
import { Crown, TrendingUp, Lock, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// تعريف نوع بيانات VIP
interface VIPLevel {
  level: string
  price: number
  dailyProfit: number
  totalProfit: number
  days: number
}

interface UserData {
  vip_level: string | null
  balance: number
}

// بيانات مستويات VIP
const vipLevels: VIPLevel[] = [
  { level: 'B1', price: 150, dailyProfit: 5, totalProfit: 200, days: 40 },
  { level: 'B2', price: 500, dailyProfit: 18, totalProfit: 720, days: 40 },
  { level: 'B3', price: 1000, dailyProfit: 38, totalProfit: 1520, days: 40 },
  { level: 'B4', price: 2000, dailyProfit: 78, totalProfit: 3120, days: 40 },
  { level: 'B5', price: 4000, dailyProfit: 160, totalProfit: 6400, days: 40 },
  { level: 'B6', price: 8000, dailyProfit: 328, totalProfit: 13120, days: 40 },
  { level: 'B7', price: 16000, dailyProfit: 668, totalProfit: 26720, days: 40 },
  { level: 'B8', price: 32000, dailyProfit: 1348, totalProfit: 53920, days: 40 },
  { level: 'B9', price: 64000, dailyProfit: 2708, totalProfit: 108320, days: 40 },
]

export default function VIPPage() {
  const [currentVip, setCurrentVip] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [showPurchase, setShowPurchase] = useState<VIPLevel | null>(null)

  // جلب بيانات المستخدم
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from<UserData>('users')
      .select('vip_level, balance')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user data:', error)
      return
    }

    if (data) {
      setCurrentVip(data.vip_level)
      setBalance(data.balance || 0)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-yellow-500/10 rounded-2xl mb-4">
          <Crown className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">عضوية VIP</h1>
        <p className="text-slate-500 text-sm">اختر المستوى المناسب لك</p>
      </div>

      {/* الحالة الحالية */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2rem] p-6 shadow-3xl">
        <div className="text-center">
          <p className="text-yellow-950/70 text-sm font-bold mb-2">مستواك الحالي</p>
          <p className="text-3xl font-black text-yellow-950 mb-2">
            {currentVip || 'مبتدئ'}
          </p>
          {!currentVip && (
            <p className="text-yellow-950/70 text-sm font-bold">
              اشترك في VIP لتفعيل ميزة السحب
            </p>
          )}
        </div>
      </div>

      {/* مستويات VIP */}
      <div className="space-y-4">
        {vipLevels.map((vip) => (
          <VIPCard
            key={vip.level}
            vip={vip}
            currentVip={currentVip}
            balance={balance}
            onPurchase={() => setShowPurchase(vip)}
          />
        ))}
      </div>

      {/* نافذة الشراء */}
      {showPurchase && (
        <PurchaseModal
          vip={showPurchase}
          balance={balance}
          onClose={() => setShowPurchase(null)}
          onSuccess={fetchUserData}
        />
      )}
    </div>
  )
}

function VIPCard({
  vip,
  currentVip,
  balance,
  onPurchase,
}: {
  vip: VIPLevel
  currentVip: string | null
  balance: number
  onPurchase: () => void
}) {
  const isOwned = currentVip === vip.level
  const canAfford = balance >= vip.price

  return (
    <div
      className={`bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border shadow-3xl transition-all ${
        isOwned
          ? 'border-yellow-500/50 bg-yellow-500/5'
          : 'border-white/5 hover:border-yellow-500/20'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown
              className={`w-6 h-6 ${isOwned ? 'text-yellow-500' : 'text-slate-500'}`}
            />
            <h3 className="text-2xl font-black text-white">{vip.level}</h3>
            {isOwned && <CheckCircle2 className="w-5 h-5 text-yellow-500" />}
          </div>
          <p className="text-yellow-500 font-black text-xl">{vip.price} MAD</p>
        </div>
        {!canAfford && !isOwned && <Lock className="w-5 h-5 text-slate-500" />}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl">
          <span className="text-slate-400 text-sm font-bold">الربح اليومي</span>
          <span className="text-green-500 font-black text-sm">+{vip.dailyProfit} MAD</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl">
          <span className="text-slate-400 text-sm font-bold">إجمالي الربح</span>
          <span className="text-yellow-500 font-black text-sm">{vip.totalProfit} MAD</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl">
          <span className="text-slate-400 text-sm font-bold">المدة</span>
          <span className="text-white font-black text-sm">{vip.days} يوم</span>
        </div>
      </div>

      {!isOwned && (
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          className={`w-full py-4 rounded-2xl font-black transition-all ${
            canAfford
              ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400 active:scale-95'
              : 'bg-slate-950/50 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canAfford ? 'شراء الآن' : 'رصيد غير كافٍ'}
        </button>
      )}

      {isOwned && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
          <p className="text-yellow-500 font-black text-sm">✓ مشترك حالياً</p>
        </div>
      )}
    </div>
  )
}

function PurchaseModal({
  vip,
  balance,
  onClose,
  onSuccess,
}: {
  vip: VIPLevel
  balance: number
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (balance < vip.price) {
      alert('رصيد غير كافٍ')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newBalance = balance - vip.price

      const { error } = await supabase
        .from('users')
        .update({
          vip_level: vip.level,
          balance: newBalance,
          vip_started_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (!error) {
        alert(`تم! أنت الآن عضو ${vip.level}`)
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error('Purchase error:', err)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-[#0a0f1e] rounded-[2rem] p-6 max-w-md w-full border border-white/10 animate-fadeIn">
        <div className="text-center mb-6">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">تأكيد الشراء</h2>
          <p className="text-slate-400 text-sm">أنت على وشك الاشتراك في {vip.level}</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
            <span className="text-slate-400 font-bold">المستوى</span>
            <span className="text-white font-black">{vip.level}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
            <span className="text-slate-400 font-bold">السعر</span>
            <span className="text-yellow-500 font-black">{vip.price} MAD</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
            <span className="text-slate-400 font-bold">رصيدك الحالي</span>
            <span className="text-white font-black">{balance} MAD</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <span className="text-green-400 font-bold">الرصيد بعد الشراء</span>
            <span className="text-green-500 font-black">{balance - vip.price} MAD</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-950/50 text-white py-4 rounded-2xl font-black hover:bg-slate-950 transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="flex-1 bg-yellow-500 text-yellow-950 py-4 rounded-2xl font-black hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'جاري المعالجة...' : 'تأكيد الشراء'}
          </button>
        </div>
      </div>
    </div>
  )
}
