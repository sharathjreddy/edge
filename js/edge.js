
var myList = [ 
                { "name" : "HEIGHT", "type" : "NUMERIC" },
                { "name" : "ACT_TYPE", "type" : "SELECT", "values" : [ 'NONE', 'HAND QUAD', '' ] },
                { "name" : "ACTUATOR", "type" : "SELECT", "values" : [ 'NONE',  'HQRSS050', 'HDHQ100', 'RH120', 'RLH120', 'LF120', 'MA418', 'LF24' ] }
             ];

var _table_ = document.createElement('table'),
    _tr_ = document.createElement('tr'),
    _th_ = document.createElement('th'),
    _td_ = document.createElement('td');


var table;
$(document).ready(function() {
    table = buildHtmlTable(myList);
    table.addEventListener('change',  changeHandler);
    table.addEventListener('mousedown',  clickHandler);
    var div1 = document.getElementById('div1');
    div1.appendChild(table);
});

//Capture all the values in the row 
//Get the name of the option 
//Invoke the Rules Handler
function changeHandler() {
    //alert('on change');
    for (var c = 0, m = table.rows[1].cells.length; c < m; c++) {
        console.log(table.rows[1].cells[c].childNodes[0].value);
    }

    var model = { height : 9  };
    ruleHandler(null, model);
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
            var option = el.getAttribute('data-option');
            var value = el.value;
            model[option] = value;
        }
    }
    console.log(model);

    //Get all the options from the Select control 
    var values = [];
    var options = sel.options;
    for (i = 0; i < options.length; i++) {
        values.push( { valueName : options[i].value, isAvailable : true } );
    }
    console.log(JSON.stringify(values));
    validate(model, option, values);
    console.log(JSON.stringify(values));

    //TODO: update the Grid with the availability results 
    for (i = 0; i < values.length; i++) {
        if (!values[i].isAvailable) {
            sel.options[i].style.backgroundColor = 'red';
            sel.options[i].disabled = true;
        }
        else {
            sel.options[i].style.backgroundColor = 'white';
            sel.options[i].disabled = false;    
        }
    }
}

// Builds the HTML Table out of myList json data from Ivy restful service.
 function buildHtmlTable(arr) {
     var table = _table_.cloneNode(false),
         columns = addAllColumnHeaders(arr, table);

        var tr = _tr_.cloneNode(false);
        for (var i=0; i < arr.length; ++i) {
            var x = arr[i];
            var td = _td_.cloneNode(false);
            if (x.type == 'NUMERIC') {
                var ninput = document.createElement("INPUT");
                ninput.setAttribute("type", "number");    
                ninput.setAttribute("data-option", x.name);
                td.appendChild(ninput);
            }
            if (x.type == 'SELECT') {
                var sel = document.createElement("SELECT");
                sel.setAttribute("data-option", x.name);
                var opts = x.values;
                for (var j = 0; j < opts.length; j++) {
                    var option = document.createElement("option");
                    option.value = opts[j];
                    option.text = opts[j];
                    //option.className = 'red';
                    sel.appendChild(option);
                }

                td.appendChild(sel);
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
     
     return table;
 }
 
// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table)
{

    var tr = _tr_.cloneNode(false);
    for (var i=0; i < arr.length; i++) {
        var th = _th_.cloneNode(false);
        th.appendChild(document.createTextNode(arr[i].name));
        tr.appendChild(th);
    }
    table.appendChild(tr);
}


