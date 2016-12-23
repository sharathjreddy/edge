var express = require('express');
var app = express();
var path = require('path');
var fs = require("fs");
var request = require('request');


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

app.get('/product_properties/:id', function(req, res) {
	
	var id = req.params.id;
	//console.log('id is ' + req.params.id);
	//res.sendFile(path.join(__dirname, 'index.html'));
	fs.readFile( __dirname + "/js/" + id + "_Properties.json", 'utf8', function (err, data) {
       //var options = JSON.parse( data ); 
       //console.log( options );
       //res.end( JSON.stringify(options));
       res.end(data);
   });

});

app.use('/pricing', function(req, res) {

	console.log('forwaring pricing request'); 
	
	//var url = 'http://localhost:3001/pricing'; 
  	//req.pipe(request(url)).pipe(res);
  	res.end('hello'); 
});
	
	
var port = process.env.PORT || 3000;

app.listen(port, function() {   
	console.log('Edge app listening on ' + port);
});



