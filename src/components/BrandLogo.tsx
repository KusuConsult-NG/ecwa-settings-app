import Image from "next/image"

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <Image src="/logo.svg" alt="ChurchFlow" width={36} height={36} priority />
      <span className="font-heading text-2xl font-bold text-brand-700">ChurchFlow</span>
    </div>
  )
}


