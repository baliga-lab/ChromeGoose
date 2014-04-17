// A RScriptWrapper wraps a R script/package, which contains one or many
// R functions. We parse the script to extract the functions and their parameters

function RScriptWrapper(name, script, datasrcelementid)
{
    try {
        handler_base.call(this, name, true, null, null);
        this._script = script;
        this._functions = new Array();
        // datasourceid is the id of the DOM select element that contains the parsed gaggle data
        this._datasourceid = datasrcelementid;
        this.parseScript(script);
    }
    catch (e) {
        alert(e);
    }
}

RScriptWrapper.prototype = new handler_base();

RScriptWrapper.prototype.constructor = RScriptWrapper;

RScriptWrapper.prototype.processUI = function() {
    $("#divScript").empty();

    console.log("Functions: " + this._functions);
    if (this._functions != null) {
        // First we store the reference to the scriptwrapper obj
        currentScriptToRun = this;

        var rFunctions = this._functions;
        console.log("processUI: # of functions: " + rFunctions.length);
        var datainputhtml = null;
        if (this._datasourceid != null) {
            datainputhtml = $("#" + this._datasourceid)[0].outerHTML;
        }
        if (datainputhtml == null || datainputhtml.length == 0)
            datainputhtml = "<input type='text' />";
        console.log("datainput html: " + datainputhtml);
        for (var i = 0; i < rFunctions.length; i++) {
            var funcObj = rFunctions[i];
            var div = document.createElement("div");
            $(div).appendTo("#divScript");
            div.className = "scriptcomponent";
            var accordiondiv = document.createElement("div");
            accordiondiv.className = "parameteraccordion";
            var parameterhtml = "<p>" + funcObj.functionName + "</p><div><ul>";
            console.log(funcObj.parameters.length);
            for (var j = 0; j < funcObj.parameters.length; j++) {
                console.log("Parameter name: " + funcObj.parameters[j].paramName);
                parameterhtml += "<li><label>" + funcObj.parameters[j].paramName + "</label>&nbsp;&nbsp;" + datainputhtml + "<br /><input type='file' /></li>";
            }
            parameterhtml += "</ul><br/><input class='btnRunScript' type='button' value='Run' />&nbsp;&nbsp;<input class='btnCloseScript' type='button' value='Close' /></div>";
            accordiondiv.innerHTML = parameterhtml;
            $(div).prepend(accordiondiv);
        }

        $('.scriptcomponent').draggable({
            containment: "parent",
            helper: "original"
        });

        $('.parameteraccordion').accordion(
        { //active: true,
            collapsible: true,
            heightStyle: "content"
        });

        // We need to manually wireup the event because Chrome extension security mechanism
        // forbids inline javascript
        $(".btnCloseScript").each(function() {
            $(this).click(closeScript);
        });

        $(".btnRunScript").each(function() {
            $(this).click(runScript);
        });


        $("#divScript").attr("style", "display: block");

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