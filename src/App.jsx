import Info from './Info';
import MapView from './MapView';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './assets/styles/index.css'; 
import HomePage from './HomePage';
import Header from './Header';
import Path from './Route';
import Stations from './Stations';


const App = () => {
  return (
   <Router>
    <Header/>
      <Routes>
        <Route path = "/" element ={<HomePage/>}/>
        <Route path="/Map" element={<MapView />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/info/:name" element={<Info />} />
        <Route path="/path" element={<Path/>}/>
      </Routes>
    </Router>
  );
};

export default App;