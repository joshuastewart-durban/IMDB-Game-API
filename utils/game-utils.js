const correctAnswer = 5;
const incorrectAnswer = 3;

let _validateAnswer = (ans, title, question) => {
  return (question.title === title && question.year === ans);
};

let _score = (answer, currentScore) => {
  if (answer) {
    return currentScore + correctAnswer;
  } else {
    return currentScore - incorrectAnswer;
  }
};

module.exports = {
  _validateAnswer,
  _score
};
