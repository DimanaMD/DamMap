import Info from './Info';
import MapView from './MapView';
import WaterMap from './WaterMap';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'; 


const App = () => {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/info/:name" element={<Info />} />
        <Route path='/water' element={<WaterMap/>}/>
      </Routes>
    </Router>
  );
};

export default App;