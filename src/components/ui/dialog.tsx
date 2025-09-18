"use client"
import * as React from "react"

type DialogContextType = { open: boolean; setOpen: (o: boolean) => void }
const DialogContext = React.createContext<DialogContextType | null>(null)

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  const [stateOpen, setStateOpen] = React.useState(open)
  React.useEffect(() => setStateOpen(open), [open])
  const setOpen = (o: boolean) => {
    setStateOpen(o)
    onOpenChange(o)
  }
  return <DialogContext.Provider value={{ open: stateOpen, setOpen }}>{children}</DialogContext.Provider>
}

export function DialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(DialogContext)!
  const child = React.Children.only(children)
  const props = {
    onClick: () => ctx.setOpen(true),
  }
  return asChild ? React.cloneElement(child, props) : <button {...props}>{children}</button>
}

export function DialogContent({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DialogContext)!
  if (!ctx.open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg" {...props}>
        <div className="h-1 w-full bg-brand-600" />
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b px-6 py-4">{children}</div>
}

export function DialogTitle({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className="text-lg font-semibold" {...props}>{children}</h3>
}

export function DialogDescription({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-sm text-gray-500" {...props}>{children}</p>
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 border-t px-6 py-4">{children}</div>
}


