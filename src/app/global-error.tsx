"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg,#fdf2f7,#ffffff)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#111827",
          textAlign: "center",
          padding: 20,
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              margin: "0 auto",
              background: "linear-gradient(135deg,#9d2159,#66143a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 512 512">
              <g transform="translate(0 12)">
                <circle cx="206" cy="228" r="80" fill="none" stroke="#cba14a" strokeWidth="30" />
                <circle cx="300" cy="228" r="80" fill="none" stroke="#ffffff" strokeWidth="30" />
                <path
                  transform="translate(186 246) scale(5.4)"
                  fill="#cba14a"
                  d="M12 21s-1-.7-2.6-2.1C6.9 16.6 3 13.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.3-3.9 7.7-6.4 10C13 20.3 12 21 12 21z"
                />
              </g>
            </svg>
          </div>
          <h1 style={{ marginTop: 28, fontSize: 20, fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>
            We hit an unexpected snag. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 28,
              padding: "12px 24px",
              borderRadius: 9999,
              background: "#9d2159",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
