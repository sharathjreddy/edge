/*Private Variables*/
var _lineGuid = null;
var _modelName = null;
var _modelProp = [];
var _jobdata = null;
var _fdWidthAdd = 0;
var _hPrime = 0;
var _bLnSectionsHighOverride = false;
var _iSectionHighOverride = 0;
/*Public Properties*/
this.getModelProperties = function () {
    return _modelProp;
}
/*Public Methods*/
this.setSectionCalcs = function (job, product, line, option, value) {
    if (_jobdata == null) {
        _jobdata = job;
    }
    //update line value
    line[option.toUpperCase()] = value;
    line[option.toUpperCase()+ ' UOM'] = value;
    //check if line has changed
    checkInstance(product, line);
    //calcuate sections
    calculateSections(product);
    var propertyTable = "Products_" + _modelName + "_Writable";
    if (typeof _jobdata[propertyTable] !== "undefined") {
        updatePropertyTable(propertyTable, product.Product_GUID, "SectionsWide", "Model", line.LineItemGuid, _modelProp["SectionsWide"]);
        updatePropertyTable(propertyTable, product.Product_GUID, "SectionsTall", "Model", line.LineItemGuid, _modelProp["SectionsTall"]);
        updatePropertyTable(propertyTable, product.Product_GUID, "SectionsDeep", "Model", line.LineItemGuid, _modelProp["SectionsDeep"]);
        updatePropertyTable(propertyTable, product.Product_GUID, "SectionsDetail", "Model", line.LineItemGuid, _modelProp["SectionsDetail"]);
        if (_modelProp["UL_Validation_Table"] != "") {
            updatePropertyTable(propertyTable, product.Product_GUID, "MaxSectionWidth", "Model", line.LineItemGuid, _modelProp["MaxSectionWidth"]);
            updatePropertyTable(propertyTable, product.Product_GUID, "MaxSectionHeight", "Model", line.LineItemGuid, _modelProp["MaxSectionHeight"]);
            updatePropertyTable(propertyTable, product.Product_GUID, "ModelMinWidth", "Model", line.LineItemGuid, _modelProp["MinWidth"]);
            updatePropertyTable(propertyTable, product.Product_GUID, "ModelMinHeight", "Model", line.LineItemGuid, _modelProp["MinHeight"]);
            updatePropertyTable(propertyTable, product.Product_GUID, "ModelMaxWidth", "Model", line.LineItemGuid, _modelProp["MaxHeight"]);
            updatePropertyTable(propertyTable, product.Product_GUID, "ModelMaxHeight", "Model", line.LineItemGuid, _modelProp["MaxHeight"]);
            var overallSizeWidth = parseInt(_modelProp["WIDTH"]) + parseInt(_modelProp["WidthAdd"]);
            updatePropertyTable(propertyTable, product.Product_GUID, "OverallSizeWidth", "Model", line.LineItemGuid, overallSizeWidth);
            var hprime = 0;
            if (typeof _modelProp["HPrime"] !== "undefined") { hprime = parseInt(_modelProp["HPrime"]); }
            var overallSizeHeight = parseInt(_modelProp["HEIGHT"]) + hprime;
            updatePropertyTable(propertyTable, product.Product_GUID, "OverallSizeHeight", "Model", line.LineItemGuid, overallSizeHeight);
        }
    }
}
this.setActuatorQuantity = function (job, product, line) {
    if (_jobdata == null) {
        _jobdata = job;
    }
    //method parameters
    var writeTable;
    var readTable;
    var perimeterInterval;
    var actuator = _modelProp["ACTUATOR"];
    var actuatorGUID = _modelProp["ACTUATOR MVG"];
    var actuatorQty;
    //check if line has changed
    checkInstance(product, line);
    //kick out if actuator is null
    if (actuator == null) { return; }
    else {
        if (actuator == "" ) { return ;}
    }
    if (actuator.toUpperCase().startsWith("OTH")) { return; }
    var propertyWritable = "Products_" + _modelName + "_Writable";
    var propertyReadable = _modelName + "_Properties";
    if (typeof _jobdata[propertyWritable] !== "undefined" && actuatorGUID != "") {
        //get form write properties
        //writeTable = _jobdata[propertyWritable];
        _modelProp["MaxWidth"] = getPropertyValue(propertyWritable, actuatorGUID, "Model_Value", _lineGuid, "MaxWidth");
        _modelProp["MaxHeight"] = getPropertyValue(propertyWritable, actuatorGUID, "Model_Value", _lineGuid, "MaxHeight");
        _modelProp["MaxArea"] = getPropertyValue(propertyWritable, actuatorGUID, "Model_Value", _lineGuid, "MaxArea");
        _modelProp["MaxAreaWithSeals"] = getPropertyValue(propertyWritable, actuatorGUID, "Model_Value", _lineGuid, "MaxAreaWithSeals");
        //get from read properties
        //readTable = _jobdata[propertyReadable];
        _modelProp["PerimeterInterval"] = getPropertyValue(propertyReadable, actuatorGUID, "Model_Value", _lineGuid, "PerimeterInterval");
        _modelProp["MaxArea"] = getPropertyValue(propertyReadable, actuatorGUID, "Model_Value", _lineGuid, "MaxArea");
    }
    var dataTable; 
    if (actuator.toUpperCase() == "NONE") { actuatorQty = 0; }
    else if (_modelProp["PCategory"].toUpperCase() == "CONTROL DAMPERS" && _modelProp["CCategory"].toUpperCase().includes("INDUSTRIAL") == false) {
        dataTable = lookupActuatorCalcPropertyCD(_modelName, actuator);
        if (dataTable == null || dataTable.length == 0) {
            //do nothing
        }
        else {
            _modelProp["MaxWidth"] = dataTable[0]["MaxWidth"];
            _modelProp["MaxHeight"] = dataTable[0]["MaxHeight"];
            _modelProp["MaxArea"] = dataTable[0]["Oper_SqFt_WO_Seals"];
            _modelProp["MaxAreaWithSeals"] = dataTable[0]["Oper_SqFt_Seals"];
            _modelProp["PerimeterInterval"] = dataTable[0]["MaxQty"];
            if (parseInt(_modelProp["WIDTH"]) < parseInt(dataTable[0]["MinWidth"]) || parseInt(_modelProp["HEIGHT"]) < parseInt(dataTable[0]["MinHeight"])) {
                actuatorQty = -1;
            }
            else {
                actuatorQty = getActuatorQuantity();
            }
        }
    }
    else if (_modelProp["PCategory"].toUpperCase() == "FIRE/SMOKE DAMPERS" || _modelProp["PCategory"].toUpperCase() == "SMOKE DAMPERS") {
        //model, actuator, fail, static_press, velocity, assembly, mounting)
        dataTable = lookupActuatorCalcPropertyFSD(_modelName, actuator, _modelProp["FAIL POS."], _modelProp["STATIC PRESSURE"], _modelProp["VELOCITY"],
                                                   _modelProp["ASSEMBLY TEMP"], _modelProp["MOUNTING"]);
        if (dataTable == null || dataTable.length == 0) {
            //do nothing
        } else if (dataTable.length == 1) {
            _modelProp["MaxWidth"] = dataTable[0]["Oper_Sec_Width"];
            _modelProp["MaxHeight"] = dataTable[0]["Oper_Sec_Height"];
            _modelProp["MaxAreaWithSeals"] = dataTable[0]["Oper_SqFt_Seals"];
            _modelProp["ActQuantityPerSection"] = dataTable[0]["Actuator_Qty_Sec"];
            _modelProp["TotalNumOperSections"] = dataTable[0]["Total_Num_Sec"];
            _modelProp["OperatingSectionsWide"] = dataTable[0]["Max_Oper_Width"];
            _modelProp["OperatingSectionsTall"] = dataTable[0]["Max_Oper_Height"];
            actuatorQty = getActuatorQuantity();
        } else if (dataTable.length > 1) {
            var tmpActQty = 0
            var tmpSectWidth = 0;
            var tmpSectHeight = 0;

            for (var i = 0; i < dataTable.length; i++) {
                _modelProp["MaxWidth"] = dataTable[i]["Oper_Sec_Width"];
                _modelProp["MaxHeight"] = dataTable[i]["Oper_Sec_Height"];
                _modelProp["MaxAreaWithSeals"] = dataTable[i]["Oper_SqFt_Seals"];
                _modelProp["ActQuantityPerSection"] = dataTable[i]["Actuator_Qty_Sec"];
                _modelProp["TotalNumOperSections"] = dataTable[i]["Total_Num_Sec"];
                _modelProp["OperatingSectionsWide"] = dataTable[i]["Max_Oper_Width"];
                _modelProp["OperatingSectionsTall"] = dataTable[i]["Max_Oper_Height"];
                actuatorQty = getActuatorQuantity();

                if (tmpActQty > actuatorQty || tmpActQty == 0) {
                    if (actuatorQty != -1) { tmpActQty = actuatorQty;}
                }
            }
            if (tmpActQty == 0) { actuatorQty = -1 }
            else { actuatorQty = tmpActQty }
        }
        else {
            actuatorQty = getActuatorQuantity();
        }

        if (actuator.toUpperCase() != "NONE" && actuatorQty == 0) { actuatorQty = -1;}
        updatePropertyTable(propertyWritable, product.Product_GUID, "ActuatorQuantity", "Model", line.LineItemGuid, actuatorQty);
    }

}
this.setActuatorQuantityValue = function (job, product, line, value) {
    var propertyWritable = "Products_" + _modelName + "_Writable";
    updatePropertyTable(propertyWritable, product.Product_GUID, "ActuatorQuantity", "Model", line.LineItemGuid, value);
}
this.calculateActuatorQuantity = function (job, product, line) {
    setActuatorQuantity(job, product, line);
    return getPropertyValue("Products_" + _modelName + "_Writable", product.product_Guid, "Model", line.LineItemGuid, "ActuatorQuantity");
}
this.calculateAirMeasuringUnitLimits = function(productName, controlTransVal, itemWidth, itemHeight, option, lowLimitCFM, designLimitCFM, highLimitCFM, error) {
    try {
        var freeArea = 0;
        var iWidth = 0;
        var iHeight = 0;
        var lDefaultLowLimitCFM = 0;
        var lDefaultHighLimitCFM = 0;
        var lDefaultDesignLimitCFM = 0;
        var iError = 0;
        var retval = [];
        //set return values
        retval["IsValid"] = false;
        retval["LowLimit"] = 0;
        retval["HighLimit"] = 0;
        retval["DesignLimit"] = 0;
        retval["ErrorMessage"] = "";

        var bHasController = airMeasuringUnitHasController(productName, controlTransVal);
        switch (productName.toUpperCase){
            case "AMS050":
            case "PVDS050X":
                lDefaultLowLimitCFM = Math.ceil((((itemWidth * itemHeight) / 144) * 300));
                lDefaultHighLimitCFM = Math.ceil((((itemWidth * itemHeight) / 144) * 2000));
                lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                if (bHasController == true) {
                    if ((lDefaultHighLimitCFM - lDefaultLowLimitCFM) > 25600) {
                        lDefaultHighLimitCFM = lDefaultLowLimitCFM + 256000;
                    }
                    lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                }
                else {
                    lDefaultDesignLimitCFM = 0;
                }
                break;
            case "CDRAMS":
            case "PVDS060X":
                lDefaultLowLimitCFM = Math.ceil((((itemWidth ^ 2) * 3.14) / 144) * 300);
                lDefaultHighLimitCFM = Math.ceil((((itemWidth ^ 2) * 3.14) / 144) * 2149);
                lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                if (bHasController == true) {
                    if ((lDefaultHighLimitCFM - lDefaultLowLimitCFM) > 25600) {
                        lDefaultHighLimitCFM = lDefaultLowLimitCFM + 256000;
                    }
                    lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                }
                else {
                    lDefaultDesignLimitCFM = 0;
                }
                break;
            case "IAQ50X":
            case "PVDT050X":
                iWidth = parseInt(itemWidth);
                iHeight = parseInt(itemHeight);
                freeArea = (iWidth * iHeight);
                lDefaultLowLimitCFM = Math.ceil((freeArea * 150) / 144);
                lDefaultHighLimitCFM = Math.ceil((freeArea * 2000) / 144);
                lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                break;
            case "EAMS-HP":
                lDefaultLowLimitCFM = Math.ceil((((itemWidth * itemHeight) / 144) * 50));
                lDefaultHighLimitCFM = Math.ceil((((itemWidth * itemHeight) / 144) * 2000));
                lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                if (bHasController == true) {
                    if ((lDefaultHighLimitCFM - lDefaultLowLimitCFM) > 32000) {
                        lDefaultHighLimitCFM = lDefaultLowLimitCFM + 32000;
                    }
                    lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                }
                else {
                    lDefaultDesignLimitCFM = 0;
                }
                break;
            case "EAMS":
            case "PVES030":
                lDefaultLowLimitCFM = Math.ceil((((itemWidth * itemHeight) / 144) * 100));
                lDefaultHighLimitCFM = Math.ceil((((itemWidth * itemHeight) / 144) * 2000));
                lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                if (bHasController == true) {
                    if ((lDefaultHighLimitCFM - lDefaultLowLimitCFM) > 32000) {
                        lDefaultHighLimitCFM = lDefaultLowLimitCFM + 32000;
                    }
                    lDefaultDesignLimitCFM = Math.ceil((lDefaultLowLimitCFM + lDefaultHighLimitCFM) / 2);
                }
                else {
                    lDefaultDesignLimitCFM = 0;
                }
                break;
            case "AMS": 
            case "PVDS020":
                lDefaultLowLimitCFM = Math.ceil(((itemWidth * itemHeight) / 144) * 300);
                lDefaultHighLimitCFM = Math.ceil(((itemWidth * itemHeight) / 144) * 2000);
                lDefaultDesignLimitCFM = 0;
                break;
            case "EAML6625":
                lDefaultLowLimitCFM = Math.ceil(((itemWidth * itemHeight) / 144) * 345);
                lDefaultHighLimitCFM = Math.ceil(((itemWidth * itemHeight) / 144) * 1508);
                lDefaultDesignLimitCFM = 0;
                break;
            case "AML3":
            case "PVDL300":
                freeArea = getFreeArea("AML3", itemWidth, itemHeight);
                lDefaultLowLimitCFM = Math.ceil(freeArea * 275);
                lDefaultHighLimitCFM = Math.ceil(freeArea * 1400);
                lDefaultDesignLimitCFM = 0;
                break;
            case "AML6":
            case "PVDL600":
                freeArea = getFreeArea("AML6", itemWidth, itemHeight);
                lDefaultLowLimitCFM = Math.ceil(freeArea * 345);
                lDefaultHighLimitCFM = Math.ceil(freeArea * 2149);
                lDefaultDesignLimitCFM = 0;
                break;
            default:
                lDefaultDesignLimitCFM = Math.ceil(((itemWidth * itemHeight) / 144) * 700);
                lDefaultLowLimitCFM = Math.ceil(lDefaultDesignLimitCFM * 0.7);
                lDefaultHighLimitCFM = Math.ceil(lDefaultDesignLimitCFM * 1.4);
                break;
        }
        var iError = 0;
        if (bHasController) {
            switch (option) {
                case "CNTRL/TRANS":
                    retval["LowLimit"] = lDefaultLowLimitCFM;
                    retval["HighLimit"] = lDefaultHighLimitCFM;
                    retval["DesignLimit"] = lDefaultDesignLimitCFM;
                    break;
                case "LO LIMIT CFM":
                    if (lowLimitCFM < lDefaultLowLimitCFM) {
                        iError = 1;
                    } else if (lowLimitCFM > designLimitCFM)
                        iError = 5;
                    break;
                case "CFM DESIGN":
                    if (designLimitCFM < lDefaultLowLimitCFM) {
                        iError = 2;
                    } else if (designLimitCFM > lDefaultHighLimitCFM )
                        iError = 3;
                    break;
                case "HI LIMIT CFM":
                    if (highLimitCFM > lDefaultHighLimitCFM) {
                        iError = 4;
                    } else if (highLimitCFM < designLimitCFM)
                        iError = 6;
                    break;
                case "WIDTH":
                case "HEIGHT":
                    retval["LowLimit"] = lDefaultLowLimitCFM;
                    retval["HighLimit"] = lDefaultHighLimitCFM;
                    retval["DesignLimit"] = lDefaultDesignLimitCFM;
                    break;
                default:
                    if (retval["LowLimit"] == 0) { retval["LowLimit"] = lDefaultLowLimitCFM; }
                    if (retval["HighLimit"] == 0) { retval["HighLimit"] = lDefaultHighLimitCFM; }
                    if (retval["DesignLimit"] == 0) {retval["DesignLimit"]= lDefaultDesignLimitCFM;}
                    break;
            }
            if (iError == 0) {
                if (lowLimitCFM < lDefaultLowLimitCFM) { iError = 1; }
                else if (lowLimitCFM > designLimitCFM) { iError = 5; }
                else if (designLimitCFM < lDefaultLowLimitCFM) { iError = 2; }
                else if (designLimitCFM > lDefaultHighLimitCFM) { iError = 3; }
                else if (highLimitCFM > lDefaultHighLimitCFM) { iError = 4; }
                else if (highLimitCFM > designLimitCFM) { iError = 6; }
            }
            switch (iError) {
                case 0:
                    retval["ErrorMessage"] = "";
                    break;
                case 1:
                    retval["ErrorMessage"] = lowLimitCFM + " Low Limit CFM is below the minimum of " + lDefaultLowLimitCFM;
                case 2:
                    retval["ErrorMessage"] = designLimitCFM + " Design CFM is below the minimum of " + lDefaultLowLimitCFM
                case 3:
                    retval["ErrorMessage"] = designLimitCFM + " Design CFM is above the maximum of " + lDefaultHighLimitCFM
                case 4:
                    retval["ErrorMessage"] = highLimitCFM + " High Limit CFM is above the maximum of " + lDefaultHighLimitCFM
                case 5:
                    retval["ErrorMessage"] = lowLimitCFM + " Low Limit CFM is above the Design CFM " + designLimitCFM
                case 6:
                    retval["ErrorMessage"] = lowLimitCFM + " High Limit CFM is below the Design CFM " + designLimitCFM
            }
        }
        else {
            retval["LowLimit"] = lDefaultLowLimitCFM;
            retval["HighLimit"] = lDefaultHighLimitCFM;
            retval["DesignLimit"] = lDefaultDesignLimitCFM;
        }
        retval["IsValid"] = true;
        
    }
    catch (err) {
        retval["IsValid"] = false;
    }
    return retval;
}

/*Private Methods*/
function airMeasuringUnitHasController(productName, controlTransVal) {
    var retval = false;
    switch (productName) {
        case "IAQ50X":
        case "EAMS":
        case "EAMS-HP":
        case "PVDT050X":
        case "PVES030":
            retval = true;
            break;
        case "AMS050":
        case "CDRAMS":
        case "PVDS050X":
        case "PVDS060X":
            var temp = controlTransVal.toUpperCase();
            if (temp == "AMS070V-AF" || temp == "AMS070V-LF" || temp == "PVAMS070V-AF" || temp == "PVAMS070V-LF") { retval = true; }
            else { retval = false; }
            break;
        default:
            retval = false;
            break;
    }
    return retval;
}

function calculateSections(product) {
    var bIsValid = false;
    var bOtherMax = false;
    var Category = _modelProp["PCategory"].toUpperCase();
    var ChildCategory = _modelProp["CCategory"].toUpperCase();
    var ULValidation = _modelProp["UL_Validation_Table"].toUpperCase();
    switch (ULValidation) {
        case "UL_FSD":
            bIsValid = getULCalcSections_FSD(bOtherMax);
            break;
        case "UL_SLEEVE_LENGTH_FSD":
            bIsValid = getULCalcSections_FSD();
            if (bIsValid == true) {
                bIsValid = getULCalcSleeveLengthCalc_FSD();
            }
            break;
        case "UL_SD":
            bIsValid = getULCalcSections_SD();
            break;
        case "UL_DFD":
            bIsValid = getULCalcSections_DFD();
            break;
        case "UL_DYNAMIC_FIRE_DAMPER":
            var sRetval = getULCalcSections_DynamicFD();
            if (sRetVal == "True") { bIsValid = true; }
            else { bIsValid == false; }
            break;
        case "UL_FIRE_DAMPER":
            bIsValid = getULCalcSections_FD();
            break;
        case "UL_STATIC_FIRE_DAMPER":
            bIsValid = getULCalcSections_StaticFD();
            break;
        default:
            bIsValid = true;
            switch (Category) {
                case "LOUVERS":
                    if (_modelProp["HasSeals"] == true) { bOtherMax = true; }
                    else {bOtherMax = false;}
                    break;
                case "CONTROL DAMPERS":
                case "ZONE CONTROL":
                    if (_modelProp["WIDTH"] > _modelProp["MaxSectionWidth"] || _modelProp["HEIGHT"] > _modelProp["MaxSectionHeight"]) {
                        if (_modelProp["MaxSectionWidth2"] > 0 || _modelProp["MaxSectionHeight2"] > 0) { bOtherMax = true;}
                        else {bOtherMax = false;}
                    }
                    else { bOtherMax = false;}
                    break;
                default:
                    if (_modelProp["WIDTH"] > _modelProp["MaxSectionWidth"] || _modelProp["HEIGHT"] > _modelProp["MaxSectionHeight"]) {
                        if (_modelProp["WIDTH"] > _modelProp["MaxSectionWidth2"] > 0 || _modelProp["HEIGHT"] > _modelProp["MaxSectionHeight2"] > 0) { bOtherMax = true;}
                        else {bOtherMax = false;}
                    }
                    else { bOtherMax = false;}
                    break;
            }//end of Category select
            break; 
    } //end of UL_Validation select
    
    if (Category == "SILENCERS" && _modelProp["SHAPE"] != 3) {
        if (ChildCategory == "ELBOW") {
            var temp = GetElbowSilencers(_modelProp["DEPTH"]);
            if (temp["Valid"] == true) {
                _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], 0, _modelProp["MaxSectionWidth2"]);
                _modelProp["SectionsTall"] = calcSectionValue(_modelProp["HEIGHT"], 0, _modelProp["MaxSectionHeight2"]);
            }
            else {
                _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], 0, _modelProp["MaxSectionWidth"]);
                _modelProp["SectionsTall"] = MathcalcSectionValue(_modelProp["HEIGHT"], 0, _modelProp["MaxSectionHeight"]);
            }
        }
        else {
            if (_modelProp["DEPTH"] > 78 && _modelProp["MaxSectionWidth2"] > 0 && _modelProp["MaxSectionHeight2"] > 0) {
                _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], 0, _modelProp["MaxSectionWidth2"]);
                _modelProp["SectionsTall"] = calcSectionValue(_modelProp["HEIGHT"], 0, _modelProp["MaxSectionHeight2"]);
            }
            else {
                _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], 0, _modelProp["MaxSectionWidth"]);
                _modelProp["SectionsTall"] = calcSectionValue(_modelProp["HEIGHT"], 0, _modelProp["MaxSectionHeight"]);
            }
        }
    }
    else {
        //Set SectionWidth
        if (_modelProp["MaxSectionWidth"] == 0) { 
            _modelProp["SectionWidth"] = 1; 
        }
        else {
            if (bOtherMax == false) {
                //BP 1/17/2007 Number of sections wide for ELF6375DFL model must be > 1 if height > 90 per case# 33296
                if (_modelName == "ELF6375DFL" && _modelProp["HEIGHT"] > 90 && _modelProp["WIDTH"] > 90 && _modelProp["WIDTH"] <= 180) {
                    _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], _fdWidthAdd,_modelProp["MaxSectionHeight"]);
                }
                else {
                    _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"],_fdWidthAdd, _modelProp["MaxSectionWidth"]);
                }
            }
            else {
                if (_modelProp["MaxSectionWidth2"] == 0) {
                    _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], _fdWidthAdd, _modelProp["MaxSectionWidth"]);
                }
                else {
                    _modelProp["SectionsWide"] = calcSectionValue(_modelProp["WIDTH"], _fdWidthAdd, _modelProp["MaxSectionWidth2"]);
                }
            }
        }
        //Set SectionHeight
        if (_modelProp["MaxSectionHeight"] == 0 || _modelName.toUpperCase() == "ELF6375DFL") {
            _modelProp["SectionsTall"] = 1; 
        }
        else {
            if (_bLnSectionsHighOverride == true) {
                _modelProp["SectionsTall"] = _iSectionHighOverride;
            }
            else {
                if (bOtherMax == false) {
                    _modelProp["SectionsTall"] = calcSectionValue(_modelProp["HEIGHT"], _hPrime, _modelProp["MaxSectionHeight"]);
                }
                else {
                    if (_modelProp["MaxSectionHeight2"] == 0) {
                        _modelProp["SectionsTall"] = calcSectionValue(_modelProp["HEIGHT"], _hPrime, _modelProp["MaxSectionHeight"]);
                    }
                    else {
                        _modelProp["SectionsTall"] = calcSectionValue(_modelProp["HEIGHT"], _hPrime, _modelProp["MaxSectionHeight2"]);
                    }
                }
            }
        }
        //Set SectionsDeep
        if (_modelProp["Shape"] == 3) {
            if (_modelProp["MaxSectionDepth"] == 0) { _modelProp["SectionsDeep"] = 1; }
            else {
                if (_bLnSectionsHighOverride == true) { _modelProp["SectionsDeep"] = _iSectionHighOverride; }
                else {
                    if (bOtherMax == false) {
                        _modelProp["SectionsDeep"] = calcSectionValue(_modelProp["HEIGHT"] + _hPrime, _modelProp["MaxSectionHeight"]);
                    }
                    else {
                        if (_modelProp["MaxSectionHeight2"] == 0) {
                            _modelProp["SectionsDeep"] = calcSectionValue(_modelProp["DEPTH"] + _hPrime, _modelProp["MaxSectionDepth"]);
                        }
                        else {
                            _modelProp["SectionsDeep"] = calcSectionValue(_modelProp["DEPTH"] + _hPrime, _modelProp["MaxSectionDepth2"]);
                        }
                    }
                }
            }
        }
        _modelProp["SectionsDetails"] = getSectionDetail();
    }
    return bIsValid;
}

function calcSectionValue(value, addOn, maxValue) {
    return Math.ceil((parseInt(value) + parseInt(addOn)) / parseInt(maxValue));
}
/*check to see if model data needs to be reloaded*/
function checkInstance(product, line) {
    var bLoad = false;
    if (_modelName == null || _modelName != product.Product_Name) {
        bLoad = true;
        _modelName = product.Product_Name;
    }
    if (_lineGuid == null || _lineGuid != line.LineItemGuid) {
        bLoad == true;
        _lineGuid = line.LineItemGuid;
    }
    if (bLoad == true) {
        _modelProp = [];
        getProductInformation(product, line);
    }
}

function getActuatorQuantity() {
    if (_modelProp["ACTUATOR"].toUpperCase() == "NONE") {
        return 0;
    }
    if (typeof _modelProp["MaxAreaWithSeals"] === "undefined" || parseInt(_modelProp["MaxAreaWithSeals"]) == 0) { _modelProp["MaxAreaWithSeals"] = 99999; }
    var frame = _modelProp["FRAME"].toUpperCase();
    var itemWidth = 0;
    var itemHeight = 0;
    _modelProp["MaxQty"] = _modelProp["PermiterInterval"];
    if (listContains("C,CO,CR,LO,LR,WC,WO", frame, 2) == true && frame.length > 0 || parseInt(_modelProp["Shape"]) == 1) {
        itemWidth = parseInt(_modelProp["WIDTH"]) + 2;
        itemHeight = parseInt(_modelProp["HEIGHT"]) + 2;
    } else {
        itemWidth = parseInt(_modelProp["WIDTH"]);
        itemHeight = parseInt(_modelProp["HEIGHT"]);
    }
    var actuator = _modelProp["ACTUATOR"].toUpperCase();
    var actuatorType = 0;
    if (listContains("AF,EM,M4,M9,MA,MP,H2,GG,AB,NB,LB,AF,LF,NF,ML", actuator, 2) == true) { actuatorType = 1; } //Electric
    else if (listContains("33,D3", actuator, 2) == true) { actuatorType = 2; } //Pneumatic
    else if (listContains("CRA,BAH,HDH,HQR,HQS,LOU,SS ", actuator, 3) == true) { actuatorType = 3; } //Manual Hand Quad
    else if (listContains("HCH,HCM", actuator, 3) == true) { actuatorType = 4; } //Manual Hand Crank
    else if (listContains("DCP,HDC,LCP", actuator, 23) == true) { actuatorType = 5; } //Manual Chain Pull
    else if (listContains("WG,WO", actuator, 2) == true) {actuatorType = 6;} //Manual Worm Gear

    if (typeof _modelProp["MaximumArea"] === "undefined" || parseInt(_modelProp["MaximumArea"]) == 0) { _modelProp["MaximumArea"] = 999999; }
    if (typeof _modelProp["SectionsWide"] === "undefined" || parseInt(_modelProp["SectionsWide"]) == 0) { _modelProp["SectionsWide"] = 1; }
    if (typeof _modelProp["SectionsTall"] === "undefined" || parseInt(_modelProp["SectionsTall"]) == 0) { _modelProp["SectionsTall"] = 1; }
    if (typeof _modelProp["TotalNumOperSections"] === "undefined") { _modelProp["TotalNumOperSections"] = 0; }
    if (typeof _modelProp["ActQuantityPerSection"] === "undefined") { _modelProp["ActQuantityPerSection"] = 0; }
    if (typeof _modelProp["MaxOperSecWidth"] === "undefined") { _modelProp["MaxOperSecWidth"] = 0; }
    if (typeof _modelProp["MaxOperSecHeight"] === "undefined") { _modelProp["MaxOperSecHeight"] = 0; }
    if (typeof _modelProp["OperatingSectionsWide"] === "undefined") { _modelProp["OperatingSectionsWide"] = 0; }
    if (typeof _modelProp["OperatingSectionsTall"] === "undefined") { _modelProp["OperatingSectionsTall"] = 0; }


    var calcType = 0;
    switch (_modelProp["PCategory"].toUpperCase()) {
        case "BACKDRAFT DAMPERS":
        case "ZONE CONTROL":
        case "MANUAL DAMPERS":
            calcType = 1;
            break;
        case "CONTROL DAMPERS":
            if (_modelProp["CCategory"].toUpperCase().indexOf("COMMERICAL") > 0 || _modelProp["CCategory"].toUpperCase().indexOf("FIBERGLASS") > 0) {
                calcType = 9;
            } else {
                if (actuatorType != 4) { calcType = 2; }
                else { calcType = 5; }
            }
            break;
        case "AIR MEASURING":
            if (actuatorType != 4) { calcType = 2; }
            else { calcType = 5; }
            break;
        case "FIRE/SMOKE DAMPERS":
        case "SMOKE DAMPERS":
            calcType = 3;
            break;
        case "LOUVERS":
            switch (actuatorType) {
                case 4:
                    calcType = 5;
                    break;
                case 5:
                    calcType = 1;
                    break;
                case 6:
                    calcType = 8;
                    break;
                default:
                    calcType = 2;
                    break;
            }
            break;
        case "FIRE DAMPERS":
            calcType = 7;
            break;
        case "ACCESSORIES":
            return 1;
            break;
    }
    //Calculate Actuator Quantity
    var tempQty = 0;
    var tempActQtyWidth = 0;
    var tempActQtyHeight = 0;
    var tempActQtyWxH = 0;
    var tempActQtySqFt = 0;
    
    var qtyActuator = 0;
    switch (calcType) {
        case 1:
            if (parseInt(_modelProp["MaxQty"] < 10)) {
                if (parseInt(_modelProp["MaxQty"] == 0)) {
                    _modelProp["MaxQty"] = 9999;
                }
                qtyActuator = Math.ceil((parseInt(_modelProp["SectionsWide"]) * parseInt(_modelProp["SectionsTall"])) / parseInt(_modelProp["MaxQty"]));
            } else {
                qtyActuator = (parseInt(_modelProp["SectionsWide"]) * parseInt(_modelProp["SectionsTall"]))
            }
            break;
        case 2: //Control Dampers - Non Commercial or Commerical Round/Oval
            if (_modelProp["HasSeals"] == true) {
                tempQty = Math.ceil((itemWidth * itemHeight / 144) / (parseInt(_modelProp["MaxAreaWithSeals"]) / 144))
            } else {
                tempQty = Math.ceil((itemWidth * itemHeight / 144) / (parseInt(_modelProp["MaximumArea"]) / 144))
            }
            if (parseInt(_modelProp["MaxQty"]) == 0) { _modelProp["MaxQty"] = 9999; }
            if (tempQty > _modelProp["MaxQty"]) { qtyActuator = -1; }
            else { qtyActuator = tempQty; }

            if (actuatorType >= 3 && _modelProp["CCategory"].toUpperCase() != "INDUSTRIAL") {
                if (actuator.indexOf("100") > 0) {
                    if (parseInt(_modelProp["SectionsWide"]) > 2) { qtyActuator = tempQty; }
                    else if ((_modelProp["HasSeals"] == true && ((itemWidth * itemHeight / 144) <= 12.5)) || (_modelProp["HasSeals"] == false && ((itemWidth * itemHeight / 144) <= 25))) {
                        qtyActuator = -1;
                    }
                    else {
                        qtyActuator = tempQty;
                    }
                } else if (actuator.indexOf("050") > 0) {
                    if (parseInt(_modelProp["SectionsWide"]) == 1) { qtyActuator = tempQty; }
                    else if ((_modelProp["HasSeals"] == true && ((itemWidth * itemHeight / 144) <= 12.5)) || (_modelProp["HasSeals"] == false && ((itemWidth * itemHeight / 144) <= 25))) {
                        qtyActuator = -1;
                    }
                    else {
                        qtyActuator = tempQty;
                    }
                } else {
                    qtyActuator = tempQty;
                }
                if (qtyActuator > parseInt(_modelProp["MaxQty"])) {
                    qtyActuator = -1;
                }
            }
            break;
        case 3: //FIRE/Smoke Dampers
            tempQty = 0;
            //width
            if (Math.ceil(itemWidth / parseInt(_modelProp["MaxWidth"])) > _modelProp["MaxOperSecWidth"]) { tempActQtyWidth = 0; }
            else { tempActQtyWidth = Math.ceil(itemWidth / parseInt(_modelProp["MaxWidth"])); }
            //height
            if (Math.ceil(itemHeight / parseInt(_modelProp["MaxHeight"])) > _modelProp["MaxOperSecHeight"]) { tempActQtyHeight = 0; }
            else { tempActQtyHeight = Math.ceil(itemHeight / parseInt(_modelProp["MaxHeight"])); }

            tempActQtyWxH = tempActQtyWidth * tempActQtyHeight;
            if (tempActQtyWxH > parseInt(_modelProp["TotalNumOperSections"])) { _modelProp["ActQtyWxH"] = 0; }
            else if (tempActQtyWxH <= parseInt(_modelProp["TotalNumOperSections"])) { _modelProp["ActQtyWxH"] = tempActQtyWxH;}

            tempActQtySqFt = Math.ceil(((itemWidth * itemHeight) / 144) / parseFloat(_modelProp["MaxAreaWithSeals"]));
            if (tempActQtySqFt > parseFloat(_modelProp["TotalNumOperSections"])) { _modelProp["ActQtySqFt"] = 0; }
            else if (tempActQtySqFt <= parseFloat(_modelProp["TotalNumOperSections"])) { _modelProp["ActQtySqFt"] = tempActQtySqFt; }

            if (parseFloat(_modelProp["ActQtyWxH"]) < 1 || parseFloat(_modelProp["ActQtySqFt"]) < 1) { tempQty = 0; }
            else {
                if (parseFloat(_modelProp["ActQtyWxH"]) == parseFloat(_modelProp["ActQtySqFt"])) { tempQty = parseFloat(_modelProp["ActQtyWxH"]); }
                else {
                    tempQty = Math.max(parseFloat(_modelProp["ActQtyWxH"]), parseFloat(_modelProp["ActQtySqFt"]));
                }
            }
            if (tempQty == 0) { tempQty = -1 }

            qtyActuator = tempQty;

            break;
        case 4:
            var details = _modelProp["SectionDetail"];
            var tempNumber = parseInt(details.match(/\d/g));
            if (tempNumber > 0) { qtyActuator = parseInt(details.substring(details.length - 1, 1)); }
            else {
                if (((itemWidth * itemHeight) / 144) > 240) { qtyActuator = -1; }
                else { qtyActuator = 1; }
            }
            break;
        case 5:
            switch (_modelProp["PCategory"].toUpperCase()) {
                case "LOUVERS":
                    if (Math.ceil(((itemHeight / _modelProp["SectionsTall"]) * (itemWidth / _modelProp["SectionsWide"])) / 144) <= parseInt(_modelProp["MaximumArea"])) {
                        qtyActuator = _modelProp["SectionsWide"] * _modelProp["SectionsTall"];
                    } else { qtyActuator = -1;}
                    break;
                default:
                    if (Math.ceil(((itemHeight / _modelProp["SectionsTall"]) * (itemWidth / _modelProp["SectionsWide"])) / 144) <= (parseInt(_modelProp["MaximumArea"]) / 144)) {
                        qtyActuator = _modelProp["SectionsWide"] * _modelProp["SectionsTall"];
                    } else { qtyActuator = -1; }
                    break;
            }
            break;
        case 6:
            if (parseInt(_modelProp["MaxWidth"]) > 0 && parseInt(_modelProp["MaxWidth"]) < 999 && parseInt(_modelProp["MaxHeight"]) > 0 && parseInt(_modelProp["MaxHeight"]) < 999) {
                if ((itemHeight / parseInt(_modelProp["SectionsTall"])) > parseInt(_modelProp["MaxHeight"]) || (itemWidth > parseInt(_modelProp["MaxWidth"]))){
                    tempQty = (Math.ceil(itemWidth / parseInt(_modelProp["MaxWidth"])) * (Math.ceil((itemHeight / _modelProp["SectionHeight"]) / _modelProp["MaxHeight"])));
                    if (tempQty < 2) { tempQty = 2; }
                }
                else {
                    tempQty = (Math.ceil(((itemWidth * (itemHeight / _modelProp["SectionTall"])) / 144) / (_modelProp["MaxAreaWithSeals"] / 144))) * _modelProp["SectionTall"];
                }
            }
            else {
                tempQty = (Math.ceil(((itemWidth * (itemHeight / _modelProp["SectionTall"])) / 144) / (_modelProp["MaxAreaWithSeals"] / 144))) * _modelProp["SectionTall"];
            }
            if ((tempQty / _modelProp["SectionsTall"]) > _modelProp["MaxQty"] && _modelProp["MaxQty"] != 0) { qtyActuator = -1; }
            else { qtyActuator = tempQty;}
            break;
        case 7:
            qtyActuator = (_modelProp["SectionsTall"] * _modelProp["SectionsWide"]);
            break;
        case 8:
            var tmpAcutatorWide = Math.ceil(itemWidth / _modelProp["MaxWidth"]);
            var tmpActuatorArea = Math.ceil(((itemWidth / itemHeight) / 144) / 120);
            if (tmpAcutatorWide > tmpActuatorArea) { tempQty = tmpAcutatorWide; }
            else { tempQty = tmpActuatorArea; }
            qtyActuator = tempQty;
            break;
        case 9:
            tempQty = 0;

            if (_modelProp["WIDTH"] <= _modelProp["MaxWidth"]) {
                if (_modelProp["HasSeals"] == true) {
                    tempQty = Math.ceil(((_modelProp["WIDTH"] * _modelProp["HEIGHT"]) / 144) / _modelProp["MaxAreaWithSeals"]);
                    if (tempQty > _modelProp["PerimeterInterval"]) { tempQty = -1; }
                } else {
                    tempQty = Math.ceil(((_modelProp["WIDTH"] * _modelProp["HEIGHT"]) / 144) / _modelProp["MaxArea"]);
                    if (tempQty > _modelProp["PerimeterInterval"]) { tempQty = -1; }
                }
            }
            qtyActuator = tempQty;
            break;
    }
    return tempQty;
}
/*get elbow max width & height*/
function getElbowMaxWidth(length) {

}
/*Finds a row from a give table based on field name*/
function getDataRow(table, key, id) {
    for (var i = 0; i < _jobdata[table].length; i++) {
        if (_jobdata[table][i][key] = id) {
            return _jobdata[table][i];
        }
    }
}
function getFreeArea(modelName, itemWidth, itemHeight) {
    var retval;
    var blade;
    var mindGap;
    var frameDeduct;
    var angleFactor;
    var frameWidth;
    var corrFactor;
    switch (modelName) {
        case "AML3":
            blade = 0.75;
            minGap = 0.433;
            frameDeduct = 2.17;
            angleFactor = 1;
            corrFactor = 0.878825;
            frameWidth = 3.61;
            retval = (((itemWidth - frameDeduct) - parseInt((itemWidth - frameDeduct) / blade) * blade) * angleFactor + parseInt((itemWidth - FrameDeduct) / BladeCC) * minGap) * (itemHeight - frameWidth) / 144 * corrFactor
            break;
        case "AML6":
            blade = 1.194;
            minGap = 0.6;
            frameDeduct = 3.397;
            angleFactor = 1;
            corrFactor = 1.109299;
            frameWidth = 9;
            retval = (((itemWidth - frameDeduct) - parseInt((itemWidth - frameDeduct) / blade) * blade) * angleFactor + parseInt((itemWidth - FrameDeduct) / BladeCC) * minGap) * (itemHeight - frameWidth) / 144 * corrFactor
            break;
    }
    return retval;
}
/*Check if table has a property value*/
function getHasProperty(line, name, value) {
    if (typeof line[name] !== "undefined" && line[name].toUpperCase() != value) { return true; }
    else { return false; }
}
/*load the model and line information*/
function getProductInformation(product, line) {
    _lineGuid = line.LineItemGuid;
    var table = product.Product_Brand + '_' + product.Product_Name + '_LineItem';
    var dWidth, dHeight, dDepth, dSleeveLen = 0;
    _modelProp["Brand"] = product.Product_Brand;
    _modelProp["PCategory"] = product.Product_Parent_Category_Name;
    _modelProp["CCategory"] = product.Product_Child_Category_Name;
    _modelProp["ModelName"] = product.Product_Original_Name;
    _modelProp["Brand"] = product.Product_Brand;

    //check if line had W/H or Diameter
    if (typeof line["WIDTH"] !== "undefined" && typeof line["HEIGHT"] !== "undefined") {
        storeModelData(line, "WIDTH");
        storeModelData(line, "HEIGHT");
    }
    else if (typeof line["DIAMETER"] !== "undefined") {
        _modelProp["WIDTH"] = table["DIAMETER"];
        _modelProp["HEIGHT"] = table["DIAMETER"];
    }
    if (typeof line["DEPTH"] !== "undefined") { dDepth = line["DEPTH"]; }
    else {
        if (product.Product_Parent_Category_Name.toUpperCase() == "SILENCERS") {
            if (typeof line["LENGTH"] !== "undefined") { dDepth = line["LENGTH"]; }
            if (typeof line["CL LENGTH"] !== "undefined") { dDepth = line["CL LENGTH"]; }
        }
    }
    _modelProp["DEPTH"] = dDepth;

    /*Check if line has value for SEALS*/
    var bHasSeals = getHasProperty(line, "JAMB SEALS", "NONE");
    if (!bHasSeals) { bHasSeals = getHasProperty(line, "BLADE SEALS", "NONE"); }
    if (!bHasSeals) { bHasSeals = getHasProperty(line, "BLD/JAMB SEALS", "NONE"); }
    _modelProp["HasSeals"] = bHasSeals;
    /*Set option variables*/
    storeModelData(line, "FRAME");
    storeModelData(line, "FRAME MVG");
    storeModelData(line, "MOUNTING");
    storeModelData(line, "BLADE ACTION");
    storeModelData(line, "STATIC PRESSURE");
    storeModelData(line, "ASSEMBLY TEMP");
    storeModelData(line, "VELOCITY");
    storeModelData(line, "FAIL POS.");
    storeModelData(line, "ACTUATOR");
    storeModelData(line, "ACTUATOR MVG");
    storeModelData(line, "ACCESSORIES");
    storeModelData(line, "GRILL DEPTH");
    storeModelData(line, "DUCT CONNECTIONS");
    if (typeof line["SLEEVE LENGTH"] !== "undefined") {
        sSleeveLen = line["SLEEVE LENGTH"];
        var dSleeveLen = 0;
        if (sSleeveLen.startsWith("OTH -")) {
            sSleeveLen = sSleeveLen.substring(sSleeveLen.indexOf("- ") + 2);
        }
        _modelProp["SLEEVE LENGTH"] = parseInt(sSleeveLen);
    }
    /*Set variable from Property Table*/
    var sWriteProperty = "Products_" + product.Product_Name + "_Writable";
    var sReadProperty = product.Product_Name + "_Properties";
    _modelProp["SectionsTall"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "SectionsTall");
    _modelProp["SectionsWide"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "SectionsWide");
    _modelProp["Shape"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "Shape");
    _modelProp["MaxSectionWidth"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "MaxSectionWidth");
    _modelProp["MaxSectionHeight"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "MaxSectionHeight");
    _modelProp["MaxSectionDepth"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "MaxSectionDepth");
    _modelProp["MaxSectionWidth2"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "MaxSectionWidth2");
    _modelProp["MaxSectionHeight2"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "MaxSectionHeight2");
    _modelProp["MaxSectionDepth2"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "MaxSectionDepth2");
    _modelProp["ModelMaxHeight"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "ModelMaxHeight");
    _modelProp["ModelMaxWidth"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "ModelMaxWidth");
    _modelProp["ModelMinHeight"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "ModelMinHeight");
    _modelProp["ModelMinWidth"] = getPropertyValue(sWriteProperty, product.Product_GUID, "Model", _lineGuid, "ModelMinWidth");
    _modelProp["UL_Validation_Table"] = getPropertyValue2(sReadProperty, "Model", "UL_Validation_Table");
}
/*get a value from property table*/
function getPropertyValue(table, record, type, id, property) {
    var tbl = _jobdata[table];
    for (var i = 0; i < tbl.length; i++) {
        if (tbl[i]["Record_Guid"].toUpperCase() == record.toUpperCase() && tbl[i]["Table_Name"].toUpperCase() == type.toUpperCase() && tbl[i]["LineItem_Id"].toUpperCase() == id.toUpperCase()) {
            if (tbl[i]["Property_Name"].toUpperCase() == property.toUpperCase()) {
                return tbl[i]["Property_Default_Value"];
            }
        }
    }
}
function getPropertyValueTrace(table, record, type, id, property) {
    var tbl = _jobdata[table];
    for (var i = 0; i < tbl.length; i++) {
        if (tbl[i]["Property_Name"].toUpperCase() == property.toUpperCase()) {
            console.log(tbl[i]["Property_Name"] + "|" + tbl[i]["Table_Name"] + "|" + tbl[i]["Record_Guid"] + "|" + tbl[i]["Property_Default_Value"]);
            if (tbl[i]["Table_Name"] == type && tbl[i]["LineItem_Id"] == id) {
                if (tbl[i]["Record_Guid"].toUpperCase() == record.toUpperCase()) {
                    return tbl[i]["Property_Default_Value"];
                }
            }
        }
    }
}
/*get a value from property table*/
function getPropertyValue2(table, type, property) {
    var tbl = _jobdata[table];
    for (var i = 0; i < tbl.length; i++) {
        if (tbl[i]["Table_Name"] == type && tbl[i]["Property_Name"] == property) {
            return tbl[i]["Property_Default_Value"];
        }
    }
}
/*get section details*/
function getSectionDetail() {
    var unitArea = null;
    var sDetail = "";
    var sModelName = null;
    var sSections = null;
 
    if ((_modelProp["PCategory"].toUpperCase() == "CONTROL DAMPERS" || _modelProp["PCategory"].toUpperCase() == "ZONE CONTROL") && (_modelName.indexOf("25") == 0)) {
        sModelName = "CD";

        if (_modelName.toUpperCase().indexOf("CD30") > 0) {
            sDetail = "";
        }
        else {
            unitArea = (_modelProp["WIDTH"] * _modelProp["HEIGHT"]) / 144;
            if (_modelName.toUpperCase().indexOf("CD50V") > 0) {
                sModelName = "CD50V";
                sSections = _modelProp["SectionsWidth"] + _modelProp["SectionsTall"];
            }
            else {
                sSections = _modelProp["SectionsWidth"] + _modelProp["SectionsTall"];
            }
            sDetail = lookupSectionDetail(sModeName, sSections, unitArea, _modelProp["HasSeals"]);
        }
    }
    else if (_modelProp["PCategory"].toUpperCase() == "SMOKE DAMPERS") {
        sModelName = _modelName;
        unitArea = (_modelProp["WIDTH"] * _modelProp["HEIGHT"]) / 144;
        sSections = _modelProp["SectionsWidth"] + _modelProp["SectionsTall"];
        sDetail = lookupSectionDetail(sModeName, sSections, unitArea, _modelProp["HasSeals"]);
    }
    return sDetail;
}

function getULCalcSections_DFD() {
    //modelName, frame, mounting, blade, staticpressure, velocity, width, height
    var retval = lookupCalcsDFD(_modelName, _modelProp["FRAME"], _modelProp["MOUNTING"], _modelProp["BLADE ACTION"], _modelProp["STATIC PRESSURE"],
        _modelProp["VELOCITY"], parseInt(_modelProp["WIDTH"]), parseInt(_modelProp["HEIGHT"]));
    //update values 
    if (typeof retval["ErrorMsg"] !== "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["MaxWidth"] = retval["MaxWidth"];
        _modelProp["MaxHeight"] = retval["MaxHeight"];
        _modelProp["OtherMax"] = retval["OtherMax"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
    }
    return retval["IsValid"];
}

function getULCalcSections_DynamicFD() {
    //(modelName, frame, mounting, staticpressure, velocity, width, height)
    var retval = lookuplookupULDynamicFD(_modelName, _modelProp["FRAME"], _modelProp["MOUNTING"], _modelProp["STATIC PRESSURE"],
        _modelProp["VELOCITY"], parseInt(_modelProp["WIDTH"]), parseInt(_modelProp["HEIGHT"]))
    //update values 
    if (typeof retval["ErrorMsg"] !== "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["MaxWidth"] = retval["MaxWidth"];
        _modelProp["MaxHeight"] = retval["MaxHeight"];
        _modelProp["OtherMax"] = retval["OtherMax"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
        if (typeof retaval["HPrime"] !== "undefined") { _modelProp["HPrime"] = retval["HPrime"];}
    }
    return retval["IsValid"];
}

function getULCalcSections_StaticFD() {
    //modelName, frame, mounting, staticpressure, velocity, width, height
    var retval = lookuplookupULStaticFD(_modelName, _modelProp["FRAME"], _modelProp["MOUNTING"], _modelProp["STATIC PRESSURE"],
        _modelProp["VELOCITY"], parseInt(_modelProp["WIDTH"]), parseInt(_modelProp["HEIGHT"]))
    //update values 
    if (typeof retval["ErrorMsg"] !== "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["MaxWidth"] = retval["MaxWidth"];
        _modelProp["MaxHeight"] = retval["MaxHeight"];
        _modelProp["OtherMax"] = retval["OtherMax"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
        if (typeof retaval["HPrime"] !== "undefined") { _modelProp["HPrime"] = retval["HPrime"]; }
    }
    return retval["IsValid"];
}

function getULCalcSections_FD() {
    //modelName, frame, mounting, blade, staticpressure, velocity, width, height
    var retval = lookupCalcsFD(_modelName, _modelProp["FRAME"], _modelProp["MOUNTING"], _modelProp["BLADE ACTION"], _modelProp["STATIC PRESSURE"],
        _modelProp["VELOCITY"], parseInt(_modelProp["WIDTH"]), parseInt(_modelProp["HEIGHT"]));
    //update values 
    if (typeof retval["ErrorMsg"] !== "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["MaxWidth"] = retval["MaxWidth"];
        _modelProp["MaxHeight"] = retval["MaxHeight"];
        _modelProp["OtherMax"] = retval["OtherMax"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
    }
    return retval["IsValid"];
}

function getULCalcSections_FSD(bOtherMax) {
    //modelName, frame, mounting, blade, staticpressure, temp, velocity, width, height
    var retval = lookupULCalcsFSD(_modelName, _modelProp["FRAME"], _modelProp["MOUNTING"], _modelProp["BLADE ACTION"], _modelProp["STATIC PRESSURE"],
        _modelProp["ASSEMBLY TEMP"], _modelProp["VELOCITY"], parseInt(_modelProp["WIDTH"]), parseInt(_modelProp["HEIGHT"]), bOtherMax);
    //update values 
    if (typeof retval["ErrorMsg"] === "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["NumberOfSections"] = retval["NumberOfSections"];
        _modelProp["MaxWidth"] = retval["MaxWidth"];
        _modelProp["MaxHeight"] = retval["MaxHeight"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
        _modelProp["OtherMax"] = retval["OtherMax"];
    }
    return retval["IsValid"];
}

function getULCalcSections_SD() {
    //modelName, frame, fail, blade, staticpressure, temp, velocity, width, height
    var retval = lookupULCalcsSD(_modelName, _modelProp["FRAME"], _modelProp["MOUNTING"], _modelProp["BLADE ACTION"], _modelProp["STATIC PRESSURE"],
        _modelProp["ASSEMBLY TEMP"], _modelProp["VELOCITY"], parseInt(_modelProp["WIDTH"]), parseInt(_modelProp["HEIGHT"]), bOtherMax);
    //update values 
    if (typeof retval["ErrorMsg"] !== "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["NumberOfSections"] = retval["NumberOfSections"];
        _modelProp["MaxWidth"] = retval["MaxWidth"];
        _modelProp["MaxHeight"] = retval["MaxHeight"];
        _modelProp["OtherMax"] = retval["OtherMax"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
    }
    return retval["IsValid"];
}

//(modelName, actuator, accessories, grill, duct, width, height, sleeve)
function getULCalcSleeveLengthCalc_FSD() {
    var retval = lookuplooupULSleeveLengthCalcsFSD(_modelName, _modelProp["ACTUATOR"], _modelProp["ACCESSORIES"], _modelProp["GRILL DEPTH"],
        _modelProp["DUCT CONNECTIONS"], parseInt(_model["WIDTH"]), parseInt(_modelProp["HEIGHT"]), parseInt(_modelProp["SLEEVE LENGTH"]));
    //update values 
    if (typeof retval["ErrorMsg"] !== "undefined") {
        _modelProp["MaxSectionWidth"] = retval["MaxSectionWidth"];
        _modelProp["MaxSectionHeight"] = retval["MaxSectionHeight"];
        _modelProp["NumberOfSections"] = retval["NumberOfSections"];
        _modelProp["WidthAdd"] = retval["WidthAdd"];
    }
    return retval["IsValid"];
}

function listContains(list, value, length) {
    var check = list.split(",");
    //use full string value
    if (length > 0) {
        if (check.indexOf(value)) { return true; }
        else { return false; }
    } else {
        if (check.indexOf(value.substring(0, length))) { return true; }
        else { return false; }
    }
}

/*adds Value to ModelProperty table*/
function storeModelData(table, option) {
    if (typeof table[option] !== "undefined") {
        _modelProp[option] = table[option];
    }
}

function updatePropertyTable(table, product, variable, type, lineId, value) {
    /*loop through to find matching record*/
    for (var i = 0; i < _jobdata[table].length; i++) {
        if (_jobdata[table][i]["Record_Guid"] == product && _jobdata[table][i]["Property_Name"] == variable) {
            if (_jobdata[table][i]["Table_Name"] == type && _jobdata[table][i]["LineItem_Id"] == lineId) {
                _jobdata[table][i]["Property_Default_Value"] == value;
                break;
            }
        }
    }
}


