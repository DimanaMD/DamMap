import React from "react";
import "./assets/styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Brand / Description */}
        <div>
          <div className="footer-brand-wrap">
            <span className="footer-logo-icon">▲</span>
            <h2 className="footer-title">
              Язовири БГ
            </h2>
          </div>

          <p className="footer-description">
            Модерни решения за управление и мониторинг на водните ресурси. 
            Осигуряваме прецизност и сигурност за по-добро бъдеще.
          </p>

          <div className="footer-contact">
            <a href="mailto:presian.dimitrov-26z@mgberon.com" className="footer-email">
              presian.dimitrov-26z@mgberon.com
            </a>
            <a href="mailto:dimana.dimitrova-26z@mgberon.com" className="footer-email">
              dimana.dimitrova-26z@mgberon.com
            </a>
          </div>
        </div>

        {/* Site Map */}
        <div>
          <h3 className="footer-heading">Site Map</h3>
          <ul className="footer-list">
            <li><a href="/" className="footer-link">Homepage</a></li>
            <li><a href="/Map" className="footer-link">Map</a></li>
            <li><a href="/path" className="footer-link">Path</a></li>
            <li><a href="/About" className="footer-link">About Us</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Язовири БГ. Всички права запазени.
      </div>
    </footer>
  );
};

export default Footer;