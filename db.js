var Datastore = require('nedb')
  , path = require('path');

module.exports = function (nwGui) {
  console.log(nwGui.App.dataPath);

  return new Datastore({
    filename: path.join(__dirname, 'nf.db'),
    autoload: true
  });
};