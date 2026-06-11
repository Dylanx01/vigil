import { NiveauRisque } from "@/types"

interface BadgeProps {
  niveau: NiveauRisque
  size?: "sm" | "md"
}

const config = {
  faible: {
    label: "Risque faible",
    className: "badge-faible"
  },
  modere: {
    label: "Risque modéré",
    className: "badge-modere"
  },
  eleve: {
    label: "Risque élevé",
    className: "badge-eleve"
  },
  critique: {
    label: "Risque critique",
    className: "badge-critique"
  }
}

export function Badge({ niveau, size = "md" }: BadgeProps) {
  const { label, className } = config[niveau]

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
        ${className}
      `}
    >
      {label}
    </span>
  )
}