import { Link, useLocation } from "react-router-dom";
import "./assets/styles/Header.css";
import logo from "./assets/images/logo.png";

const Header = () => {
  const location = useLocation();
  const path = location.pathname;

  const getLinkStyle = (isActive) => ({
    textDecoration: "none",
    color: isActive ? "#0ea5e9" : "#64748b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: isActive ? "rgba(14, 165, 233, 0.1)" : "transparent",
    transition: "all 0.2s ease",
    minWidth: "70px"
  });

  return (
   <header className="header-container" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
      display: "flex",
      justifyContent: "space-between", 
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      padding: "0 24px",
      height: "80px",
      borderBottom: "1px solid #f1f5f9"
    }}>

      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: "12px" }}>
          <img 
            src={logo} 
            alt="logo" 
            className="header-logo" 
            style={{ height: "58px", width: "auto", margin: 0 }} 
          />
          <h1 className="header-title" style={{ 
            fontSize: "1.5rem", 
            fontWeight: "800", 
            color: "#0f172a", 
            margin: 0,
            letterSpacing: "-0.5px"
          }}>
            Язовири <span style={{ color: "#0ea5e9" }}>БГ</span>
          </h1>
      </Link>

      <div style={{ display: "flex", gap: "24px", marginRight: "60px" }}>
        <Link 
          to="/Map" 
          style={getLinkStyle(path === "/Map")}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span className="material-icons" style={{ fontSize: "24px" }}>map</span>
          <span style={{ fontSize: "11px", fontWeight: "600", marginTop: "4px" }}>Карта</span>
        </Link>
        <Link 
          to="/path" 
          style={getLinkStyle(path === "/path")}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span className="material-icons" style={{ fontSize: "24px" }}>directions</span>
          <span style={{ fontSize: "11px", fontWeight: "600", marginTop: "4px" }}>Маршрут</span>
        </Link>
      </div>

    </header>
  );
};

export default Header;