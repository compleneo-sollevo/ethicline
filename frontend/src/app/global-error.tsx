"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="de">
      <head>
        <title>Fehler — ethicLine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          backgroundColor: "#ffffff",
          color: "#151515",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (prefers-color-scheme: dark) {
                body { background-color: #151515 !important; color: #e5e5e5 !important; }
                .ge-card { background: #1c1d1c !important; border-color: #2a2b2a !important; }
                .ge-code { background: #2a2b2a !important; }
              }
            `,
          }}
        />
        <div
          className="ge-card"
          style={{
            maxWidth: "420px",
            margin: "16px",
            padding: "40px 32px",
            textAlign: "center",
            borderRadius: "12px",
            border: "1px solid #e5e5e5",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              backgroundColor: "rgba(21, 21, 21, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ⚠
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 600 }}>
            Ein schwerwiegender Fehler ist aufgetreten
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: "14px", opacity: 0.6 }}>
            Die Anwendung konnte nicht geladen werden.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: "#151515",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            Erneut versuchen
          </button>
          <a
            href="/dashboard"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 500,
              color: "inherit",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Zum Dashboard
          </a>
          {error.digest && (
            <p style={{ marginTop: "20px", fontSize: "12px", opacity: 0.5 }}>
              Fehler-ID:{" "}
              <code
                className="ge-code"
                style={{
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: "#f0f0f0",
                  fontSize: "11px",
                }}
              >
                {error.digest}
              </code>
            </p>
          )}
          <p style={{ marginTop: "16px", fontSize: "12px", opacity: 0.5 }}>
            Bei Problemen bitte an den Administrator wenden.
          </p>
        </div>
      </body>
    </html>
  );
}
