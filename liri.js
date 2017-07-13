var fs = require('fs');
var cmd = require('node-cmd');
var request = require('request');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var inquirer = require('inquirer');
var command = process.argv[2];
var keys = require("./keys.js");
var keyList = keys.twitterKeys;
var consumerKey = keyList.consumer_key;
var consumerSecret = keyList.consumer_secret;
var accessToken = keyList.access_token_key;
var secretToken = keyList.access_token_secret;

//OMDB
function movieThis(movie){
	var movieName = "";
	var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";

	request(queryUrl, function(error, response, body) {
		if (error) {
		    return logData('Error occurred: ' + error);
		}

	  	if (!error && response.statusCode === 200) {
	  		logData("movie-this");
		    logData("Title: " + JSON.parse(body).Title);
		    logData("Release Year: " + JSON.parse(body).Year);
		    logData("IMDB Rating: " + JSON.parse(body).Ratings[0].Value);
		    logData("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[2].Value);
		    logData("Country: " + JSON.parse(body).Country);
		    logData("Language: " + JSON.parse(body).Language);
		    logData("Plot: " + JSON.parse(body).Plot);
		    logData("Actors: " + JSON.parse(body).Actors);
	  	}
	});
};

//SPOTIFY
function spotifyThis(song){
	var spotify = new Spotify({
		id: '667f978c54ac47d0977fe426b617e93e',
		secret: '0c501690f82547e29148935d8cc7b383'
	});
	
	spotify.search({ type: 'track', query: song, limit: 1 }, function(err, data) {
		if (err) {
		    return logData('Error occurred: ' + err);
		}
		//console.log(data.tracks.items[0].album.artists[0].external_urls.spotify); 
		logData("spotify-this-song");
		logData("Artist(s): " + data.tracks.items[0].album.artists[0].name);
		logData("Title: " + data.tracks.items[0].name);
		logData("Preview: " + data.tracks.items[0].album.artists[0].external_urls.spotify);
		logData("Album: " + data.tracks.items[0].album.name); 
	});
};

//TWITTER
function twitterMe(){
	var client = new Twitter({
	  	consumer_key: consumerKey,
	  	consumer_secret: consumerSecret,
		access_token_key: accessToken,
	  	access_token_secret: secretToken
	});
	 
	var params = {screen_name: 'codeconejo'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  	if (!error) {
	  		for (var i = 0; i < tweets.length; i++){
	  			var date = tweets[i].created_at;
	  			logData("my-tweets");
	  			logData("-----------------------------------");
	  			logData(date.split("+")[0]);
	    		logData("@"+tweets[i].user.screen_name + ": " + tweets[i].text);
	    		logData("									");
			}
		}
	});
};

//RANDOM
function doRandom(){
	fs.readFile("random.txt", "utf8", function(error, data) {
		if (error) {
			return logData(error);
		}

		var dataArr = data.split(",");
		var runArg = dataArr[0];
		var arg = dataArr[1];
		logData("do-what-it-says");
		switch(runArg) {
			//OMDB
			case "movie-this":
				inquirer.prompt([
					{
				      type: "input",
				      message: "What movie would you like to look up?",
				      name: "movie"
				    }
				]).then(function(inquirerResponse) {
					movieThis(inquirerResponse.movie);
				});
				break;
			//SPOTIFY
			case "spotify-this-song":
					spotifyThis(arg);
				break;
			//TWITTER
			case "Twitter":
				twitterMe();
				break;
		}
	});
}
function logData(logInfo){
	console.log(logInfo);
	var textFile = "log.txt";
	fs.readFile(textFile, "utf8", function(err, data) {
	  // If there's an error reading the textFile, we log it and return immediately
	  if (err) {
	    return console.log(err);
	  }
	  // Inside of the readFile callback, we use the appendFile function
	  // The first parameter is the name of the text file to save to
	  // The second parameter is the data we want to write as a string
	  // The third parameter is the callback function to be called when appendFile is finished
	  // For more info, see the docs: https://nodejs.org/api/fs.html#fs_fs_appendfile_file_data_options_callback
	  fs.appendFile("log.txt", "\n"+ logInfo +"\n", function(err) {
	    // If there was an error, we log it and return immediately
	    if (err) {
	      return console.log(err);
	    }
	  });
	});
}

inquirer.prompt([
	{
      type: "list",
      message: "What do you want to do?",
      choices: ["Twitter", "Spotify", "Movies", "Random"],
      name: "category"
    },
]).then(function(inquirerResponse) {
	switch(inquirerResponse.category) {
		//OMDB
		case "Movies":
			inquirer.prompt([
				{
			      type: "input",
			      message: "What movie would you like to look up?",
			      name: "movie"
			    }
			]).then(function(inquirerResponse) {
				movieThis(inquirerResponse.movie);
			});
			break;
		//SPOTIFY
		case "Spotify":
			inquirer.prompt([
				{
			      type: "input",
			      message: "What song title would you like to look up?",
			      name: "song"
			    }
			]).then(function(inquirerResponse) {
				spotifyThis(inquirerResponse.song);
			});
			break;
		//TWITTER
		case "Twitter":
			twitterMe();
			break;
		//RANDOM
		case "Random":
			doRandom();
			break;
	}
});