import React from "react";
import { Link } from "react-router-dom";
import "./assets/styles/Footer.css";

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      padding: "60px 24px 24px",
      marginTop: "auto"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "48px",
        marginBottom: "48px"
      }}>
        
        {/* Brand / Description */}
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "800", 
              margin: 0,
              letterSpacing: "-0.5px"
            }}>
              Язовири <span style={{ color: "#0ea5e9" }}>БГ</span>
            </h2>
          </div>

          <p style={{ 
            color: "#94a3b8", 
            lineHeight: "1.6", 
            fontSize: "0.95rem",
            maxWidth: "300px"
          }}>
            Модерни решения за управление и мониторинг на водните ресурси. 
            Осигуряваме прецизност и сигурност за по-добро бъдеще.
          </p>
        </div>

        {/* Site Map */}
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "24px", color: "#e2e8f0" }}>Навигация</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <li><Link to="/" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Начало</Link></li>
            <li><Link to="/Map" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Карта</Link></li>
            <li><Link to="/path" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>Маршрут</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "24px", color: "#e2e8f0" }}>Контакти</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <a 
              href="mailto:presian.dimitrov-26z@mgberon.com" 
              style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", transition: "color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <span className="material-icons" style={{ fontSize: "20px", color: "#0ea5e9" }}>email</span>
              presian.dimitrov-26z@mgberon.com
            </a>
            <a 
              href="mailto:dimana.dimitrova-26z@mgberon.com" 
              style={{ color: "#94a3b8", textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", transition: "color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
            >
              <span className="material-icons" style={{ fontSize: "20px", color: "#0ea5e9" }}>email</span>
              dimana.dimitrova-26z@mgberon.com
            </a>
          </div>
        </div>

      </div>

      <div style={{
        borderTop: "1px solid #1e293b",
        paddingTop: "24px",
        textAlign: "center",
        color: "#64748b",
        fontSize: "0.875rem"
      }}>
        © {new Date().getFullYear()} Язовири БГ. Всички права запазени.
      </div>
    </footer>
  );
};

export default Footer;