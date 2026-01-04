import { Link } from "react-router-dom";
import "./assets/styles/Header.css";
import logo from "./assets/images/logo.png";

const Header = () => {
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
      backgroundColor: "white", // Ensure it's not transparent
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      padding: "0 20px",
      height: "100px"
    }}>

      {/*Home*/}
      <Link to="/path" className="header-btn">
        <span className="material-icons">home</span>
      </Link>

      {/* Logo*/}
      <div className="header-center">
        <Link to="/">
          <img src={logo} alt="logo" className="header-logo" />
        </Link>
        
        <h1 className="header-title">Язовири БГ</h1>
      </div>

      {/* Map*/}
      <Link to="/Map" className="header-btn">
        <span className="material-icons">map</span>
      </Link>

    </header>
  );
};

export default Header;