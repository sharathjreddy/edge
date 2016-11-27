var express = require('express');
var app = express();
var path = require('path');
var fs = require("fs");

app.use('/js',express.static(path.join(__dirname, 'js')));

app.use(express.static(__dirname));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/product/:id', function(req, res) {
	
	var id = req.params.id;
	//console.log('id is ' + req.params.id);
	//res.sendFile(path.join(__dirname, 'index.html'));
	fs.readFile( __dirname + "/" + id + ".json", 'utf8', function (err, data) {
       var options = JSON.parse( data ); 
       console.log( options );
       res.end( JSON.stringify(options));
   });

});




app.listen(80, function() {   
	console.log('Example app listening on 80');
});



