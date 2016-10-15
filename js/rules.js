

function validate(model, option, values) {

	
	//Validate the Values against Global conditions
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


