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
  filename: path.join(__dirname, 'fhd.db'),
  autoload: true
});
var FantasyHD = 'http://fantasyhd.com/';
var base = FantasyHD + '?page=';
links = [1, 2, 3, 4, 5, 6].map(function (index) {
  return base + index;
});
console.log(links);

function insertInDb(clip) {
  var $ = cheerio.load(clip);
  var $clip = $(clip);

  function _getModels() {
    var models = [];
    $clip.find('.model a').each(function (i, item) {
      models.push($(item).text());
    });
    return models;
  }

  var movie = {
    title: $clip.find('.title').text(),
    aired: new Date($clip.find('.date').text()),
    rating: $clip.find('.rating').text(),
    //favs: $clip.find('.favs').text(),
    //comments: $clip.find('.comments').text(),
    models: _getModels(),
    poster: $clip.find('img').attr('src'),
    externalId: $clip.find('.img a').attr('href')
  };
  db.insert(movie, function (err, movie) {
    if (err) {
      console.log(err);
    }
    console.log(movie);
  });
}

var getFantasyHD = function (uri) {
  console.log('Now visiting: ' + uri);
  request(uri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      async.each($('.thumb'), insertInDb);
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

async.each(links, getFantasyHD);

// update description, more photos, tags
// db.find({}, function (err, docs) {
//   async.each(docs, updateMov);
// });