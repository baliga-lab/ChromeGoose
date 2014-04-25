// A RScriptWrapper wraps a R script/package, which contains one or many
// R functions. We parse the script to extract the functions and their parameters

function RScriptWrapper(name, script, datasrcelement)
{
    try {
        handler_base.call(this, name, true, null, null);
        this._script = script;
        this._functions = new Array();
        // datasourceid is the id of the DOM select element that contains the parsed gaggle data
        this._datasourceelement = datasrcelement;
        this.parseScript(script);
    }
    catch (e) {
        alert(e);
    }
}

RScriptWrapper.prototype = new handler_base();

RScriptWrapper.prototype.constructor = RScriptWrapper;

RScriptWrapper.prototype.processUI = function() {
    //$("#divScript").empty();

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
            parameterhtml += "</ul><br/><div class='divResult' style='display: none'></div><br /><input class='btnRunScript' type='button' value='Run' />";
            resulthtml += parameterhtml + "</div>";
        }
        resulthtml += "</div></div>";
        console.log("RScriptwrapper html: " + resulthtml);

        // Now we inject the resulthtml to current page

        cg_util.getActiveTab(
            function (tab) {
                if (tab != null) {
                    console.log("RScriptWrapper injecting html for " + myname);
                    try {
                        var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_INSERTRSCRIPTDATAHTML,
                                          {html: resulthtml, tabid: tab.id.toString(), packagename: myname,
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

   $(".selGaggleData").change(gaggleDataItemSelected);
   $(".btnCancelTextInput").click(cancelTextInput);
   $(".btnCancelFileInput").click(cancelFileInput);

   $(".btnRunScript").each(function() {
       $(this).click(runScript);
   });

   // Now open it as a dialog
   $('#divDataDialog').dialog( { height:550, width:500,  modal: false,
       buttons: {
           "Cancel": function() {
                $('#divDataDialog').dialog('close');
                $(this).dialog('destroy').remove();
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
        var source = event.target; // The Run button
        var parentdiv = $(source).parent();
        $(parentdiv).find(".selGaggleData").each(function () {
            console.log("selGaggleData: " + $(this).val());
            var selected = $(this).val();
            if (selected != "-1") {
                var paramlabel = $(this).parent().parent().find("label");
                console.log("Parameter Name: " + $(paramlabel).html());
                if (selected == "OtherText") {
                    var textinput = $(this).parent().find(".inputTextData");
                    console.log("Parameter value: " + $(textinput).val());
                    if ($(textinput).val() != null) {
                        parameters[$(paramlabel).html()] = $(textinput).val();
                    }
                }
                else if (selected == "OtherFile") {
                    var fileinput = $(this).parent().find(".inputFileData");
                    var file = $(fileinput)[0].files[0];
                    console.log("File parameter: " + file);
                    if (file != null) {
                        parameters[$(paramlabel).html()] = file;
                    }
                }
            }
        });

        if (parameters != null) {
            var resultdiv = ($(parentdiv).find(".divResult"))[0];
            console.log("Result div: " + resultdiv);
            var parafunc = $(parentdiv).prev();
            var packageindex = $("#selTarget").val();
            var packagename = currentScriptToRun.getName();
            console.log("Package name: " + packagename + ", Function name: " + $(parafunc).text());
            ocpu.seturl(opencpuserver + "/library/" + packagename + "/R");
            console.log("Parameter JSON string: " + JSON.stringify(parameters));
            var req = ocpu.call($(parafunc).text(), parameters, function(session){
                console.log("Session ID: " + session.getKey() + " session URl: " + session.getLoc());
                var openurl = opencpuserver + "/library/" + packagename + "/www/" + $(parafunc).text()
                    + "_output.html?host=" + opencpuserver + "&sessionID=" + session.getKey();
                console.log("Open output html page: " + openurl);

                // Pass an event including the open url to the extension
                var event = new CustomEvent('RScriptWrapperEvent', {detail: {outputurl : openurl}, bubbles: true, cancelable: false});
                document.dispatchEvent(event);


                session.getObject(function(data) {
                    console.log("Function return: " + JSON.stringify(data));
                    var result = data["message"];
                    console.log("Result text: " + result + " result div: " + resultdiv);
                    if (result != null) {
                        // Open a tab and show the result
                        $(resultdiv).show();
                        $(resultdiv).html(result);
                    }
                });
            });

            req.fail(function(){
                console.log("Server error: " + req.responseText);
            });
        }
    }
    //closeScript();
}
