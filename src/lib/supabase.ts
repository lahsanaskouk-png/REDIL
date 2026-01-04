import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocjxewdtihtlhckhrxit.supabase.co'
const supabaseAnonKey = 'sb_publishable_OrGLz6VTWwbnka1AMvTKLQ_1fV4aTep'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// تحويل رقم الهاتف إلى بريد إلكتروني وهمي
export const phoneToEmail = (phone: string): string => {
  // إزالة المسافات والأحرف غير الرقمية
  const cleanPhone = phone.replace(/\D/g, '')
  return `${cleanPhone}@brixa.com`
}

// التحقق من صحة رقم الهاتف المغربي
export const validateMoroccanPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '')
  // يجب أن يبدأ بـ 06 أو 07 ويكون 10 أرقام
  return /^0[67]\d{8}$/.test(cleanPhone)
}

// التحقق من قوة كلمة المرور
export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}
