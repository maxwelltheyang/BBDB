import React, { useContext } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './styles.css'; // Import the stylesheet for styling

const Page1 = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Invalid login credentials.');
        return;
      }

      const userData = await response.json();
      setUser(usernameInput);
      navigate('/home');
    } catch (error) {
      setErrorMessage('An internal error occurred. Try again later.');
      console.error('Login error:', error);
    }
  };

  const handleNewUser = () => {
    navigate('/register'); 
  };

  return (
    <div className="container">
      <button className="new-user-button" onClick={handleNewUser}>New User?</button>
      <div className="login-box">
        <h1>Login</h1>
        <div>Enter your Username and Password</div>
        <input
          id="username"
          type="text"
          placeholder="Lebron"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        {/* Render error message if present */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button className="button" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Page1;