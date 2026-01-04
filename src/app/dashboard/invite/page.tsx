'use client'

import { useState, useEffect } from 'react'
import { Users, Copy, Share2, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function InvitePage() {
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [referrals, setReferrals] = useState({
    level1: 0,
    level2: 0,
    level3: 0,
    totalEarnings: 0,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // جلب كود الإحالة
    const { data: userData } = await supabase
      .from('users')
      .select('referral_code, referral_earnings')
      .eq('id', user.id)
      .single()

    if (userData) {
      setReferralCode(userData.referral_code || generateReferralCode())
      setReferralLink(`https://brixa.app/register?ref=${userData.referral_code}`)

      // جلب إحصائيات الإحالات
      const { data: referralData } = await supabase
        .from('referrals')
        .select('level')
        .eq('referrer_id', user.id)

      if (referralData) {
        const level1 = referralData.filter((r) => r.level === 1).length
        const level2 = referralData.filter((r) => r.level === 2).length
        const level3 = referralData.filter((r) => r.level === 3).length

        setReferrals({
          level1,
          level2,
          level3,
          totalEarnings: userData.referral_earnings || 0,
        })
      }
    }
  }

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'انضم إلى Brixa',
          text: `استخدم كود الإحالة الخاص بي: ${referralCode}`,
          url: referralLink,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      copyToClipboard(referralLink)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-yellow-500/10 rounded-2xl mb-4">
          <Users className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">الدعوة</h1>
        <p className="text-slate-500 text-sm">ادعُ أصدقاءك واحصل على أرباح</p>
      </div>

      {/* كود الإحالة */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2rem] p-6 shadow-3xl">
        <p className="text-yellow-950/70 text-sm font-bold mb-3 text-center">
          كود الإحالة الخاص بك
        </p>

        <div className="bg-yellow-950/30 rounded-2xl p-4 mb-4">
          <p className="text-3xl font-black text-yellow-950 text-center tracking-widest">
            {referralCode}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => copyToClipboard(referralCode)}
            className="flex-1 bg-yellow-950 text-yellow-500 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-yellow-900 transition-all active:scale-95"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'تم النسخ!' : 'نسخ الكود'}
          </button>

          <button
            onClick={shareReferral}
            className="flex-1 bg-white/20 backdrop-blur-sm text-yellow-950 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
        </div>
      </div>

      {/* رابط الإحالة */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <p className="text-slate-400 text-sm font-bold mb-3">رابط الإحالة</p>

        <div
          onClick={() => copyToClipboard(referralLink)}
          className="bg-slate-950/50 rounded-2xl p-4 mb-3 cursor-pointer hover:bg-slate-950 transition-all"
        >
          <p className="text-yellow-500 font-bold text-sm break-all">
            {referralLink}
          </p>
        </div>

        <button
          onClick={() => copyToClipboard(referralLink)}
          className="w-full bg-slate-950/50 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-950 transition-all"
        >
          <Copy className="w-4 h-4" />
          نسخ الرابط
        </button>
      </div>

      {/* نسب الأرباح */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-black text-white">نسب الأرباح</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold">المستوى الأول</span>
            <span className="text-yellow-500 font-black text-lg">17%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold">المستوى الثاني</span>
            <span className="text-yellow-500 font-black text-lg">1%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl">
            <span className="text-slate-400 font-bold">المستوى الثالث</span>
            <span className="text-yellow-500 font-black text-lg">1%</span>
          </div>
        </div>
      </div>

      {/* إحصائيات الإحالات */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <h2 className="text-lg font-black text-white mb-4">إحصائياتك</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950/50 rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs font-bold mb-2">المستوى 1</p>
            <p className="text-2xl font-black text-white">{referrals.level1}</p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs font-bold mb-2">المستوى 2</p>
            <p className="text-2xl font-black text-white">{referrals.level2}</p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs font-bold mb-2">المستوى 3</p>
            <p className="text-2xl font-black text-white">{referrals.level3}</p>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-4 text-center">
            <p className="text-slate-400 text-xs font-bold mb-2">الإجمالي</p>
            <p className="text-2xl font-black text-white">
              {referrals.level1 + referrals.level2 + referrals.level3}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20 rounded-2xl p-4 text-center">
          <p className="text-green-400 text-sm font-bold mb-2">إجمالي الأرباح</p>
          <p className="text-3xl font-black text-green-500">
            {referrals.totalEarnings.toFixed(2)} MAD
          </p>
        </div>
      </div>

      {/* كيفية العمل */}
      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 shadow-3xl">
        <h2 className="text-lg font-black text-white mb-4">كيف يعمل؟</h2>

        <div className="space-y-3 text-slate-400 text-sm">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center font-black text-xs">
              1
            </span>
            <p>شارك كود الإحالة أو الرابط مع أصدقائك</p>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center font-black text-xs">
              2
            </span>
            <p>عندما يسجلون باستخدام كودك، يصبحون في إحالاتك</p>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center font-black text-xs">
              3
            </span>
            <p>احصل على نسبة من أرباحهم حسب المستوى</p>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-yellow-950 rounded-full flex items-center justify-center font-black text-xs">
              4
            </span>
            <p>الأرباح تُضاف تلقائياً إلى رصيدك</p>
          </div>
        </div>
      </div>
    </div>
  )
}
