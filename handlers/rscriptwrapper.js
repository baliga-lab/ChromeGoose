// A RScriptWrapper wraps a R script/package, which contains one or many
// R functions. We parse the script to extract the functions and their parameters
//var currentRScriptWrapper = null;
function RScriptWrapper(name, script, datasrcelement)
{
    try {
        handler_base.call(this, name, true, 'handlers/rscriptwrapper.js', null, null);

        // Set the current rscriptwrapper to set the metadata in the callback funtion
        //currentRScriptWrapper = this;
        cg_util.httpGet(OPENCPU_SERVER + "/library/" + this._name + "/www/" + this._name + ".txt", this.handleMetaData);

        this._script = script;
        this._functions = new Array();

        // datasourceid is the id of the DOM select element that contains the parsed gaggle data
        this._datasourceelement = datasrcelement;
    }
    catch (e) {
        console.log("Failed to initialize RScriptWrapper: " + e);
    }
}

RScriptWrapper.prototype = new handler_base();

RScriptWrapper.prototype.constructor = RScriptWrapper;

RScriptWrapper.prototype.setPackageMetaData = function(packageMetaData)
{
    this._packageMetaData = packageMetaData;
}

RScriptWrapper.prototype.handleMetaData = function(packagemetadata) {
    console.log("Package meta data: " + packagemetadata);
    var packageMetaData = (packagemetadata == null) ? null : JSON.parse(packagemetadata);
    var rscriptwrapper = null;
    if (packageMetaData != null) {
        var packagename = packageMetaData["PackageName"];
        console.log("Obtained package name: " + packagename);
        rscriptwrapper = opencpuHandlers[packagename];
        console.log("Wrapper: " + rscriptwrapper);
        if (rscriptwrapper != null)
            rscriptwrapper.setPackageMetaData(packageMetaData);
    }

    /*if (rscriptWrapper == null) {
        cg_util.httpGet(OPENCPU_SERVER + "/library/" + this._name + "/R", function(robjects) {
            console.log("R Objects: " + robjects);
            if (robjects != null) {
                var robjsplit = robjects.split("\n");
                for (var j = 0; j < robjsplit.length; j++) {
                    var robj = robjsplit[j];
                    console.log("Parsing R obj " + robj);
                    cg_util.httpGet(OPENCPU_SERVER + "/library/" + this._name + "/R/" + robj, function(rscript) {
                        //console.log("R script: " + rscript);
                        if (rscript.indexOf("function") == 0) {
                            // This is a R function script
                            currentRScriptWrapper.setScript(robj, rscript);
                        }
                    });
                }
            }
        });
    } */
}

RScriptWrapper.prototype.processUI = function(pageData, organismshtml) {
    //$("#divScript").empty();
    console.log("Generating input html for package " + this._name + " " + this._packageMetaData + " " + organismshtml);
    var resulthtml = "<div id='divDataDialog' style='display: none'><div id='divAccordionFunctions'>";
    if (this._packageMetaData != null) {
        //var pagedatahtml = "<select class='selGaggleData' style='display: none'></select>";

        var pagedatahtml = "<select class='form-control input-sm selGaggleData'>" +
                           "<option value='-1'>----- Input Data -----</option>" +
                           "<option value='OtherText'> Paste/Enter text input</p></option>" +
                           "<option value='OtherFile'>Upload a File</option>" +
                           "<option value='-2'>----- Select a Data Item on Page -----</option>";

        // Generate the html for gaggled data on the current page
        var firstdata = true;
        for (var i = 0; i < pageData.length; i++) {
            if (pageData[i].jsondata == undefined)
                continue;

            var pagedataobj = JSON.parse(pageData[i].jsondata);
            var pagedata = pagedataobj["data"];
            var guid = pagedataobj["guid"];
            console.log("Page data GUID: " + guid);

            var text = (pagedata["_name"] != null) ? pagedata["_name"] : pagedata["name"];
            if (text == null)
                text = (pagedata["_type"] != null) ? pagedata["_type"] : pagedata["type"];
            console.log("option text: " + text);
            if (text != null) {
                var gaggledata = (pagedata["_data"] != null) ? pagedata["_data"] : pagedata["gaggle-data"];
                if (gaggledata != null && gaggledata.length > 0)
                    text += " (" + gaggledata.length + ")";
                pagedatahtml += "<option value='" + guid + "'>" + text + "</option>";
            }
        }
        pagedatahtml += ("</select><br />" +
                        "<div class='divTextInput' style='display:none;'>" +
                        "<input class='inputTextData' type='text' /><input class='btnCancelTextInput' type='button' value='Cancel' /></div>" +
                        "<div class='divFileInput' style='display:none;'>" +
                        "<input class='inputFileData' type='file' /><input class='btnCancelFileInput' type='button' value='Cancel' /></div>");
        console.log("Page data input html: " + pagedatahtml);


        // Now we parse package meta data to
        var parameterhtml = "";
        var packagename = (this._packageMetaData)["PackageName"];
        var funcsobj = (this._packageMetaData)["Functions"];
        if (funcsobj != null) {
            var findex = 0;
            do {
               var funcobj = funcsobj[findex.toString()];
               if (funcobj != null) {
                    findex++;
                    var funcname = funcobj["Name"];
                    var funcdesc = funcobj["Description"];
                    console.log("function name: " + funcname + " Description: " + funcdesc);
                    parameterhtml += ("<h3>" + funcname + "</h3><div>"
                                        + "<label>" + funcdesc + "</label><br/><ul>");

                    var parametersobj = funcobj["Parameters"];
                    if (parametersobj != null) {
                        var pindex = 0;
                        do {
                            var parameterobj = parametersobj[pindex.toString()];
                            if (parameterobj != null) {
                                pindex++;
                                var paramname = parameterobj["Name"];
                                var paramdesc = parameterobj["Description"];
                                var paramtype = parameterobj["Type"];
                                var paramtoshow = parameterobj["Show"];
                                var paramdefault = parameterobj["Default"];
                                console.log("Parameter name: " + paramname + " Parameter desc: " + paramdesc + "Parameter type:" + paramtype + " Parameter Show: " + paramtoshow + " Parameter default value: " + paramdefault);
                                if (paramtoshow == "True") {
                                    parameterhtml += "<li><label>" + paramdesc + "</label><input type='hidden' value='" + paramname + "' /><input type='hidden' value='" + paramtype + "' />&nbsp;&nbsp;";
                                    // Now generate html
                                    var inputhtml = "";
                                    if (paramtype == "file") {
                                        //parameterhtml += "<option value='-2'>------- Select an action -------</option>";
                                        //parameterhtml += "<option value='OtherFile'>Upload a File</option></select>";
                                        //inputhtml = "<div class='divFileInput' style='display:none;'><input class='inputFileData' type='file' /><input class='btnCancelFileInput' type='button' value='Cancel' /></div>";
                                        inputhtml = "<input class='inputFileData' type='file' />";

                                    }
                                    else if (paramtype == "text") {
                                        //parameterhtml += "<option value='-2'>------- Select an action -------</option>";
                                        //parameterhtml += "<option value='OtherText'>Input Text</option></select>";
                                        //inputhtml = "<div class='divTextInput' style='display:none;'><input class='inputTextData' type='text' /><input class='btnCancelTextInput' type='button' value='Cancel' /></div>";
                                        inputhtml = "<input class='inputTextData' type='text' ";
                                        if (paramdefault != null) {
                                            inputhtml += "value='" + paramdefault + "' ";
                                        }
                                        inputhtml += "/>";
                                    }
                                    else if (paramtype == "organism") {
                                        inputhtml += (organismshtml != null && organismshtml.length > 0) ? organismshtml : "<input class='inputTextData' type='text' />";
                                        //parameterhtml += "<option value='-3'>------- Invalid Parameter Type -------</option>";
                                    }
                                    else if (paramtype == "data") {
                                        inputhtml += pagedatahtml;
                                    }
                                    else if (paramtype == "boolean") {
                                        console.log("Boolean parameter");
                                        inputhtml += "<select>";
                                        if (paramdefault == null || paramdefault.toLowerCase() == "true") {
                                            inputhtml += "<option value='True'>True</option>";
                                            inputhtml += "<option value='False'>False</option></select>";
                                        }
                                        else {
                                            inputhtml += "<option value='False'>False</option>";
                                            inputhtml += "<option value='True'>True</option></select>";
                                        }
                                    }
                                    else if (paramtype == "Select") {
                                        var optionsobj = parameterobj["Options"];
                                        if (optionsobj != null) {
                                            inputhtml += "<select";
                                            if (paramdefault != null) {
                                                inputhtml += " value='" + paramdefault + "'";
                                            }
                                            inputhtml += ">";
                                            var optionindex = 0;
                                            var finished = false;
                                            do {
                                                var optionobj = optionsobj[optionindex.toString()];
                                                console.log("Option obj: " + optionobj);
                                                if (optionobj == null)
                                                    finished = true;
                                                else {
                                                    var name = optionobj["Name"];
                                                    var value = optionobj["Value"];
                                                    console.log("Name: " + name + " Value: " + value);
                                                    inputhtml += "<option value='" + value + "'>" + name + "</option>";
                                                    optionindex++;
                                                }
                                            }
                                            while (!finished);
                                            inputhtml += "</select>";
                                        }

                                    }
                                    parameterhtml += inputhtml + "</li>";
                                    console.log("Input html for parameter " + inputhtml);
                                }
                            }
                            else
                                break;
                        }
                        while (true);
                        parameterhtml += "</ul><br /><div id='divProgressBar'></div></br><input class='btnRunScript' type='button' value='Run' />";
                    }
               }
               else
                    break;
            }
            while (true);
            resulthtml += parameterhtml + "</div>";
        }
    }
    else {
        // No metadata is provided by the package, so we generate html based on the parsed r script
        console.log("Functions: " + this._functions);
        if (this._functions != null) {
            // First we store the reference to the scriptwrapper obj
            currentScriptToRun = this;
            var myname = this._name;

            var rFunctions = this._functions;
            console.log("processUI: # of functions: " + rFunctions.length);
            var datainputhtml = null;
            if (this._datasourceelement != null) {
                datainputhtml =  $(this._datasourceelement)[0].outerHTML;
                console.log("RScriptWrapper.processUI datainput html: " + datainputhtml);
            }
            if (datainputhtml == null || datainputhtml.length == 0)
                datainputhtml = "<input type='text' />";
            console.log("datainput html: " + datainputhtml);
            var resulthtml = "<div id='divDataDialog' style='display: none'><div id='divAccordionFunctions'>";
            for (var i = 0; i < rFunctions.length; i++) {
                var funcObj = rFunctions[i];
                var parameterhtml = "<h3>" + funcObj.functionName + "</h3><div><ul>";
                console.log(funcObj.parameters.length);
                for (var j = 0; j < funcObj.parameters.length; j++) {
                    console.log("Parameter name: " + funcObj.parameters[j].paramName);
                    parameterhtml += "<li><label>" + funcObj.parameters[j].paramName + "</label>&nbsp;&nbsp;" + datainputhtml + "</li>";
                }
                parameterhtml += "</ul><br/></div><br /><input class='btnRunScript' type='button' value='Run' />";
                resulthtml += parameterhtml + "</div>";
            }
            resulthtml += "</div></div>";
        }
    }
    console.log("RScriptwrapper html: " + resulthtml);

    // Now we inject the resulthtml to current page
    var myname = this._name;
    cg_util.getActiveTab(
        function (tab) {
            if (tab != null) {
                console.log("RScriptWrapper injecting html for " + myname);
                try {
                    // Send message to the content page to inject the code and pop up the dialogbox
                    var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_INSERTRSCRIPTDATAHTML,
                                      {html: resulthtml, tabid: tab.id.toString(), packagename: myname,
                                       insertUIId: "divDataDialog",
                                       injectscripturl: 'handlers/rscriptwrapper.js',
                                       injectcode: "var rscriptwrapper;var currentScriptToRun;var opencpuserver;processRScriptInputDataUI('" + myname + "', '" + OPENCPU_SERVER + "');",
                                       opencpuurl: OPENCPU_SERVER },
                                      function(response) {
                                           console.log("Post injecting processing...");

                                      });
                    msg.send();
                }
                catch(e) {
                    console.log("Failed to pass html to the content page " + e);
                }
            }
        }
    );
}

RScriptWrapper.prototype.handleNameList = function(namelist) {
    this.processUI();
}

RScriptWrapper.prototype.setScript = function(funcName, script) {
    this._script = script;
    this.parseScript(funcName, script);
}

RScriptWrapper.prototype.parseScript = function(funcName, script) {
    if (script != null) {
        try {
            console.log("Parsing script " + script);
            var funcname = funcName;
            var result = script.match(/[\w.]+\s*<-\s*function\s*\x28([\w=\s,\"'\\.]*)\x29/g);
            if (result == null) {
                result = script.match(/\s*function\s*\x28([\w=\s,\"'\\.]*)\x29/g);
                // This is a single function we get from opencpu. We only keep the top level function
                var funcobj = result[0];
                result = new Array();
                result[0] = funcobj;
            }
            console.log("parseScript Functions: " + result + " Function name: " + funcname);
            if (result != null) {
                for (var i = 0; i < result.length; i++) {
                    var funcObj = this.parseRFunction(funcname, result[i]);
                    if (funcObj != null) {
                        this._functions.push(funcObj);
                    }
                }
            }
        }
        catch (e) {
            console.log("Failed to parse script " + e);
        }
    }
}

RScriptWrapper.prototype.parseRFunction = function(funcName, rFunctionText)
{
  if (rFunctionText != null) {
      console.log("parseRFunction: " + rFunctionText + " " + funcName);
      var funcObj = {};
      if (funcName != null)
        funcObj.functionName = funcName;
      else {
        var loc1 = rFunctionText.indexOf("<-");
        if (loc1 >= 0)
        {
            funcObj.functionName = rFunctionText.substring(0, loc1).trim();
        }
      }
      console.log("Function name: " + funcObj.functionName);
      var loc2 = rFunctionText.indexOf("(");
      var loc3 = rFunctionText.indexOf(")");
      console.log("Parenthesis loc: " + loc2 + " " + loc3);
      if (loc2 >= 0 && loc3 > loc2) {
          var i = 1;
          // ignore all the white spaces between the left paranthesis and the first parameter
          while(rFunctionText[loc2 + i] == ' ' || rFunctionText[loc2 + i] == '\t')
              i++;
          loc2 += i;
          var parameterstring = rFunctionText.substring(loc2, loc3);
          console.log("Parameter string: " + parameterstring);
          funcObj.parameters = [];
          if (parameterstring != null) {
              var parametersplitted = parameterstring.split(",");
              if (parametersplitted.length > 0)
              {
                  for (var i = 0; i < parametersplitted.length; i++) {
                      var parametersplit = parametersplitted[i].split("=");
                      var parametername = parametersplit[0].trim();
                      console.log("Parameter name: " + parametername);
                      var param = {};
                      param.paramName = parametername;
                      funcObj.parameters.push(param);
                  }
              }
          }
      }
      return funcObj;
  }
  return null;
}

function setOrganism()
{
    // set the selected option of the organism select
    console.log("document.URL: " + document.URL);
    console.log("window.location");
    $(".selectOrganism").each(function () {
      var currSelect = $(this);
      $(this).find("option").each(function () {
        console.log("Select organism option value: " + $(this).val());
        var species = ($(this).val() == "mtu") ? "mtb" : $(this).val();
        if (document.URL.toLowerCase().indexOf("networks.systemsbiology.net") >= 0
            && document.URL.indexOf(species) >= 0) {
            console.log("Setting select vale to " + species);
            $(currSelect).val($(this).val());
            return;
        }
      });
    });
}

// Show the dialog after injecting the code to the current page
function processRScriptInputDataUI(packagename, opencpuurl)
{
   console.log("Processing data input UI for " + packagename);
   rscriptwrapper = new RScriptWrapper(packagename, null, null);
   currentScriptToRun = rscriptwrapper;
   opencpuserver = opencpuurl;
   $('#divAccordionFunctions').accordion(
   { //active: true,
       collapsible: true,
       heightStyle: "content"
   });

   $("#divProgressBar").hide();

   $(".selGaggleData").change(gaggleDataItemSelected);
   $(".btnCancelTextInput").click(cancelTextInput);
   $(".btnCancelFileInput").click(cancelFileInput);

   $(".btnRunScript").each(function() {
       $(this).click(runScript);
   });

   setOrganism();

   // Now open it as a dialog
   $('#divDataDialog').dialog( { height:550, width:500,  modal: false,
       buttons: {
           "Cancel": function() {
                $('#divDataDialog').dialog('close');
           }
       }
   });
}


function showDataInput(source, inputclass)
{
    var parentdiv = $(source).parent();
    console.log("Parent div: " + parentdiv);
    var textdiv = ($(parentdiv).find(inputclass))[0];
    console.log(textdiv);
    if (textdiv != null) {
        $(textdiv).show();
    }
}

function gaggleDataItemSelected(event)
{
    console.log("Gaggle data item selected "); // + $("#selGaggleMenu").val());

    var source = event.target;
    console.log("gaggleDataItemSelected: event source: " + source);
    var selected = $(source).val();
    console.log("Selected data value: " + selected);
    if (selected == "OtherText") {
        showDataInput(source, ".divTextInput");
    }
    else if (selected == "OtherFile") {
        showDataInput(source, ".divFileInput");
    }
}

function cancelTextInput(event) {
    console.log("Cancel data text input"); // + $("#selGaggleMenu").val());

    var source = event.target;
    $(source).parent().hide();
    var select = $(source).parent().find(".selGaggleData");
    $(select).val("-1");
}

function cancelFileInput(event) {
    console.log("Cancel data text input"); // + $("#selGaggleMenu").val());

    var source = event.target;
    $(source).parent().hide();
    var select = $(source).parent().find(".selGaggleData");
    $(select).val("-1");
}

function runScript(event)
{
    console.log("Running script...");
    if (currentScriptToRun != null) {
        console.log("Script to run: " + currentScriptToRun.getName());
        var parameters = {};
        var species = "";
        var source = event.target; // The Run button
        var parentdiv = $(source).parent();
        var datadesc = "";
        var paramtypes = {};
        $(parentdiv).find("li").each(function () {
            console.log("Parameter li: " + $(this));
            //var selected = $(this).val();
            var paramlabel = $(this).find("label");
            var paramdesc = $(paramlabel).html();
            var paramnameinput = $(paramlabel).next();
            var paramname = $(paramnameinput).val();
            var paramtypeinput = $(paramnameinput).next();
            var paramtype = $(paramtypeinput).val();
            var paramvalueinput = $(paramtypeinput).next();

            console.log("Parameter Name: " + paramname + " Param type: " + paramtype + " Param value: " + $(paramvalueinput).val());
            //if (selected == "OtherText") {
            paramtypes[paramname] = paramtype;

            if (paramtype.toLowerCase() == "organism" || paramtype.toLowerCase() == "organism") {
                //var textinput = $(this).find(".inputTextData");
                var paramvalue = $(paramvalueinput).val();
                console.log("Parameter value: " + paramvalue);  //$(textinput).val());
                //if ($(textinput).val() != null) {
                if (paramvalue != null) {
                    parameters[paramname] = paramvalue;
                    if (paramdesc.toLowerCase().indexOf("organism") >= 0 || paramdesc.toLowerCase().indexOf("species") >= 0)
                    {
                        species = paramvalue;
                        console.log("Species: " + species);
                    }
                }
            }
            else if (paramtype.toLowerCase() == "file") {
                var file = $(paramvalueinput)[0].files[0];

                console.log("File parameter: " + file);
                if (file != null) {
                    parameters[paramname] = file;
                    datadesc += (" [" + paramname + ": " + file.name + "]");
                }
            }
            else if (paramtype.toLowerCase() == "data") {
                console.log("Select element" + $(paramvalueinput).val());
                if ($(paramvalueinput).val() == "OtherText") {
                    paramtypes[paramname] = "string";  // We do not store string inputs on opencpu server
                    var textinput = $(this).find(".inputTextData");
                    console.log("text input: " + ($(textinput[0])).val());
                    var text = ($(textinput[0])).val().toUpperCase();
                    var splitted = text.split(' ');
                    if (splitted.length == 1)
                    {
                        splitted = text.split(',');
                        if (splitted.length == 1)
                            splitted = text.split(";");
                    }
                    if (splitted.length == 1) {
                        parameters[paramname] = [];
                        parameters[paramname].push(splitted[0]);
                    }
                    else
                        parameters[paramname] = splitted;
                    datadesc += (" [" + paramname + ": " + text + "]");
                }
                else if ($(paramvalueinput).val() == "OtherFile") {
                    var fileinput = $(this).find(".inputFileData");
                    var file = $(fileinput)[0].files[0];
                    parameters[paramname] = file;
                    datadesc += (" [" + paramname + ": " + file.name + "]");
                }
                else {
                    // page data
                    parameters[paramname] = $(paramvalueinput).val();
                    var option = $(paramvalueinput).find("option[value='" + $(paramvalueinput).val() + "']");
                    console.log("Selected data option: " + option + " text: " + $(option).text());
                    datadesc += (" [" + paramname + ": " + $(option).text() + "]");
                }
            }
            else if (paramtype.toLowerCase() == "select") {
                var selectedvalue = $(paramvalueinput).val();
                console.log("Selected value: " + selectedvalue);
                /*$(paramvalueinput).children().each(function () {
                    var value = $(this).val();
                    var text = $(this).text();
                    console.log("Option text " + text + " value: " + value);
                    parameters[value] = (value == selectedvalue) ? "T" : "F";
                }); */
                parameters[paramname] = selectedvalue;
                datadesc += (" [" + paramname + ": " + selectedvalue + "]");

            }
            else {
                // User selected a data item (either from the gaggled web page or received from broadcast)
                parameters[paramname] = $(paramvalueinput).val(); //selected;
                datadesc += (" [" + paramname + ": " + parameters[paramname] + "]");
            }
        });

        if (parameters != null) {
            // send parameters to the content page, which will run the scripts
            var packagename = currentScriptToRun.getName();
            //var resultdiv = ($(parentdiv).find(".divResult"))[0];
            //console.log("Result div: " + resultdiv);
            var parafunc = $(parentdiv).prev();
            var funcname = $(parafunc).text();
            console.log("Package name: " + packagename + " function name: " + funcname + " desc: " + datadesc);

            // Send event to the extension to execute the rscript
            var event = new CustomEvent('RScriptWrapperEvent', {detail: {packageName: packagename,
                                            functionName: funcname, scriptParameters : parameters, paramTypes: paramtypes, species: species, description: datadesc, initialRun: "true"},
                                            bubbles: true, cancelable: false});
            document.dispatchEvent(event);
        }
    }
    //closeScript();
}
