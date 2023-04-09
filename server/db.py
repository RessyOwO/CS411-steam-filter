from sqlalchemy import create_engine, text

engine = create_engine(
    "mysql+pymysql://user:meowmeowmeowmeow@34.66.20.53:3306/411Project",
    pool_recycle=3600,
)


def query(statement):
    with engine.connect() as connection:
        return connection.execute(statement)


def insert(statement):
    with engine.connect() as connection:
        connection.execute(statement)
        connection.commit()


if __name__ == "__main__":
    # print(
    #     query(
    #         text("select * from UserInfo where username=:username").bindparams(
    #             username="IAmUser2974"
    #         )
    #     ).fetchone()
    # )

    print(
        query(
            text(
                # "SELECT g.ResponseName, d.Developer, r.Rating, r.Content FROM Games g JOIN Develops dv ON g.GameID = dv.GameID JOIN Developers d ON dv.DeveloperID = d.DeveloperID LEFT JOIN Review r ON g.GameID = r.GameID where lower(g.ResponseName) like '%counter%'"
                """SELECT ResponseName, ReleaseDate, PriceFinal, SupportedLanguages,
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
                FROM Games;"""
            )
        ).fetchall()
    )

    # print(query(text("select * from Review order by ReviewID desc limit 1")).fetchall())
    # print(insert(text("SET FOREIGN_KEY_CHECKS = 0")))
    # print(insert(text("ALTER TABLE UserInfo MODIFY COLUMN UserID INT auto_increment")))
    # print(insert(text("SET FOREIGN_KEY_CHECKS = 1")))
