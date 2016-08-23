var express = require('express');
var app = express();
var path = require('path');

app.use('/js',express.static(path.join(__dirname, 'js')));

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, function() {
	console.log('Example app listening on 3000');
});



