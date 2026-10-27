import { ImageResponse } from "next/og";

export const alt = "Biruk Belete: digital skills coach, IT systems and web developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin text only on purpose: the OG renderer has no Ethiopic font and fetching one would add a network dependency.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg,#080d12 0%,#0f1d26 100%)",
          color: "#e8eef1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", width: 120, height: 8, background: "#2dd4bf", marginBottom: 40 }} />
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Biruk Belete</div>
        <div style={{ fontSize: 40, color: "#9dacb5", marginTop: 24 }}>
          Digital skills coach · IT systems · Web developer
        </div>
        <div style={{ fontSize: 30, color: "#f5b942", marginTop: 48 }}>Youth empowerment · AI · Data</div>
      </div>
    ),
    size,
  );
}
