import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/constants";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Load logo as base64 data URI so it works in the edge renderer
  const logoBuffer = await readFile(join(process.cwd(), "public/logo.png"));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  // Load Syne Bold for headings
  const syneBold = await fetch(
    "https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uQ.woff2"
  ).then((r) => r.arrayBuffer());

  // Load DM Sans Regular for body
  const dmSansRegular = await fetch(
    "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZa4ET-DNl0.woff2"
  ).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "#090B18",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Star-field dots — pure CSS via box-shadow isn't available here, use positioned divs */}
        {[
          [80, 60], [200, 120], [350, 45], [500, 90], [650, 30],
          [800, 75], [950, 50], [1100, 100], [140, 200], [420, 180],
          [700, 160], [900, 140], [1050, 220], [260, 310], [580, 280],
          [760, 320], [1000, 300], [100, 420], [380, 400], [620, 450],
          [850, 380], [1120, 410], [50, 530], [300, 570], [700, 520],
          [980, 560], [1150, 490],
        ].map(([x, y], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
              borderRadius: "50%",
              background: i % 7 === 0 ? "#FEC73E" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}

        {/* Left glow from brand navy */}
        <div
          style={{
            position: "absolute",
            left: -100,
            top: "50%",
            transform: "translateY(-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(22,33,97,0.6) 0%, transparent 70%)",
          }}
        />

        {/* Gold accent line at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, transparent 0%, #FEC73E 40%, #FEC73E 60%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 96px",
            height: "100%",
          }}
        >
          {/* Left: Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(22,33,97,0.4)",
              border: "1px solid rgba(254,199,62,0.25)",
              flexShrink: 0,
            }}
          >
            <img
              src={logoBase64}
              alt="Eka Research Logo"
              width={150}
              height={150}
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Right: Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 72,
              flex: 1,
            }}
          >
            {/* Label pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  background: "rgba(254,199,62,0.15)",
                  border: "1px solid rgba(254,199,62,0.4)",
                  borderRadius: 100,
                  padding: "6px 16px",
                  color: "#FEC73E",
                  fontSize: 14,
                  fontFamily: "'DM Sans'",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Space Research · Kathmandu, Nepal
              </div>
            </div>

            {/* Site name */}
            <div
              style={{
                fontFamily: "'Syne'",
                fontWeight: 800,
                fontSize: 72,
                color: "#EDF0FF",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Eka Research
            </div>

            {/* Tagline */}
            <div
              style={{
                fontFamily: "'DM Sans'",
                fontWeight: 400,
                fontSize: 22,
                color: "#9098C0",
                marginTop: 16,
                lineHeight: 1.5,
                maxWidth: 520,
              }}
            >
              {SITE.tagline}
            </div>

            {/* Gold accent dots */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 32,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: i === 0 ? 32 : 8,
                    height: 4,
                    borderRadius: 2,
                    background: i === 0 ? "#FEC73E" : "rgba(254,199,62,0.3)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Syne", data: syneBold, style: "normal", weight: 800 },
        { name: "DM Sans", data: dmSansRegular, style: "normal", weight: 400 },
      ],
    }
  );
}
