import os
from collections import defaultdict

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from sqlalchemy import text

import db
from models import User

load_dotenv()

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
jwt = JWTManager(app)


@app.post("/register")
def register():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    email = request.json.get("email", None)
    device_background = request.json.get("device_background", None)

    if not all([username, password, email, device_background]):
        return jsonify({"msg": "Invalid parameters"}), 400

    if User.get(username):
        return jsonify({"msg": "Username already exists"}), 400

    statement = text("select * from UserInfo where email=:email").bindparams(
        email=email
    )
    if db.query(statement).fetchone():
        return jsonify({"msg": "Email already exists"}), 400

    statement = text(
        "insert into UserInfo (Email, Username, Password, DeviceBackground) values (:email, :username, :password, :device_background)"
    ).bindparams(
        username=username,
        password=password,
        email=email,
        device_background=device_background,
    )
    db.insert(statement)

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


@app.post("/login")
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    user = User.get(username)

    if user and user.password == password:
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad username or password"}), 401


@app.route("/review", methods=["GET", "POST"])
@jwt_required()
def reviews():
    current_user = User.get(get_jwt_identity())

    if request.method == "POST":
        game_id = request.json.get("game_id", None)
        content = request.json.get("content", None)
        rating = request.json.get("rating", None)

        if not all([game_id, content, rating]):
            return jsonify({"msg": "Invalid parameters"}), 400

        statement = text(
            "insert into Review (GameID, UserID, Content, Rating) values (:game_id, :user_id, :content, :rating)"
        ).bindparams(
            game_id=game_id, user_id=current_user.id, content=content, rating=rating
        )
        db.insert(statement)

    statement = text("select * from Review where UserID=:user_id").bindparams(
        user_id=current_user.id
    )

    result = db.query(statement).fetchall()
    reviews = [{"id": row[0], "rating": row[4], "content": row[3]} for row in result]
    return jsonify({"reviews": reviews}), 200


@app.delete("/review/<review_id>")
@jwt_required()
def delete_review(review_id):
    current_user = User.get(get_jwt_identity())

    if not review_id:
        return jsonify({"msg": "Invalid parameters"}), 400

    statement = text("select * from Review where ReviewID=:review_id").bindparams(
        review_id=review_id
    )
    review = db.query(statement).fetchone()

    if review[2] != current_user.id:
        return jsonify({"msg": "Unauthorized"}), 401

    statement = text("delete from Review where ReviewID=:review_id").bindparams(
        review_id=review_id
    )
    db.insert(statement)

    return jsonify({"msg": "Review deleted"}), 200


@app.post("/search")
@jwt_required()
def search():
    search_type = request.json.get("search_type", None)
    search = request.json.get("search", None)

    if search_type == "developer":
        statement = text(
            "SELECT g.ResponseName, d.Developer FROM Games g JOIN Develops dv ON g.GameID = dv.GameID JOIN Developers d ON dv.DeveloperID = d.DeveloperID where lower(d.Developer) like :developer"
        ).bindparams(developer=f"%{search}%")

        result = db.query(statement).fetchall()

        developers = defaultdict(list)
        for game, developer in result:
            developers[developer].append(game)

        return jsonify(developers), 200
    elif search_type == "game":
        statement = text(
            """SELECT g.GameID, g.ResponseName, g.ReleaseDate, g.PriceFinal, g.SupportedLanguages, d.Developer, r.Rating, r.Content,
                CONCAT_WS(',',
                 CASE WHEN ControllerSupport = 'True' THEN 'ControllerSupport' ELSE NULL END,
                 CASE WHEN IsFree = 'True' THEN 'IsFree' ELSE NULL END,
                 CASE WHEN FreeVerAvail = 'True' THEN 'FreeVerAvail' ELSE NULL END,
                 CASE WHEN PurchaseAvail = 'True' THEN 'PurchaseAvail' ELSE NULL END,
                 CASE WHEN SubscriptionAvail = 'True' THEN 'SubscriptionAvail' ELSE NULL END,
                 CASE WHEN PlatformWindows = 'True' THEN 'PlatformWindows' ELSE NULL END,
                 CASE WHEN PlatformLinux = 'True' THEN 'PlatformLinux' ELSE NULL END,
                 CASE WHEN PlatformMac = 'True' THEN 'PlatformMac' ELSE NULL END,
                 CASE WHEN CategorySinglePlayer = 'True' THEN 'CategorySinglePlayer' ELSE NULL END,
                 CASE WHEN CategoryMultiplayer = 'True' THEN 'CategoryMultiplayer' ELSE NULL END,
                 CASE WHEN CategoryCoop = 'True' THEN 'CategoryCoop' ELSE NULL END,
                 CASE WHEN CategoryMMO = 'True' THEN 'CategoryMMO' ELSE NULL END,
                 CASE WHEN CategoryInAppPurchase = 'True' THEN 'CategoryInAppPurchase' ELSE NULL END,
                 CASE WHEN CategoryIncludeSrcSDK = 'True' THEN 'CategoryIncludeSrcSDK' ELSE NULL END,
                 CASE WHEN CategoryIncludeLevelEditor = 'True' THEN 'CategoryIncludeLevelEditor' ELSE NULL END,
                 CASE WHEN CategoryVRSupport = 'True' THEN 'CategoryVRSupport' ELSE NULL END,
                 CASE WHEN GenreIsNonGame = 'True' THEN 'GenreIsNonGame' ELSE NULL END,
                 CASE WHEN GenreIsIndie = 'True' THEN 'GenreIsIndie' ELSE NULL END,
                 CASE WHEN GenreIsAction = 'True' THEN 'GenreIsAction' ELSE NULL END,
                 CASE WHEN GenreIsAdventure = 'True' THEN 'GenreIsAdventure' ELSE NULL END,
                 CASE WHEN GenreIsCasual = 'True' THEN 'GenreIsCasual' ELSE NULL END,
                 CASE WHEN GenreIsStrategy = 'True' THEN 'GenreIsStrategy' ELSE NULL END,
                 CASE WHEN GenreIsRPG = 'True' THEN 'GenreIsRPG' ELSE NULL END,
                 CASE WHEN GenreIsSimulation = 'True' THEN 'GenreIsSimulation' ELSE NULL END,
                 CASE WHEN GenreIsEarlyAccess = 'True' THEN 'GenreIsEarlyAccess' ELSE NULL END,
                 CASE WHEN GenreIsFreeToPlay = 'True' THEN 'GenreIsFreeToPlay' ELSE NULL END,
                 CASE WHEN GenreIsSports = 'True' THEN 'GenreIsSports' ELSE NULL END,
                 CASE WHEN GenreIsRacing = 'True' THEN 'GenreIsRacing' ELSE NULL END,
                 CASE WHEN GenreIsMassivelyMultiplayer = 'True' THEN 'GenreIsMassivelyMultiplayer' ELSE NULL END
                ) as TrueColumns
                FROM Games g JOIN Develops dv ON g.GameID = dv.GameID JOIN Developers d ON dv.DeveloperID = d.DeveloperID
                LEFT JOIN Review r ON g.GameID = r.GameID where lower(g.ResponseName) like :game"""
        ).bindparams(game=f"%{search}%")

        result = db.query(statement).fetchall()

        games = {}

        for (
            game_id,
            name,
            release_date,
            price,
            languages,
            developer,
            rating,
            content,
            attributes,
        ) in result:
            if game_id not in games:
                games[game_id] = {
                    "name": name,
                    "release_date": release_date,
                    "price": price,
                    "languages": languages,
                    "developer": developer,
                    "attributes": attributes.split(","),
                    "reviews": [],
                }

            if rating and content:
                games[game_id]["reviews"].append(
                    {
                        "rating": rating,
                        "content": content,
                    }
                )
        return jsonify(games), 200
    elif search_type == "lucky_rating":
        statement = text(
            """
            SELECT min(g.GameID), g.ResponseName AS GameName, AVG(r.Rating) AS AverageRating, g.ReleaseDate AS ReleaseDate, d.Developer AS DeveloperName
            FROM Games g JOIN Develops dv ON g.GameID = dv.GameID JOIN Developers d ON dv.DeveloperID = d.DeveloperID JOIN Review r ON g.GameID = r.GameID
            WHERE r.Rating > 4.0
            GROUP BY g.ResponseName, g.ReleaseDate, d.Developer
            ORDER BY AVG(r.Rating) DESC;
            """
        )

        result = db.query(statement).fetchall()

        games = {}

        for (
            game_id,
            name,
            average_rating,
            release_date,
            developer,
        ) in result:
            if name not in games:
                games[name] = {
                    "average_rating": average_rating,
                    "release_date": release_date,
                    "developer": developer,
                }

        return jsonify(games), 200
    elif search_type == "lucky_price":
        statement = text(
            """
            SELECT ResponseName, PlatformWindows, PlatformLinux, PlatformMac, PriceFinal
            FROM Games
            WHERE PriceFinal >= (SELECT LowerPrice FROM PriceRange WHERE Grade = 3)
            AND PriceFinal <= (SELECT UpperPrice FROM PriceRange WHERE Grade = 3)
            AND PlatformWindows = 'True'
            UNION
            SELECT ResponseName, PlatformWindows, PlatformLinux, PlatformMac, PriceFinal
            FROM Games
            WHERE PriceFinal >= (SELECT LowerPrice FROM PriceRange WHERE Grade = 3)
            AND PriceFinal <= (SELECT UpperPrice FROM PriceRange WHERE Grade = 3)
            AND PlatformLinux = 'True'
            UNION
            SELECT ResponseName, PlatformWindows, PlatformLinux, PlatformMac, PriceFinal
            FROM Games
            WHERE PriceFinal >= (SELECT LowerPrice FROM PriceRange WHERE Grade = 3)
            AND PriceFinal <= (SELECT UpperPrice FROM PriceRange WHERE Grade = 3)
            AND PlatformMac = 'True';
            """
        )

        result = db.query(statement).fetchall()

        games = {}

        for name, platform_windows, platform_linux, platform_mac, price in result:
            if name not in games:
                games[name] = {
                    "platform_windows": platform_windows,
                    "platform_linux": platform_linux,
                    "platform_mac": platform_mac,
                    "price": price,
                }

        return jsonify(games), 200
    else:
        return jsonify({"msg": "Invalid parameters"}), 400


@app.route("/profile", methods=["GET", "PATCH"])
@jwt_required()
def profile():
    if request.method == "PATCH":
        current_user = User.get(get_jwt_identity())

        username = request.json.get("username", None)

        if username and username != current_user.username:
            if User.get(username):
                return jsonify({"msg": "Username already exists"}), 400

            statement = text(
                "update UserInfo set username=:username where UserID=:user_id"
            ).bindparams(username=username, user_id=current_user.id)
            db.insert(statement)

        email = request.json.get("email", None)

        if email and email != current_user.email:
            statement = text(
                "select * from UserInfo where lower(email)=:email and UserID!=:user_id"
            ).bindparams(email=email, user_id=current_user.id)
            if db.query(statement).fetchone():
                return jsonify({"msg": "Email already exists"}), 400

            statement = text(
                "update UserInfo set email=:email where UserID=:user_id"
            ).bindparams(email=email, user_id=current_user.id)
            db.insert(statement)

        password = request.json.get("password", None)

        if password and password != current_user.password:
            statement = text(
                "update UserInfo set password=:password where UserID=:user_id"
            ).bindparams(password=password, user_id=current_user.id)
            db.insert(statement)

        device_background = request.json.get("device_background", None)

        if device_background and device_background in ["Linux", "Windows", "Mac"]:
            statement = text(
                "update UserInfo set DeviceBackground=:device_background where UserID=:user_id"
            ).bindparams(device_background=device_background, user_id=current_user.id)
            db.insert(statement)

        current_user_dict = User.get(username).__dict__
        access_token = create_access_token(identity=username)
        return jsonify(user=current_user_dict, access_token=access_token)

    current_user_dict = User.get(get_jwt_identity()).__dict__
    # del current_user_dict["password"]
    return jsonify(user=current_user_dict), 200
