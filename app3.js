var Datastore = require('nedb'),
  path = require('path'),
  db = new Datastore({
    filename: path.join(require('nw.gui').App.dataPath, 'main.db')
  });
db.loadDatabase(function(err) { // Callback is optional
  // Now commands will be executed
});