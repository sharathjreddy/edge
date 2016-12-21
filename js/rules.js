"use strict";

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


function isActuatorAvailable(model) { 
    var actType = model['ACT_TYPE'];
    var actuator = model['ACTUATOR'];

    var validActuators = actuatorMappings[actType]; 
    if (validActuators.indexOf(actuator) == -1)
        return false; 

    return true; 
}



function ruleFlow(model, option) {
    
    //for each option, validate all the event types 
    var result = { isavailable : true }; 
    
    let value = model[option];

    //Look-up table that maps actuator types to valid actuator values 
    //TODO: failed variable is acutator? 
    if (option == 'ACTUATOR') {
        if (!isActuatorAvailable(model)) {
            result.isavailable = false; 
            result.listvaluecolor = 'Red';
            result.message = 'Not available because of ' + model['ACT_TYPE']; 
            return result; 
        }
    }

    switch(option) {  
        case "ACTUATOR":
        case "INSTALLATION":
        case "ACCESSORIES": 
            //should never actually fail !! 
            var isValid = {}; 
            isActuatorInvalid(isValid, product.Product_Parent_Category_Name, product, model, value); 
            break; 
            
        case "FRAME":
        case "MOUNTING":
        case "BLADE ACTION":
        case "FAIL POS.": 
        case "ACCESSORIES": 
        case "SLEEVE LENGTH": 
            
            //TODO: failedVariable == Current Variable?? 
            var bIsValid = isULValid(job, product, model, option); 
            if (!bIsValid.retval) {
                result.isavailable = false; 
                result.message = bIsValid["ErrorMsg"];
                return result; 
            }
            break; 

        case "WIDTH", "HEIGHT": 
            var height = parseInt(model['HEIGHT']);
            var width = parseInt(model['WIDTH']);
            bIsValid = isULValid(job, product, model, option);        
            if (!bIsValid.retval) {
                result.isavailable = false; 
                result.message = bIsValid["ErrorMsg"];
                return result; 
            }
            break; 
    }        
    
    if (option == 'ACTUATOR' && value != 'NONE') {
        var modelValueGuid; 
        setActuatorQuantity(job, product, model);           
        var props = getModelProperties(); 
                
        model.ActuatorQuantity = props.actuatorquantity;
        result.actuatorquantity = props.actuatorquantity;  
    }
    
    
    let optionRules = null;
    if (rules.hasOwnProperty(option)) {
        optionRules = rules[option];
    }
    else 
        return processResult(result);
    
    
    //Invoke the Rule Engine - 4 types of events   
    if (optionRules.hasOwnProperty('GlobalOption Value Available')) {
            
        result = optionRules['GlobalOption Value Available'](model);
        console.log(result.message); 
    }

    if (result && !result.isavailable)
        return processResult(result);


    if (optionRules.hasOwnProperty('Global Value Available')) {
            
        let globalValueFunctions = optionRules['Global Value Available'];
             
            if (globalValueFunctions.hasOwnProperty(value)) {
                result = optionRules['Global Value Available'][value](model);
                console.log(result.message);
            }
        
    }


    if (result && !result.isavailable)
        return processResult(result);

   
    if (optionRules.hasOwnProperty('LocalOption Value Available')) {
            
        result = optionRules['LocalOption Value Available'](model);
        console.log(result.message); 
    }
    
    if (result && !result.isavailable)
        return processResult(result);


    if (optionRules.hasOwnProperty('Local Value Available')) {
        
        let globalValueFunctions = optionRules['Local Value Available'];
         
        if (globalValueFunctions.hasOwnProperty(value)) {
            result = optionRules['Local Value Available'][value](model);
            console.log(result.message);
        }
        
    }

    //If Actutator, execute Actuator Pricing Rules 
    if (option == 'ACTUATOR') {
        let func = actuatorPricingRules[value];        
        if (func) {
            let price = func(model);
            result.price = price.totalprice; 
        }
    }


    return processResult(result); 

}


function processResult(result) {

    validationFailureMessage = result.message;
     
    if (!result.isavailable && result.failedVariables.length == 0) {
        result.failedVariables = result.allVariables;     
    }
     
    return result; 
}



function validateOption(model, option, values) {
	
	var backupValue = model[option]; 
    
    for (let value of values) {
        model[option] = value.valueName; 
        var result = ruleFlow(model, option);
        value.isavailable = result.isavailable;
        value.listvaluecolor = result.listvaluecolor;
        if (!result.isavailable && result.message == '') {
            var msg = 'This value is unavailable because of ' + result.failedVariables.join(',');
            result.message = msg;     
        }
        value.message = result.message;
        value.pricelabel = result.actuatorquantity + '-' + result.price; 
    } 

    model[option] = backupValue; 
    return; 
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

    actuatorPricingRules = {}; 
    for (let rule of data.addon_rules) {
        let func = new Function("m", rule.rule); 
        actuatorPricingRules[rule.actuator] =  func;      
    }

}












