

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

function actuator3(model) {

	var result = {};

	if (model.ACT_TYPE != "HAND QUAD") {
	    result.IsAvailable = false;
	    result.Message = "HDHQ100 only available with ACT TYPE HAND QUAD";
	    return result;
	}
	if (model.FAIL_POS == "N/A") {
		result.IsAvailable = true;
	} 
	else {
	    result.IsAvailable = false;   
	    return result; 
	}
    if (model.Category == "Control Dampers") { 
    	if (model.Child_Category == "Industrial") {
    		if (model.FAIL_POS == "NONE") && (model.INSTALLATION == "NONE") && (model.OPER_SHAFT == "JACKSHAFT") {
    			result.IsAvailable = True;	
    		}
    		else {
    			result.IsAvailable = False;    
    			return result;         
    		}			
    	}	
    }
    return result;
};

globalValueAvailable['ACTUATOR'] = {};
globalValueAvailable['ACTUATOR']['RLH120'] = actuator1;
globalValueAvailable['ACTUATOR']['HQRSS050'] = actuator2;
globalValueAvailable['ACTUATOR']['HDHQ100'] = actuator3;

var localOptions = []; 