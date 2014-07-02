var pageGaggleData = [];
var webHandlers = null;
var receivedData = null;

function init()
{
    // Load web handler content script
    webHandlers = webhandlers.loadContentPageHandlers();

    document.addEventListener("IFrameGaggleDataEvent", function(e) {
        console.log("Received IFrameGaggleDataEvent " + e.detail.data);
        // Save the iframe gaggle data to pageGaggleData
        // Only do it on top level window
        if (window.self == top) {
            console.log("Received iframe data " + e.detail.data);
            var receivedData = e.detail.data;
            if (receivedData != null) {
                console.log("Received " + receivedData.length + " data items");
                for (var i = 0; i < receivedData.length; i++) {
                    console.log("Data item " + i + ": " + receivedData[i]);
                    pageGaggleData.push(receivedData[i]);
                }
            }
        }
        else
            console.log("Iframe data ignored");
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

    var control = document.getElementById("inputDataParsingFinishSignal");
    if (control == null)
        getPageData();
    else
        parsePage();
}

function execRScript(broadcastData) {
    var parameters = receivedData["scriptParameters"];
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
               console.log("Gaggle data: " + parameters[k]);
           }
        }
    }

    var funcname = receivedData["functionName"];
    var packagename = receivedData["packageName"];
    console.log("Package name: " + packagename + ", Function name: " + funcname);
    ocpu.seturl(OPENCPU_SERVER + "/library/" + packagename + "/R");
    console.log("Parameter JSON string: " + JSON.stringify(parameters));
    var species = parameters["org"];
    console.log("Package species: " + species);


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
        if (progress == 80)
            step = 2;
        else if (progress == 90)
            step = 1;
        else if (progress == 99)
            step = 0;
        progressbar.progressbar( "option", {
                  value: progress
                });
    }, 500);

    var req = ocpu.call(funcname, parameters, function(session){
        console.log("Session ID: " + session.getKey() + " session URl: " + session.getLoc());

        progressbar.progressbar( "option", {
          value: 100
        });
        clearInterval(progessid);
        // remove the dialog
        $(".ui-dialog").remove();

        /*$("#divProgressBar").progressbar( "option", {
            value: 100
        }); */

        var openurl = OPENCPU_SERVER + "/library/" + packagename + "/www/" + funcname
            + "_output.html?host=" + OPENCPU_SERVER + "&sessionID=" + session.getKey() + "&species=" + species;
        console.log("Open output html page: " + openurl);
        var scripturl = "handlers/" + funcname.toLowerCase() + ".js";
        // Note that the variable name of the corresponding handler should be the same as the package name
        var code = packagename + ".parseData('" + OPENCPU_SERVER + "', '" + packagename + "', '" + funcname + "', '" + session.getKey() + "', '" + species + "');"; // All the opencpu output data page should have this function

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
        progressbar.progressbar( "option", {
          value: 100
        });
        clearInterval(progessid);
        alert("OPENCPU Server error: " + req.responseText);
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
    if (msg.from && (msg.from == MSG_FROM_BACKGROUND)) {
        if (msg.subject) {
            if (msg.subject == MSG_SUBJECT_OPENURL) {
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