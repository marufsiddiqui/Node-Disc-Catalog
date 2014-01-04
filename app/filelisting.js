var fs = require("fs"),
  _path = require("path");

exports.readdirSyncRecursive = function (baseDir) {
  baseDir = baseDir.replace(/\/$/, '');

  var readdirSyncRecursive = function (baseDir) {
    var files = {},
      curFiles,
      nextDirs,
      isDir = function (fname) {
        return fs.statSync(_path.join(baseDir, fname)).isDirectory();
      },
      prependBaseDir = function (fname) {
        return _path.join(baseDir, fname);
      };

    curFiles = fs.readdirSync(baseDir);
    //files['children'] = curFiles;
    files.label = _path.basename(baseDir);
    files.children = [];
    files.id = files.label;
    //nextDirs = curFiles.filter(isDir);

    //curFiles = curFiles.map(prependBaseDir);

    // var obj = {
    //     label:
    // }

    while (curFiles.length) {
      var next = curFiles.shift();
      if (isDir(next)) {
        var nextDir = _path.join(baseDir, next);
        files['children'].push(readdirSyncRecursive(nextDir))
      }
      else {
        files['children'].push({
          label: next,
          id: next,
          children: []
        })
      }
    }

    return files;
  };

  // convert absolute paths to relative
  var fileList = readdirSyncRecursive(baseDir)
  /*.map(function(val){
   return _path.relative(baseDir, val);
   });*/

  return fileList;
};