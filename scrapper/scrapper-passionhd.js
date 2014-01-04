var async = require('async'),
  Datastore = require('nedb')
  , db
  , links = []
  , path = require('path');

var request = require('request'),
  fs = require('fs'),
  url = require('url'),
  cheerio = require('cheerio');

db = new Datastore({
  filename: path.join(__dirname, 'phd.db'),
  autoload: true
});
var PassionHD = 'http://passion-hd.com/';
var base = PassionHD + '?page=';
for (var i = 1; i < 28; i++) {
  links.push(base + i);
};
console.log(links);

function insertInDb(clip) {
  var $ = cheerio.load(clip);
  var $clip = $(clip);

  function _getModels() {
    var models = [];
    $clip.find('.actor a').each(function (i, item) {
      models.push({
        name: $(item).text(),
        link: $(item).attr('href')
      });
    });
    return models;
  }

  var movie = {
    title: $clip.find('.left > a').text(),
    aired: new Date($clip.find('.actor+div').text()),
    //rating: $clip.find('.rating').text(),
    //favs: $clip.find('.favs').text(),
    //comments: $clip.find('.comments').text(),
    models: _getModels(),
    poster: $clip.find('img').attr('src'),
    externalId: $clip.find('.left > a').attr('href')
  };
  console.log(movie);
  db.insert(movie, function (err, movie) {
    if (err) {
      console.log(err);
    }
    console.log(movie);
  });
}

var getPassionHD = function (uri) {
  console.log('Now visiting: ' + uri);
  request(uri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      async.each($('.thumbs li'), insertInDb);
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

async.each(links, getPassionHD);

var testPassionHD = function() {
  var body = '<ul class="thumbs"><li><a href="/video/screwing-in-the-new-year" class="tn"><img alt="Sample_475x268" height="180" src="http://i.passionhdmedia.com/content/videos/000/046/185/handtouched_ss/sample_475x268.jpg?1387825937" width="320"></a><div class="left"><a href="/video/screwing-in-the-new-year">Screwing in the New Year</a><small><div class="actor"><a href="/girls/natasha-white">Natasha White</a></div><div>December 30, 2013</div></small></div><div class="right-tour"><a href="/video/screwing-in-the-new-year" class="play">Play Video</a></div></li></ul>';
  var $ = cheerio.load(body);
  async.each($('.thumbs li'), insertInDb);
};

// update description, more photos, tags
// db.find({}, function (err, docs) {
//   async.each(docs, updateMov);
// });

//testPassionHD();