var express = require("express");
var app = express();

app.get("/", function(req, res){
	res.send("Hi there, wellcome to my assignment!");	
});

app.get("/speak/:animal", function(req, res){
	var sounds = {
		pig: "Oink",
		cow: "Mpp",
		dog: "Woof Woof",
		cat: "Meao",
		fish: "Bloop Bloop",
	}
	var animal = req.params.animal.toLowerCase();
	var sound = sounds[animal];
	res.send("The " + animal +" syas "+ sound);
});

app.get("/repeat/:word/:number", function (req, res){
	var word = req.params.word;
	var number = Number(req.params.number);
	var result = ""
	for (var i = 0; i<number; i++) {
		result+= word + " ";
	}
	res.send(result);
});

app.get ("*", function(req, res){
	res.send("Sorry, page not found");
});


app.listen(3000, function(){;
	console.log("Server started");
});
