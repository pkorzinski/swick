/* global $, _ */
require('dotenv').config();

const path = require('path');
const db = require('./db');
const requestify = require('requestify');
const watson = require('watson-developer-cloud');
const queries = require('./queries');

// YQL query urls for rss feeds
let financeNews = [];
let financeUpdateCount = 0;

let techNews = [];
let techUpdateCount = 0;

let news = [];
let newsUpdateCount = 0;

let sportsNews = [];
let sportsUpdateCount = 0;

let finNews = [];
let watsonFin = [];

// Some fun Watson functionality that we use
// eslint-disable-next-line no-unused-vars
const toneAnalyzer = watson.tone_analyzer({
  username: process.env.WATSON_TONE_USERNAME,
  password: process.env.WATSON_TONE_PASSWORD,
  version: 'v3',
  version_date: '2016-05-19',
});

// eslint-disable-next-line no-unused-vars
const alchemyLanguage = watson.alchemy_language({
  api_key: process.env.WATSON_ALCHEMY_APIKEY,
});

// How to set parameters: http://www.ibm.com/watson/developercloud/alchemy-language/api/v1/?node#methods
const parameters = {
  text: watsonFin,
};

alchemyLanguage.emotion(parameters, (err, response) => {
  if (err) {
    console.log('error:', err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
});

alchemyLanguage.sentiment(parameters, (err, response) => {
  if (err) {
    console.log('error:', err);
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
});

// function to aggregate tasty info for Watson
const popFinNews = () => {
  finNews = [];
  watsonFin = [];
  Promise.all([
    queries.financeBodyUpi,
    queries.mwTopStories,
    queries.mwCommentary,
    queries.mwSW,
    queries.mwNewsletters,
    queries.reutersHotStocks,
    queries.reutersWealth,
    queries.reutersBusiness,
    queries.reutersBankruptcy,
    queries.reutersBonds,
    queries.reutersDeals,
    queries.reutersEconomy,
    queries.reutersHedgefunds,
    queries.reutersIPOs,
    queries.reutersMergersAcquisitions,
    queries.reutersRegulatory,
    queries.reutersSummit,
    queries.reutersUSDollar,
    queries.reutersUSMarkets,
    queries.sciDailyBus,
    queries.sciDailyTop,
    queries.sciDailyTech,
    queries.wsjMarkets,
    queries.wsjBusiness,
    // Somehow the next one breaks everyhting...
    // queries.reutersGlobalMarkets,
  ].map(src => requestify.get(src)))
    .then((results) => {
      const [feed0, feed1, feed2, feed3, feed4, feed5, feed6,
        feed7, feed8, feed9, feed10, feed11, feed12, feed13,
        feed14, feed15, feed16, feed17, feed18, feed19,
        feed20, feed21, feed22, feed23] = results.map(result =>
        JSON.parse(result.body).query.results.rss);
      finNews = Array.from(new Set([...feed0, ...feed1, ...feed2,
        ...feed3, ...feed4, ...feed5, ...feed6, ...feed7, ...feed8,
        ...feed9, ...feed10, ...feed11, ...feed12, ...feed13,
        ...feed14, ...feed15, ...feed16, ...feed17, ...feed18,
        ...feed19, ...feed20, ...feed21, ...feed22, ...feed23]
        .map(element => element.channel.item.description)));
    })
    .then(() => {
      // eslint-disable-next-line array-callback-return
      finNews.map((element) => {
        // Needs to ignore the first element as it is frequently a '<p>'
        if (element.indexOf('<') < 1) {
          watsonFin.push(element);
        } else {
          watsonFin.push(element.substring(0, element.indexOf('<')));
        }
      });
    });
};

// Update functions for rss feeds
const updateFinance = () => {
  financeNews = [];
  requestify.get(queries.financeUpi).then((upi) => {
    let titles = JSON.parse(upi.body).query.results.rss;
    let alternate = true;
    titles.forEach((element) => {
      if (alternate) {
        financeNews.push(element.channel.item.title);
        alternate = false;
      } else {
        alternate = true;
      }
    });
    return requestify.get(queries.financeMW).then((mw) => {
      titles = JSON.parse(mw.body).query.results.rss;
      titles.forEach((element) => {
        financeNews.push(element.channel.item.title);
      });
      return requestify.get(queries.financeReuters).then((reuters) => {
        titles = JSON.parse(reuters.body).query.results.rss;
        titles.forEach((element) => {
          financeNews.push(element.channel.item.title);
        });
        console.log('Updated finance');
        financeUpdateCount = 0;
      });
    });
  })
  .catch(() => {
    if (financeUpdateCount < 20) {
      updateFinance();
    } else {
      financeUpdateCount += 1;
    }
    console.log('FINANCE GET ERROR');
  });
};

const updateTech = () => {
  techNews = [];
  requestify.get(queries.techTechCrunch).then((techcrunch) => {
    let titles = JSON.parse(techcrunch.body).query.results.rss;
    titles.forEach((element) => {
      techNews.push(element.channel.item.title);
    });
    return requestify.get(queries.techEngadget).then((engadget) => {
      titles = JSON.parse(engadget.body).query.results.rss;
      titles.forEach((element) => {
        techNews.push(element.channel.item.title);
      });
      return requestify.get(queries.techGizmodo).then((gizmodo) => {
        titles = JSON.parse(gizmodo.body).query.results.rss;
        titles.forEach((element) => {
          techNews.push(element.channel.item.title);
        });
        console.log('Updated tech');
        techUpdateCount = 0;
      });
    });
  })
  .catch(() => {
    if (techUpdateCount < 20) {
      updateTech();
    } else {
      techUpdateCount += 1;
    }
    console.log('TECH GET ERROR');
  });
};

const updateNews = () => {
  news = [];
  requestify.get(queries.newsUpi).then((upi) => {
    let titles = JSON.parse(upi.body).query.results.rss;
    let alternate = true;
    titles.forEach((element) => {
      if (alternate) {
        news.push(element.channel.item.title);
        alternate = false;
      } else {
        alternate = true;
      }
    });
    return requestify.get(queries.newsAP).then((ap) => {
      titles = JSON.parse(ap.body).query.results.rss;
      titles.forEach((element) => {
        news.push(element.channel.item.title);
      });
      return requestify.get(queries.newsReuters).then((reuters) => {
        titles = JSON.parse(reuters.body).query.results.rss;
        titles.forEach((element) => {
          news.push(element.channel.item.title);
        });
        console.log('Updated news');
        newsUpdateCount = 0;
      });
    });
  })
  .catch(() => {
    if (newsUpdateCount < 20) {
      updateNews();
    } else {
      newsUpdateCount += 1;
    }
    console.log('NEWS GET ERROR');
  });
};

const updateSports = () => {
  sportsNews = [];
  requestify.get(queries.sportsUpi).then((upi) => {
    let titles = JSON.parse(upi.body).query.results.rss;
    let alternate = true;
    titles.forEach((element) => {
      if (alternate) {
        sportsNews.push(element.channel.item.title);
        alternate = false;
      } else {
        alternate = true;
      }
    });
    return requestify.get(queries.sportsAP).then((ap) => {
      titles = JSON.parse(ap.body).query.results.rss;
      titles.forEach((element) => {
        sportsNews.push(element.channel.item.title);
      });
      return requestify.get(queries.sportsReuters).then((reuters) => {
        titles = JSON.parse(reuters.body).query.results.rss;
        titles.forEach((element) => {
          sportsNews.push(element.channel.item.title);
        });
        console.log('Updated sports');
        sportsUpdateCount = 0;
      });
    });
  })
  .catch(() => {
    if (sportsUpdateCount < 20) {
      updateSports();
    } else {
      sportsUpdateCount += 1;
    }
    console.log('SPORTS GET ERROR');
  });
};

const createUser = (user) => {
  db.User.create({
    userName: user.username,
    firstName: user.givenName,
    lastName: user.surname,
    isAdmin: false,
    interests: ['', ''],
  });
};

module.exports = {
  getSlash: (req, res) => {
    // console.log('HERE', req.user);
    db.User.find({ where: { userName: req.user.username } })
      .then((result) => {
        if (result) {
          // eslint-disable-next-line no-console
          console.log('user found, serving up some hot & fresh html');
        } else {
          createUser(req.user);
        }
      });
    res.sendFile('index.html', { root: path.resolve(__dirname, '../client') });
  },

  getState: (req, res) => {
    console.log('getState called');
    db.User.find({ where: { userName: req.user.username } })
      .then((foundUser) => {
        const result = {
          interests: foundUser.interests,
          RSSFeeds: {
            news,
            finance: financeNews,
            tech: techNews,
            sports: sportsNews,
            stocks: ['Stocks is a VIP feature!'],
            clear: [''],
          },
          user: {
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            userName: foundUser.userName,
          },
          docEmotions: {
            anger: 0.57912,
            disgust: 0.085289,
            fear: 0.007593,
            joy: 0.312947,
            sadness: 0.015051,
          },
          docSentiment: {
            mixed: 1,
            score: -0.103141,
            type: 'negative',
          },
        };

        db.Button.findAll({ where: { UserId: foundUser.id } })
          .then((buttonKeys) => {
            result.buttons = buttonKeys.reduce((buttons, buttonKey) => {
              // console.log(buttonKey.buttonName, buttonKey.links);
              // we are using the reduce to build up properties:
              // eslint-disable-next-line no-param-reassign
              buttons[buttonKey.buttonName] = buttonKey.links;
              return buttons;
            }, {});

            res.status(200).json(result);
          })
          .catch(error => res.status(500).send(error));
      })
      .catch(error => res.status(404).send(error));
  },

  saveState: (req, res) => {
    // console.log('req.body', req.body);
    db.User.find({ where: { userName: req.user.username } })
      .then((foundUser) => {
        const interests = Object.keys(req.body.interests)
          .map(interestKey => req.body.interests[interestKey]);

        foundUser.update({ interests })
          // eslint-disable-next-line no-console
          .then(() => console.log('user updated'))
          .catch(error => res.status(500).send(error));

        const buttons = Object.keys(req.body.buttons)
          .map(buttonKey => ({
            UserId: foundUser.id,
            buttonName: buttonKey,
            links: req.body.buttons[buttonKey],
          }));

        // refresh all Buttons
        db.Button.destroy({
          where: {
            UserId: foundUser.id,
          },
        })
        .then(() => db.Button.bulkCreate(buttons))
        .then(() => res.status(202).send('haha'))
        .catch(error => res.status(500).send(error));
      })
      .catch(error => res.status(404).send(error));
  },

  updateAll: () => {
    popFinNews();
    updateNews();
    updateFinance();
    updateTech();
    updateSports();
    setInterval(() => {
      updateNews();
      updateFinance();
      updateTech();
      updateSports();
    }, 900000);
  },

  // Testing functions
  getAllTests: (req, res) => {
    db.Test.findAll({})
      .then(result => res.status(200).json(result))
      .catch(error => res.status(404).send(error));
  },

  getTest: (req, res) => {
    db.Test.find({ where: { testName: req.params.testname } })
      .then(result => res.status(200).json(result))
      .catch(error => res.status(404).send(error));
  },

  createTest: (req, res) => {
    db.Test.create({ testName: req.body.testName })
      .then(result => res.status(201).json(result))
      .catch(error => res.status(409).send(error));
  },

  deleteTest: (req, res) => {
    db.Test.destroy({ where: { testName: req.params.testname } })
      .then(() => res.sendStatus(204))
      .catch(error => res.status(404).send(error));
  },
};
