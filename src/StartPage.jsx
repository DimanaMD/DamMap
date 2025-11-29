import { Link } from 'react-router-dom';
import './start.css'
const StartPage = () => {
    return(
       <>
        <header id='c'>
            <Link to={"/Map"}>Click</Link>
        </header>
       </>
    );
}

export default StartPage;