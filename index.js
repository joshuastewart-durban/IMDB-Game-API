const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
var socketIO = require("socket.io");

const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const GameService = require("./services/game-service");
const GameDao = require("./models/GameDao");
const QuestionService = require("./services/question-service");
const { handleError } = require("./error-handler/error-handler");

const app = express();
var server = require("http").Server(app);
var io = socketIO(server);

app.use(morgan("tiny"));
app.use(cors());
app.use(bodyParser.json());

const cosmosClient = new CosmosClient({
  endpoint: config.host,
  key: config.authKey
});

const questionService = new QuestionService();
const gameDao = new GameDao(
  cosmosClient,
  config.databaseId,
  config.containerId
);

const gameService = new GameService(gameDao, questionService);

gameDao
  .init(err => {
    console.error(err);
  })
  .catch(err => {
    console.error(err);
    console.error(
      "Shutting down because there was an error setting up the database."
    );
    process.exit(1);
  });

// Add the WebSocket handlers
io.on("connection", function(socket) {
  console.log("Player connected!");
  /**
   * Create a new game room and notify the creator of game.
   */
  socket.on("createGame", function(data) {
    if (data.name) {
      gameService
        .createGame(data)
        .then(result => {
          console.log("Created game", socket.id);
          socket.join(result.id);
          socket.emit("newGame", {
            gameId: result.id
          });
        })
        .catch(err => {
          socket.emit("error", "Server error");
        });
    } else {
      socket.emit("error", "Provide a player name.");
    }
  });

  /**
   * Connect the Player 2 to the room he requested. Show error if room full.
   */
  socket.on("joinGame", function(data) {
    gameService.joinGame(data).then(result => {
      console.log("joinedGame", socket.id);
      if (result.success) {
        socket.join(data.game);
        socket.emit("joinGame", {
          gameId: data.game
        });
        socket.broadcast
          .to(data.game)
          .emit("playerOne", {
            joined: data.name,
            question: result.question.title
          });
        socket.emit("playerTwo", {
          name: data.name,
          game: data.game,
          question: result.question.title
        });
      } else {
        socket.emit("err", { message: "Sorry, The game is full!" });
      }
    });
  });

  /**
   * Handle the turn played by either player and notify the other.
   */
  socket.on("playTurn", function(data) {
    console.log(data, "data");
    gameService.playTurn(data).then(result => {
      socket.broadcast.to(data.game).emit("turnPlayed", {
        question: result.question.title,
        score: result.score,
        finished: result.finished,
        playerId: data.playerId
      });
      socket.emit("turnPlayed", {
        question: result.question.title,
        score: result.score,
        finished: result.finished,
        playerId: data.playerId
      });
    });
  });

  /**
   * Notify the players about the victor.
   */
  socket.on("gameEnded", function(data) {
    socket.broadcast.to(data.game).emit("gameEnd", data);
  });
});

app.get("/", (req, res, next) => {
  gameService.findGame(req, res, next);
});

app.use((err, req, res, next) => {
  handleError(err, res);
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`listening on ${port}`);
});
