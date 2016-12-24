
"use strict";

function startFlippingValues(line, selectedOption, failedVariables, allVariables) {
	
	doneFlipOptions.add(selectedOption);
	
    flipOptions(line, failedVariables, selectedOption);

    if (flipValuesExhausted)
    	return; 

    var allOptions = filterAndSort(allVariables); 

    for (let option of allOptions) {

    	var optionObj = optionMap[option]; 

    	if (option == 'ACTUATOR' && (doneFlipOptions.has(option) || failedFlipOptions.has(option)))
    		continue; 

    	if (option == selectedOption || doneFlipOptions.has(option))
    		continue; 

    	var flipped = false; 
    	if (optionObj.type == 'List') {
         	
         	while(!flipped) {
                flipped = continueFlipping(line,option);
                if (flipValuesExhausted) 
                	return; 
            }            

        }
        else if (optionObj.type == 'Value') {
            flipped = continueFlipping(line, option); 
            if (!flipped) 
                 return; 
        }     
	} //end for     
}



function flipOptions(line, failedVariables, selectedOption) {
	
	
	let failedOptions = filterAndSort(failedVariables);
	
	for (let failedOption of failedOptions) {
		
		if (failedOption != userSelectedOption && !failedFlipOptions.has(failedOption) && !doneFlipOptions.has(failedOption)) {
	
			var isFlipped = false;
    		flipValuesExhausted = false;

    		while (!isFlipped) {

    			isFlipped = continueFlipping(line, failedOption);

        		if (flipValuesExhausted) 
        			break;

    		}
    	}
    }

}


function continueFlipping(line, currentOption) {

	var result = ruleFlow(line, currentOption); 
	if (result.isavailable) {
		doneFlipOptions.add(currentOption); 
		return true;
	}

	//TODO: filter out non-list, not-value options? eg. Drawings 

	var optionObj = optionMap[currentOption]; 
	if (optionObj.Type == "Value") {
		flipValuesExhausted = true; 
		return false; //Nothing more to be done; can't flip a numeric value 
	}	

	var values = optionObj.values;  
	for (let value of values) {

		if (value.name == model[currentOption]) continue; 

		setOptionValue(line, optionObj, value);

		//TODO: handle case where it is RED 

		result = ruleFlow(line, currentOption); 

		if (result.listvaluecolor == 'Red')
			continue;  

		if (result.isavailable) {
			doneFlipOptions.add(currentOption); 
			flipValuesExhausted = false; 
			return true; 
		}

		var failedVariables = result.failedVariables; 
		failedFlipOptions.add(currentOption);
		flipOptions(line, failedVariables,currentOption); 

		result = ruleFlow(line, currentOption); 
		
		if (result.isavailable) {
			failedFlipOptions.delete(currentOption); 
			doneFlipOptions.add(currentOption);
			flipValuesExhausted = false; 
			return true; 
		}

		for (let failedOption of failedVariables) {
			if (failedOption != userSelectedOption)
				if (doneFlipOptions.has(failedOption)) doneFlipOptions.delete(failedOption);
		}
	}
	flipValuesExhausted = true; 
	return false; 
}

function setOptionValue(line, option, value) {

	line[option.name] = value.name;
	
    //All below values required by RM Eng Calcs 
    line[option.displayName] = value.name;  
    line[option.displayName + ' Guid'] = value.valueGuid; 
    line[option.displayName + ' MVG'] = value.modelValueGuid;
    line[option.displayName + ' VALUETEXT'] = value.valueText; 
		
}

function filterAndSort(failedVariables) {

	var failedOptions = []; 

	//options are already sorted! 
	for (let option of options) {
		if (!failedVariables)
			debugger; 

		if (failedVariables.indexOf(option.name) > -1) {
			failedOptions.push(option.name); 
		}
	}

	return failedOptions; 


}