interface LiveBadgeProps {
    lastUpdate?: Date | null
  }
  
  export function LiveBadge({ lastUpdate }: LiveBadgeProps) {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  
    return (
      <div className="live-badge">
        <span className="live-dot" />
        <span>Données en direct</span>
        {lastUpdate && (
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            — {formatTime(lastUpdate)}
          </span>
        )}
      </div>
    )
  }