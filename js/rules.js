function getValues(option) {

    var values = []; 

    for (var i = 0; i < options.length; i++) {
        if (option === options[i].name) {
            values = options[i].values;   
            break; 
        }
    }

    return values;

}                            



function validateSelectedValue(model, option) {

    
    //for each option, validate all the event types 
    var result = { isavailable : true }; 
    
    let value = model[option];

    let optionRules = null;
    if (rules.hasOwnProperty(option)) {
        optionRules = rules[option];
    }
    else 
        return;
    
    
    if (optionRules.hasOwnProperty('Global Value Available')) {
            
        let globalValueFunctions = optionRules['Global Value Available'];
             
            if (globalValueFunctions.hasOwnProperty(value)) {
                result = optionRules['Global Value Available'][value](model);
                console.log(result.message);
            }
        
    }

    if (result && !result.isavailable)
        return result;

    if (optionRules.hasOwnProperty('Local Value Available')) {
        
        let globalValueFunctions = optionRules['Local Value Available'];
         
        if (globalValueFunctions.hasOwnProperty(value)) {
            result = optionRules['Local Value Available'][value](model);
            console.log(result.message);
        }
        
    }

    return result; 

}


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
                value.isavailable = result.isavailable;
                value.listvaluecolor = result.listvaluecolor;
                value.message = result.message;
                console.log(result.message);
            }
        }
    }


    if (optionRules.hasOwnProperty('Local Value Available')) {
        
        let globalValueFunctions = optionRules['Local Value Available'];
    	for (let value of values) {	 
            if (value.isavailable) {   
                if (globalValueFunctions.hasOwnProperty(value.valueName)) {
                    result = optionRules['Local Value Available'][value.valueName](model);
                    value.isavailable = result.isavailable;
                    value.listvaluecolor = result.listvaluecolor;
                    value.message = result.message;
                    console.log(result.message);
                }
            }
        }
    }

}



function validateModel(model) {

    //for each option, validate all the event types 
    var result; 
    
    for (let option of options) {
        if (rules.hasOwnProperty(option.name)) {
            var optionRules = rules[option.name];
            var val = model[option.name];

            if (optionRules.hasOwnProperty('GlobalOption Value Available')) {
                result = optionRules['GlobalOption Value Available'](model);
                console.log(result.message);
                if (!result.isavailable) {
                    return result; 
                }
            }
            if (optionRules.hasOwnProperty('Global Value Available')) {
                var globalValueFunctions = optionRules['Global Value Available'];
                if (globalValueFunctions.hasOwnProperty(val)) {
                    result = optionRules['Global Value Available'][val](model);
                    console.log(result.Message);
                }
                if (!result.isavailable) {
                    return result; 
                }
            }
        }
    }
    return { isavailable : true };

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












