import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rishta — Find your rishta the halal way";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #9d2159 0%, #7f1a47 55%, #4d0e2b 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />

        {/* Logo mark — crescent + heart */}
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 36,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <svg width="94" height="94" viewBox="0 0 512 512">
            <g transform="translate(0 12)">
              <circle cx="206" cy="228" r="80" fill="none" stroke="#c1963a" strokeWidth="30" />
              <circle cx="300" cy="228" r="80" fill="none" stroke="#9d2159" strokeWidth="30" />
              <path
                transform="translate(186 246) scale(5.4)"
                fill="#9d2159"
                d="M12 21s-1-.7-2.6-2.1C6.9 16.6 3 13.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 4.3-3.9 7.7-6.4 10C13 20.3 12 21 12 21z"
              />
            </g>
          </svg>
        </div>

        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 44, letterSpacing: -1 }}>
          Rishta
        </div>

        <div style={{ fontSize: 36, fontWeight: 500, marginTop: 10, opacity: 0.92 }}>
          Find your rishta the halal way
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 44,
          }}
        >
          {["Verified profiles", "Halal communication", "For marriage"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "12px 26px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
