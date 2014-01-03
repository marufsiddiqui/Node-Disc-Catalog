var http = require('http');
var fs = require('fs');
var request = require('request');
var url = require('url');
var async = require('async');
var path = require('path')

/*
function getImages(uri) {
    var request = require('request');
    var url = require('url');
    var cheerio = require('cheerio');
    path = require('path')
    var fs = require('fs');

    request(uri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            $ = cheerio.load(body)
            imgs = $('img').toArray()
            console.log("Downloading...")
            imgs.forEach(function (img) {
                //console.log(img.attribs.src)
                process.stdout.write(".");
                img_url = img.attribs.src
                if (/^https?:\/\//.test(img_url)) {
                    img_name = path.basename(img_url)
                    request(img_url).pipe(fs.createWriteStream(img_name))
                }
            })
            console.log("Done!")
        }
    })
}
getImages("http://imgur.com/gallery")
*/


console.log("Downloading...");

var pattern = /url\(["'']?(https?:\/\/.+)["'']?\)/gi;
var match;

var imgs = [];

function download(localFile, remotePath, callback) {
	var localStream = fs.createWriteStream(localFile);

	var out = request({
		uri: remotePath
	});
	out.on('response', function(resp) {
		if (resp.statusCode === 200) {
			out.pipe(localStream);
			localStream.on('close', function() {
				callback(null, localFile);
			});
		} else callback(new Error("No file found at given url."), null);
	})

	out.on('error', function(a) {
		console.log(a);
		console.log(remotePath);
	});
};


// read css files in the directory
fs.readFile('./1352924129.css', 'utf8', function(err, data) {
	if (err) {
		return console.log(err);
	} else {
		while (match = pattern.exec(data)) {
			imgs.push(match[1].replace('"', '').replace("'", ''));
		}
		//var res = pattern.exec(data);
		//var res = data.match(pattern);
		console.log(imgs.length);
		console.log(imgs);

		imgs = imgs.filter(function(elem, pos) {
			return imgs.indexOf(elem) == pos;
		});
		console.log(imgs.length);

		async.each(imgs, function(img) {
			console.log(img);
		});


		async.each(imgs, function(img) {
			process.stdout.write(".");
			img_name = path.basename(img);
			download(img_name, img, function(err, result) {
				//handle error here

				console.log('creating ' + img);
				//cb();
			})
			//request(img).pipe(fs.createWriteStream(img_name));
		});

		/*
		imgs.forEach(function(img) {
			process.stdout.write(".");
			img_name = path.basename(img);
			request(img).pipe(fs.createWriteStream(img_name));
		});*/
	}
});