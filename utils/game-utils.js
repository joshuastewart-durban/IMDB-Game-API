const correctAnswer = 5;
const incorrectAnswer = 3;

let _validateAnswer = (ans, title, question) => {
  return question.title === title && question.year === ans;
};

let _score = (answer, currentScore) => {
  if (answer) {
    return currentScore + correctAnswer;
  } else {
    return currentScore - incorrectAnswer;
  }
};

let _winner = players => {
  if (players.playerOne.finished && players.playerTwo.finished) {
    if (players.playerOne.score > players.playerTwo.score) {
      return "playerOne";
    } else if (players.playerOne.score < players.playerTwo.score) {
      return "playerTwo";
    } else {
      return "draw";
    }
  }
};

module.exports = {
  _validateAnswer,
  _score,
  _winner
};
