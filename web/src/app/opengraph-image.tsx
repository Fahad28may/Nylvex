import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#05070d",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(124,58,237,0.35), transparent 55%), radial-gradient(circle at 10% 90%, rgba(37,99,235,0.3), transparent 55%)",
          color: "#f5f7ff",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 4,
            color: "#60a5fa",
            fontFamily: "monospace",
            marginBottom: 28,
          }}
        >
          NYLVEX — AI &amp; SOFTWARE ENGINEERING STUDIO
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 600,
            lineHeight: 1.2,
            maxWidth: 920,
            letterSpacing: -1,
          }}
        >
          {siteConfig.headline}
        </div>
      </div>
    ),
    { ...size }
  );
}
