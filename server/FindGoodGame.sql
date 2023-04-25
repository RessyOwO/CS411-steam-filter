DROP PROCEDURE IF EXISTS 411Project.FindGoodGame;
CREATE PROCEDURE FindGoodGame(IN PriceMax DOUBLE, IN uname VARCHAR(20))
BEGIN
  DECLARE varGameId INT;
  DECLARE varAvRating DOUBLE;
  DECLARE varGameName VARCHAR(255);
  DECLARE varReleaseDate VARCHAR(100);
  DECLARE varDeveloper VARCHAR(255);
  DECLARE varSupportedLanguages VARCHAR(512);
  DECLARE varPrice DOUBLE;
  DECLARE varUserDevice VARCHAR(20);
  DECLARE exit_loop BOOLEAN DEFAULT FALSE;
  DECLARE varPlatformWindows VARCHAR(10);
  DECLARE varPlatformLinux VARCHAR(10);
  DECLARE varPlatformMac VARCHAR(10);
  DECLARE varShouldSkip VARCHAR(10) DEFAULT 'False';

  -- select only the good games which have average rating > 7
  DECLARE gameCur CURSOR FOR (SELECT g.GameID, ResponseName, ReleaseDate, PriceFinal, SupportedLanguages, d.Developer, temp.avg_rating, PlatformWindows, PlatformLinux, PlatformMac
        FROM Games g NATURAL JOIN Develops dv NATURAL JOIN Developers d
        NATURAL JOIN (SELECT g.GameID, AVG(r.rating) AS avg_rating
                  FROM Games g LEFT JOIN Review r ON g.GameID = r.GameID
                  GROUP BY g.GameID
                  HAVING AVG(r.Rating) >= 7.0
                  ORDER BY g.GameID) AS temp);

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET exit_loop = TRUE;

  -- get user device for platform filter
  SELECT DeviceBackground INTO varUserDevice FROM UserInfo WHERE Username = uname;

  -- create a temp table called game table to keep only the desired games
  DROP TABLE IF EXISTS GameTable;
  CREATE TABLE GameTable (
    GameID INT,
    ResponseName VARCHAR(255),
    ReleaseDate VARCHAR(100),
    PriceFinal DOUBLE,
    SupportedLanguages VARCHAR(512),
    Developer VARCHAR(255),
    Rating DOUBLE
  );

  -- start the loop with cursor
  OPEN gameCur;
    cloop: LOOP
      FETCH gameCur INTO varGameId, varGameName, varReleaseDate, varPrice, varSupportedLanguages, varDeveloper, varAvRating, varPlatformWindows, varPlatformLinux, varPlatformMac;
      IF exit_loop THEN 
        LEAVE cloop;
      END IF;


      -- if the user device is not compatible with this game, we should not recommend it
      IF varUserDevice LIKE 'Windows' AND varPlatformWindows LIKE 'False' THEN
        SET varShouldSkip = 'True';
	    END IF;
      IF varUserDevice LIKE 'Mac' AND varPlatformLinux LIKE 'False' THEN
        SET varShouldSkip = 'True';
	    END IF;
      IF varUserDevice LIKE 'Linux' AND varPlatformMac LIKE 'False' THEN
        SET varShouldSkip = 'True';
      END IF;
      
      -- insert the games meets the requirment into our new temp table
      IF varShouldSkip = 'False' AND varPrice <= PriceMax THEN
        INSERT INTO GameTable VALUES (varGameId, varGameName, varReleaseDate, varPrice, varSupportedLanguages, varDeveloper, varAvRating);
      END IF;


    END LOOP cloop;
  CLOSE gameCur;

  -- return the desired format for our frontend presentation
  SELECT gt.GameID, gt.ResponseName, gt.ReleaseDate, gt.PriceFinal, gt.SupportedLanguages, gt.Developer, gt.Rating,
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
  FROM GameTable gt JOIN Games g ON gt.GameID = g.GameID
  -- we sort the results based on the ratings and the price, finally its name
  ORDER BY Rating DESC, PriceFinal DESC, ResponseName;
END;