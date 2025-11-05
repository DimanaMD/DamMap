import './search.css'
import { Link } from 'react-router-dom';
const SearchBar = () =>{
    return(
        <div className="searchBar">
            <input type="search" id="gsearch" name="gsearch"/>
            
            <Link to="/water" className='txt'>
                <button className='btn'>
                    ?
                </button>
            </Link>
        </div>
    );
}
export default SearchBar