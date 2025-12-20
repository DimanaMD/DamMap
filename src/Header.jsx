import { Link } from "react-router-dom";
import "./Header.css";
import logo from "./logo.png";

const Header = () => {
  return (
    <header className="header-container">

      {/* Left: Home button */}
      <Link to="/" className="header-btn">
        <span className="material-icons">home</span>
      </Link>

      {/* Center: Logo + title */}
      <div className="header-center">
        <img src={logo} alt="logo" className="header-logo" />
        <h1 className="header-title">Язовири БГ</h1>
      </div>

      {/* Right: Map button */}
      <Link to="/Map" className="header-btn">
        <span className="material-icons">map</span>
      </Link>

    </header>
  );
};

export default Header;