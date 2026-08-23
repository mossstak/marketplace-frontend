'use client'

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

type DashboardPageProps = {
  sidebar: React.ReactNode
  header?: React.ReactNode
  children: React.ReactNode
}

const DashboardPage = ({ sidebar, children }: DashboardPageProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-700 text-white">
      {/* Mobile Dashboard Sub-Header */}
      <div className="md:hidden flex items-center justify-between bg-gray-800/90 px-4 py-2.5 border-b border-gray-600">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Dashboard Menu
        </span>
        <button
          type="button"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-200 transition font-medium"
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? (
            <>
              <X className="h-3.5 w-3.5" /> Close
            </>
          ) : (
            <>
              <Menu className="h-3.5 w-3.5" /> Navigation
            </>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileNavOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-600 p-4">
          <div onClick={() => setMobileNavOpen(false)}>
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen w-64 shrink-0 bg-gray-600 p-4">
          {sidebar}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
      </div>
    </div>
  )
}

export default DashboardPage
