 var options = [


{ "name":"WIDTH","type":"NUMERIC", },
{ "name":"HEIGHT","type":"NUMERIC", },
{ "name":"SIZE","type":"SELECT","values":['Deduct 1/4'] },
{ "name":"FRAME","type":"SELECT","values":['CHANNEL','FRONT FLANGE','REAR FLANGE','DOUBLE FLANG','T-FLANGE','U CHANNEL','C STYLE','CO STYLE','CR STYLE'] },
{ "name":"BLADE SEALS","type":"SELECT","values":['NEOPRENE'] },
{ "name":"OPER.SHAFT","type":"SELECT","values":['EXTENDED','NONE'] },
{ "name":"ACT_TYPE","type":"SELECT","values":['NONE','HAND QUAD','ELECTRIC/120 VOLT','ELECTRIC/24 VOLT','ELECTRIC/230 VOLT','PNEUMATIC','120 VOLT W/SWITCH','24 VOLT W/SWITCH','24 VOLT MODULATING','230 VOLT W/SWITCH','PNEU MODULATING'] },
{ "name":"ACTUATOR","type":"SELECT","values":['NONE','HQRSS050','HDHQ100','HDHQ050','HQR050B','HQR050','M9220-BAA-RK','RH120','FSLF120-RUS','NFBUP-RUS','MS4120','RLH120','AFBUP','FSTF120-RUS','M9208-BAA-RK','LF120','AFBUP-RUS','M9203-BUA-RK','MA418','NFBUP','NFB24','LF24','MA318','AFB24','MS8120','RLH24','M9203-BGA-RK','M9208-BGA-RK','FSTF24','GCA121','RH24','GCA126','M9220-BGA-RK','FSLF24','TFB24','331-3060P','331-2961','331-4827P','331-4827','331-2961P','331-3060','M9203-BUB-RK','M9220-BAC-RK','FSTF120-S','MS4120S','TFB120-S','RLH120-S','NFBUP-S','M9208-BAC-RK','AFBUP-S','RH120-S','LF120-S','MA418-500','GCA226','FSLF120S','RLH24-S','MA318-500','MS8120S','FSTF24-S','RH24-S','NFB24-S','FSLF24S','LF24-S','AFB24S','M9220-BGC-RK','M9208-BGC-RK','TFB24-S','M9203-GGA-RK','TFB24SR-RUS','TFB24-SR','RLH24-MOD','M9208-GGA-RK','RH24-MOD','GCA161','NFB24-SR','AFB24SR','LF24SR-RUS','M9220-GGA-RK','LF24-SR','MS7520A2015','FSTF230','FSTF230-S'] },
{ "name":"ACTUATOR BRAND","type":"SELECT","values":['BELIMO'] },
{ "name":"FAIL POS.","type":"SELECT","values":['N/A','CLOSE','OPEN','IN PLACE'] },
{ "name":"INSTALLATION","type":"SELECT","values":['N/A','IN','OUT'] },
{ "name":"SIDE PLATE","type":"SELECT","values":['NO','YES'] },
{ "name":"FRAME GAUGE","type":"SELECT","values":['16 GA.','.125 ALUM','14 GA. U CHANNEL','12 GA. U CHANNEL'] },
{ "name":"FRM MATERIAL","type":"SELECT","values":['GALV.STEEL','304 SS','ALUMINUM'] },
{ "name":"BLADE WIDTH","type":"SELECT","values":['3 1/2 Inch WIDE'] },
{ "name":"Slv/Tran","type":"SELECT","values":['None','SLEEVE'] },
{ "name":"Slv/Tran Len","type":"SELECT","values":['N/A','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','8','9','10','11'] },
{ "name":"Slv_Tran_Ga","type":"SELECT","values":['N/A','20 Gauge','18 Gauge','16 Gauge','14 Gauge','10 Gauge','.080 Inch','.125 Inch'] },
{ "name":"Slv/Tran Mat","type":"SELECT","values":['N/A','GALVANIZED','304 SS','ALUMINUM'] },
{ "name":"CONSTRUCTION","type":"SELECT","values":['304 SS','STANDARD GALV','ALUM/GALV'] },
{ "name":"MTG.HOLES","type":"SELECT","values":['FRONT FLANGE','REAR FLANGE','BOTH SIDES'] },
{ "name":"BLADE ACTION","type":"SELECT","values":['OPPOSED'] },
{ "name":"LINKAGE","type":"SELECT","values":['CONCEALED'] },
{ "name":"FRAME DEPTH","type":"SELECT","values":['5 INCHES','3 1/2 INCHES','6 INCHES'] },
{ "name":"BEARING TYPE","type":"SELECT","values":['THRUST- VERT BLADES'] },
{ "name":"BEARING MAT.","type":"SELECT","values":['STANDARD','SS'] },
{ "name":"LNKG. MATRL","type":"SELECT","values":['STANDARD','STAIN. STEEL'] },


];


var _table_ = document.createElement('table'),
    _tr_ = document.createElement('tr'),
    _th_ = document.createElement('th'),
    _td_ = document.createElement('td');


var table;
$(document).ready(function() {
    table = buildHtmlTable(options);
    //table.addEventListener('change',  changeHandler);
    table.addEventListener('mousedown',  clickHandler);
    table.addEventListener('focusout',  validateModel);
    var div1 = document.getElementById('div1');
    div1.appendChild(table);
    loadRules();
    bindKeys();
});



function bindKeys() {

    $(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        break;

        case 38: // up
        break;

        case 39: // right
        break;

        case 40: // down
        break;

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
   });


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

function validateModel(event) {
    //alert('validating...');
    console.log('validing...');

    var model = {}; 
    var sel = event.target;
    var target = sel;
    
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
    doValidate(model);
}


function doValidate(model) {

    model.ModelMinWidth = 5;
    model.ModelMaxWidth = 100;

    //for each option, validate all the event types 
    var result; 

    for (let option of options) {
        if (rules.hasOwnProperty(option.name)) {
            var optionRules = rules[option.name];
            var val = model[option.name];

            if (optionRules.hasOwnProperty('GlobalOption Value Available')) {
                result = optionRules['GlobalOption Value Available'](model);
                console.log(result.Message);
            }
            if (optionRules.hasOwnProperty('Global Value Available')) {
                var globalValueFunctions = optionRules['Global Value Available'];
                if (globalValueFunctions.hasOwnProperty(val)) {
                    result = optionRules['Global Value Available'][val](model);
                    console.log(result.Message);
                }
            }
        }
    }


}




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
        values.push( { valueName : options[i].value, isAvailable : true } );
    }
    console.log(JSON.stringify(values));
    validate(model, option, values);
    console.log(JSON.stringify(values));

    //TODO: update the Grid with the availability results 
    for (i = 0; i < values.length; i++) {
        if (!values[i].ListValueColor == 'red') {
            sel.options[i].style.backgroundColor = 'pink';
            sel.options[i].disabled = true;
        }
        else if (!values[i].IsAvailable){
            sel.options[i].style.backgroundColor = 'grey';
            sel.options[i].disabled = false;    
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


