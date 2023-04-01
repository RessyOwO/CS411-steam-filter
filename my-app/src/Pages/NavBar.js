import { Link } from 'react-router-dom'

// this page serves as a helper page just so I can navigate to pages while trying to figure things out
// need to be updated/deleted later
export const NavBar = () => {
    return (
        <div>
            <Link to="/">Login</Link>
            <Link to="/Home">Home</Link>
            <Link to="/Profile">Profile</Link>
        </div>
    );
};