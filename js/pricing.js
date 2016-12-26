
var currentRequest = null; 

function price(line) {
    
    let pricingXML = buildPricingRequest(line);     
    
    let pricingRequest = 
        {
            Pricing : pricingXML, 
            CD35_Properties: job.CD35_Properties,
            Products_CD35_Writable : job.Products_CD35_Writable
        };

    console.log(pricingRequest); 

    currentRequest = jQuery.ajax({
        type: 'POST',
        data: JSON.stringify(pricingRequest),
        contentType: 'application/json; charset=utf-8',
        url: '/pricing/' + modelId,
        beforeSend : function()    {           
            if(currentRequest != null) {
                currentRequest.abort();
            }
        },
        success: function(data) {
            console.log(data); 
        // Success
        },
        error:function(e){
        // Error
        },
        dataType: "text"
    });
}


/*start of pricing logic*/
function buildPricingRequest(line) {
    //build array of pricing objects

    var pricing = [];
   
    for (var current in line) {
        if (line.hasOwnProperty(current)) {
            switch (current.toUpperCase()) {
                //skip this options
                case "PRODUCT_ORIGINAL_NAME":
                case "LINEITEMID":
                case "LINEITEMGUID": 
                case "RELEASE_NUMBER": 
                case "IN_ERROR": 
                case "NO_PRICING": 
                case "ERROR_MESSAGE": 
                case "COMMENTS": 
                case "BRAND_NAME": 
                case "PRODUCT_NAME":
                case "BRAND_GUID": 
                case "PRODUCT_GUID":
                case "IS_RELEASED": 
                case "QUANTITY":
                case "QTY":
                case "TAG":
                    break;
                default:
                    //only look at option columns
                    if (!current.endsWith("UOM") && !current.endsWith("ISQE") && !current.endsWith("VALUETEXT") && current.indexOf("_") == -1) {
                        var record = optionMap[current];
                        if (typeof record !== "undefined") {
                            pricing.push(getPricingEntry(product, line, current, record));
                        }
                    }
                    break;
            }
        }
    }
    var result = buildInputXml(job, product, line, pricing);
    return result; 
}


/*builds xml for pricing request*/
function buildInputXml(job, product, line, pricing) {
    var outputXml;
    var profit_type = "MarkUp";
    var default_marketing = "STANDARD";
    var marketing_code = "STANDARD";
    var discount_category = "B1";
    var freight = 0;
    var account_no = "5600";
    var version = "2014.0.348";
    var currency = "USD";
    //start root node lineitem
    var xmlData = "<?xml version=\"1.0\" encoding=\"utf-16\" standalone=\"yes\"><lineitem>";
    //lineitem_info start
    xmlData += "<lineitem_info ";
    //add all lineitem_info attributes
    xmlData += xmlattr("model_name", product.Product_Name);
    xmlData += xmlattr("model_guid", product.Product_GUID);
    xmlData += xmlattr("account_number", account_no);
    xmlData += xmlattr("marketing_program", default_marketing);
    xmlData += xmlattr("lineitem_qty", line.qty);
    xmlData += xmlattr("discount_category", discount_category);
    xmlData += xmlattr("model_base_price", 0.0);
    xmlData += xmlattr("model_unit_price", 0.0);
    xmlData += xmlattr("item_id", line.LineItemId);
    xmlData += xmlattr("express_percent", 0.0);
    xmlData += xmlattr("markup", 0.0);
    xmlData += xmlattr("exe_version", version);
    xmlData += xmlattr("version_mode", "Test");
    xmlData += xmlattr("currency", currency);
    xmlData += ">"; //close lineitem_info tag

    for (var i = 0; i < pricing.length; i++) {
        xmlData += xmlpricecol(pricing[i]);
    }

    xmlData += "</lineitem_info >";//lineitem_info end
    xmlData += "</lineitem>"; //close root node lineitem
    return xmlData; 

}
/*lookup option record from collection*/
function getOptionRecord(details, current) {
    var retval;
    for (var i = 0; i < details.length; i++) {
        if (details[i]["displayName"] == current.toUpperCase()) {
            retval = details[i];
            break;
        }
    }
    return retval;
    
}
/*build pricing entry from option information*/
function getPricingEntry(product, line, option, detail) {
    var retval = [];
    try {
    retval["ModelName"] = product.Product_Name;
    retval["ModelGUID"] = product.Product_GUID;
    retval["BrandName"] = product.Product_Brand;
    retval["BrandGUID"] = product.Product_Brand_GUID;
    retval["LineItemGUID"] = line.LineItemGuid;
    retval["IsReleased"] = line["Is_Released"];
    retval["Quantity"] = line.qty;
    retval["LineStatus"] = line.In_Error;
    if (detail.type == "List") {
        for (var i = 0; i < detail.values.length; i++) {
            if (detail.values[i].name == line[option]) {
                retval["ValueName"] = detail.values[0].name;
                retval["ModelValueGUID"] = detail.values[0].modelValueGuid;
                retval["ValueGUID"] = detail.values[0].valueGuid;
                retval["ValueEntered"] = 0;
                break;
            }
        }
    } else {
        if (detail.values.length == 1) {
            retval["ValueName"] = detail.values[0].name;
            retval["ModelValueGUID"] = detail.values[0].modelValueGuid;
            retval["ValueGUID"] = detail.values[0].valueGuid;
            retval["ValueEntered"] = line[option];
        }
    }
    retval["OptionGUID"] = detail.optionGuid;//lookup from Option table
    retval["ModelOptionGUID"] = detail.modelOptionGuid;//lookup from Option table
    retval["OptionName"] = detail.displayName;
    retval["RuleVariableName"] = detail.name;//lookup from Option table
    retval["OptionType"] = detail.type.toLowerCase();//lookup from Option table
    retval["QuickEntry"] = false; //lookup from Option table
    } catch (err) {
        console.log(err);
    }
    return retval;
}


/*xml methods*/
function xmlpricecol(pricing) {
    try{
    var node = "<col>";
    node += "<option_guid>" + pricing.OptionGUID + "</option_guid>";
    node += "<option_name>![CDATA[" + pricing.OptionName + "]]</option_name>";
    node += "<rule_variable_name>" + pricing.RuleVariableName + "</rule_variable_name>";
    node += "<option_type_name>" + pricing.OptionType + "</option_type_name>";
    if (pricing.OptionType == "list") {
        node += "<model_value_guid>" + pricing.ModelValueGUID + "</model_value_guid>";
        node += "<value_guid>" + pricing.ValueGUID + "</value_guid>";
        node += "<value_name>![CDATA[" + pricing.ValueName + "]]</value_name>";
    } else {
        node += "<model_value_guid />";
        node += "<value_guid />";
        node += "<value_name>![CDATA[]]</value_name>";
    }
    node += "<value_entered>" + pricing.ValueEntered + "</value_entered>";
    node += "</col>"
    }
    catch (err) {
        console.log(err);
    }
    return node;
}
function xmlattr(name, value) {
    return name + "=\"" + value + "\" ";
}
