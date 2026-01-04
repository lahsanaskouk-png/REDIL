'use client'

import { useState, useEffect } from 'react'
import { User, Phone, Gift, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  full_name: string
  phone: string
  referral_code: string | null
  balance: number
  vip_level: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('users')
          .select('full_name, phone, referral_code, balance, vip_level')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        if (data) {
          setProfile({
            full_name: data.full_name,
            phone: data.phone,
            referral_code: data.referral_code,
            balance: data.balance || 0,
            vip_level: data.vip_level,
          })
        }
      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        لم يتم العثور على البيانات
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <User className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
        <h1 className="text-3xl font-black text-white">الملف الشخصي</h1>
        <p className="text-slate-500 text-sm">عرض معلومات حسابك</p>
      </div>

      <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center gap-4">
          <User className="w-5 h-5 text-yellow-500" />
          <span className="text-white font-bold">{profile.full_name}</span>
        </div>

        <div className="flex items-center gap-4">
          <Phone className="w-5 h-5 text-yellow-500" />
          <span className="text-white font-bold">{profile.phone}</span>
        </div>

        {profile.referral_code && (
          <div className="flex items-center gap-4">
            <Gift className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-bold">{profile.referral_code}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl">
          <span className="text-yellow-500 font-bold">الرصيد الحالي</span>
          <span className="text-yellow-950 font-black">{profile.balance} MAD</span>
        </div>

        {profile.vip_level && (
          <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl">
            <span className="text-yellow-500 font-bold">عضوية VIP الحالية</span>
            <span className="text-yellow-950 font-black">{profile.vip_level}</span>
          </div>
        )}
      </div>
    </div>
  )
}
