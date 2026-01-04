'use client'

import { useState, useEffect } from 'react'
import { Gift, ExternalLink, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function TasksPage() {
  const [showGoldenCode, setShowGoldenCode] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    setTasks(data || [])
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2">المهام</h1>
        <p className="text-slate-500 text-sm">أكمل المهام واحصل على أرباح</p>
      </div>

      {/* الرمز الذهبي */}
      <div
        onClick={() => setShowGoldenCode(true)}
        className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2rem] p-6 shadow-3xl cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-950/30 rounded-2xl flex items-center justify-center">
            <Gift className="w-8 h-8 text-yellow-950" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-yellow-950 mb-1">الرمز الذهبي</h2>
            <p className="text-yellow-950/70 text-sm font-bold">
              أدخل الكود واحصل على رصيد فوري
            </p>
          </div>
        </div>
      </div>

      {/* المهام */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white">المهام المتاحة</h2>

        {tasks.length === 0 ? (
          <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/5 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-slate-400 font-bold">لا توجد مهام متاحة حالياً</p>
            <p className="text-slate-500 text-sm mt-2">تحقق لاحقاً للحصول على مهام جديدة</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onComplete={fetchTasks} />
          ))
        )}
      </div>

      {/* نافذة الرمز الذهبي */}
      {showGoldenCode && <GoldenCodeModal onClose={() => setShowGoldenCode(false)} />}
    </div>
  )
}

function TaskCard({ task, onComplete }: { task: any; onComplete: () => void }) {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    checkIfCompleted()
  }, [])

  const checkIfCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_id', task.id)
      .single()

    setCompleted(!!data)
  }

  const handleComplete = async () => {
    if (completed) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // تسجيل إكمال المهمة
      const { error } = await supabase.from('user_tasks').insert({
        user_id: user.id,
        task_id: task.id,
      })

      // إضافة الربح
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (userData) {
        await supabase
          .from('users')
          .update({ balance: userData.balance + task.reward })
          .eq('id', user.id)
      }

      if (!error) {
        setCompleted(true)
        onComplete()
        alert(`تم! حصلت على ${task.reward} MAD`)
      }
    } catch (err) {
      console.error('Task completion error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/5 shadow-3xl">
      {task.image_url && (
        <div className="w-full h-32 bg-slate-950/50 overflow-hidden">
          <img
            src={task.image_url}
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        <h3 className="text-lg font-black text-white mb-2">{task.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{task.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="bg-yellow-500/10 px-4 py-2 rounded-xl">
            <p className="text-yellow-500 font-black text-sm">
              +{task.reward} MAD
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-950/50 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-950 transition-all"
            >
              فتح الرابط
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={handleComplete}
            disabled={loading || completed}
            className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              completed
                ? 'bg-green-500/20 text-green-500 cursor-not-allowed'
                : 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400 active:scale-95'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                مكتملة
              </>
            ) : loading ? (
              'جاري التحقق...'
            ) : (
              'إكمال'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function GoldenCodeModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      alert('يرجى إدخال الكود')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // التحقق من الكود
      const { data: codeData, error: codeError } = await supabase
        .from('golden_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('used', false)
        .single()

      if (codeError || !codeData) {
        alert('كود غير صحيح أو مستخدم بالفعل')
        setLoading(false)
        return
      }

      // تحديث حالة الكود
      await supabase
        .from('golden_codes')
        .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
        .eq('id', codeData.id)

      // إضافة الرصيد
      const { data: userData } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (userData) {
        await supabase
          .from('users')
          .update({ balance: userData.balance + codeData.amount })
          .eq('id', user.id)
      }

      alert(`تم! حصلت على ${codeData.amount} MAD`)
      onClose()
    } catch (err) {
      console.error('Golden code error:', err)
      alert('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-[2rem] p-6 max-w-md w-full shadow-3xl animate-fadeIn">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-yellow-950/30 rounded-2xl mb-4">
            <Gift className="w-12 h-12 text-yellow-950" />
          </div>
          <h2 className="text-2xl font-black text-yellow-950 mb-2">الرمز الذهبي</h2>
          <p className="text-yellow-950/70 text-sm font-bold">
            أدخل الكود للحصول على رصيد فوري
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="أدخل الكود هنا"
            className="w-full bg-yellow-950/30 border-2 border-yellow-950/50 rounded-2xl py-4 px-5 text-center text-yellow-950 placeholder-yellow-950/50 font-black text-xl tracking-widest focus:border-yellow-950 outline-none"
            maxLength={20}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-yellow-950/30 text-yellow-950 py-4 rounded-2xl font-black hover:bg-yellow-950/40 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-950 text-yellow-500 py-4 rounded-2xl font-black hover:bg-yellow-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
