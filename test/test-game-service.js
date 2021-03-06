var expect = require('chai').expect;
const gameUtils = require("../utils/game-utils");

describe("_validateAnswer", () => {
  it("should check whether the answer is correct", () => {
    let questions = [
      { year: "1986", title: "Stand by Me" },
      { year: "1944", title: "Double Indemnity" },
      { year: "1924", title: "Sherlock Jr." },
      { year: "2002", title: "The Pianist" },
      { year: "2010", title: "Shutter Island" },
      { year: "1957", title: "12 Angry Men" },
      { year: "1989", title: "Dead Poets Society" },
      { year: "1977", title: "Star Wars" },
      { year: "1992", title: "Reservoir Dogs" }
    ];
    let answer = '1986';
    let title = 'Stand by Me'
    expect(gameUtils._validateAnswer(answer,title,questions[0])).to.equal(true)
  });
});

describe("_score", () => {
    it("should return the players new score", () => {
      let currentScore = 5;
      let result = 2;
      let answer = false;
      expect(gameUtils._score(answer,currentScore)).to.equal(result)
    });
  });


describe("_winner", () => {
    it("should return the winner Id", () => {
      let players = {
        playerOne: {
          id: 1,
          name: 'test1',
          score: 1,
          joined: true,
          nextIndex: 0,
          finished: true,
          winner: false
        },
        playerTwo: {
          id: 2,
          name: "test2",
          score: 4,
          joined: true,
          nextIndex: 0,
          finished: true,
          winner: false
        }
      };
      expect(gameUtils._winner(players)).to.equal('playerTwo')
    });
    it("should return the draw", () => {
        let players = {
          playerOne: {
            id: 1,
            name: 'test1',
            score: 1,
            joined: true,
            nextIndex: 0,
            finished: true,
            winner: false
          },
          playerTwo: {
            id: 2,
            name: "test2",
            score: 1,
            joined: true,
            nextIndex: 0,
            finished: true,
            winner: false
          }
        };
        expect(gameUtils._winner(players)).to.equal('draw')
      });
  });
