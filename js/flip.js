var doneFlipOptions = new Set();
var failedFlipOptions = new Set();
var flipValuesExhausted  = false;
var selectedOption = '';
var originalModel = null;
var flippedModel = null;


function startFlippingValues(model, _selectedOption, failedOptions) {
	

	failedFlipOptions.clear();
	doneFlipOptions.clear();

	//TODO : sort failed options by validation order 
	
	originalModel = model; 
	flippedModel = Object.assign({}, model); 
	
	selectedOption = _selectedOption;
	doneFlipOptions.add(selectedOption);
	
    flipOptions(failedOptions);
       
    if (flipValuesExhausted) {
    	return { flipped : false }
    }

    return { flipped : true, model : flippedModel }; 

}



function flipOptions(failedOptions) {


	for (let failedOption of failedOptions) {

		if (failedOption !==  selectedOption && !failedFlipOptions.has(failedOption) 
			                                 && !doneFlipOptions.has(failedOption)) {
	
			var isFlipped = false;
    		flipValuesExhausted = false;

    		while (!isFlipped) {

    			isFlipped = continueFlipping(failedOption);

        		if (flipValuesExhausted) 
        			break;

    		}
    	}
    }

}


function continueFlipping(currentOption) {

	var result = validateSelectedValue(flippedModel, currentOption); 
	if (result.isavailable) {
		doneFlipOptions.add(currentOption); return true;
	}

	if (currentOption.isNumeric) return isValid; //Nothing more to be done; can't flip a numeric value 

	var values = getValues(currentOption); 
	for (let value of values) {

		if (value == originalModel[currentOption]) continue; 

		flippedModel[currentOption] = value; 
		
		result = validateSelectedValue(flippedModel, currentOption); 
		if (result.isavailable) {
			doneFlipOptions.add(currentOption); return true; 
		}
		
		var failedVariables = result.failedVariables; 
		failedFlipOptions.add(currentOption);
		flipOptions(failedVariables);

		result = validateSelectedValue(flippedModel, currentOption); 
		
		if (result.isavailable) {
			failedFlipOptions.delete(currentOption);
			doneFlipOptions.add(currentOption);
			return true; 
		}
		
		for (let failedOption of failedVariables) {
			if (failedOption != currentOption)
				if (doneFlipOptions.has(failedOption)) doneFlipOptions.delete(failedOption);
		}
	}
	flipValuesExhausted = true; 
	return false; 
}

function flipOptionValue(model, optionName, valueName) {
		
}