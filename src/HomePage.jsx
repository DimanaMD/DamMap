import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

import damImg from "./dam.jpg";
import dam1 from "./dam1.jpg";
import dam2 from "./dam2.jpg";
import dam3 from "./dam3.jpg";

import Header from "./Header";

const HomePage = () => {
  const navigate = useNavigate();

  const damImages = [dam1, dam2, dam3];

  return (
    <Header/>
  );
};

export default HomePage;