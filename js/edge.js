


var _table_ = document.createElement('table'),
    _tr_ = document.createElement('tr'),
    _th_ = document.createElement('th'),
    _td_ = document.createElement('td');


var options = null;
var properties = null;    
var model = 'CD35';
var counter = 1; 

var table;
$(document).ready(function() {

    loadModelMetadata();

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

            if (!e.metaKey) return; 

            if (e.metaKey)    
                addRow();

            $next = $active
                .closest('tr')
                .next()                
                .find('td:nth-child(' + position + ')')
                .find(focusableQuery);
            
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
            buildHtmlTable(xmlHttp.response);
    }
    xmlHttp.open("GET", '/product/CD35', true); // true for asynchronous 
    xmlHttp.send(null);

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



function blurHandler(event) {
    //alert('validating...');
    console.log('validing...');
    document.getElementById("msg").innerHTML = '';

    var model = {}; 
    $.extend(model, properties);
    
    var sel = event.target;
    var target = sel;
    
    while (target && target.nodeName !== "TR") {
        target = target.parentNode;
    }
    if (target) {
        var cells = target.getElementsByTagName("td");
        for (var i = 0; i < cells.length; i++) {
            var el = cells[i].firstElementChild;
            if (el == null) continue; 
            var option = el.getAttribute('data-option');
            var value = el.value;
            model[option] = value;
        }
    }
    console.log(model);
    var result = validateModel(model);
    if (!result.isavailable) {
        document.getElementById("msg").innerHTML = result.message;
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
    console.log(model);

    //Get all the options from the Select control 
    var values = [];
    var options = sel.options;
    for (i = 0; i < options.length; i++) {
        values.push( { valueName : options[i].value, isavailable : true } );
    }
    console.log(JSON.stringify(values));
    validateOption(model, option, values);
    console.log(JSON.stringify(values));
    
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
}


// Builds the HTML Table out of myList json data from Ivy restful service.
 function buildHtmlTable(arr) {

    arr = JSON.parse(arr);
    options = arr.options;
    properties = arr.properties; 
    var columns;

    table = _table_.cloneNode(false),
         columns = addAllColumnHeaders(options, table);
         
    var tr = createRow(options);    
    table.appendChild(tr);

    table.addEventListener('mousedown',  clickHandler);
    table.addEventListener('focusout',  blurHandler);
    var div1 = document.getElementById('div1');
    div1.appendChild(table);
    loadRules();
    bindKeys();

    return table;
 }
 

function addRow() {
    var tr = createRow(options);
    table.appendChild(tr);
}


function createRow(options) {

    var tr = _tr_.cloneNode(false);

    var td = _td_.cloneNode(false);
    var lineItem = model + '-' + counter;
    counter++; 
    td.appendChild(document.createTextNode(lineItem));
    tr.appendChild(td);

    td = _td_.cloneNode(false);
    var ninput = document.createElement("INPUT");
    ninput.setAttribute("type", "number");    
    ninput.setAttribute("data-option", 'qty'); 
    ninput.value = 1;
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
        if (x.type == 'NUMERIC') {
            var ninput = document.createElement("INPUT");
            ninput.setAttribute("type", "number");    
            ninput.setAttribute("data-option", x.name);
            ninput.value = 0;
            td.appendChild(ninput);

        }
        if (x.type == 'SELECT') {
            var sel = document.createElement("SELECT");
            sel.setAttribute("data-option", x.name);
            var opts = x.values;
            for (var j = 0; j < opts.length; j++) {
                var value = document.createElement("option");
                value.value = opts[j];
                value.text = opts[j];
                //option.className = 'red';
                sel.appendChild(value);
            }

            td.appendChild(sel);
        }
        tr.appendChild(td);
    }
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


