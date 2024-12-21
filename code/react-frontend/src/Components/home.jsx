import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import Popup from 'reactjs-popup';
import './styles.css'; 

const Page2 = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Popup states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isQueryOpen, setIsQueryOpen] = useState(false); 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSimplePopupOpen, setIsSimplePopupOpen] = useState(false);
  const [isRelatedOpen, setIsRelatedOpen] = useState(false); // Related entities popup

  // User update
  const [newFavoritePlayer, setNewFavoritePlayer] = useState('');
  const [newFavoriteTeam, setNewFavoriteTeam] = useState('');

  // For main query
  const [favoritePlayer, setFavoritePlayer] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [outputStats1, setOutputStats1] = useState([]);
  const [outputStats2, setOutputStats2] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState('stats2');

  // General query states
  const [queryResults, setQueryResults] = useState(null);
  const [relatedEntities, setRelatedEntities] = useState(null);
  const [popupTitle, setPopupTitle] = useState('');

  const [isPlayerQuery, setIsPlayerQuery] = useState(false);
  const [playerID, setPlayerID] = useState('');
  const [teamName, setTeamName] = useState('');
  const [season, setSeason] = useState('');
  const [numYears, setNumYears] = useState('');
  const [numGames, setNumGames] = useState('');

  const [selectedStats, setSelectedStats] = useState([]);
  const [selectedTeamStats, setSelectedTeamStats] = useState([]);
  const [selectedAwardStats, setSelectedAwardStats] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const availableStats = [
    "Games_Played", "Games_Started", "Minutes_Played", "Field_Goals_Made", "Field_Goals_Attempted",
    "Three_Pointers_Attempted", "Three_Pointers_Made", "Two_Pointers_Attempted", "Two_Pointers_Made",
    "Free_Throws_Made", "Free_Throws_Attempted", "Offensive_Rebounds", "Defensive_Rebounds",
    "Assists", "Steals", "Blocks", "Turnovers", "Personal_Fouls", "Points"
  ];

  const availableAwardStats = [
    "Champion", "Most_Valuable_Player", "Defensive_Player_Of_The_Year", "Rookie_Of_The_Year",
    "Sixth_Man_Of_The_Year", "Most_Improved_Player"
  ];

  const handleCheckboxChange = (stat, setState = setSelectedStats) => {
    setState((prevStats) =>
      prevStats.includes(stat)
        ? prevStats.filter((s) => s !== stat)
        : [...prevStats, stat]
    );
  };

  const goback = () => {
    setUser("");
    navigate('/');
  };

  // Initial query to get favorite player/team stats
  const handleQuery = async () => {
    const object = { username: user };
    try {
      const response = await fetch('http://127.0.0.1:5000/getPlayerAwardsAndPerformance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });
      if (response.ok) {
        const data = await response.json();
        setFavoritePlayer(data.favoritePlayer);
        setFavoriteTeam(data.favoriteTeam);
        setOutputStats1(data.stats1);
        setOutputStats2(data.stats2);
        setSelectedOutput('stats2');
        setIsQueryOpen(true);
      } else {
        console.log("Bad response on initial query");
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleBasicQuery = async (endpoint, body, title) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        const data = await response.json();
        setPopupTitle(title);
        setQueryResults(data.stats || data.games || data.awards || []);
        setRelatedEntities(data.related_players || data.related_teams || null);
        setIsPopupOpen(true);
        setCurrentPage(0);
      } else {
        console.error("Error fetching query results");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const renderQueryResults = () => {
    if (!queryResults || !Array.isArray(queryResults) || queryResults.length === 0) {
      return <p>No results found.</p>;
    }

    let defaultColumns = [];
    let stats = [];

    if (popupTitle === "Player Stats") {
      defaultColumns = ["Player_Name", "Team_Name", "Season", "Position"];
      stats = selectedStats;
    } else if (popupTitle === "Team Stats") {
      defaultColumns = ["Team.Team_Name", "Team.Season"];
      stats = selectedTeamStats;
    } else if (popupTitle === "Game Stats") {
      defaultColumns = ["GameID", "Date", "Season", "Home_Score", "Visitor_Score", "Home_Team", "Away_Team", "Arena_Name"];
    } else if (popupTitle === "Award Winners") {
      defaultColumns = ["Season"];
      stats = selectedAwardStats;
    }

    const tableHeaders = [...defaultColumns, ...stats];
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRows = queryResults.slice(startIndex, endIndex);

    return (
      <div style={{ backgroundColor: 'white', padding: '20px' }}>
        <h2>{popupTitle}</h2>
        <table className="query-results-table">
          <thead>
            <tr>
              {tableHeaders.map((key) => (
                <th key={key}>{key.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((result, index) => (
              <tr key={index}>
                {tableHeaders.map((key) => (
                  <td key={key}>{result[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            &lt; Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => (endIndex < queryResults.length ? prev + 1 : prev))}
            disabled={endIndex >= queryResults.length}
          >
            Next &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderRelatedResults = () => {
    if (!relatedEntities || relatedEntities.length === 0) {
      return <p>No related entities found.</p>;
    }

    let defaultColumns = isPlayerQuery ? ["PlayerID", "Player_Name"] : ["Team_Name"];
    const tableHeaders = [...defaultColumns];

    return (
      <div style={{ backgroundColor: 'white', padding: '20px' }}>
        <h2>Related Entities</h2>
        <table className="query-results-table">
          <thead>
            <tr>
              {tableHeaders.map((key) => (
                <th key={key}>{key.replace(/_/g, " ")}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {relatedEntities.map((row, index) => {
              const entity = isPlayerQuery ? row["PlayerID"] : row["Team_Name"];
              return (
                <tr key={index}>
                  {tableHeaders.map((key) => (
                    <td key={key}>{row[key]}</td>
                  ))}
                  <td>
                    <button onClick={() => RelatedQuery(entity)}>Query</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const RelatedQuery = (entity) => {
    // Query stats for the related entity
    if (isPlayerQuery) {
      setPlayerID(entity);
      handleBasicQuery(
        "getPlayerStats",
        { player_id: entity, num_years: numYears, stats: selectedStats },
        "Player Stats"
      );
    } else {
      setTeamName(entity);
      handleBasicQuery(
        "getTeamStats",
        { team_name: entity, num_years: numYears, stats: selectedTeamStats },
        "Team Stats"
      );
    }
    // Close the related popup after querying
    setIsRelatedOpen(false);
  };

  const deleteUser = async() => {
    const object = { username: user };
    try {
      const response = await fetch('http://127.0.0.1:5000/deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });
      if (response.ok) {
        setIsDeleteOpen(false);
        setUser("");
        navigate('/');
      } else {
        console.log("Delete failed");
        setIsDeleteOpen(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleteOpen(false);
    }
  };

  const handleUpdateUser = () => {
    setIsUpdateOpen(true);
  };

  const performUpdateUser = async() => {
    const object = {
      username: user,
      favoritePlayer: newFavoritePlayer,
      favoriteTeam: newFavoriteTeam
    };
    try {
      const response = await fetch('http://127.0.0.1:5000/updateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(object)
      });
      if (response.ok) {
        setFavoritePlayer(newFavoritePlayer);
        setFavoriteTeam(newFavoriteTeam);
        setIsUpdateOpen(false);
      } else {
        console.log("Update failed");
        setIsUpdateOpen(false);
        setPopupTitle("Update Error");
        setQueryResults(["Updated Favorite Team or Favorite Player does not exist"]);
        setIsSimplePopupOpen(true);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const queryComponents = [
    {
      title: "Player Stats",
      component: (
        <>
          <input
            type="text"
            placeholder="Enter Player ID"
            value={playerID}
            onChange={(e) => setPlayerID(e.target.value)}
          />
          <input
            type="text"
            placeholder="Number of Years"
            value={numYears}
            onChange={(e) => setNumYears(e.target.value)}
          />
          <h3>Select Stats:</h3>
          <div className="checkbox-group">
            {availableStats.map((stat) => (
              <label key={stat}>
                <input
                  type="checkbox"
                  value={stat}
                  checked={selectedStats.includes(stat)}
                  onChange={() => handleCheckboxChange(stat)}
                />
                {stat.replace(/_/g, " ")}
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setIsPlayerQuery(true);
              handleBasicQuery(
                "getPlayerStats",
                { player_id: playerID, num_years: numYears, stats: selectedStats },
                "Player Stats"
              );
            }}
          >
            Query Player Stats
          </button>
        </>
      ),
    },
    {
      title: "Team Stats",
      component: (
        <>
          <input
            type="text"
            placeholder="Enter Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Number of Years"
            value={numYears}
            onChange={(e) => setNumYears(e.target.value)}
          />
          <h3>Select Stats:</h3>
          <div className="checkbox-group">
            {availableStats.map((stat) => (
              <label key={stat}>
                <input
                  type="checkbox"
                  value={stat}
                  checked={selectedTeamStats.includes(stat)}
                  onChange={() => handleCheckboxChange(stat, setSelectedTeamStats)}
                />
                {stat.replace(/_/g, " ")}
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              setIsPlayerQuery(false);
              handleBasicQuery(
                "getTeamStats",
                { team_name: teamName, num_years: numYears, stats: selectedTeamStats },
                "Team Stats"
              );
            }}
          >
            Query Team Stats
          </button>
        </>
      ),
    },
    {
      title: "Game Stats",
      component: (
        <>
          <input
            type="text"
            placeholder="Enter Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <input
            type="text"
            placeholder="Number of Games"
            value={numGames}
            onChange={(e) => setNumGames(e.target.value)}
          />
          <button
            onClick={() => {
              handleBasicQuery(
                "getLastGameStats",
                { season: season, num_games: numGames },
                "Game Stats"
              );
            }}
          >
            Query Game Stats
          </button>
        </>
      ),
    },
    {
      title: "Award Winners",
      component: (
        <>
          <input
            type="text"
            placeholder="Enter Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <h3>Select Awards:</h3>
          <div className="checkbox-group">
            {availableAwardStats.map((stat) => (
              <label key={stat}>
                <input
                  type="checkbox"
                  value={stat}
                  checked={selectedAwardStats.includes(stat)}
                  onChange={() => handleCheckboxChange(stat, setSelectedAwardStats)}
                />
                {stat.replace(/_/g, " ")}
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              handleBasicQuery(
                "getAwardWinnerSeason",
                { season: season, awards: selectedAwardStats },
                "Award Winners"
              );
            }}
          >
            Query Award Winners
          </button>
        </>
      ),
    },
  ];

  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);

  const handleNextQuery = () => {
    setCurrentQueryIndex((prevIndex) => (prevIndex + 1) % queryComponents.length);
  };

  const handlePreviousQuery = () => {
    setCurrentQueryIndex((prevIndex) => (prevIndex - 1 + queryComponents.length) % queryComponents.length);
  };

  const SimplePopup = ({ title, content, onClose }) => (
    <>
      <div className="simple-popup-overlay" onClick={onClose}></div>
      <div className="simple-popup">
        <h2>{title}</h2>
        <div>
          {content.map((result, index) => (
            <p key={index}>{result}</p>
          ))}
        </div>
        <div className="popup-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="container">
      {/* Delete User Popup */}
      <Popup open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <div style={{ backgroundColor: 'white', padding: '20px' }}>
          <h2>Delete User</h2>
          <p>Are you sure you want to delete your account? This action is irreversible</p>
          <button onClick={deleteUser}>Delete</button>
          <button onClick={() => setIsDeleteOpen(false)}>Go back</button>
        </div>
      </Popup>

      {/* Update User Popup */}
      <Popup open={isUpdateOpen} onClose={() => setIsUpdateOpen(false)}>
        <div style={{ backgroundColor: 'white', padding: '20px' }}>
          <h2>Update User</h2>
          <label>Favorite Player:</label>
          <input 
            type="text" 
            value={newFavoritePlayer} 
            onChange={(e) => setNewFavoritePlayer(e.target.value)} 
          />
          <label>Favorite Team:</label>
          <input 
            type="text" 
            value={newFavoriteTeam} 
            onChange={(e) => setNewFavoriteTeam(e.target.value)} 
          />
          <button onClick={performUpdateUser}>Update</button>
          <button onClick={() => setIsUpdateOpen(false)}>Cancel</button>
        </div>
      </Popup>

      {/* Initial Query Popup (Favorite player/team) */}
      <Popup open={isQueryOpen} onClose={() => setIsQueryOpen(false)}>
        <div style={{ backgroundColor: 'white', padding: '20px' }}>
          <h2>Your Query Results</h2>
          {favoritePlayer && <h3>Favorite Player: {favoritePlayer}</h3>}
          {favoriteTeam && <h3>Favorite Team: {favoriteTeam}</h3>}

          <div>
            <label>
              <input
                type="radio"
                value="stats1"
                checked={selectedOutput === 'stats1'}
                onChange={() => setSelectedOutput('stats1')}
              />
              Awards won by favorite team
            </label>
            <label>
              <input
                type="radio"
                value="stats2"
                checked={selectedOutput === 'stats2'}
                onChange={() => setSelectedOutput('stats2')}
              />
              Recent stats by favorite player
            </label>
          </div>

          {selectedOutput === 'stats1' && outputStats1 && outputStats1.length > 0 ? (
            <table>
              <thead>
                <tr>
                  {Object.keys(outputStats1[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outputStats1.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : selectedOutput === 'stats1' ? (
            <p>No data available for Stats1</p>
          ) : null}

          {selectedOutput === 'stats2' && outputStats2 && outputStats2.length > 0 ? (
            <table>
              <thead>
                <tr>
                  {Object.keys(outputStats2[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outputStats2.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : selectedOutput === 'stats2' ? (
            <p>No data available for Stats2</p>
          ) : null}

          <button onClick={() => setIsQueryOpen(false)}>Back</button>
        </div>
      </Popup>

      {/* General Query Results Popup */}
      {isPopupOpen && (
        <Popup open={true} onClose={() => setIsPopupOpen(false)}>
          <div style={{ backgroundColor: 'white', padding: '20px' }}>
            {renderQueryResults()}
            {relatedEntities && relatedEntities.length > 0 && (
              <button onClick={() => setIsRelatedOpen(true)}>Show Related Entities</button>
            )}
            <button onClick={() => setIsPopupOpen(false)}>Close</button>
          </div>
        </Popup>
      )}

      {/* Related Entities Popup */}
      {isRelatedOpen && (
        <Popup open={true} onClose={() => setIsRelatedOpen(false)}>
          <div style={{ backgroundColor: 'white', padding: '20px' }}>
            {renderRelatedResults()}
            <button onClick={() => setIsRelatedOpen(false)}>Close</button>
          </div>
        </Popup>
      )}

      {/* Simple Error Popup */}
      {isSimplePopupOpen && (
        <SimplePopup
          title={popupTitle}
          content={queryResults || []}
          onClose={() => setIsSimplePopupOpen(false)}
        />
      )}

      <div className="query-box">
        <h2>Query Options</h2>
        <h3>{queryComponents[currentQueryIndex].title}</h3>
        {queryComponents[currentQueryIndex].component}
        <div className="navigation-buttons">
          <button onClick={handlePreviousQuery}>Previous</button>
          <button onClick={handleNextQuery}>Next</button>
        </div>
      </div>

      <button className="sign-out-button" onClick={goback}>Sign Out</button>
      <button className="delete-user-button" onClick={() => setIsDeleteOpen(true)}>Delete User</button>
      <div className="query-box">
        <h1>Welcome, {user}!</h1>
        <label htmlFor="player-stats">Select Option:</label>
        <select id="player-stats">
          <option value="getFavoritePlayerStats">Get Favorite Player Stats</option>
        </select>
        <button className="button" onClick={handleQuery}>Query</button>
      </div>
      <button className="update-user-button" onClick={handleUpdateUser}>Update User</button>
    </div>
  );
};

export default Page2;
