import { NiveauRisque } from "@/types"

interface CardProps {
  niveau?: NiveauRisque
  interactive?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const tintStyles: Record<NiveauRisque, string> = {
  faible: "bg-risk-faible/[0.05] border-risk-faible/25 hover:border-risk-faible/50",
  modere: "bg-risk-modere/[0.05] border-risk-modere/25 hover:border-risk-modere/50",
  eleve: "bg-risk-eleve/[0.05] border-risk-eleve/25 hover:border-risk-eleve/50",
  critique: "bg-risk-critique/[0.05] border-risk-critique/25 hover:border-risk-critique/50",
}

export function Card({ niveau, interactive = false, onClick, className = "", style, children }: CardProps) {
  const base = "rounded-squircle border transition-all duration-300 ease-out-expo"
  const colors = niveau
    ? tintStyles[niveau]
    : "bg-[var(--bg-card)] border-[var(--border)]"
  const interaction = interactive
    ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 active:scale-[0.99]"
    : ""

  return (
    <div onClick={onClick} style={style} className={`${base} ${colors} ${interaction} ${className}`}>
      {children}
    </div>
  )
}