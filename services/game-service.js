const GameDao = require("../models/GameDao");
const {ErrorHandler} = require("../error-handler/error-handler")

class GameService {
  /**
   * Handles the various APIs for displaying and managing the game state
   * @param {GameDao} gameDao
   */
  constructor(gameDao, questionService) {
    this.gameDao = gameDao;
    this.questionService = questionService;
  }
  async findGame(req, res) {
    const querySpec = {
      query: "SELECT * FROM root r"
      //   parameters: [
      //     {
      //       name: "@completed",
      //       value: false
      //     }
      //   ]
    };

    const items = await this.gameDao.find(querySpec);
    res.json({
      items
    });
  }

  async createGame(req, res, next) {
    console.log(req.body);
    if (req.body.name) {
      let name = req.body.name;
    } else {
        throw new ErrorHandler(404, 'Missing player name')
    }

    let questions = await this.questionService
      .generateQuestions()
      .then(result => {
        return result;
      });
    const item = {
      id: Math.floor(Math.random() * 1000 + 10).toString(),
      players: {
        playerOne: {
          id: 1,
          name: req.body.name,
          score: 0,
          joined: true
        },
        playerTwo: {
          id: 2,
          name: "",
          score: 0,
          joined: false
        }
      },
      questions
    };
    await this.gameDao.addItem(item);
    res.json({
      id: item.id
    });
  }

  async completeTask(req, res) {
    const completedTasks = Object.keys(req.body);
    const tasks = [];

    completedTasks.forEach(task => {
      tasks.push(this.taskDao.updateItem(task));
    });

    await Promise.all(tasks);

    res.redirect("/");
  }
}

module.exports = GameService;
