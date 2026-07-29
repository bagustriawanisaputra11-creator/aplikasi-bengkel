import './globals.css'
import Sidebar from '@/components/Sidebar'
import Toast from '@/components/Toast'
import TrialChecker from '@/components/TrialChecker'

export const metadata = { title: 'Aplikasi Bengkel', description: 'Manajemen bengkel profesional' }

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <TrialChecker />
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        </div>
        <Toast />
      </body>
    </html>
  )
}
