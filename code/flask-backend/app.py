from flask import Flask, jsonify, request
from flask_cors import CORS  # Import Flask-CORS
import backend
app = Flask(__name__)
CORS(app)

@app.route('/login', methods=['POST'])
def processLogin():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    if backend.validateUser(username, password):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@app.route('/getFavoritePlayerStats', methods=['POST'])
def processFavoritePlayerStats():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    username = data.get("username")
    if not username:
        return jsonify({"error": "'username' is required in the JSON payload"}), 400
    result = backend.getFavoritePlayerStats(username)
    return jsonify(result)

@app.route('/addUser', methods = ['POST'])
def processAddUser():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    username = data.get("username")
    if not username:
        return jsonify({"error": "'username' is required in the JSON payload"}), 400
    password = data.get("password")
    if not password:
        return jsonify({"error": "'password' is required in the JSON payload"}), 400
    favoritePlayer = data.get("favorite_player")
    if not favoritePlayer:
        return jsonify({"error": "'favorite_player' is required in the JSON payload"}), 400
    favoriteTeam = data.get("favorite_team")
    if not favoriteTeam:
        return jsonify({"error": "'favorite_team' is required in the JSON payload"}), 400
    result = backend.createUser(username, password, favoritePlayer, favoriteTeam)
    if result["Status"] == "Failed":
        return jsonify({"error": "Favorite player and/or favorite team does not exist"}), 400
    return jsonify(result)

@app.route('/deleteUser', methods = ['POST'])
def processDeleteUser():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    username = data.get("username")
    if not username:
        return jsonify({"error": "'username' is required in the JSON payload"}), 400
    result = backend.deleteUser(username)
    return jsonify(result)

@app.route('/updateUser', methods = ['POST'])
def processUpdateUser():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    username = data.get("username")
    if not username:
        return jsonify({"error": "'username' is required in the JSON payload"}), 400
    favoritePlayer = data.get("favoritePlayer")
    if not favoritePlayer:
        favoritePlayer = None
    favoriteTeam = data.get("favoriteTeam")
    if not favoriteTeam:
        favoriteTeam = None
    result = backend.updateUser(username, favoritePlayer, favoriteTeam)
    if result["Status"] == "Failed":
        return jsonify({"error": "Favorite player and/or favorite team does not exist"}), 400
    return jsonify(result)

@app.route('/getPlayerStats', methods = ['POST'])
def processGetPlayerStats():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    playerID = data.get("player_id")
    if not playerID:
        return jsonify({"error": "'player_id' is required in the JSON payload"}), 400
    numYears = data.get("num_years")
    if not numYears:
        return jsonify({"error": "'num_years' is required in the JSON payload"}), 400
    stats = data.get("stats")
    if not stats:
        return jsonify({"error": "'stats' is required in the JSON payload"}), 400
    result = backend.getPlayerStats(playerID, numYears, stats)
    return jsonify(result)

@app.route('/getTeamStats', methods = ['POST'])
def processGetTeamStats():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    teamName = data.get("team_name")
    if not teamName:
        return jsonify({"error": "'team_name' is required in the JSON payload"}), 400
    numYears = data.get("num_years")
    if not numYears:
        return jsonify({"error": "'num_years' is required in the JSON payload"}), 400
    stats = data.get("stats")
    if not stats:
        return jsonify({"error": "'stats' is required in the JSON payload"}), 400
    result = backend.getTeamStats(teamName, numYears, stats)
    return jsonify(result)

@app.route('/getLastGameStats', methods = ['POST'])
def processGetLastGameStats():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    season = data.get("season")
    if not season:
        return jsonify({"error": "'season' is required in the JSON payload"}), 400
    numGames = data.get("num_games")
    if not numGames:
        return jsonify({"error": "'num_games' is required in the JSON payload"}), 400
    result = backend.getGameStats(season, numGames)
    return jsonify(result)

@app.route('/getAwardWinnerSeason', methods = ['POST'])
def processGetAwardWinnerSeason():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    season = data.get("season")
    if not season:
        return jsonify({"error": "'season' is required in the JSON payload"}), 400
    awards = data.get("awards")
    if not awards:
        return jsonify({"error": "'awards' is required in the JSON payload"}), 400
    result = backend.getAwardWinnerSeason(season, awards)
    return jsonify(result)

@app.route('/getPlayerAwardsAndPerformance', methods = ['POST'])
def processPlayerAwardsAndPerformance():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
    username = data.get("username")
    if not username:
        return jsonify({"error": "'username' is required in the JSON payload"}), 400
    result = backend.getPlayerAwardsAndPerformance(username)
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
