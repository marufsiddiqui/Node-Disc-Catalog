var async = require('async'),
  Datastore = require('nedb')
  , db
  , links
  , path = require('path');

var request = require('request'),
  fs = require('fs'),
  url = require('url'),
  cheerio = require('cheerio');

db = new Datastore({
  filename: path.join(__dirname, 'nf.db'),
  autoload: true
});
var NF = 'http://www.nubilefilms.com/';
var base = NF + 'films.php?category=hardcore&sort=recent&p=';
links = [1, 2, 3, 4].map(function (index) {
  return base + index;
});
console.log(links);

function insertInDb(clip) {
  var $ = cheerio.load(clip);
  var $clip = $(clip);

  function _getModels() {
    var models = [];
    $clip.find('.featuring a').each(function (i, item) {
      models.push($(item).text());
    });
    return models;
  }

  var movie = {
    title: $clip.find('.title').text(),
    aired: new Date($clip.find('.date').text()),
    rating: $clip.find('.rating').text(),
    favs: $clip.find('.favs').text(),
    comments: $clip.find('.comments').text(),
    models: _getModels(),
    poster: $clip.find('img').attr('src'),
    externalId: $clip.find('.img_container a').attr('href').match(/id=(\d+)&/)[1]
  };
  db.insert(movie, function (err, movie) {
    if (err) {
      console.log(err);
    }
    console.log(movie);
  });
}

var getNF = function (uri) {
  console.log('Now visiting: ' + uri);
  request(uri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      async.each($('.vid320thumb'), insertInDb);
    }
  });
};

function updateMov(doc) {
  var uri = NF + 'movieindex.php?id=' + doc.externalId;
  console.log('Now visiting: ' + uri);
  request(uri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var tags = [];
      var photosets = [];
      $('.row3 li').each(function (i, item) {
        tags.push($(item).text());
      });
      console.log(tags);
      $('.ss img').each(function (i, item) {
        photosets.push($(item).attr('src'));
      });
      console.log(photosets);
      db.update({externalId: doc.externalId}, {
        $set: {
          tags: tags,
          desc: $('.desc').html(),
          photos: photosets
        }
      }, function (err, numReplace, upsert) {
        console.log(numReplace);
        console.log(upsert);

      })
    }
  });
}

//async.each(links, getNF);

// update description, more photos, tags
db.find({}, function (err, docs) {
  async.each(docs, updateMov);
});