import Info from './Info';
import MapView from './MapView';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'; 


const App = () => {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/info" element={<Info />} />
      </Routes>
    </Router>
  );
};

export default App;