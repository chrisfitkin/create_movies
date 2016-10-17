var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));

// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
}

app.get('/', function(req, res, next) {
    // res.render('fruitPicker', { 'fruits' : [ 'apple', 'orange', 'banana', 'peach' ] });
    res.render('createMovie');
});

app.post('/create_movie', function(req, res, next) {

  var url = 'mongodb://localhost:27017/video';

  MongoClient.connect(url, function(err, db) {

      var title = req.body.title;
      var year = req.body.year;
      var imdb = req.body.imdb;
      if (typeof title == 'undefined') next('Please provide a Title');
      if (typeof year == 'undefined') next('Please provide a Year');
      if (typeof imdb == 'undefined') next('Please provide an IMDB ID');

      var newMovie = {
        "title": title,
        "year": year,
        "imdb": imdb
      }


      assert.equal(null, err);
      console.log("Successfully connected to server");

      // Add the movie to the database
      try {
        db.movies.insertOne( newMovie );
      } catch (e) {
        next("Could not insert movie :(");
      }
      res.send(newMovie.title + " added with insertOne()");
      console.log("Movie added with insertOne");

      db.close();

  });
});

// app.post('/favorite_fruit', function(req, res, next) {
//     var favorite = req.body.fruit;
//     if (typeof favorite == 'undefined') {
//         next('Please choose a fruit!');
//     }
//     else {
//         res.send("Your favorite fruit is " + favorite);
//     }
// });

app.use(errorHandler);

var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
});
