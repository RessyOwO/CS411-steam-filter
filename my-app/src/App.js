import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Pages/Home';
import { Login } from './Pages/Login';
import { Profile } from './Pages/Profile';
import { Error } from './Pages/Error';
import { NavBar } from './Pages/NavBar';

function App() {
  return (
    <div className="App">
      <Router>
        {/* @TODO: this navbar needs to be fixed so that it only shows on home and profile page or smth like that */}
        <NavBar/>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/Home" element={<Home/>}/>
          <Route path="/Profile" element={<Profile/>}/>
          <Route path="*" element={<Error />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
