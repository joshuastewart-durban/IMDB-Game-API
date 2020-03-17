var cheerio = require("cheerio");
var axios = require("axios");

class QuestionService {
  async fetchMovies() {
    const url = "http://www.imdb.com/chart/top?ref_=nb_mv_3_chttp";
    let movies = [];
    return axios.get(url).then(
      response => {
        if (response.status === 200) {
          const html = response.data;
          var $ = cheerio.load(html);
          var yearSet, titleSet;
          yearSet = $(".titleColumn span");
          titleSet = $(".titleColumn a");
          for (let i = 0; i < yearSet.length; i++) {
            let year = $(yearSet[i]).text().replace(/[()]/g,'');
            movies.push({
              year,
              title: $(titleSet[i]).text()
            });
          }
        }
        return movies;
      },
      error => console.log(error)
    );
  }
  async generateQuestions() {
    return await this.fetchMovies().then(result => {
      return this._randomNumbers().map(x => {
        return result[x];
      });
    });
  }
  _randomNumbers() {
    var arr = [];
    while (arr.length <= 8) {
      var r = Math.floor(Math.random() * 250) + 1;
      if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
  }
}

module.exports = QuestionService;
