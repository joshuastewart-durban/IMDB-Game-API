const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
var socketIO = require('socket.io');

const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const GameService = require("./services/game-service");
const GameDao = require("./models/GameDao");
const QuestionService = require("./services/question-service");
const { handleError } = require("./error-handler/error-handler");

const app = express();
var server = require('http').Server(app);
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
io.on('connection', function(socket) {
});
app.get("/", (req, res, next) => {
  gameService.findGame(req, res, next);
});

app.post("/createGame", (req, res,next) => {
  gameService.createGame(req, res, next).catch(next);
});

app.use((err, req, res, next) => {
  handleError(err, res);
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`listening on ${port}`);
});

setInterval(function() {
    io.sockets.emit('message', 'hi!');
  }, 1000);
