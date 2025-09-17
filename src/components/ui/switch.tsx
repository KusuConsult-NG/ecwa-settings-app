"use client"
import * as React from "react"

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>

export function Switch({ className = "", ...props }: SwitchProps) {
  return (
    <label className={`relative inline-flex h-5 w-9 items-center ${className}`}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-gray-900" />
      <span className="absolute left-0.5 h-4 w-4 translate-x-0 rounded-full bg-white transition peer-checked:translate-x-4" />
    </label>
  )
}


