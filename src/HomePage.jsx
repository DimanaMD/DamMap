import React from "react";
import { useNavigate } from "react-router-dom";
import "./assets/styles/HomePage.css";
import damImg from "./assets/images/dam.jpg";
import dam1 from "./assets/images/dam1.jpg";
import dam2 from "./assets/images/dam2.jpg";
import dam3 from "./assets/images/dam3.jpg";
import Footer from "./Footer"

import damsData from "./json/dams_data.json";

const HomePage = () => {
  const navigate = useNavigate();

  const damImages = [dam1, dam2, dam3];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div style={{ 
        position: "relative", 
        height: "100vh", 
        width: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        overflow: "hidden"
      }}>
        
        {/* Background Image & Overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: -1 }}>
          <img 
            src={damImg} 
            alt="Background" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
          <div style={{ 
            position: "absolute", 
            inset: 0, 
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 100%)" 
          }}></div>
        </div>

        {/* Hero Content */}
        <div style={{ 
          textAlign: "center", 
          color: "white", 
          maxWidth: "800px", 
          padding: "0 20px",
          zIndex: 10,
          marginTop: "-50px"
        }}>
          <h1 style={{ 
            fontSize: "clamp(2.5rem, 5vw, 4rem)", 
            fontWeight: "800", 
            lineHeight: "1.1", 
            marginBottom: "24px",
            letterSpacing: "-2px"
          }}>
            Водното богатство на <br/>
            <span style={{ 
              background: "linear-gradient(to right, #38bdf8, #818cf8)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>
              България
            </span>
          </h1>
          
          <p style={{ 
            fontSize: "1.25rem", 
            color: "#e2e8f0", 
            marginBottom: "40px", 
            lineHeight: "1.6",
            fontWeight: "300"
          }}>
            Интерактивна карта и мониторинг на язовирите в реално време. 
            Следете нивата, обемите и състоянието на водните ресурси.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/map")}
              style={{
                padding: "16px 32px",
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "white",
                backgroundColor: "#0ea5e9",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.5)"
              }}
            >
              Към картата
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div style={{ padding: "80px 20px", backgroundColor: "#f8fafc" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "2.5rem", color: "#0f172a", marginBottom: "60px", fontWeight: "700" }}>
            Избрани обекти
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            {damsData.slice(0, 3).map((dam, index) => (
              <div key={dam["Име"]} 
                onClick={() => navigate(`/info/${encodeURIComponent(dam["Име"])}`)}
                style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", cursor: "pointer", transition: "transform 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ height: "200px", overflow: "hidden" }}>
                  <img src={damImages[index]} alt={dam["Име"]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "24px" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "1.5rem", color: "#1e293b" }}>{dam["Име"]}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                    <span>{dam["Област"]}</span>
                    <span style={{ color: "#0ea5e9", fontWeight: "600" }}>Детайли →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default HomePage;