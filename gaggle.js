var pageGaggleData = [];
var webHandlers = null;
var receivedData = null;

function init()
{
    // Load web handler content script
    webHandlers = webhandlers.loadContentPageHandlers();

    document.addEventListener("GaggleOutputPageEvent", function(e) {
        console.log("Received data from Gaggle Output Page " + e.detail);
        var data = e.detail.data;
        var handlerName = (e.detail)["handler"];
        console.log("Data " + data + " handler " + handlerName);

        if (data != null) {
            var msg = new Message(MSG_FROM_CONTENT, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                  { handler: handlerName, source: data }, null);
            msg.send();
        }
    });

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

    var control = document.getElementById("inputDataParsingFinishSignal");
    if (control == null)
        getPageData();
    else
        parsePage();
}

function execRScript(broadcastData) {
    var parameters = receivedData["scriptParameters"];
    for (var k in parameters) {
        if (parameters.hasOwnProperty(k)) {
           var p = parameters[k];
           var data = cg_util.findDataByGuid(broadcastData, p);
           if (data == null)
               data = cg_util.findDataByGuid(pageGaggleData ,p);
           if (data != null)
               parameters[k] = data;
        }

    }
    var funcname = receivedData["functionName"];
    var packagename = receivedData["packageName"];
    console.log("Package name: " + packagename + ", Function name: " + funcname);
    ocpu.seturl(OPENCPU_SERVER + "/library/" + packagename + "/R");
    console.log("Parameter JSON string: " + JSON.stringify(parameters));
    var species = parameters["org"];
    console.log("Package species: " + species);

    var req = ocpu.call(funcname, parameters, function(session){
        console.log("Session ID: " + session.getKey() + " session URl: " + session.getLoc());
        var openurl = OPENCPU_SERVER + "/library/" + packagename + "/www/" + funcname
            + "_output.html?host=" + OPENCPU_SERVER + "&sessionID=" + session.getKey() + "&species=" + species;
        console.log("Open output html page: " + openurl);
        var scripturl = "handlers/" + funcname.toLowerCase() + ".js";
        var code = "parseData('" + OPENCPU_SERVER + "', '" + packagename + "', '" + funcname + "', '" + session.getKey() + "', '" + species + "');"; // All the opencpu output data page should have this function

        // Pass an event including the open url to the extension
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
        console.log("Server error: " + req.responseText);
    });
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
            if ($("#inputDataParsingFinishSignal").val() == "True")
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

    if (msg.from && (msg.from == MSG_FROM_POPUP))
    {
        if (msg.subject) {
            if (msg.subject == MSG_SUBJECT_PAGEDATA) {
                /* Collect the necessary data
                 * (For your specific requirements `document.querySelectorAll(...)`
                 *  should be equivalent to jquery's `$(...)`)*/

                /* Directly respond to the sender (popup),
                 * through the specified callback */
                //alert("Sending page data: " + pageGaggleData.length);
                if (response != null)
                    response(pageGaggleData);
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

                    //alert("HTML to be inserted: " + html);
                    if (html != null) {
                        // Insert jquery ui css
                        console.log("Tab ID: " + tabid + " script url " + injectscripturl + ' code: ' + injectcode);
                        try {
                            var div = document.createElement("div");
                            div.setAttribute("id", "divChromeGooseInject");
                            div.innerHTML = html;
                            document.body.appendChild(div);

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