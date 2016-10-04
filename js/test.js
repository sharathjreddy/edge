var fs = require('fs');
var json = JSON.parse(fs.readFileSync('rules.json', 'utf8'));
console.log(json);

var rules = json['rules'];
console.log(rules[0].function);

var fn = new Function('model', rules[0].function);

console.log(fn);

var model = { ACT_TYPE : 'HAND QUAD'};

var result = fn(model);

console.log(result);


