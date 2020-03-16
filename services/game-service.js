const GameDao = require("../models/GameDao");
const { ErrorHandler } = require("../error-handler/error-handler");

class GameService {
  /**
   * Handles the various APIs for displaying and managing the game state
   * @param {GameDao} gameDao
   */
  constructor(gameDao, questionService) {
    this.gameDao = gameDao;
    this.questionService = questionService;
  }
  async findGame(data) {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [
        {
          name: "@id",
          value: data.game
        }
      ]
    };
    return await this.gameDao.find(querySpec);
  }

  async createGame(data) {
    let questions = await this.questionService
      .generateQuestions()
      .then(result => {
        return result;
      });
    const item = {
      id: "game-" + Math.floor(Math.random() * 100000 + 10).toString(),
      players: {
        playerOne: {
          id: 1,
          name: data.name,
          score: 0,
          joined: true,
          nextIndex: 0
        },
        playerTwo: {
          id: 2,
          name: "",
          score: 0,
          joined: false,
          nextIndex: 0
        }
      },
      questions
    };
    await this.gameDao.addItem(item);
    return {
      id: item.id
    };
  }

  async joinGame(data) {
    let gameData = await this.gameDao
      .getItem(data.game)
      .then(result => {
        if (!result.players.playerTwo.joined) {
          result.players.playerTwo.joined = true;
          result.players.playerTwo.name = data.name;
          result.players.playerOne.nextIndex = 1;
          result.players.playerTwo.nextIndex = 1;
        }
        return { game: data.game, result };
      })
      .catch(err => {
        return { success: false, data: null };
      });

    let result = await this.gameDao
      .updateItem(gameData.game, gameData.result)
      .then(result => {
        return {
          success: true,
          data: result,
          question: result.questions[0]
        };
      })
      .catch(err => {
        return { success: false, data: null };
      });
    return result;
  }

  async scorePlayer(data){
    let gameData = await this.gameDao
    .getItem(data.game)
    .then(result => {
        // get question result
        // update player score
        // return player score
    });
  }
}

module.exports = GameService;
