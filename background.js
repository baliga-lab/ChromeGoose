var dataToBeProcessed = null;
var geeseJSONString = null;  //  JSON result of calling GetGeese from the Boss
var broadcastData = new Array();
var pipe2AllTabs = null;
var pipe2NotFound = 0;
var pipe2Species = null;
var pipe2Names = null;
var pipe2URL = null;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* First, validate the message's structure */
    //alert("Event page event received: " + msg.from + " " + msg.subject);
    try {
        if (msg.from && (msg.from == MSG_FROM_CONTENT)) {
             if (msg.subject) {
                if (msg.subject == MSG_SUBJECT_RETRIEVEDATA) {
                    console.log("Received retrieval request from content script " + dataToBeProcessed);
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
                        var tabid = data['srctabid'];
                        //alert("tab id: " + tabid + " found: " + found);
                        if (!found) {
                            alert("PIPE Goose not found...");
                            pipe2NotFound++;
                            if (pipe2NotFound >= pipe2AllTabs.length) {
                                // No PIPE2 page is found, we need to start a new tab and pass the data
                                alert("No PIPE2 page found, start new tab");
                                cg_util.openNewTab(pipe2URL, function(tab) {
                                    // Inject PIPE2 code
                                    if (sendResponse != null) {
                                        sendResponse(null, null, tab);
                                    }
                                });
                            }
                            else if (sendResponse != null)
                            {
                                console.log("Pass PIPE2 species " + pipe2Species + " PIPE2 Names: " + pipe2Names);
                                sendResponse(null, null, null);
                            }
                        }
                        else {
                            // Now we send the data to the page
                            if (sendResponse != null) {
                                console.log("Pass PIPE2 species " + pipe2Species + " PIPE2 Names: " + pipe2Names);
                                sendResponse(pipe2Species, pipe2Names, null);
                            }
                        }

                    }
                }
             }

        }
        else if (msg.from && (msg.from == MSG_FROM_POPUP)) {
            if (msg.subject) {
                if (msg.subject == MSG_SUBJECT_STOREDATA)  {
                    // data is json stringified
                    console.log("Received data storage request from popup " + msg.data);
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
                else if (msg.subject == MSG_SUBJECT_PIPE2DATA) {
                    //alert("PIPE2 Data received: " + msg.data);
                    var data = JSON.parse(msg.data);
                    if (data != null) {
                        var species = data['pipe2species'];
                        var names = data['pipe2names'];
                        var url = data['pipe2url'];
                        pipe2Species = species;
                        pipe2Names = names;
                        pipe2URL = url;
                        //alert("PIPE2 species: " + pipe2Species + " PIPE2 names: " + pipe2Names + " PIPE2 URL: " + pipe2URL);
                        if (sendResponse != null)
                            sendResponse();
                    }
                }
                else if (msg.subject == MSG_SUBJECT_PIPE2GETALLTABS) {
                    //alert("Received Get all tabs message " + pipe2AllTabs);
                    pipe2NotFound = 0;
                    chrome.tabs.getAllInWindow(null, function(tabs){
                        pipe2AllTabs = tabs;
                    });

                    if (sendResponse != null) {
                        sendResponse();
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
