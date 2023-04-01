import { Link } from 'react-router-dom'

// this page serves as a helper page just so I can navigate to pages while trying to figure things out
// need to be updated/deleted later
// this is just a comment testing for nothing :)
export const NavBar = () => {
    return (
        <div>
            <Link to="/">Login</Link>
            <Link to="/Home">Home</Link>
            <Link to="/Profile">Profile</Link>
        </div>
    );
};