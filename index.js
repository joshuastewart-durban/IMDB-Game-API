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
      let id = "game-" + Math.floor(Math.random() * 100000 + 10).toString();
      socket.join(id);
      data.id = id;
      gameService
        .createGame(data)
        .then(result => {
          console.log("Created game", socket.id);
          socket.emit("newGame", {
            gameId: result.id
          });
        })
        .catch(err => {
          socket.emit("err", { message: 'There was an error Creating your game.' });
        });
    } else {
      socket.emit("err", "Provide a player name.");
    }
  });

  /**
   * Connect the Player 2 to the room he requested. Show error if room full.
   */
  socket.on("joinGame", function(data) {
    gameService
      .joinGame(data)
      .then(result => {
        console.log("joinedGame", socket.id);
        if (result.success) {
          socket.join(data.game);
          socket.emit("joinGame", {
            gameId: data.game
          });
          socket.broadcast.to(data.game).emit("playerOne", {
            joined: data.name,
            question: result.question.title,
            players: result.players
          });
          socket.emit("playerTwo", {
            name: data.name,
            game: data.game,
            question: result.question.title,
            players: result.players
          });
        } else {
          socket.emit("err", { message: "Sorry, The game is full!" });
        }
      })
      .catch(error => {
        socket.emit("err", {
          message: "There was an issue while joining your game!"
        });
      });
  });

  socket.on("disconnect", function() {
    console.log("DisConnected");
  });
  
  socket.on("error", function(e) {
    console.log("System", e ? e : "A unknown error occurred");
  });

  /**
   * Handle the turn played by either player and notify the other.
   */
  socket.on("playTurn", function(data) {
    gameService
      .playTurn(data)
      .then(result => {
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
          playerId: data.playerId,
          answer: result.answer
        });
        if (result.finished) {
          if (
            result.players.playerOne.finished &&
            result.players.playerTwo.finished
          ) {
            let winner;
            let draw = false;
            if (result.gameResult !== "draw") {
              winner = result.players.playerOne.winner
                ? "playerOne"
                : "playerTwo";
            } else {
              draw = true;
            }
            socket.broadcast.to(data.game).emit("result", {
              winnerId: winner,
              draw
            });
            socket.emit("result", {
                winnerId: winner,
                draw
              });
          }
        }
      })
      .catch(error => {
        socket.emit("err", {
          message: "We are currently experiencing an issue please try again later."
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
