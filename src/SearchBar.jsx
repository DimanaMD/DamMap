import './search.css'
import { Link } from 'react-router-dom';
const SearchBar = () =>{
    return(
        <div className="searchBar">
            <input type="search" id="gsearch" name="gsearch"/>
            <button id='btn'>
                <Link to="/water">Откъде ти идва водата?</Link>
            </button>
        </div>
    );
}
export default SearchBar