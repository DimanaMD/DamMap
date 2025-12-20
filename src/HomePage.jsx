import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/HomePage.css";

import damImg from "./assets/dam.jpg";
import dam1 from "./assets/dam1.jpg";
import dam2 from "./assets/dam2.jpg";
import dam3 from "./assets/dam3.jpg";

import damsData from "./assets/dams_data.json";

const HomePage = () => {
  const navigate = useNavigate();

  const damImages = [dam1, dam2, dam3];

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${damImg})` }}
    >
    
      {/* LEFT SIDE */}
      <div className="home-left">
        <h1 className="home-title">
          BULGARIAN DAMS <br /> DATA <br /> <span>MONITORING</span>
        </h1>

        <p className="home-description">
          Discover detailed insights about dams across the country.  
          Explore locations, capacity, values, and more.
        </p>

        <button
          className="home-main-btn"
          onClick={() => navigate("/map")}
        >
          Go to Map
        </button>
      </div>

     {/* RIGHT SIDE – DAM CARDS */}
<div className="home-cards">
  {damsData.slice(0, 3).map((dam, index) => (
    <div key={dam["Име"]} className="home-card">
      
      <img 
        src={damImages[index]} 
        alt={dam["Име"]} 
        className="home-card-img" 
      />

      <h3 className="home-card-title">
        {dam["Име"]}
      </h3>

      <button
        className="home-card-btn"
        onClick={() => navigate(`/dams/${encodeURIComponent(dam["Име"])}`)}
      >
        View Details
      </button>

    </div>
  ))}
</div>
    </div>
  );
};

export default HomePage;