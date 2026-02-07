import React from 'react'

type DashboardPageProps = {
  sidebar: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
}

const DashboardPage = ({ sidebar, children }: DashboardPageProps) => {
  return (
    <div className="min-h-screen bg-gray-700 text-white">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 h-screen w-64 shrink-0 bg-gray-600 p-4">
          {sidebar}
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardPage
