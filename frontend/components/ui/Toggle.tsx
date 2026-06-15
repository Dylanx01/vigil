interface ToggleProps {
    active: boolean
    onChange: () => void
    disabled?: boolean
  }
  
  export function Toggle({ active, onChange, disabled }: ToggleProps) {
    return (
      <button
        onClick={onChange}
        disabled={disabled}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 ease-out-expo"
        style={{ background: active ? "var(--brand)" : "var(--border-strong)" }}
        aria-pressed={active}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-md bg-white transition-transform duration-300 ease-out-expo"
          style={{
            transform: active ? "translateX(20px)" : "translateX(0)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
          }}
        />
      </button>
    )
  }