"use strict";

var _table_ = document.createElement('table'),
    _tr_ = document.createElement('tr'),
    _th_ = document.createElement('th'),
    _td_ = document.createElement('td');

var options = null;
var properties = null;    
var modelId = 'CD35';
var counter = 1; 

var table;
$(document).ready(function() {

    //Look for Query String 
    modelId = getParameterByName('model');
    if (modelId)
        loadModelMetadata();  

    document.getElementById("price").addEventListener("click", price, false);
    //table = buildHtmlTable(options);
    
    
});


function bindKeys() {

    $(table).keydown(function(e) {
    
    var $table = $(this);
    var $active = $('input:focus,select:focus',$table);
    var $next = null;
    var focusableQuery = 'input:visible,select:visible,textarea:visible';
    var position = parseInt( $active.closest('td').index()) + 1;
    console.log('position :',position);

    switch(e.which) {
        case 37: // left
        $next = $active.parent('td').prev().find(focusableQuery);
        break;

        case 38: // up

            if (!e.ctrlKey) return;

            $next = $active
                .closest('tr')
                .prev()                
                .find('td:nth-child(' + position + ')')
                .find(focusableQuery);
        break;

        case 39: // right
            //tab to next cell 
            console.log('right key');
            
            $next = $active.closest('td').next().find(focusableQuery);            
            break;
        case 40: // down
            console.log('key down');

            if (!e.ctrlKey) return; 

            $next = $active
                .closest('tr')
                .next();

            if ($next.length == 0) {  //We are on the last row!!
                let tr = createRow();    
                validateLineItem(tr, options[0]); 
                $next = $active.closest('tr').next();
            }    

            $next.find('td:nth-child(' + position + ')').find(focusableQuery).focus();
            //TODO: update the validation msg to reflect the current row 
            break;

        default: return; // exit this handler for other keys
    }
    if($next && $next.length)
    {        
        $next.focus();
    }
    return false;
    //e.preventDefault(); // prevent the default action (scroll / move caret)
   });

}


function loadModelMetadata() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            loadProperties(xmlHttp.response);
    }
    xmlHttp.open("GET", '/product/CD35', true); // true for asynchronous 
    xmlHttp.send(null);

}
 
function loadProperties(data)  {
    var arr = JSON.parse(data);
    options = arr.options;
    actuatorMappings = arr.actuator_mappings; 
    optionMap = {}; 
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        optionMap[option.name] = option; 
    }
    optionsSortedByValidationOrder = options.slice();  
    optionsSortedByValidationOrder.sort(function(a, b) {

        var colA = parseInt(a.columnOrder);
        var colB = parseInt(b.columnOrder);

        if (colA < colB) {
            return -1;
        }
        if (colA > colB) {
            return 1;
        }
        return 0; 
    });

    properties = arr.properties; 
    buildHtmlTable(optionsSortedByValidationOrder);

    options.sort(function(a, b) {

        var colA = parseInt(a.validationOrder);
        var colB = parseInt(b.validationOrder);

        if (colA < colB) {
            return -1;
        }
        if (colA > colB) {
            return 1;
        }
        return 0; 
    });


    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            parseProperties(xmlHttp.response);
    }
    xmlHttp.open("GET", '/product_properties/CD35', true); // true for asynchronous 
    xmlHttp.send(null);

}


function parseProperties(data) {
    var arr = JSON.parse(data); 
    product = arr.Products[0];
        
    //These are used by Rules Engine, so need to copy them over with the appropriate key 
    properties.Category = product.Product_Parent_Category_Name;
    properties.Child_Category = product.Product_Child_Category_Name;
    job = {}; 
    job.CD35_Properties = arr.CD35_Properties; 
    job.CD35_Writable_Properties = arr.CD35_Writable_Properties; 
    job.Products_CD35_Writable = arr.Products_CD35_Writable; 

    createAndValidateLineItem(); 
}

function createAndValidateLineItem() {

    var tr = createRow(options);    
    var firstOption = optionsSortedByValidationOrder[0].name; 
    var firstOption = optionsSortedByValidationOrder[0].name; 
    var inputElement = tr.querySelector('[data-option="' + firstOption + '"]');
    inputElement.focus(); 

    validateLineItem(tr, firstOption); 
    displayValidationResult(tr); 
    //Set focus on option that failed? 
   

}



function loadRules() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            parseRules(xmlHttp.response);
    }
    xmlHttp.open("GET", '/js/CD35.js', true); // true for asynchronous 
    xmlHttp.send(null);

}

var fillDownSelectedOption = '';
var fillDownSelectedRow = null; 
var fillDownSelectedValue = '';

function contextMenuHandler(event) {

        var textbox = event.target; 

        var isText = (textbox instanceof HTMLInputElement || textbox instanceof HTMLSelectElement);
        if (!isText)
            return true; 

        fillDownSelectedOption = textbox.getAttribute('data-option');
        fillDownSelectedValue = textbox.value; 
        fillDownSelectedRow = textbox.parentNode.parentNode;
    
        
        document.getElementById("rmenu").className = "show";  

        document.getElementById("rmenu").style.top =  mouseY(event) + 'px';
        document.getElementById("rmenu").style.left = mouseX(event) + 'px';
        event.preventDefault();
        return false; 

}


function filldown() {
    //alert('starting fill down');
    var input = prompt("Enter Number of Rows:", "1");
    var rows = parseInt(input);

    var nextRow = fillDownSelectedRow.nextElementSibling;
    for (var i = 0; i < rows; i++) {
        var input = nextRow.querySelector('[data-option="' + fillDownSelectedOption + '"]'); 
        input.value = fillDownSelectedValue;
        validateLineItem(nextRow, fillDownSelectedOption); 
        nextRow = nextRow.nextElementSibling;
    }

}


function onFocus(event) {
    
    console.log('executing onfocus');

    if (event.target.type != 'select-one' && event.target.type != 'number') 
        return;

    var sel = event.target;
    var target = sel;
    var option = target.getAttribute('data-option');
    
    while (target && target.nodeName !== "TR") {
        target = target.parentNode;
    }

    displayValidationResult(target); 

}


    
function afterCellUpdate(event) {
    
    console.log('executing afterCellUpdate');

    if (event.target.type != 'select-one' && event.target.type != 'number') 
        return;

    line = {}; 
    var sel = event.target;
    var target = sel;
    var option = target.getAttribute('data-option');
    
    while (target && target.nodeName !== "TR") {
        target = target.parentNode;
    }
    
    if (sel.type == 'number') {
        var val = sel.value; 
        var reg = /^\d+$/;
        if (!reg.test(val)) {
            sel.value = 0; 
        }
    }
    
    validateLineItem(target, option);
    
    var line = model; 

    if (validationSucceeded) {
        setSectionCalcs(job, product, line);
        setActuatorQuantity(job, product, line); 
        var props = getModelProperties(); 
        //TODO: retrieve updated actuator quantity from props?   
        price(line); 
    }
    

}

function updateDisplayValues(row, line, pristineCopy) {
    
    for (let key in pristineCopy) {
        
        if (!pristineCopy.hasOwnProperty(key))
            continue; 
        
        let originalValue = pristineCopy[key];
        let modifiedValue = line[key];

        if (originalValue != modifiedValue) {
            var inputElement = row.querySelector('[data-option="' + key + '"]');
            inputElement.value = modifiedValue; 
        }

    }
    
}

function clickHandler(event) {
    //alert('mouse down');
    console.log('mouse down');
    
    if (event.target.type != 'select-one') return;
    
    //TODO: Get model, option and values from the Grid
    console.log(event.target);
    console.log(event.target.type);
    
    var model = {}; 
    var sel = event.target;
    var target = sel;
    var option = target.getAttribute('data-option');
    
    while (target && target.nodeName !== "TR") {
        target = target.parentNode;
    }
    if (target) {
        var cells = target.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            var el = cells[i].firstElementChild;
            if (el == null) continue; 
            var optionName = el.getAttribute('data-option');
            var value = el.value;
            model[optionName] = value;
        }
    }
    enrichModel(model); 
    console.log(model);
    
    //Get all the values from the Select control 
    var values = [];
    var options = sel.options;
    for (i = 0; i < options.length; i++) {
        values.push( { valueName : options[i].value, isavailable : true } );
    }
    console.log(JSON.stringify(values));
    validateOption(model, option, values);
    console.log(JSON.stringify(values));

    if (option == 'ACTUATOR') {  
        sortActuatorValuesByPrice(values, sel); 
        return; 
    }

    
    //TODO: update the Grid with the availability results 
    for (i = 0; i < values.length; i++) {
        if (values[i].listvaluecolor == 'Red') {
            sel.options[i].style.backgroundColor = 'pink';
            sel.options[i].disabled = true;
            sel.options[i].title = values[i].message; 
        }
        else if (!values[i].isavailable){
            sel.options[i].style.backgroundColor = 'grey';
            sel.options[i].disabled = false;    
            sel.options[i].title = values[i].message; 
        }
        else {
            sel.options[i].style.backgroundColor = 'white';
            sel.options[i].disabled = false;  
       }
    }

    //Sort values by List Price

}


function sortActuatorValuesByPrice(values, selectElement) {
    
    values.sort(function(a, b) {

        if (a.listvaluecolor == 'Red') 
            return 1; 
        
        if (b.listvaluecolor == 'Red') 
            return -1;

        if (a.actuatorquantity == -1) {
            return 1;
        }

        if (b.actuatorquantity == -1) 
            return -1; 

        if (!a.isavailable) {
            return 1;
        }

        if (!b.isavailable) {
            return -1;
        }        

        if (a.price < b.price) 
            return -1; 
        else 
            return 1; 

        return 0; 
    });

    selectElement.innerHTML = ''; 
    for (var i = 0; i < values.length; i++) {
        
        var option = document.createElement("option");
        option.value = values[i].valueName; 
        option.text = values[i].valueName; 

        if (values[i].listvaluecolor == 'Red') {
            option.style.backgroundColor = 'pink';
            option.disabled = true;
            option.title = values[i].message; 
        }
        else if (values[i].actuatorquantity == -1) {
            option.style.backgroundColor = 'pink';
            option.disabled = true;
            option.title = 'Not available because of actuator quantity'; 
        }
        else if (!values[i].isavailable){
            option.style.backgroundColor = 'grey';
            option.disabled = false;    
            option.title = values[i].message; 
        }
        else {
            option.style.backgroundColor = 'white';
            option.disabled = false;  
            option.title = values[i].actuatorquantity + '- $' + values[i].price; 
        }
        selectElement.appendChild(option); 
    }
}

    
    
function validateLineItem(targetRow, optionChanged) {
     
    model = {}; 
    var cells = targetRow.getElementsByTagName("td");
    for (var i = 0; i < cells.length; i++) {
        var el = cells[i].firstElementChild;
        if (el == null) continue; 
            var optionName = el.getAttribute('data-option');
            var value = el.value;
            model[optionName] = value;
    }
    
    if (log.isTraceEnabled) {
        log.trace(model); 
    }    
    
    var pristineCopy = Object.assign({}, model);

    validationSucceeded = false; 
    startedFlipping = false;
    failedFlipOptions.clear();
    doneFlipOptions.clear();
    flipValuesExhausted = false; 

    enrichModel(model);  //add attributes required by RM Eng Calcs 

    var result = ruleFlow(model, optionChanged);  
    if (result.isavailable)  {
        callRulesEngineByValidationOrder(model); 
        validationSucceeded = (!flipValuesExhausted);
        updateDisplayValues(targetRow, model,pristineCopy);
        updateDisplay(targetRow);
        return; 
    }

    //If changed option is numeric, no point flipping!! 
    var optionObj = optionMap[optionChanged];
    if (optionObj.type == "Value") {
        validationSucceeded = false;
        updateDisplay(targetRow); 
        return; 
    }

    startedFlipping = true; 
    userSelectedOption = optionChanged; 
    
    var failedVariables = result.failedVariables;
    var allVariables = result.allVariables; 
    if (log.isDebugEnabled) {
        log.debug('Failed Variables: ', failedVariables); 
    }

    startFlippingValues(model, optionChanged, failedVariables, allVariables);
    
    if (!flipValuesExhausted) {
        callRulesEngineByValidationOrder(model); 
    }
    if (!flipValuesExhausted)
        validationSucceeded = true; 
    
    updateDisplayValues(targetRow, model, pristineCopy);
    updateDisplay();  
}


function updateDisplay(targetRow) {
    
    updateRowColor(targetRow); 
     
    if (validationFailureMessage) {
        targetRow.setAttribute('data-validation-message', validationFailureMessage);  
    }
    else {
        targetRow.setAttribute('data-validation-message', '');
    }
    
    displayValidationResult(targetRow); //Error msg, or in case of successful validation, NO message 

}



function updateRowColor(targetRow) {

    if (validationSucceeded) {
        targetRow.classList.remove('invalid');
    }
    else {
        targetRow.classList.add('invalid');    
    }    
}



function callRulesEngineByValidationOrder(line) {
    for (let optionObj of options) {
        if (doneFlipOptions.has(optionObj.name))
            continue; 
    

        var result = ruleFlow(line, optionObj.name); 
        
        //TODO: There are 2 more option types : for Drawings 

        if (result.isavailable)
            continue; 

        if (!result.isavailable && optionObj.type == 'Value') {
            flipValuesExhausted = true; //Can't flip a numeric value !! 
            return; 
        }

        var failedVariables = result.failedVariables;
        var allVariables = result.allVariables; 
        
        startFlippingValues(line, optionObj.name, failedVariables, allVariables);
        if (flipValuesExhausted) //No point continueing 
            return; 
    }

    // TODO: if actuator was not modifed by flippig, sort actator by add on value 
    
    //TODO: sort (non-actutator) values for display? 
}





//Take a model and add all the attributes required by Engineering Calcs 
function enrichModel(model) {

    for (var key in model) {
        if (!model.hasOwnProperty(key)) {
            continue; 
        }

        var option = optionMap[key];

        if (!option) continue; //Not an option at all; maybe Qty or Tag. TODO: THis can be checked for to avoid lookup 
        
        var value = null;
        if (option.type == "Value") {
            value = option.values[0];
        }
        if (option.type == "List") {
            console.log("list"); 
            value = findValue(option.values, model[key]);
        }

        //findValue(option.values, model[key]);
        model[option.displayName] = model[key]; 
        model[option.displayName + ' Guid'] = value.valueGuid; 
        model[option.displayName + ' MVG'] = value.modelValueGuid;
        model[option.displayName + ' VALUETEXT'] = value.valueText; 

        //Copy all values specific to CD35 
        Object.assign(model, Line_Header); 

        Object.assign(model, productProperties);
        Object.assign(model, properties); 
    }

}

function findValue(values, valueToFind) {
    for (var i = 0; i < values.length; i++) {
        if (values[i].name == valueToFind) {
            return values[i]; 
        }    
    }
}




// Builds the HTML Table from the JSON Metadata
 function buildHtmlTable(options) {
    
   var columns;
    
    table = _table_.cloneNode(false),
         columns = addAllColumnHeaders(options, table);
         
    table.addEventListener('focusin',  onFocus);
    table.addEventListener('mousedown',  clickHandler);
    table.addEventListener('focusout',  afterCellUpdate);
    table.addEventListener('change',  afterCellUpdate);
    table.addEventListener('contextmenu', contextMenuHandler); 
    $(document).bind("click", function(event) {
        document.getElementById("rmenu").className = "hide";
    });
    var fillDown = document.getElementById('filldown');
    fillDown.addEventListener('click', filldown);
    
    var div1 = document.getElementById('div1');
    div1.appendChild(table);
    loadRules();
    bindKeys();

    return table;
 }
 

function createRow() {

    let options = optionsSortedByValidationOrder; 

    var tr = _tr_.cloneNode(false);

    var td = _td_.cloneNode(false);
    var lineItem = modelId + '-' + counter;
    counter++; 
    td.appendChild(document.createTextNode(lineItem));
	td.setAttribute("id", lineItem); 
    tr.appendChild(td);

    td = _td_.cloneNode(false);
    var ninput = document.createElement("INPUT");
    ninput.setAttribute("type", "number");    
    ninput.setAttribute("data-option", 'qty'); 
    ninput.value = 1;
    ninput.size = 2; 
    td.appendChild(ninput);
    tr.appendChild(td);

    td = _td_.cloneNode(false);
    var ninput = document.createElement("INPUT");  
    ninput.setAttribute("data-option", 'tag');
    td.appendChild(ninput);
    tr.appendChild(td);

    for (var i=0; i < options.length; ++i) {
        var x = options[i];
        td = _td_.cloneNode(false);
        if (x.type == 'Value') {
            var ninput = document.createElement("INPUT");
            ninput.setAttribute("type", "number");    
            ninput.setAttribute("data-option", x.name);
            ninput.value = 0;
            td.appendChild(ninput);

        }
        if (x.type == 'List') {
            var sel = document.createElement("SELECT");
            sel.setAttribute("data-option", x.name);
            var opts = x.values;
            for (var j = 0; j < opts.length; j++) {
                var value = document.createElement("option");
                value.value = opts[j].name;
                value.text = opts[j].name;
                //option.className = 'red';
                sel.appendChild(value);
            }

            td.appendChild(sel);
        }
        tr.appendChild(td);
    }
    table.appendChild(tr);
    return tr;

}

 
// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table)
{

    var tr = _tr_.cloneNode(false);

    var th = _th_.cloneNode(false);
    th.appendChild(document.createTextNode('Line Item'));
    tr.appendChild(th);

    th = _th_.cloneNode(false);
    th.appendChild(document.createTextNode('Qty'));
    tr.appendChild(th);
    
    th = _th_.cloneNode(false);
    th.appendChild(document.createTextNode('Tag'));
    tr.appendChild(th);

    for (var i=0; i < arr.length; i++) {
        th = _th_.cloneNode(false);

        th.appendChild(document.createTextNode(arr[i].displayName));
        tr.appendChild(th);
    }
    table.appendChild(tr);
}


function validateListOption() {

    var result = validateOptionValue();
    if (!result.isValid) {
        startFlippingOptions(); 
    }

}






