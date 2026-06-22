import { useEffect, useState } from "react";

export default function IPhoneMockup({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 430);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 430);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (isMobile) return children;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#fff",
      padding: "40px 0",
    }}>
      <div style={{
        width: 393,
        height: 852,
        borderRadius: 50,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
        flexShrink: 0,
        position: "relative",
      }}>
        {children}
      </div>
    </div>
  );
}
