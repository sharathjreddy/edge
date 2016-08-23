

function validate(model, option, values) {

	var globalValidationFunctions = globalValueAvailable[option];
		
	//Validate the Values against Global conditions
	
	for (var i = 0; i < values.length; i++) {
		
		var value = values[i];
		
		if (value.valueName in globalValidationFunctions) {
			var result = globalValidationFunctions[value.valueName](model);
			value.isAvailable = result.isAvailable;	
		}
	}
}

var globalValueAvailable = {};

function actuator1(model) {
	var result = {  isAvailable : false };
	if (model.ACT_TYPE == "24 VOLT MODULATING") {
		result.isAvailable = true;
	} 
	else {
		result.isAvailable = false; 
	}
	return result;
}

function actuator2(model) {
	var result = {  isAvailable : false };
	if (model.ACT_TYPE == "HAND QUAD") {
		result.isAvailable = true;
	} 
	else {
		result.isAvailable = false; 
	}
	return result;
}

globalValueAvailable['ACTUATOR'] = {};
globalValueAvailable['ACTUATOR']['RLH120'] = actuator1;
globalValueAvailable['ACTUATOR']['HQRSS050'] = actuator2;


var localOptions = []; 