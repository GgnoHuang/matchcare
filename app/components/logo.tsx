import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 150, height = 40 }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image src="/logo.svg" alt="台灣醫療保險平台" width={width} height={height} className="h-auto" priority />
    </Link>
  )
}

export function LogoIcon({ className = "", width = 32, height = 32 }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image
        src="/favicon-32x32.png"
        alt="台灣醫療保險平台"
        width={width}
        height={height}
        className="h-auto"
        priority
      />
    </Link>
  )
}
