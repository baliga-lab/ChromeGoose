var pageGaggleData = [];
var webHandlers = null;
var receivedData = null;
var parameterSessions = {};

var halConvertTable = {
'VNG7001'	:	'VNG5001H'	,
'VNG7002'	:	'VNG5003H'	,
'VNG7003'	:	'VNG5005H'	,
'VNG7005'	:	'VNG5007H'	,
'VNG7006'	:	'VNG5008H'	,
'VNG7007'	:	'VNG5009H'	,
'VNG7008'	:	'VNG5010G'	,
'VNG7009'	:	'VNG5011H'	,
'VNG7010'	:	'VNG5012H'	,
'VNG7011'	:	'VNG5013G'	,
'VNG7012'	:	'VNG5016H'	,
'VNG7013'	:	'VNG5017H'	,
'VNG7015'	:	'VNG5019G'	,
'VNG7016'	:	'VNG5020G'	,
'VNG7017'	:	'VNG5021G'	,
'VNG7018'	:	'VNG5022G'	,
'VNG7019'	:	'VNG5023G'	,
'VNG7020'	:	'VNG5025G'	,
'VNG7021'	:	'VNG5026G'	,
'VNG7022'	:	'VNG5027G'	,
'VNG7023'	:	'VNG5028G'	,
'VNG7024'	:	'VNG5029G'	,
'VNG7025'	:	'VNG5030G'	,
'VNG7026'	:	'VNG5032G'	,
'VNG7027'	:	'VNG5033G'	,
'VNG7028'	:	'VNG5034G'	,
'VNG7029'	:	'VNG5035G'	,
'VNG7030'	:	'VNG5037G'	,
'VNG7031'	:	'VNG5039G'	,
'VNG7032'	:	'VNG5040H'	,
'VNG7033'	:	'VNG5041H'	,
'VNG7034'	:	'VNG5042H'	,
'VNG7035'	:	'VNG5044H'	,
'VNG7036'	:	'VNG5045H'	,
'VNG7038'	:	'VNG5052G'	,
'VNG7039'	:	'VNG5055G'	,
'VNG7040'	:	'VNG5057G'	,
'VNG7041'	:	'VNG5059C'	,
'VNG7042'	:	'VNG5061C'	,
'VNG7043'	:	'VNG5062C'	,
'VNG7044'	:	'VNG5063H'	,
'VNG7046'	:	'VNG5064H'	,
'VNG7047'	:	'VNG5066G'	,
'VNG7048'	:	'VNG5068G'	,
'VNG7049'	:	'VNG5069C'	,
'VNG7051'	:	'VNG5071C'	,
'VNG7052'	:	'VNG5074C'	,
'VNG7053'	:	'VNG5075C'	,
'VNG7054'	:	'VNG5076G'	,
'VNG7055'	:	'VNG5077G'	,
'VNG7056'	:	'VNG5079H'	,
'VNG7059'	:	'VNG5082H'	,
'VNG7060'	:	'VNG5084G'	,
'VNG7061'	:	'VNG5085H'	,
'VNG7062'	:	'VNG5086H'	,
'VNG7063'	:	'VNG5087H'	,
'VNG7064'	:	'VNG5088H'	,
'VNG7065'	:	'VNG5089G'	,
'VNG7066'	:	'VNG5090C'	,
'VNG7067'	:	'VNG5091C'	,
'VNG7069'	:	'VNG5093C'	,
'VNG7071'	:	'VNG5199H'	,
'VNG7072'	:	'VNG5098C'	,
'VNG7073'	:	'VNG5100C'	,
'VNG7074'	:	'VNG5102H'	,
'VNG7075'	:	'VNG5104H'	,
'VNG7076'	:	'VNG5105H'	,
'VNG7077'	:	'VNG5106H'	,
'VNG7078'	:	'VNG5108H'	,
'VNG7080'	:	'VNG5115H'	,
'VNG7081'	:	'VNG5116H'	,
'VNG7082'	:	'VNG5118H'	,
'VNG7083'	:	'VNG5119H'	,
'VNG7085'	:	'VNG5122H'	,
'VNG7086'	:	'VNG5124H'	,
'VNG7087'	:	'VNG5126G'	,
'VNG7089'	:	'VNG5129H'	,
'VNG7090'	:	'VNG5131H'	,
'VNG7091'	:	'VNG5132H'	,
'VNG7092'	:	'VNG5133C'	,
'VNG7093'	:	'VNG5134G'	,
'VNG7094'	:	'VNG5135H'	,
'VNG7095'	:	'VNG5136G'	,
'VNG7096'	:	'VNG5138C'	,
'VNG7097'	:	'VNG5139C'	,
'VNG7099'	:	'VNG5141G'	,
'VNG7100'	:	'VNG5142G'	,
'VNG7101'	:	'VNG5143C'	,
'VNG7102'	:	'VNG5144H'	,
'VNG7103'	:	'VNG5145H'	,
'VNG7104'	:	'VNG5146H'	,
'VNG7105'	:	'VNG5147G'	,
'VNG7106'	:	'VNG5148H'	,
'VNG7107'	:	'VNG5149H'	,
'VNG7108'	:	'VNG5152H'	,
'VNG7109'	:	'VNG5153H'	,
'VNG7110'	:	'VNG5154H'	,
'VNG7112'	:	'VNG5156H'	,
'VNG7114'	:	'VNG5163G'	,
'VNG7115'	:	'VNG5164C'	,
'VNG7116'	:	'VNG5165H'	,
'VNG7117'	:	'VNG5166H'	,
'VNG7118'	:	'VNG5169H'	,
'VNG7119'	:	'VNG5170H'	,
'VNG7120'	:	'VNG5174H'	,
'VNG7121'	:	'VNG5177C'	,
'VNG7122'	:	'VNG5176C'	,
'VNG7123'	:	'VNG5180G'	,
'VNG7124'	:	'VNG5181G'	,
'VNG7125'	:	'VNG5182G'	,
'VNG7126'	:	'VNG5183G'	,
'VNG7127'	:	'VNG5185H'	,
'VNG7130'	:	'VNG5189H'	,
'VNG7131'	:	'VNG5191H'	,
'VNG7132'	:	'VNG5192H'	,
'VNG7134'	:	'VNG5194C'	,
'VNG7135'	:	'VNG5195H'	,
'VNG7136'	:	'VNG5197H'	,
'VNG7140'	:	'VNG5204C'	,
'VNG7142'	:	'VNG5206C'	,
'VNG7143'	:	'VNG5207C'	,
'VNG7144'	:	'VNG5208G'	,
'VNG7145'	:	'VNG5209H'	,
'VNG7146'	:	'VNG5210H'	,
'VNG7147'	:	'VNG5211H'	,
'VNG7148'	:	'VNG5212H'	,
'VNG7149'	:	'VNG5213G'	,
'VNG7150'	:	'VNG5215H'	,
'VNG7153'	:	'VNG5218H'	,
'VNG7154'	:	'VNG5220G'	,
'VNG7155'	:	'VNG5221G'	,
'VNG7156'	:	'VNG5222C'	,
'VNG7157'	:	'VNG5223C'	,
'VNG7158'	:	'VNG5225C'	,
'VNG7160'	:	'VNG5228C'	,
'VNG7161'	:	'VNG5229G'	,
'VNG7162'	:	'VNG5231G'	,
'VNG7164'	:	'VNG5233H'	,
'VNG7165'	:	'VNG5234H'	,
'VNG7166'	:	'VNG5235C'	,
'VNG7167'	:	'VNG5236C'	,
'VNG7168'	:	'VNG5238C'	,
'VNG7169'	:	'VNG5240G'	,
'VNG7170'	:	'VNG5242G'	,
'VNG7171'	:	'VNG5245G'	,
'VNG7174'	:	'VNG5253H'	,
'VNG7175'	:	'VNG5255H'	,
'VNG7176'	:	'VNG5256H'
};




function init()
{
    // Load web handler content script
    webHandlers = webhandlers.loadContentPageHandlers();

    // Handle gaggle data passed to top level from iframe
    window.addEventListener( "message",
      function (e) {
            console.log("Received post message: " + e.data.type);
            if (e.data != null && e.data.type == "gaggle") {
                if (window.self == top) {
                    console.log("Top level window handle message " + e.data.type);

                    var dataobj = e.data.data;
                    console.log("Data array: " + dataobj.length);
                    for (var i = 0; i < dataobj.length; i++) {
                        var dataitem = dataobj[i];
                        var guid = dataitem.guid;
                        if (guid != null && cg_util.findDataByGuid(pageGaggleData, guid) == null) {
                            var gaggleData = new GaggleData(dataitem.name,
                                                            dataitem.type,
                                                            dataitem.size,
                                                            dataitem.species,
                                                            dataitem.data);


                            var pagedata = {};
                            pagedata.data = gaggleData;
                            pagedata.guid = dataitem.guid;
                            var jsondata = JSON.stringify(pagedata);
                            console.log("page data " + pageGaggleData.length + " " + jsondata);
                            pagedata.jsondata = jsondata;
                            pagedata.source = "Page";
                            //alert(pagedata.source);
                            pageGaggleData.push(pagedata);
                        }
                    }
                }
                else {
                    // If I'm not the top level, pass the data up to my parent
                    console.log("Post message to parent");
                    window.parent.postMessage(e.data, "*");
                }
            }
      },
      false);

    document.addEventListener("IFrameGaggleDataEvent", function(e) {
        console.log("Received IFrameGaggleDataEvent " + e.detail.data);
        // Save the iframe gaggle data to pageGaggleData
        // Only do it on top level window
        if (window.self == top) {
            // This should never be reached....
            console.log("Received iframe data " + e.detail.data);
            var receivedData = e.detail.data;
            if (receivedData != null && e.detail.type == "gaggle") {
                console.log("Received " + receivedData.length + " data items");
                for (var i = 0; i < receivedData.length; i++) {
                    console.log("Data item " + i + ": " + receivedData[i]);
                    pageGaggleData.push(receivedData[i]);
                }
            }
        }
        else {
            console.log("Send iframe data to parent " + e.detail);
            var receivedPageData = e.detail.data;
            if (receivedPageData != null && e.detail.type == "gaggle") {
                // We need to call the lazy loader of each data item, and then
                // wrap the data in a duplicable object to be passed in postMessage to
                // the parent window
                var msgobj = {type: "gaggle"};
                var dataarray = new Array();
                msgobj.data = dataarray;
                for (var i = 0; i < receivedPageData.length; i++) {
                    var gaggledata = receivedPageData[i].data;
                    var guid = receivedPageData[i].guid;
                    if (gaggledata != null) {
                        //gaggledata.getData();
                        console.log(gaggledata.getName() + " " + gaggledata.getType() + " " + gaggledata.getSpecies());
                        var dataobj = {name: gaggledata.getName(), type: gaggledata.getType(),
                            species: gaggledata.getSpecies(), size: gaggledata.getSize(), guid: guid, data: gaggledata.getData()};
                        dataarray.push(dataobj);
                    }
                }
                window.parent.postMessage(msgobj, "*");
            }
        }
    });

    document.addEventListener("GaggleOutputInitEvent", function(e) {
        console.log("Received GaggleOutputInitEvent");
        // Pass it to background page to save the iframeid for the handler
        var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_GAGGLEOUTPUTINIT,
                              null, null);
        msg.send();
    });

    document.addEventListener("IFrameOpenEvent", function (e) {
        console.log("Received IFrameOpenEvent " + e.detail);
        var handler = e.detail.handler;
        var iframeid = e.detail.iframeId;

        // Pass it to background page to save the iframeid for the handler
        var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_STOREHANDLERIFRAMEID,
                              { handler: handler, iframeId: iframeid }, null);
        msg.send();
    });

    document.addEventListener("GaggleOutputPageEvent", function(e) {
        console.log("Received data from Gaggle Output Page " + e.detail);
        var data = e.detail.data;
        var handlerName = (e.detail)["handler"];
        var iframeid = (e.detail)["iframeId"];
        data.iframeId = iframeid;
        console.log("Data " + data + " handler " + handlerName + " Iframe Id: " + iframeid);

        if (data != null) {
            var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                  { handler: handlerName, source: data }, null);
            msg.send();
        }
    });

    // Execute R script
    document.addEventListener("RScriptWrapperEvent", function(e) {
        var outputurl = e.detail.outputurl;
        if (outputurl!= null) {
            try {
                var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RSCRIPTEVENT,
                                      e.detail, function() {
                                      });
                msg.send();
            }
            catch (e) {
                alert("Failed to send message to background page: " + e);
            }
        }
        else {
            receivedData = e.detail;
            //alert("Received parameters from page: " + receivedParameters);
            // Now we get broadcast data from the background page
            // Get data broadcast to me from other geese
            var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_BROADCASTDATA,
                                  null, execRScript);
            msg.send();
        }
    });

    document.addEventListener("RScriptRerunFromOutputPageEvent", function(e) {
        console.log("Received rscript rerun event: " + e.detail);
        // Now we pass the event to background page, which will send it to the gaggle.js of the source tab
        var guid = e.detail.rscriptGuid;
        var tabid = e.detail.sourceTabId;
        var parameters = e.detail.parameters;
        console.log("page received rscript guid " + guid);
        var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RERUNEVENT,
                              {rscriptGuid: guid, sourceTabId: tabid, parameters: parameters}, null);
        msg.send();
    });

    var control = document.getElementById("inputDataParsingFinishSignal");
    if (control == null)
        getPageData();
    else
        parsePage();
}

function storeParameterOnOpencpuServer(parameterToBeStoredOnServer, paramIndex, storedParamSessionIDs, callback)
{
    if (parameterToBeStoredOnServer == null)
        return;

    if (paramIndex >= parameterToBeStoredOnServer.length) {
        if (callback != null) {
            console.log("Calling opencpu function...");
            callback(storedParamSessionIDs);
        }
        return;
    }

    var data = null;
    var dataindex = -1;
    do {
        dataindex = parameterToBeStoredOnServer[paramIndex]["index"];
        data = parameterToBeStoredOnServer[paramIndex]["data"];
        paramIndex++;
    }
    while (data == null && paramIndex < parameterToBeStoredOnServer.length);

    console.log("Calling ocpu to store " + data);
    if (data != null) {
        var req = ocpu.call("saveData", {x: data}, function(session){
            console.log("Stored parameter " + data + " to Session ID: " + session.getKey() + " session URl: " + session.getLoc());
            var sessionparamobj = {paramIndex: dataindex, sessionObj: session };
            storedParamSessionIDs.push(sessionparamobj);
            storeParameterOnOpencpuServer(parameterToBeStoredOnServer, paramIndex, storedParamSessionIDs, callback);
        });
    }
}

function callOpencpu(parametersessionobj, parameters, parameterToBeStoredOnServer, progressbar, progessid) {
    var storedParamSessions = [];
    var packagename = parametersessionobj.package;
    var funcname = parametersessionobj["functionname"];
    var species = parameters["org"];
    var desc = parametersessionobj["description"];
    var guid = parametersessionobj["id"];
    console.log("Package species: " + species + " package: " + packagename + " function: " + funcname + " guid: " + guid);

    // Record the opencpu function has actually been executed
    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GOOGLEANALYTICS,
                          { category: packagename, data: funcname, action: 'Run' }, null);
    msg.send();

    // First store the data
    //var storedParamSessionIDs = [];
    ocpu.seturl(OPENCPU_SERVER + "/library/" + packagename + "/R");
    storeParameterOnOpencpuServer(parameterToBeStoredOnServer, 0, storedParamSessions, function(storeParameterOnOpencpuServer) {
        if (storedParamSessions != null) {
            // replace the stored parameter with their session obj
            for (var i = 0; i < storedParamSessions.length; i++) {
                var sessiondataobj = storedParamSessions[i];
                var index = sessiondataobj["paramIndex"];
                var sessionobj = sessiondataobj["sessionObj"];
                console.log("Fetching stored param session info " + index + " " + sessionobj);
                parameters[index] = sessionobj;
            }
        }
        // store the parameters of this run for future rerun reference
        parametersessionobj.parameters = parameters;

        console.log("Parameter JSON string: " + JSON.stringify(parameters));


        var req = ocpu.call(funcname, parameters, function(session){
            console.log("Session ID: " + session.getKey() + " session URl: " + session.getLoc());
            if (progressbar) {
                progressbar.progressbar( "option", {
                  value: 100
                });
                clearInterval(progessid);
                // remove the dialog
                $(".ui-dialog").remove();
            }

            /*$("#divProgressBar").progressbar( "option", {
                value: 100
            }); */


            var openurl = OPENCPU_SERVER + "/library/" + packagename + "/www/" + funcname
                + "_output.html?host=" + OPENCPU_SERVER + "&sessionID=" + session.getKey() + "&species=" + species;
            console.log("Open output html page: " + openurl);
            var scripturl = "handlers/" + funcname.toLowerCase() + ".js";
            // Note that the variable name of the corresponding handler should be the same as the package name
            var code = packagename + ".parseData('" + OPENCPU_SERVER + "', '" + packagename + "', '" + funcname + "', '" + session.getKey() + "', '" + species + "', '" + desc + "', '" + guid + "');"; // All the opencpu output data page should have this function

            // Call background page to verify if the gaggle_output.html is already opened, and inject the script and
            // execute the code
            var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_RSCRIPTEVENT,
                                  {outputurl: openurl, script: scripturl, code: code}, function() {
                                  });
            msg.send();


            /*session.getObject(function(data) {
                console.log("Function return: " + JSON.stringify(data));
                var result = data["message"];
                console.log("Result text: " + result + " result div: " + resultdiv);
                if (result != null) {
                    // Open a tab and show the result
                    $(resultdiv).show();
                    $(resultdiv).html(result);
                }
            }); */
        });

        req.fail(function(){
            if (progressbar) {
                progressbar.progressbar( "option", {
                  value: 100
                });
                clearInterval(progessid);
            }
            alert("OPENCPU Server error: " + req.responseText);
        });
    });
}


function reExecRScript(guid, newParameters)
{
    if (guid != null && newParameters != null && newParameters.length > 0) {
        console.log("Re exec rscript " + guid + " " + newParameters);
        var parametersessionobj = parameterSessions[guid];
        var parameters = parametersessionobj["parameters"];
        if (parametersessionobj != null) {
            var existingparameters = parametersessionobj.parameters;
            for (var i = 0; i < newParameters.length; i++) {
                var paramobj = newParameters[i];
                var paramname = paramobj["paramName"];
                var paramvalue = paramobj["paramValue"];
                var paramvaluetype = paramobj["paramValueType"];
                console.log("New param name: " + paramname + " value: " + paramvalue + " type: " + paramvaluetype);
                if (paramvaluetype == "string")
                    parameters[paramname] = paramvalue;
                else if (paramvaluetype == "double")
                    parameters[paramname] = parseFloat(paramvalue);
                else if (paramvaluetype == "integer")
                    parameters[paramname] = parseInt(paramvalue);
            }
            callOpencpu(parametersessionobj, parameters, [], null, -1);
        }
    }
}

function execRScript(broadcastData) {
    console.log("Rscript event data: " + receivedData);
    var funcname = receivedData["functionName"];
    var packagename = receivedData["packageName"];
    console.log("Package name: " + packagename + ", Function name: " + funcname);


    var desc = receivedData["description"];
    console.log("Desc: " + desc);
    var parameters = receivedData["scriptParameters"];
    var parameterToBeStoredOnServer = [];
    var storedParamSessions = [];
    var guid = cg_util.generateUUID();
    //storedParamSessions = [];
    var parametersessionobj = {id: guid, package: packagename, functionname: funcname, description: desc };
    parameterSessions[guid] = parametersessionobj;

    // Get data using GUID if parameter is gaggled data on page
    for (var k in parameters) {
        if (parameters.hasOwnProperty(k)) {
           var p = parameters[k];
           var data = cg_util.findDataByGuid(broadcastData, p);
           if (data == null)
               data = cg_util.findDataByGuid(pageGaggleData, p);
           if (data != null)
           {
               var originaldata = data.data;
               console.log("Parameter data: " + originaldata);
               if (originaldata.getData == null)
                  parameters[k] = originaldata["gaggle-data"];
               else
                  parameters[k] = originaldata.getData();

               // HACK HACK
               // convert mtu to lowercase
               var source = parameters[k];
               console.log("Processing mtu data if applicable: " + source);
               if (source != null) {
                  for (var i = 0; i < source.length; i++) {
                    var srcdata = source[i];
                    if (srcdata.indexOf("RV") == 0) {
                        srcdata = srcdata.replace("RV", "Rv");
                        var last = srcdata.charAt(srcdata.length - 1);
                        if (last == last.toUpperCase() && last != last.toLowerCase()) {
                            var firstpart = srcdata.substr(0, srcdata.length - 1);
                            srcdata = firstpart + last.toLowerCase();
                        }
                        console.log("Processed RV data: " + srcdata);
                        source[i] = srcdata;
                    }
                    else if (srcdata.indexOf("VNG") == 0) {
                        if (halConvertTable[srcdata] != null) {
                            source[i] = halConvertTable[srcdata];
                            console.log("Converted " + srcdata + " to " + source[i]);
                        }
                    }
                  }
                  parameters[k] = source;
                  // We store the data on opencpu server first and then reference them
                  var paramstoreobj = {index: k, data: source};
                  parameterToBeStoredOnServer.push(paramstoreobj);
               }
               console.log("Parameter Gaggle data: " + parameters[k]);
           }
           else {
             console.log("Data is a file object: " + (p.fileName));
             if (p.fileName != null) {
                var paramstoreobj = {index: k, data: p};
                parameterToBeStoredOnServer.push(paramstoreobj);
             }
           }
        }
    }

    $("#divProgressBar").show();
    var progressbar = $( "#divProgressBar" );
    progressbarValue = progressbar.find( ".ui-progressbar-value" );
    $("#divProgressBar").progressbar({value: 0});
    progressbarValue.css({
        "background": '#' + Math.floor( Math.random() * 16777215 ).toString( 16 )
    });

    var progress = 0;
    var step = 10;
    var progessid = setInterval(function() {
        progress += step;
        if (progress == 70)
            step = 2;
        else if (progress == 90)
            step = 1;
        else if (progress == 99)
            step = 0;
        progressbar.progressbar( "option", {
                  value: progress
                });
    }, 500);

    console.log("Parameter JSON string: " + JSON.stringify(parameters));
    callOpencpu(parametersessionobj, parameters, parameterToBeStoredOnServer, progressbar, progessid);
}

// The output page of rscriptwrapper has javascript code to generate gaggled data.
// We need to wait after the code is done to parse the page.
// We hook up to the load event to wait for javascript to finish running
// before parsing the page.

function parsePage() {
    //alert("Parsing page...");
    var control = $("#inputDataParsingFinishSignal");
    if (control != null) {
        var jsInitChecktimer = setInterval (checkForJS_Finish, 2000);

        function checkForJS_Finish () {
            if ($("#inputDataParsingFinishSignal").val() == "Goose")
            {
                // Clear the array since we are on the same page, and we do not want to
                // show the same data item multiple times
                pageGaggleData.length = 0;

                $("#inputDataParsingFinishSignal").val("False");
                //pageGaggleData = {};
                //clearInterval (jsInitChecktimer);
                getPageData();
            }
        }
    }
    else
        getPageData();
}

function getPageData()
{
    //alert("Parsing page...");
    /*var names = new Array("BC0478", "BC0706", "BC0772");
    var nl = new Namelist("bcu namelist (5)", 5, "bcu", names);
    var pagedata = {data: nl};
    var jsondata = JSON.stringify(pagedata);
    pagedata.jsondata = jsondata;
    pageGaggleData.push(pagedata);
    */

    console.log("Scanning page for gaggle data...");
    for (var i = 0; i < webHandlers.length; i++) {
        var handler = webHandlers[i];
        if (handler.scanPage != null)
            handler.scanPage();
    }
    console.log("Parsed data: " + pageGaggleData.length);


    // Send to background.js
    /*chrome.runtime.sendMessage({
        from: "content",
        subject: "showPageAction"
    }); */
}

/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    //if (msg.subject == MSG_SUBJECT_INSERTRSCRIPTDATAHTML)
    //alert("Content script message received from " + msg.from + " subject: " + msg.subject);
    if (msg.from && (msg.from == MSG_FROM_BACKGROUND)) {
        if (msg.subject) {
            if (msg.subject == MSG_SUBJECT_RERUNTOPAGE) {
                console.log("Received opencpu rerun " + msg.data);
                var data = JSON.parse(msg.data);
                var guid = data["rscriptGuid"];
                var receivedParameters = data["parameters"];
                var newparams = [];
                var index = 0;
                do {
                    var paramobj = receivedParameters[index.toString()];
                    if (paramobj != null) {
                        newparams.push(paramobj);
                        console.log("Got param: " + paramobj);
                        index++;
                    }
                    else
                        break;
                }
                while(true);
                reExecRScript(guid, newparams);
            }
            else if (msg.subject == MSG_SUBJECT_OPENURL) {
                console.log("Open url: " + msg.data);
                var data = JSON.parse(msg.data);
                var url = data["Url"];
                var target = data["Target"];
                var geneId = data["GeneId"];
                var geneName = data["GeneName"];
                var source = data["Source"];
                var iframeId = data["IFrameId"];
                var containerClass = data["ContainerClass"];
                var iframeDivClass = data["IFrameDivClass"];
                var iframeClass = data["IFrameClass"];
                var embedhtml = data["EmbedHtml"];
                console.log("Embed html: " + embedhtml)
                if (target == "IFrame") {
                    cg_util.createIFrame(url, iframeId, containerClass, iframeDivClass, iframeClass, embedhtml);
                }
            }
            else if (msg.subject == MSG_SUBJECT_GAGGLEPARSERESULT) {
                console.log("Received gaggle parse result: " + msg.data);
                var data = JSON.parse(msg.data);
                var geneId = data["GeneId"];
                var geneName = data["GeneName"];
                var type = data["Type"];
                var source = data["Source"];
                var desc = data["Description"];
                var url = data["Url"];
                var iframeid = data["IFrameId"];

                if ($("#" + iframeid).parent().find(".divChromeGooseEmbedInfo").length > 0) {
                    var embeddiv = $("#" + iframeid).parent().find(".divChromeGooseEmbedInfo")[0];
                    var inputgeneId = $(embeddiv).find(".inputGeneId")[0];
                    var inputgeneName = $(embeddiv).find(".inputGeneName")[0];
                    geneId = $(inputgeneId).val();
                    geneName = $(inputgeneName).val();
                    console.log("Gaggle.js found embedded geneId " + geneId + " Gene name: " + geneName);
                }
                var event = new CustomEvent('GaggleParseEvent',
                                            {detail:
                                                {
                                                 GeneId: geneId,
                                                 GeneName: geneName,
                                                 Url: url,
                                                 Type: type,
                                                 Source: source,
                                                 Description: desc,
                                                 IFrameId: iframeid
                                                 },
                                             bubbles: true,
                                             cancelable: false});
                document.dispatchEvent(event);
            }
        }
    }
    if (msg.from && (msg.from == MSG_FROM_POPUP))
    {
        if (msg.subject) {
            if (msg.subject == MSG_SUBJECT_PAGEDATA) {
                console.log("Sending page data: " + pageGaggleData.length);
                /*for (var i = 0; i < pageGaggleData.length; i++)
                    if (pageGaggleData[i].data != null && pageGaggleData[i].data.getData != null) {
                        console.log("Call lazy load: " + pageGaggleData[i].data.getData());
                    } */
                if (pageGaggleData.length > 0) {
                    if (response != null) {
                        response(pageGaggleData);
                    }
                }
            }
            else if (msg.subject == MSG_SUBJECT_GETDATABYINDEX) {
                //alert("Getting page data by index " + msg.data);
                if (pageGaggleData.length > 0 && msg.data != null)
                {
                    var jsonobj = JSON.parse(msg.data);
                    var handlerindexstr = jsonobj['handlerindex'];
                    var dataindex = jsonobj['dataindex'];
                    console.log(handlerindexstr + " " + dataindex);
                    var originaldata = cg_util.findDataByGuid(pageGaggleData, dataindex); //pageGaggleData[parseInt(dataindex)].data;
                    console.log(originaldata);
                    //console.log(originaldata.getData);

                    // Call the lazy reader
                    if (originaldata != null && originaldata.data != null) {
                        originaldata = originaldata.data;
                        var fetcheddata = originaldata.getData();
                        //alert(fetcheddata);
                        originaldata.setData(fetcheddata);
                    }
                    var responseobj = { handlerindex: handlerindexstr, data: originaldata };
                    if (response != null)
                        try {
                            response(JSON.stringify(responseobj));
                        }
                        catch(e) {
                            console.log("Failed to process retrieve data by index: " + e);
                        }
                }
            }
            else if (msg.subject == MSG_SUBJECT_INSERTRSCRIPTDATAHTML) {
                //alert("Inserting HTML into current page");
                var jsonobj = JSON.parse(msg.data);
                if (jsonobj != null) {
                    var html = jsonobj["html"];
                    var tabid = jsonobj["tabid"];
                    var rpackagename = jsonobj["packagename"];
                    var opencpuurl = jsonobj["opencpuurl"];
                    var injectscripturl = jsonobj['injectscripturl'];
                    var injectcode = jsonobj['injectcode'];
                    var insertUIId = jsonobj["insertUIId"];

                    // Remove existing dialog
                    $(".ui-dialog").remove();

                    //alert("HTML to be inserted: " + html);
                    if (html != null) {
                        // Insert jquery ui css
                        console.log("Tab ID: " + tabid + " script url " + injectscripturl + ' code: ' + injectcode);
                        try {
                            var injectdiv = document.getElementById("divChromeGooseInject");
                            if (injectdiv)
                                injectdiv.innerHTML = html;
                            else {
                                var div = document.createElement("div");
                                div.setAttribute("id", "divChromeGooseInject");
                                div.innerHTML = html;
                                document.body.appendChild(div);
                            }

                            cg_util.injectJavascript("jquery-1.11.0.min.js", function() {
                                cg_util.injectJavascript("jquery-ui-1.10.4.js", function() {
                                    cg_util.injectJavascript("opencpu-0.4.js", function() {
                                        cg_util.injectJavascript("handlers/handler.js", function() {
                                            cg_util.injectJavascript(injectscripturl, function() {
                                                cg_util.injectCode(injectcode,
                                                //("var rscriptwrapper;var currentScriptToRun;var opencpuserver;processRScriptInputDataUI('" + rpackagename + "', '" + opencpuurl + "');",
                                                    function() {
                                                        if (response != null) {
                                                            response(null);
                                                        }
                                                    }
                                                );
                                            });
                                        });
                                    });
                                });
                            });
                         }
                         catch (e) {
                            console.log("Failed to inject R html code to page: " + e);
                         }

                    }
                }
            }
            else if (msg.subject == MSG_SUBJECT_INSERTPIPE2SEARCHHANDLE) {
                console.log("gaggle.js hookup PIPE2 Search event " + msg.data);
                var data = JSON.parse(msg.data);
                if (data != null) {
                    var script = data['targetScript'];
                    var tabid = data['tabid'];
                    if (script != null) {
                        // First hook up the search result event
                        console.log("Hooking up PIPE2SearchResultEvent");
                        document.addEventListener("PIPE2SearchResultEvent", function(e) {
                            var found = e.detail.pipe2found;
                            var tabid = e.detail.tabid;
                            var targetscript = script;
                            console.log("PIPE2 Search result: " + tabid + " " + found);

                            // Inform the background page, which will decide whether to create a new tab
                            var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_PIPE2SEARCHRESULT,
                                                 { mytabid: tabid, pipe2found: found },
                                                 function(datatobeprocessed, tab) {
                                                    if (datatobeprocessed != null) {
                                                        // Now we pass the data to the injected code
                                                        console.log("PIPE2SearchResultEvent handler sending data to page...");
                                                        var species = datatobeprocessed.getSpecies();
                                                        var names = datatobeprocessed.getData();
                                                        console.log("Species: " + species + " Names: " + names);
                                                        var event = new CustomEvent('PIPE2DataEvent',
                                                                                    {detail:
                                                                                        {dataspecies: species,
                                                                                        namelist: names},
                                                                                        bubbles: true,
                                                                                        cancelable: false});
                                                        document.dispatchEvent(event);
                                                    }
                                                 });
                            msg.send();
                        });
                    }
                }
                if (response != null)
                    response();
            }
        }

    }
});

init();
//getPageData();