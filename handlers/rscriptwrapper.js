function RScriptWrapper(name, script, datasrcelementid)
{
    try {
        //alert(name);
        this._script = script;
        this._functions = new Array();
        this._datasourceid = datasrcelementid;
        this.parseScript(script);
        handler_base.call(this, name, true, null, null);
    }
    catch (e) {
        alert(e);
    }
}

RScriptWrapper.prototype = new handler_base();

RScriptWrapper.prototype.constructor = RScriptWrapper;

RScriptWrapper.prototype.processUI = function() {
    //alert("RScriptWrapper showing UI...");
    $("#divScript").empty();

    if (this._functions != null) {
        //alert(this._functions);

        // First we store the reference to the scriptwrapper obj
        currentScriptToRun = this;

        var rFunctions = this._functions;
        var datainputhtml = null;
        if (this._datasourceid != null) {
            datainputhtml = $("#" + this._datasourceid)[0].outerHTML;
        }
        if (datainputhtml == null || datainputhtml.length == 0)
            datainputhtml = "<input type='text' />";
        //alert(datainputhtml);
        for (var i = 0; i < rFunctions.length; i++) {
            var funcObj = rFunctions[i];
            var div = document.createElement("div");
            $(div).appendTo("#divScript");
            div.className = "scriptcomponent";
            var accordiondiv = document.createElement("div");
            accordiondiv.className = "parameteraccordion";
            var parameterhtml = "<p>" + funcObj.functionName + "</p><div><ul>";
            //alert(funcObj.parameters.length);
            for (var j = 0; j < funcObj.parameters.length; j++) {
                //alert(funcObj.parameters[j].paramName);
                parameterhtml += "<li><label>" + funcObj.parameters[j].paramName + "</label>&nbsp;&nbsp;" + datainputhtml + "<br /><input type='file' /></li>";
            }
            parameterhtml += "</ul><br/><input id='btnRunScript' type='button' value='Run' />&nbsp;&nbsp;<input id='btnCloseScript' type='button' value='Close' /></div>";
            accordiondiv.innerHTML = parameterhtml;
            $(div).prepend(accordiondiv);
        }

        $('.scriptcomponent').draggable({
            containment: "parent",
            helper: "original"
        });

        $('.parameteraccordion').accordion(
        { //active: true,
            //collapsible: true,
            heightStyle: "content"
        });

        //alert("Show script functions");
        //$(div).attr("style", "position: absolute");

        // We need to manually wireup the event because Chrome extension security mechanism
        // forbids inline javascript
        document.getElementById("btnCloseScript").onclick = closeScript;
        document.getElementById("btnRunScript").onclick = runScript;

        $("#divScript").attr("style", "display: block");

        /*$('#divScript').dialog( {height:500, width: 600,
                buttons: {
                    "Submit": function() {

                    },

                    "Close": function() {
                        $('#divScript').dialog('close');
                    }

                }
              }); */


    }
}

RScriptWrapper.prototype.handleNameList = function(namelist) {
    this.processUI();
}

RScriptWrapper.prototype.parseScript = function(script) {
    if (script != null) {
        try {
            var result = script.match(/[\w.]+\s*<-\s*function\s*\x28([\w=\s,\"'\\.]*)\x29/g);
            if (result != null) {
                for (var i = 0; i < result.length; i++) {
                    var funcObj = this.parseRFunction(result[i]);
                    if (funcObj != null) {
                        this._functions.push(funcObj);
                    }
                }
            }
        }
        catch (e) {
            alert(e);
        }
    }
}

RScriptWrapper.prototype.parseRFunction = function(rFunctionText)
{
  if (rFunctionText != null) {
      //alert(rFunctionText);
      var loc1 = rFunctionText.indexOf("<-");
      if (loc1 >= 0) {
          var funcObj = {};
          funcObj.functionName = rFunctionText.substring(0, loc1).trim();
          //alert(funcObj.functionName);
          var loc2 = rFunctionText.indexOf("(");
          var loc3 = rFunctionText.indexOf(")");
          if (loc2 >= 0 && loc3 > loc2) {
              var i = 1;
              // ignore all the white spaces between the left paranthesis and the first parameter
              while(rFunctionText[loc2 + i] == ' ' || rFunctionText[loc2 + i] == '\t')
                  i++;
              loc2 += i;
              var parameterstring = rFunctionText.substring(loc2, loc3);
              //alert(parameterstring);
              funcObj.parameters = [];
              if (parameterstring != null) {
                  var parametersplitted = parameterstring.split(",");
                  if (parametersplitted.length > 0)
                  {
                      for (var i = 0; i < parametersplitted.length; i++) {
                          var parametersplit = parametersplitted[i].split("=");
                          var parametername = parametersplit[0].trim();
                          //alert(parametername);
                          var param = {};
                          param.paramName = parametername;
                          funcObj.parameters.push(param);
                      }
                  }
              }
          }
          return funcObj;
      }
  }
  return null;
}