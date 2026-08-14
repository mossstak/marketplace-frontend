'use client'
import DashboardPage from '../../../components/DashboardPage'

export default function Dashboard() {
  return (
    <DashboardPage
      sidebar={
        <div className="space-y-1">
          {/* Add buyer-specific sidebar links here */}
          <p className="text-white/70">Buyer Navigation</p>
        </div>
      }
    >
      <h1 className="text-2xl font-bold">Welcome to your Buyer Dashboard!</h1>
      <p className="mt-2">This is where you can manage your orders and profile.</p>
    </DashboardPage>
  )
}
