'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption<T extends string | number> {
  value: T
  label: string
}

interface CustomSelectProps<T extends string | number> {
  id?: string
  options: SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function CustomSelect<T extends string | number>({
  id,
  options,
  value,
  onChange,
  className = '',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false)
        }}
        className="flex items-center justify-between gap-3 rounded-xl border border-black/30 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-2xs transition hover:border-black/50 dark:hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
      >
        <span>{selectedOption?.label ?? 'Select...'}</span>
        <ChevronDown
          className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 z-50 mt-1.5 min-w-full w-max overflow-hidden rounded-xl border border-black/15 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'text-foreground hover:bg-stone-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}