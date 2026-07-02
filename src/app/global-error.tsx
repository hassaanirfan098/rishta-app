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
          background: "linear-gradient(180deg,#ecfdf5,#ffffff)",
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
              background: "linear-gradient(135deg,#10b981,#0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 512 512">
              <mask id="ge-c">
                <rect width="512" height="512" fill="black" />
                <circle cx="244" cy="256" r="150" fill="white" />
                <circle cx="312" cy="256" r="130" fill="black" />
              </mask>
              <rect width="512" height="512" fill="white" mask="url(#ge-c)" />
              <path
                transform="translate(300 198) scale(5.8)"
                fill="white"
                d="M12 21s-1-.7-2.6-2.1C6.9 16.6 3 13.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.3-3.9 7.7-6.4 10C13 20.3 12 21 12 21z"
              />
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
              background: "#059669",
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
