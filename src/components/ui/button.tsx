import * as React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "destructive" | "secondary"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    const variants: Record<string, string> = {
      default: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-300",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    }
    const sizes: Record<string, string> = {
      sm: "h-8 px-2 text-sm",
      md: "h-9 px-3 text-sm",
      lg: "h-10 px-4 text-base",
    }
    const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`
    return <button ref={ref} className={cls} {...props} />
  }
)
Button.displayName = "Button"


