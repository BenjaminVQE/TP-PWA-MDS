import Link from "next/link";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function Home() {
  return (
    <main style={{
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      textAlign: "center"
    }}>
      <OfflineIndicator />

      <div className="glass animate-fade-in" style={{
        maxWidth: "42rem",
        width: "100%",
        padding: "2.5rem",
        borderRadius: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem"
      }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          background: "var(--primary-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent", // Fallback standard
          lineHeight: 1.2
        }}>
          BEN Messenger
        </h1>

        <p style={{
          fontSize: "1.125rem",
          lineHeight: 1.75,
          color: "var(--foreground)",
          opacity: 0.8
        }}>
          Bienvenue sur l'application de messagerie BEN.
        </p>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Technologies utilisées :</h3>
          <ul style={{
            listStyleType: "disc",
            paddingLeft: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            opacity: 0.8
          }}>
            <li>Next.js</li>
            <li>Progressive Web App (PWA)</li>
          </ul>
        </div>

        <Link href="/reception" className="btn-primary" style={{
          display: "inline-block",
          fontSize: "1.125rem",
          textDecoration: "none",
          alignSelf: "center",
          marginTop: "1rem"
        }}>
          Start Messaging
        </Link>
      </div>

      <footer style={{
        position: "absolute",
        bottom: "1rem",
        fontSize: "0.875rem",
        opacity: 0.5
      }}>
        TP PWA - MDS Project
      </footer>
    </main>
  );
}
