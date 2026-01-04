'use client'

import { useState, useEffect } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(true)
  const [showDeposit, setShowDeposit] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [cryptoPrices, setCryptoPrices] = useState([
    { name: 'Bitcoin', symbol: 'BTC', price: 95234.56, change: 2.34 },
    { name: 'Ethereum', symbol: 'ETH', price: 3456.78, change: -1.23 },
    { name: 'Binance Coin', symbol: 'BNB', price: 612.45, change: 0.89 },
    { name: 'Cardano', symbol: 'ADA', price: 0.67, change: 3.45 },
    { name: 'Solana', symbol: 'SOL', price: 134.23, change: 5.67 },
    { name: 'Polkadot', symbol: 'DOT', price: 9.87, change: -2.34 },
  ])

  useEffect(() => {
    fetchUserBalance()
  }, [])

  const fetchUserBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // جلب الرصيد من قاعدة البيانات
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single()

    if (data) {
      setBalance(data.balance || 0)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white">
          <span className="text-yellow-500">BRIXA</span>
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-1">
          منصة رقمية احترافية
        </p>
      </div>

      {/* الرصيد */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2rem] p-6 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-yellow-950 text-sm font-bold">إجمالي الرصيد</p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-yellow-950/70 hover:text-yellow-950 transition-colors"
            >
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-4xl font-black text-yellow-950 mb-6">
            {showBalance ? `${balance.toFixed(2)} MAD` : '••••••'}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeposit(true)}
              className="flex-1 bg-yellow-950 text-yellow-500 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-yellow-900 transition-all active:scale-95"
            >
              <ArrowDownToLine className="w-4 h-4" />
              إيداع
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex-1 bg-white/20 backdrop-blur-sm text-yellow-950 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95"
            >
              <ArrowUpFromLine className="w-4 h-4" />
              سحب
            </button>
          </div>
        </div>
      </div>

      {/* السوق المباشر */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-black text-white">السوق المباشر</h2>
        </div>

        <div className="space-y-3">
          {cryptoPrices.map((crypto) => (
            <div
              key={crypto.symbol}
              className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all"
            >
              <div>
                <p className="font-bold text-white text-sm">{crypto.name}</p>
                <p className="text-slate-500 text-xs font-bold">{crypto.symbol}</p>
              </div>
              <div className="text-left">
                <p className="font-black text-white text-sm">
                  ${crypto.price.toLocaleString()}
                </p>
                <p
                  className={`text-xs font-bold ${
                    crypto.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نافذة الإيداع */}
      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}

      {/* نافذة السحب */}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
    </div>
  )
}

function DepositModal({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState('')
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [realName, setRealName] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const banks = ['CIH', 'Attijari', 'BMCE', 'Cash Plus']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (Number(amount) < 100) {
      alert('الحد الأدنى للإيداع 100 MAD')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // رفع الصورة
      let screenshotUrl = ''
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('deposits')
          .upload(fileName, screenshot)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('deposits')
            .getPublicUrl(fileName)
          screenshotUrl = publicUrl
        }
      }

      // حفظ طلب الإيداع
      const { error } = await supabase.from('deposits').insert({
        user_id: user.id,
        bank,
        amount: Number(amount),
        account_number: accountNumber,
        real_name: realName,
        screenshot_url: screenshotUrl,
        status: 'pending',
      })

      if (!error) {
        alert('تم إرسال طلب الإيداع بنجاح! سيتم مراجعته قريباً.')
        onClose()
      }
    } catch (err) {
      console.error('Deposit error:', err)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-[#0a0f1e] rounded-[2rem] p-6 max-w-md w-full border border-white/10 animate-fadeIn">
        <h2 className="text-2xl font-black text-white mb-6 text-center">إيداع</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">اختر البنك</label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            >
              <option value="">اختر البنك</option>
              {banks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">المبلغ (MAD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100 MAD كحد أدنى"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
              min="100"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">رقم الحساب</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="أدخل رقم حسابك"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">الاسم الحقيقي</label>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="أدخل اسمك الحقيقي"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">صورة التحويل</label>
            <input
              type="file"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              accept="image/*"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-950/50 text-white py-4 rounded-2xl font-black hover:bg-slate-950 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 text-yellow-950 py-4 rounded-2xl font-black hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState('')
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [realName, setRealName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVip, setIsVip] = useState(false)

  const banks = ['CIH', 'Attijari', 'BMCE', 'Cash Plus']

  useEffect(() => {
    checkVipStatus()
  }, [])

  const checkVipStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('vip_level')
      .eq('id', user.id)
      .single()

    setIsVip(data?.vip_level && data.vip_level !== 'مبتدئ')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isVip) {
      alert('يجب أن تكون عضو VIP لتتمكن من السحب!')
      return
    }

    if (Number(amount) < 40) {
      alert('الحد الأدنى للسحب 40 MAD')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // التحقق من الرصيد
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (!userData || userData.balance < Number(amount)) {
        alert('رصيد غير كافٍ')
        setLoading(false)
        return
      }

      // خصم الرصيد
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: userData.balance - Number(amount) })
        .eq('id', user.id)

      // حفظ طلب السحب
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        bank,
        amount: Number(amount),
        account_number: accountNumber,
        real_name: realName,
        status: 'processing',
      })

      if (!error && !updateError) {
        alert('تم إرسال طلب السحب بنجاح!')
        onClose()
      }
    } catch (err) {
      console.error('Withdraw error:', err)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  if (!isVip) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-[#0a0f1e] rounded-[2rem] p-6 max-w-md w-full border border-white/10 animate-fadeIn text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-4">عضوية VIP مطلوبة</h2>
          <p className="text-slate-400 mb-6">
            يجب أن تكون عضو VIP للقيام بعمليات السحب
          </p>
          <button
            onClick={onClose}
            className="w-full bg-yellow-500 text-yellow-950 py-4 rounded-2xl font-black"
          >
            حسناً
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-[#0a0f1e] rounded-[2rem] p-6 max-w-md w-full border border-white/10 animate-fadeIn">
        <h2 className="text-2xl font-black text-white mb-6 text-center">سحب</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">اختر البنك</label>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            >
              <option value="">اختر البنك</option>
              {banks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">المبلغ (MAD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="40 MAD كحد أدنى"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
              min="40"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">الاسم الحقيقي</label>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="أدخل اسمك الحقيقي"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">رقم الحساب</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="أدخل رقم حسابك"
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold focus:border-yellow-500/30 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-950/50 text-white py-4 rounded-2xl font-black hover:bg-slate-950 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-500 text-yellow-950 py-4 rounded-2xl font-black hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'سحب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
