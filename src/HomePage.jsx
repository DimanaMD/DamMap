import React from "react";
import { useNavigate } from "react-router-dom";
import "./assets/styles/HomePage.css";
import { Link } from "react-router-dom";
import damImg from "./assets/images/dam.jpg";
import dam1 from "./assets/images/dam1.jpg";
import dam2 from "./assets/images/dam2.jpg";
import dam3 from "./assets/images/dam3.jpg";

import damsData from "./json/dams_data.json";

const HomePage = () => {
  const navigate = useNavigate();

  const damImages = [dam1, dam2, dam3];

  return (
    <>
    <div style={{ paddingTop: "100px" }}></div>
    <div
      className="home-container"
      style={{ backgroundImage: `url(${damImg})` }}
    >
      {/* LEFT SIDE */}
      <div className="home-left">
        <h1 className="home-title">
          БЪЛГАРСКИ ЯЗОВИРИ <br /> ДАННИ <br /> <span>НАБЛЮДЕНИЕ</span>
        </h1>

        <p className="home-description">
          Открийте подробна информация за язовирите в цялата страна.
          Разгледайте местоположения, капацитет, стойности и други.
        </p>

        <button
          className="home-main-btn"
          onClick={() => navigate("/map")}
        >
          Към картата
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
        Виж детайли
      </button>

    </div>
    ))}
    </div>
    </div>
    </>
    
  );
};

export default HomePage;