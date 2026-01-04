import BottomNav from '@/components/BottomNav'
import AuthGuard from '@/components/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050810] font-arabic rtl pb-24">
        {/* خلفية مع تأثيرات */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/3 blur-[120px] rounded-full pointer-events-none" />

        {/* المحتوى */}
        <div className="relative z-10 max-w-md mx-auto">
          {children}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
