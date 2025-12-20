import Info from './Info';
import MapView from './MapView';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './assets/styles/index.css'; 
import HomePage from './HomePage';
import Header from './Header';


const App = () => {
  return (
   <Router>
    <Header/>
    <div style={{ paddingTop: "100px" }}></div>
      <Routes>
        <Route path = "/" element ={<HomePage/>}/>
        <Route path="/Map" element={<MapView />} />
        <Route path="/info/:name" element={<Info />} />
      </Routes>
    </Router>
  );
};

export default App;