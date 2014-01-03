var Sequelize = require('sequelize')
  , sequelize = new Sequelize('pl', 'root', 'qweqwe', {
    dialect: "mysql", // or 'sqlite', 'postgres', 'mariadb'
    port: 3306, // or 5432 (for postgres)
  })

sequelize
  .authenticate()
  .complete(function (err) {
    if (!!err) {
      console.log('Unable to connect to the database.')
    } else {
      console.log('Connection has been established successfully.')
    }
  })


var Record = sequelize.define('Record', {
  name: Sequelize.STRING,
  quantity: Sequelize.INTEGER
});

sequelize.sync()
  .success(function () {
    console.log('synced')
  });

module.exports = Record;

/*
 var rec = Record.build({ name: "sunny", quantity: 3 });
 rec.save()
 .error(function(err) {
 // error callback
 console.log('somethings wrong')
 })
 .success(function() {
 // success callback
 console.log('inserted')
 });*/
