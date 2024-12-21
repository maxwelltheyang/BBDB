import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {UserProvider} from './Components/UserContext';
import Page1 from './Components/login';
import Page2 from './Components/home';
import Page3 from './Components/register'

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Page1 />} />
          <Route path="/home" element={<Page2 />} />
          <Route path="/register" element={<Page3 />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
