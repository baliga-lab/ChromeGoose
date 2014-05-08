var dataToBeProcessed = null; // Data to be processed by a web handler
var geeseJSONString = null;  //  JSON result of calling GetGeese from the Boss
var broadcastData = new Array();  // Data received from other geese
var pipe2NumTabs = 0;
var pipe2NotFound = 0;
var pipe2TabResponses = new Array();
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* First, validate the message's structure */
    //alert("Event page event received: " + msg.from + " " + msg.subject);
    try {
        if (msg.from && (msg.from == MSG_FROM_CONTENT)) {
             if (msg.subject) {
                if (msg.subject == MSG_SUBJECT_RETRIEVEDATA) {
                    //alert("Received retrieval request from content script " + dataToBeProcessed);
                    var handlerdata = JSON.parse(msg.data);
                    var handler = handlerdata["handler"];
                    var datatosend = null;
                    if (dataToBeProcessed != null) {
                        var jsondata = JSON.parse(dataToBeProcessed);
                        var datahandler = jsondata["handler"];
                        if (datahandler == handler)
                           datatosend = dataToBeProcessed;
                    }
                    if (sendResponse != null)
                        sendResponse(datatosend);
                }
                else if (msg.subject == MSG_SUBJECT_RSCRIPTEVENT) {
                    console.log("Received RScriptEvent from content script: " + msg.data);
                    var data = JSON.parse(msg.data);
                    if (data != null) {
                        var url = data['outputurl'];
                        console.log("Open url for RScript: " + url);
                        cg_util.openNewTab(url, function(tab) {

                        });
                    }
                    if (sendResponse != null)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_PIPE2SEARCHRESULT) {
                    //alert("Received PIPE2 Search result event: " + msg.data);
                    var data = JSON.parse(msg.data);
                    if (data != null) {
                        var found = data['pipe2found'];
                        var tabid = data['mytabid'];
                        //alert("Tab id: " + tabid + " found: " + found);
                        if (!found) {
                            if (pipe2TabResponses[tabid] == null) {
                                pipe2NotFound++;
                                pipe2TabResponses[tabid] = found;

                                //alert("PIPE Goose not found " + pipe2NotFound + " " + pipe2NumTabs);
                                if (pipe2NotFound == pipe2NumTabs) {
                                    // No PIPE2 page is found, we need to start a new tab and pass the data
                                    //alert("No PIPE2 page found , start new tab");
                                    if (dataToBeProcessed != null) {
                                        var datasaved = JSON.parse(dataToBeProcessed);
                                        var pipe2URL = datasaved['handler_pageurl'];
                                        //alert("Open PIPE2 Url: " + pipe2URL);
                                        cg_util.openNewTab(pipe2URL, function(tab) {

                                        });
                                    }
                                }
                            }

                            if (sendResponse != null)
                            {
                                //console.log("Pass PIPE2 species " + pipe2Species + " PIPE2 Names: " + pipe2Names);
                                sendResponse(null, null);
                            }
                        }
                        else {
                            // Now we send the data to the page
                            if (sendResponse != null) {
                                //console.log("Pass PIPE2 species " + pipe2Species + " PIPE2 Names: " + pipe2Names);
                                chrome.tabs.update(tabid, {active: true}, null);
                                var data = parseJSONdataToGaggle(dataToBeProcessed);
                                sendResponse(data, null);
                            }
                        }
                    }
                    if (sendResponse != null)
                        sendResponse(null, null);
                }
             }

        }
        else if (msg.from && (msg.from == MSG_FROM_POPUP)) {
            if (msg.subject) {
                if (msg.subject == MSG_SUBJECT_STOREDATA)  {
                    // data is json stringified
                    //alert("Received data storage request from popup " + msg.data);
                    dataToBeProcessed = msg.data;
                    if (sendResponse != null)
                        sendResponse("Done!");
                }
                else if (msg.subject == MSG_SUBJECT_WEBSOCKETSEND) {
                    console.log("Received data to be sent to websocket " + msg.data);
                    //alert(websocketconnection);
                    if (websocketconnection == null) {
                        createWebSocket(BossWebSocketUrl, webSocketOpenCallback, parseData);
                    }
                    else {
                        //alert("Send data to websocket " + msg.data);
                        websocketconnection.send(msg.data);
                    }
                    if (sendResponse != null)
                        sendResponse(geeseJSONString);
                }
                else if (msg.subject == MSG_SUBJECT_BROADCASTDATA) {
                    // Get the data broadcast from other geese
                    if (sendResponse != null)  {
                        sendResponse(broadcastData);
                    }
                }
                else if (msg.subject == MSG_SUBJECT_PIPE2GETALLTABS) {
                    //alert("Received Get all tabs message " + pipe2AllTabs);
                    pipe2NotFound = 0;
                    pipe2TabResponses = new Array();
                    var data = JSON.parse(msg.data);
                    if (data != null) {
                        pipe2NumTabs = parseInt(data['numtabs']);
                    }
                    if (sendResponse != null) {
                        sendResponse();
                    }
                }
                else if (msg.subject == MSG_SUBJECT_OPENTABANDEXECUTE) {
                    var data = JSON.parse(msg.data);
                    if (data != null) {
                        var newurl = data['handler_url'];
                        var extensionurl = data['handler_extension_url'];
                        var code = data['runcode'];
                        if (newurl != null) {
                            cg_util.openNewTab(newurl, function(tab) {
                                cg_util.injectJavascriptToTab(tab.id, extensionurl, function() {
                                    if (code != null) {
                                        cg_util.injectCodeToTab(tab.id, code, null);
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
        else if (msg.from && (msg.from == MSG_FROM_WEBSOCKET)) {
            if (msg.subject) {
               if (msg.subject == MSG_SUBJECT_WEBSOCKETRECEIVEDDATA)  {
                  var gaggledata = msg.data;
                  //alert(gaggledata);
                  if (gaggledata != null) {
                      var broadcastdata = {};
                      var jsonobj = JSON.parse(gaggledata);
                      broadcastdata.data = jsonobj["data"];
                      broadcastdata.source = "Broadcast";
                      broadcastdata.guid = cg_util.generateUUID();
                      var jsondata = JSON.stringify(pagedata);
                      broadcastdata.jsondata = jsondata;
                      broadcastData.push(broadcastdata);
                  }
               }
            }
        }
    }
    catch (e) {
        alert(e);
    }
});


// Establish a websocket with the Boss
createWebSocket(BossWebSocketUrl, webSocketOpenCallback, parseData);

/* Enable the page-action for the requesting tab */
            //chrome.pageAction.show(sender.tab.id);
