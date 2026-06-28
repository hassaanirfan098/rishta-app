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
          background: "linear-gradient(135deg, #064e3b 0%, #047857 55%, #0d9488 100%)",
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

        {/* Logo mark */}
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 36,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            fontWeight: 700,
            color: "#047857",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          ر
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
