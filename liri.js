require("dotenv").config();
const keys = require("./keys");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const fs = require("fs");

const client = new Twitter(keys.twitter);
const spotify = new Spotify(keys.spotify);

const getTweets = function(){
    const size = 20;
    client.get("statuses/home_timeline", {count: 20})
    .then(tweets => {
        tweets.forEach( ({created_at, text}) => {
            console.log(created_at + ": " + text);
        });
    })
    .catch(error => console.log(error));
}

const searchSong = function(q){
    var query = q ? q : "All the Small Things";
    spotify.search({
        type: 'track',
        query
    })
    .then((data) => data.tracks.items[0])
    .then(data => {
        var name = data.name;
        var link = data.preview_url;
        var album = data.album.name;
        var artists = data.artists[0].name;
        console.log("Artist: " + artists);
        console.log("Name: " + name);
        console.log("Preview Link: " + (link ? link : "N/A"));
        console.log("Album: " + album);
    })
    .catch(error => console.log(error));
}

const searchMovie = function(q){
    var query = q ? q : "Mr. Nobody";
    query = query.replace(' ', '+');
    request("http://www.omdbapi.com/?apikey=trilogy&t="+query, (error, response, body) => {
        if(error)
            return console.log("error:", error);
        body = JSON.parse(body);
        console.log("Title: " + body.Title);
        console.log("Year: " + body.Year);
        body.Ratings.forEach(rating =>{
            if(rating.Source === "Internet Movie Database")
                console.log("IMDB Rating: " + rating.Value);
            else if(rating.Source === "Rotten Tomatoes")
                console.log("RT Rating: " + rating.Value);
        })
        console.log("Country: " + body.Country);
        console.log("Language: " + body.Language);
        console.log("Plot: " + body.Plot);
        console.log("Actors: " + body.Actors);
    })
}

const random = function(){
    fs.readFile("./random.txt", "utf8", (err, data) => {
        if(err)
            return console.log(err);
        var split = data.split(',');
        op(split[0], split[1]);
    });
}

const op = function(op, q){
    switch(op){
        case "my-tweets" :
            getTweets();
            break;
        case "spotify-this-song" :
            searchSong(q);
            break;
        case "movie-this" :
            searchMovie(q);
            break;
        case "do-what-it-says" :
            random();
            break;
        default:
            "Invalid operation"
    }
}

var query = process.argv[3];
for(let i = 4; i < process.argv.length; i++){
    query += " " + process.argv[i];
}

op(process.argv[2], query);