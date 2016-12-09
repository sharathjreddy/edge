var doneFlipOptions = new Set();
var failedflipOptions = new Set();
var flipValuesExhausted  = false;

function startFlippingValues(model, selectedOption, failedOptions) {
	
	flipOptionValues.clear()
    doneFlipOptions.clear()

	//TODO : sort failed options by validation order 
	
	doneFlipOptions.Add(selectedOption);
	
    flipOptions(failedvariables)
       
    if (blFlipValuesExhausted) return true;

}



function flipOptions(selectedOption, failedOptions) {


	for (let failedOption of failedOptions) {

		if (failedOption !==  selectedOption && !failedFlipOptions.contains(failedOption) 
			                                 && !doneFlipOptions.contains(failedOption)) {
	
			var isFlipped = false;
    		flipValuesExhausted = false;

    		while (!isFlipped) {

    			isFlipped = ContinueFlipping(column);

        		if (flipValuesExhausted) 
        			break;

    		}
    	}
    }

}



function continueFlipping(model, currentOption) {

	var isValid = validateOptionValue(); 
	if (result) {
		doneFlipOptions.add(option); return true;
	}

	if (option.isNumeric) return isValid; //Nothing more to be done; can't flip a numeric value 

	var values = getAllOptionValues(); 
	for (let value of values) {

		if (value == originalModel[optionToProcess]) continue; 

		model[optionToProcess] = value; 

		isValid = validateOptionValue();
		if (isValid) {
			doneFlipOptions.add(currentOption); return true; 
		}

		var failedVariables = result.failedVariables(); 
		failedflipOptions.add(currentOption);
		flipOptions(faildVariables);

		result = validateOptionValue(); 
		
		if (result.isValid) {
			failedFlipOptions.remove(currentOption);
			doneFlipOptions.add(currentOption);
			return true; 
		}

		for (let failedOption of failedOptions) {
			if (failedOption != currentOption)
				if (doneFlipOptions.contains(failedOption)) doneFlipOptions.remove(failedOption);
		}
	}
	return false; 
}