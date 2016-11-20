



function validateOption(model, option, values) {

	
	//for each option, validate all the event types 
    var result; 

    let optionRules = null;
    if (rules.hasOwnProperty(option)) {
        optionRules = rules[option];
    }
    else 
    	return;

    if (optionRules.hasOwnProperty('GlobalOption Value Available')) {
        result = optionRules['GlobalOption Value Available'](model);
        console.log(result.Message);
    }

    if (optionRules.hasOwnProperty('Global Value Available')) {
        
        let globalValueFunctions = optionRules['Global Value Available'];
    	for (let value of values) {	    
            if (globalValueFunctions.hasOwnProperty(value.valueName)) {
                result = optionRules['Global Value Available'][value.valueName](model);
                value.IsAvailable = result.IsAvailable;
                value.ListValueColor = result.ListValueColor;
                console.log(result.Message);
            }
        }
    }


    if (optionRules.hasOwnProperty('Local Value Available')) {
        
        let globalValueFunctions = optionRules['Local Value Available'];
    	for (let value of values) {	    
            if (globalValueFunctions.hasOwnProperty(value.valueName)) {
                result = optionRules['Local Value Available'][value.valueName](model);
                value.IsAvailable = result.IsAvailable;
                value.ListValueColor = result.ListValueColor;
                console.log(result.Message);
            }
        }
    }

}



function validateModel(model) {
	
    model.ModelMinWidth = 5;
    model.ModelMaxWidth = 100;

    //for each option, validate all the event types 
    var result; 

    for (let option of options) {
        if (rules.hasOwnProperty(option.name)) {
            var optionRules = rules[option.name];
            var val = model[option.name];

            if (optionRules.hasOwnProperty('GlobalOption Value Available')) {
                result = optionRules['GlobalOption Value Available'](model);
                console.log(result.Message);
            }
            if (optionRules.hasOwnProperty('Global Value Available')) {
                var globalValueFunctions = optionRules['Global Value Available'];
                if (globalValueFunctions.hasOwnProperty(val)) {
                    result = optionRules['Global Value Available'][val](model);
                    console.log(result.Message);
                }
            }
        }
    }


}


var rules = {};
function parseRules(response) {
    //alert('Received Response');
    console.log(response);
    var data = JSON.parse(response);
    var i = 0;
    for (let rule of data.rules) {
        i++;
        console.log(rule);
        console.log('parsing number ' + i);
        if (! rules.hasOwnProperty(rule.option))
            rules[rule.option] = {};
        if (! rules[rule.option].hasOwnProperty(rule.event))
            rules[rule.option][rule.event] = {};

        console.log('function text: ' + rule.rule);
        var func = new Function("m", rule.rule);
        //check for value
        if (rule.value == '-') {
            rules[rule.option][rule.event] = func; 
        }
        else {
            rules[rule.option][rule.event][rule.value] = func;    
        }    

    }
}












