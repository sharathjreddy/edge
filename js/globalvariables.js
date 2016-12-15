//List of options sorted by display order; 
var options; 
//Map of options : the key is the option rule name 
var optionMap; 
var product; 
var job; 
var actuatorMappings;
var log = log4javascript.getDefaultLogger();
log.setLevel(log4javascript.Level.TRACE);
//log.debug('Debug level');
//if (log.isTraceEnabled())
//	log.trace('Trace Level');
var Line_Header = {
	"Product_Original_Name": "CD35",
    "LineItemId": 1,
    "LineItemGuid": "CD35-1",
    "Release_Number": "",
    "In_Error": false,
    "No_Pricing": false,
     "Error_Message": "",
     "Comments": null,
     "Brand_Name": "Ruskin",
     "Product_Name": "CD35",
     "Brand_Guid": "b3b720e0-31bc-4f20-976a-e1fe4fe2143a",
     "Product_Guid": "dec66cc1-18bc-4cb2-83d3-77b01c84ebf2",
     "Is_Released": false
};

var productProperties; //Properties need by the Rules Engine


