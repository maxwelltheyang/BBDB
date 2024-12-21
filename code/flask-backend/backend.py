from sqlalchemy import create_engine, text
import pandas as pd
import json
from dotenv import load_dotenv
import os
from decimal import Decimal
from sqlalchemy.exc import DBAPIError, IntegrityError


load_dotenv()
PWRD = os.getenv("PASSWORD")
IP_ADDR= os.getenv("IP_ADDRESS")

def createEngine():
    USER = 'maxwellbyang04@gmail.com'
    PASSWORD = PWRD
    IP_ADDRESS = IP_ADDR
    DB_NAME = 'lesunshines' 
    PORT = '3306'

    engine = create_engine(f'mysql+pymysql://{USER}:{PASSWORD}@{IP_ADDRESS}:{PORT}/{DB_NAME}')
    return engine

def validateUser(username, password):
    # Query the user by username
    engine = createEngine()
    query = """
    select Password
    from User
    where Username = :username
    """
    with engine.connect() as connection:
        connection.execute(text("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')"))
        result = connection.execute(
            text(query), {"username": username}
        )
        data = result.fetchall()
        if data:
            stored_password = data[0][0]
            if stored_password != password:
                return False
        else:
            return False
        return True

def createUser(username, password, favoritePlayer, favoriteTeam):
    engine = createEngine()
    createUserQuery = "CALL CreateUser(:username, :password, :favoritePlayer, :favoriteTeam);"
    status = "Successful"
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            connection.execute(text("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')"))
            connection.execute(
                text(createUserQuery), {"username": username, "password": password, "favoritePlayer" : favoritePlayer, "favoriteTeam" : favoriteTeam}
            )
            trans.commit()
        except Exception as e:
            trans.rollback()
            status = "Failed"
    
    json_data = {
        "Status" : status
    }
    return json_data


def deleteUser(username):
    engine = createEngine()
    deleteUserQuery = "CALL DeleteUser(:username);"
    status = "Successful"
    
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            connection.execute(text(deleteUserQuery), {"username": username})
            trans.commit()
        except Exception as e:
            trans.rollback()
            status = "Failed"

    json_data = {
        "Status": status
    }
    return json_data

def updateUser(username, favoritePlayer=None, favoriteTeam=None):
    engine = createEngine()
    status = "Successful"

    params = {"username": username}
    

    updates = []
    if favoritePlayer is not None:
        updates.append("FavoritePlayer = :favoritePlayer")
        params["favoritePlayer"] = favoritePlayer
    if favoriteTeam is not None:
        updates.append("FavoriteTeam = :favoriteTeam")
        params["favoriteTeam"] = favoriteTeam
    if not updates:
        return None
    updateUserQuery = "CALL UpdateUser(:username, :favoritePlayer, :favoriteTeam);"
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            connection.execute(text(updateUserQuery), params)
            trans.commit()
        except DBAPIError as e:
            trans.rollback()
            status = "Failed"


    return {"Status": status}

def getPlayerStats(player_id, num_years, stats):
    engine = createEngine()
    default_columns = ["Player_Name", "Team_Name", "Season", "Position"]
    columns_string = ", ".join(default_columns + stats)

    query = f"""
    SELECT {columns_string}
    FROM Player
    WHERE PlayerID = :playerID AND Season > 2024 - :num_years
    order by Season desc;
    """
    related_players_query = """
    SELECT DISTINCT P.PlayerID, P.Player_Name
    FROM Player P
    JOIN Player P2
    ON P.Team_Name = P2.Team_Name 
    AND P.Season = P2.Season
    WHERE P2.PlayerID = :playerID
    AND P.PlayerID != :playerID
    ORDER BY P2.Season DESC
    LIMIT 10;
    """
    with engine.connect() as connection:
        connection.execute(text("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')"))
        result = connection.execute(
            text(query), {"playerID": player_id, "num_years": num_years}
        )
        related_result = connection.execute(
            text(related_players_query), {"playerID": player_id}
        )
        data = result.fetchall()
        related_data = related_result.fetchall()
    
    json_data = {
        "stats": [
            {column: value for column, value in zip(default_columns + stats, row)}
            for row in data
        ],
        "related_players": [
            {"PlayerID": row[0], "Player_Name": row[1]} for row in related_data
        ]
    }
    return json_data

def getTeamStats(team_name, num_years, stats):
    engine = createEngine()
    default_columns = ["Team.Team_Name", "Team.Season"]
    columns_string = ", ".join(default_columns + [f"SUM({stat}) AS {stat}" for stat in stats])
    query = f"""
    SELECT {columns_string}
    FROM Team
    JOIN Player ON Team.Team_Name = Player.Team_Name AND Team.Season = Player.Season
    WHERE Team.Team_Name = :teamname AND Team.Season > 2024 - :num_years
    GROUP BY Team.Team_Name, Team.Season
    order by Team.Season desc;
    """
    
    related_teams_query = """
    SELECT DISTINCT Team.Team_Name
    FROM Team
    """
    
    with engine.connect() as connection:
        connection.execute(text("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')"))

        result = connection.execute(
            text(query), {"teamname": team_name, "num_years": num_years}
        )

        related_result = connection.execute(
            text(related_teams_query)
        )

        data = result.fetchall()
        related_data = related_result.fetchall()
    json_data = {
        "stats": [
            {column: int(value) if isinstance(value, Decimal) else value for column, value in zip(default_columns + stats, row)}
            for row in data
        ],
        "related_teams": [
            {"Team_Name": row[0]} for row in related_data
        ]
    }

    return json_data


def getGameStats(season, num_games):
    engine = createEngine()  
    num_games = int(num_games)
    query = """
    SELECT *
    FROM Game
    WHERE Season = :season
    ORDER BY Date DESC
    LIMIT :num_games
    """

    with engine.connect() as connection:
        result = connection.execute(
            text(query), {"season": season, "num_games": num_games}
        )
        data = result.fetchall()

    json_data = {
        "games": [
            {column: value for column, value in zip(result.keys(), row)}
            for row in data
        ]
    }

    return json_data

from sqlalchemy import create_engine, text

def getAwardWinnerSeason(season, awards):
    engine = createEngine()

    default_columns = ["Season"]
    columns_string = ", ".join(default_columns + awards)

    query = f"""
    SELECT {columns_string}
    FROM Season
    WHERE Season = :season
    """

    with engine.connect() as connection:
        result = connection.execute(text(query), {"season": season})
        data = result.fetchone()

    if not data:
        return {"error": f"No data found for season {season}"}

    json_data = {
        "awards": [
            {column: data[i] for i, column in enumerate(default_columns + awards)}
        ]
    }
    return json_data

def getFavoritePlayerStats(username):
    engine = createEngine()
    query = """select sum(Shot.SHOT_MADE_FLAG) * 2 as points_scored, avg(Shot.SHOT_MADE_FLAG) as shooting_percentage, GameID
        from Shot join Game using(GameID)
        where Shot.GameID in (
            select GameID
            from Game
            where Home_Team in (
                select Team_Name
                from Player
                where PlayerID = (
                    select Favorite_Player
                    from User
                    where Username = :current_user
                ) 
            )
            or Away_Team in (
                select Team_Name
                from Player
                where PlayerID = (
                    select Favorite_Player
                    from User
                    where Username = :current_user
                ) 
            )
        ) and PlayerID = (
            select Favorite_Player
            from User
            where Username = :current_user
        ) 
        group by Shot.GameID
        order by Shot.GAME_DATE desc	
        limit 15;"""
    
    favorite_player_query = """
    SELECT Favorite_Player
    FROM User
    WHERE Username = :current_user
    """
    
    with engine.connect() as connection:
        connection.execute(text("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')"))
        result = connection.execute(text(query), {"current_user": username})
        favorite_player_result = connection.execute(
            text(favorite_player_query), {"current_user": username}
        )
        favorite_player_row = favorite_player_result.fetchone()
        favorite_player_name = favorite_player_row[0] if favorite_player_row else None
        data = result.fetchall()

    json_data = {
        "favoritePlayer": favorite_player_name,
        "stats": [
            {
                "points_scored": int(points),
                "shooting_percentage": round(float(percentage), 2),
                "game": game,
            }
            for points, percentage, game in data
        ],
    }
    return json_data


import pymysql

def create_connection():
    USER = 'maxwellbyang04@gmail.com'
    PASSWORD = PWRD  
    IP_ADDRESS = IP_ADDR  
    DB_NAME = 'lesunshines'
    PORT = 3306  

    connection = pymysql.connect(
        host=IP_ADDRESS,
        user=USER,
        password=PASSWORD,
        database=DB_NAME,
        port=PORT,
        cursorclass=pymysql.cursors.DictCursor 
    )
    return connection


def getPlayerAwardsAndPerformance(username):

    query = "CALL PlayerAwardsAndPerformance(%s)"
    favorite_player_query = """
    SELECT Favorite_Player
    FROM User
    WHERE Username = %s
    """

    favorite_team_query = """
    SELECT Favorite_Team
    FROM User
    WHERE Username = %s
    """

    json_data = {}
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute(query, (username,))
    
    data1 = cursor.fetchall()


    data2 = []
    if cursor.nextset():  
        data2 = cursor.fetchall()

    cursor.execute(favorite_player_query, (username,))
    favorite_player_row = cursor.fetchone()
    favorite_player_name = favorite_player_row['Favorite_Player'] if favorite_player_row else None

    cursor.execute(favorite_team_query, (username,))
    favorite_team_row = cursor.fetchone()
    favorite_team_name = favorite_team_row['Favorite_Team'] if favorite_team_row else None

    json_data = {
        "favoritePlayer": favorite_player_name,
        "favoriteTeam" : favorite_team_name,
        "stats1": [
            {"Player_Name": row["Player_Name"], "awards_won": row["awards_won"]}
            for row in data1
        ],
        "stats2": [
            {
                "points_scored": int(row["points_scored"]),
                "shooting_percentage": round(float(row["shooting_percentage"]), 2),
                "game_date": row["game_date"],
                "game": row["GameID"],
            }
            for row in data2[:10]
        ],
    }

        
    cursor.close()
    connection.close()

    return json_data

