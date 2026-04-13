import { ImageResponse } from "next/og";

export const alt = "ethicLine GmbH";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "#151515",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "140px",
            height: "140px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "28px",
            border: "3px solid rgba(255, 255, 255, 0.25)",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            EL
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            ethicLine
          </span>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            ethicLine GmbH
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
