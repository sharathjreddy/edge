function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
       return evt.clientX + (document.documentElement.scrollLeft ?
           document.documentElement.scrollLeft :
           document.body.scrollLeft);
    } else {
        return null;
    }
}

function displayValidationResult(targetRow) {

    var msg1 = document.getElementById('msg'); 
    var validationFailureMessage = targetRow.getAttribute('data-validation-message');
    if (validationFailureMessage) {
        msg1.innerHTML = validationFailureMessage; 
        msg1.setAttribute('class', 'my-notify-error');
    }
    else {
        msg1.innerHTML = 'Validation Successful'; 
        msg1.setAttribute('class', 'my-notify-success');
    } 
        
}


function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
       return evt.clientY + (document.documentElement.scrollTop ?
       document.documentElement.scrollTop :
       document.body.scrollTop);
    } else {
        return null;
    }
}

function copy( original )  
{
    // First create an empty object
    // that will receive copies of properties
    var clone = {} ;

    var key ;

    for ( key in original )
    {
        // copy each property into the clone
        if (original.hasOwnProperty[key])
          clone[key] = original[key] ;
    }

    return clone ;
}

//Retrieve URL parameters 
function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function hideSpinner() {
  document.getElementById('spinner').style.display = 'none'; 
}

function showSpinner() {
  document.getElementById('spinner').style.display = 'flex'; 
  //hide validation error msg, Pricing text
  //document.getElementById('msg').style.display = 'none';
  document.getElementById('pricing_text').style.display = 'none';
}