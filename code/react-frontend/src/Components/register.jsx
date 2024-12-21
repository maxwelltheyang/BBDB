import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {UserContext} from './UserContext';
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css'; 

const Page3 = () => {
  const {user , setUser} = useContext(UserContext)
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [player, setPlayer] = useState('');
  const [team, setTeam] = useState('');

  const [isSimplePopupOpen, setIsSimplePopupOpen] = useState(false);
  const [simplePopupTitle, setSimplePopupTitle] = useState('');
  const [queryResults, setQueryResults] = useState(null);

  const SimplePopup = ({ title, content, onClose }) => (
    <>
    <div className="simple-popup-overlay" onClick={onClose}></div>
    <div className="simple-popup">
      <h2>{title}</h2>
      <div>{content}</div>
      <div className="popup-buttons">
      <button onClick={onClose}>Close</button>
      </div>
    </div>
    </>
  );

  const goback = () => {
    setUser("")
    navigate('/');
    };
  
  const handleQuery = async() => {
    console.log("Handle Upload")
    console.warn("Upload")
    console.error("Upload")

    var object = {};
    object["username"] = username
    object["favorite_player"] = player
    object["favorite_team"] = team
    object["password"] = password
    try {
      const response = await fetch('http://127.0.0.1:5000/addUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(object)
      });
      if (response.ok) {
        console.log("Good upload")
        const data = await response.json()
        console.log("Good JSON fetch")
        console.log(data)
        setUser(username);
        navigate('/home');
      } else {
        console.log("Update failed");
        setSimplePopupTitle("Update Error");
        setQueryResults(["Updated Favorite Team or Favorite Player does not exist"]);
        setIsSimplePopupOpen(true);
      }
    } catch (error) {
      console.log("Good googly moogly")
      console.error('Login error:', error)
      setSimplePopupTitle("Login Error");
      setQueryResults([error.message]);
      setIsSimplePopupOpen(true);
    }
  }
  
  return (
    <>
    {isSimplePopupOpen && (
      <SimplePopup
      title={simplePopupTitle}
      content={queryResults.map((result, index) => (
        <p key={index}>{result}</p>
      ))}
      onClose={() => setIsSimplePopupOpen(false)}
      />
    )}
    <div className="container">
      <div className="login-box">
      <h1>Sign Up</h1>
      <div>Enter your Username, Password, Favorite Player, and Favorite team</div>
      <input
        id="username"
        type="text"
        placeholder="kingjames"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        id="password"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        id="player"
        type="text"
        placeholder="tatumja01"
        onChange={(e) => setPlayer(e.target.value)}
      />
      <input
        id="team"
        type="text"
        placeholder="Boston Celtics"
        onChange={(e) => setTeam(e.target.value)}
      />
      <button className="button" onClick={handleQuery}>Sign Up</button>
      </div>
    </div>
    </>
  );
  };
  
  export default Page3;