'use client'

import { Home, ListTodo, Crown, Users, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'الرئيسية' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'المهام' },
  { href: '/dashboard/vip', icon: Crown, label: 'VIP' },
  { href: '/dashboard/invite', icon: Users, label: 'الدعوة' },
  { href: '/dashboard/profile', icon: User, label: 'حسابي' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0f1e]/95 backdrop-blur-xl border-t border-white/5 z-50 rtl">
      <div className="max-w-md mx-auto px-2 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                  isActive
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
