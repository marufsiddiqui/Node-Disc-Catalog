var _ = require('./node_modules/nedb/node_modules/underscore');
var rd = require('./filelisting');
angular.module('filex', ['ui.router', 'ngResource', 'angularTreeview'])
  .factory('Data', function ($q) {
    function _getData() {
      var deferred = $q.defer();
      var data = {
        clips: [],
        tags: [],
        models: []
      };

      db.find({}, function (err, docs) {
        if (err) {
          console.log(err);
          deferred.resolve(data);
        }

        data.clips = docs;

        var models = [];
        docs.forEach(function (doc) {
          doc.models.forEach(function (model) {
            var obj = {
              count: 1,
              name: model
            };
            var items = _.where(models, {name: model});
            var index = models.indexOf(items[0]);
            if (!items.length && model) {
              models.push(obj);
            } else {
              if (models[index]) {
                models[index].count++
              }
            }
          });
        });

        var tags = [];
        docs.forEach(function (doc) {
          doc.tags.forEach(function (tag) {
            var obj = {
              count: 1,
              name: tag
            };
            var items = _.where(tags, {name: tag});
            var index = tags.indexOf(items[0]);
            if (!items.length && tag) {
              tags.push(obj);
            } else {
              if (tags[index]) {
                tags[index].count++
              }
            }
          });
        });
        data.models = _.sortBy(models, function (i) {
          return i.name;
        });
        data.tags = _.sortBy(tags, function (i) {
          return i.name;
        });
        deferred.resolve(data);
      });
      return deferred.promise;
    }

    return {
      getData: _getData
    }
  })
  .config(function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: "views/list.html",
        controller: function ($scope, Data) {
          /*Data.getData().then(function (data) {
            $scope.items = data.clips;
          });*/
          a = $scope.dirs = [rd.readdirSyncRecursive("D:\\furam\\eXe")];
        }
      })
      .state('tags', {
        url: "/tags",
        templateUrl: "views/tags.html",
        controller: function ($scope, Data) {
          Data.getData().then(function (data) {
            $scope.tags = data.tags;
          });
        }
      })
      .state('tagslist', {
        url: "/tags/:tagName",
        templateUrl: "views/list.html",
        controller: function ($scope, Data, $stateParams) {
          db.find({tags: $stateParams.tagName}, function (err, docs) {
            $scope.$apply(function () {
              $scope.items = docs;
            });
          });
        }
      })
      .state('models', {
        url: "/models",
        templateUrl: "views/models.html",
        controller: function ($scope, Data) {
          Data.getData().then(function (data) {
            $scope.models = data.models;
          });
        }
      })
      .state('modelslist', {
        url: "/models/:modelName",
        templateUrl: "views/list.html",
        controller: function ($scope, Data, $stateParams) {
          db.find({models: $stateParams.modelName}, function (err, docs) {
            $scope.$apply(function () {
              $scope.items = docs;
            });
          });
        }
      })
      .state('new', {
        url: "/new",
        templateUrl: "views/new.html",
        controller: function ($scope, $state) {
          $scope.addNew = function (post) {
            db.insert(post, function (err, post) {
              if (err) {
                console.log(err);
              }
              console.log(post);
              $state.go('home');
            })
          };
        }
      })
      .state('edit', {
        url: "/edit/:id",
        templateUrl: "views/new.html",
        controller: function ($scope, $state) {
          $scope.addNew = function (post) {
            db.insert(post, function (err, post) {
              if (err) {
                console.log(err);
              }
              console.log(post);
              $state.go('home');
            })
          };
        }
      })
  })
  .run(
    ['$rootScope', '$state', '$stateParams',

      function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
      }]);