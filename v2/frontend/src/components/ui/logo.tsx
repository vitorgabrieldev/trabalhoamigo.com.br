interface LogoProps {
  size?: number
  className?: string
  variant?: 'icon' | 'full'
}

export function Logo({ size = 36, className = '', variant = 'full' }: LogoProps) {
  const Icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Rounded rect background */}
      <rect width="40" height="40" rx="11" fill="hsl(241, 76%, 61%)" />

      {/* Abstract mark: two nodes connected through a platform arc */}
      {/* Left node */}
      <circle cx="10" cy="26" r="3" fill="white" />
      {/* Right node */}
      <circle cx="30" cy="26" r="3" fill="white" />
      {/* Connecting horizontal bar */}
      <line x1="10" y1="26" x2="30" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Upward arc — the "bridge" / platform connecting both parties */}
      <path
        d="M10 26 C10 15 20 10 20 10 C20 10 30 15 30 26"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Apex dot — the marketplace / meeting point */}
      <circle cx="20" cy="10" r="2.5" fill="white" />
    </svg>
  )

  if (variant === 'icon') return Icon

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {Icon}
      <span className="font-bold text-base tracking-tight text-gray-900 uppercase leading-none">
        Trabalho Amigo
      </span>
    </span>
  )
}
