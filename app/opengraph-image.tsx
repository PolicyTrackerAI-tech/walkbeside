import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Funerose — quiet help after a loss";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "#fbf9f5",
          color: "#20453a",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: "#6f7d75",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          Funerose
        </div>
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.1,
            marginBottom: 32,
            maxWidth: 900,
          }}
        >
          Quiet help when someone important dies.
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#4a5750",
            maxWidth: 900,
          }}
        >
          Fair prices. Family advocacy. The checklist for the next 30 days.
        </div>
      </div>
    ),
    { ...size },
  );
}
