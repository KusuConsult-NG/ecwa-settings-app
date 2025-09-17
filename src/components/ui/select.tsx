"use client"
import * as React from "react"

type SelectRootProps = React.SelectHTMLAttributes<HTMLSelectElement>

export function Select({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SelectTrigger({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-sm text-gray-900">{placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 w-full rounded-md border border-gray-200 bg-white p-1 shadow-sm">{children}</div>
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <div data-value={value} className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-gray-100">
      {children}
    </div>
  )
}

// Simple native select fallback used by forms (not interactive popover)
export function NativeSelect({ className = "", children, ...props }: SelectRootProps) {
  return (
    <select
      className={`h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}


