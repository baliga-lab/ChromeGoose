var dataToBeProcessed = new Array(); // Data to be processed by a web handler
var broadcastData = new Array();  // Data received from other geese
var pipe2NumTabs = 0;
var pipe2NotFound = 0;
var pipe2TabResponses = new Array();
var GAGGLE_OUTPUT_PAGE = "gaggle_output.html";
var dictIFrameIdUrl = new Array();
var dictIframeIdHandler = new Array();
var geeseJSONString = null;  //  JSON result of calling GetGeese from the Boss
var bossConnected = false;
var bossPollerId = null;
var constantPollerId = null;

function startPolling(pollerId, pollfunc) {
    // Stop existing polling first
    if (pollerId != null)
        clearInterval(pollerId);
    pollerId = setInterval(pollfunc, 3000);
    console.log("Polling started: " + pollerId);
    return pollerId;
}

function stopPolling(pollerId) {
    console.log("Clearing polling: " + pollerId);
    clearInterval(pollerId);
    pollerId = null;
}


function constantPoll()
{
    cg_util.getActiveTab(function (tab) {
        if (tab != null) {
            // get the page data from gaggle.js of the page
            var msg = new Message(MSG_FROM_BACKGROUND, chrome.tabs, tab.id, MSG_SUBJECT_PAGEDATA, null,
                                  function(pageData) {
                                    if (pageData != null && pageData.length > 0) {
                                        chrome.browserAction.setBadgeText({text: pageData.length.toString()});
                                    }
                                    else {
                                        console.log("Clean badge text");
                                        chrome.browserAction.setBadgeText({text: ""});
                                    }
                                  });
            msg.send();
        }
        else
            chrome.browserAction.setBadgeText({text: ""});
    });
}
constantPollerId = startPolling(constantPollerId, constantPoll);

function poll()
{
    // Poll whether the boss is connected and the geese connected to the Boss
    sendDataWebSocket(websocketid, "GetGeese", "", false, function(connected) {
        bossConnected = connected;
    });
}

function pollAndStartBossIfNotConnected()
{
    sendDataWebSocket(websocketid, "GetGeese", "", false, function(connected) {
        bossConnected = connected;
        console.log("pollAndStartBossIfNotConnected get connected: " + connected);
        if (!connected)
        {
            console.log("Starting boss...");
            cg_util.startBoss();
        }
        startPolling(poll);
    });
}

bossPollerId = startPolling(bossPollerId, poll);

// Inject data to the gaggle output page
function injectOutput(tab, data, senderTabId)
{
    if (tab != null && data != null) {
        var scripturl = data["script"];
        var codetorun = data["code"];
        var loc = codetorun.lastIndexOf(")");
        var code = codetorun.substr(0, loc);
        code += (", '" + senderTabId + "');");
        console.log("Code to be injected: " + code);

        cg_util.injectJavascriptToTab(tab.id, scripturl, function(result) {
            cg_util.injectCodeToTab(tab.id, code, null);
        });
    }
}

function findIFrameIdFromHandler(handler)
{
    console.log("Searching iframe id for " + handler + " in " + dictIframeIdHandler);
    for (var i = 0; i < dictIframeIdHandler.length; i++)
    {
        var pair = dictIframeIdHandler[i];
        if (pair.handler == handler)
            return pair.iframeid;
    }
    return null;
}

function findIFrameIdFromUrl(url)
{
    for (var i = 0; i < dictIFrameIdUrl.length; i++)
    {
        var iframeidurlpair = dictIFrameIdUrl[i];
        if (iframeidurlpair.Url == url)
            return i;
    }
    return -1;
}

function findHandlerData(handler)
{
    if (dataToBeProcessed != null) {
        console.log("Searching " + dataToBeProcessed + " " + dataToBeProcessed.length);
        for (var i = 0; i < dataToBeProcessed.length; i++) {
            var datatosend = dataToBeProcessed[i];
            console.log(datatosend);
            var jsondata = JSON.parse(datatosend);
            var datahandler = jsondata["handler"];
            if (datahandler == handler) {
                console.log("Data to send for " + handler + " " + datatosend);
                dataToBeProcessed.splice(i, 1);
                return datatosend;
            }
        }
    }
    return null;
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* First, validate the message's structure */
    //alert("Event page event received: " + msg.from + " " + msg.subject);
    try {
        if (msg.from && (msg.from == MSG_FROM_CONTENT)) {
             if (msg.subject) {
                if (msg.subject == MSG_SUBJECT_GAGGLEOUTPUTINIT) {
                    console.log("Background received gaggle output init event");
                    dictIFrameIdUrl = new Array();
                    dictIframeIdHandler = new Array();
                }
                else if (msg.subject == MSG_SUBJECT_STOREHANDLERIFRAMEID) {
                    console.log("Background received store iframe for handler msg: " + msg.data);
                    var jsonobj = JSON.parse(msg.data);
                    var handler = jsonobj["handler"];
                    var iframeid = jsonobj["iframeId"];
                    console.log("Background store handler iframeid: " + handler + " " + iframeid);
                    var pair = {};
                    pair.handler = handler;
                    pair.iframeid = iframeid;
                    dictIframeIdHandler.push(pair);
                    if (sendResponse != null)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_RETRIEVEHANDLERIFRAMEID) {
                    console.log("Background received retrieving iframe for handler msg: " + msg.data);
                    var jsonobj = JSON.parse(msg.data);
                    var handler = jsonobj["handler"];
                    console.log("Background searching iframeid for " + handler);
                    var iframeid = findIFrameIdFromHandler(handler);
                    if (sendResponse != null)
                        sendResponse(iframeid);
                }
                else if (msg.subject == MSG_SUBJECT_STOREDATA)  {
                    // data is json stringified
                    console.log("Received data storage request from content page: " + msg.data);
                    //var jsondata = JSON.parse(msg.data);
                    dataToBeProcessed.push(msg.data);
                    if (sendResponse != null)
                        sendResponse("Done!");
                }
                else if (msg.subject == MSG_SUBJECT_RETRIEVEDATA) {
                    console.log("Received retrieval request from content script " + dataToBeProcessed);
                    var handlerdata = JSON.parse(msg.data);
                    var handler = handlerdata["handler"];
                    console.log("Handler: " + handler);
                    var datatosend = findHandlerData(handler);
                    if (sendResponse != null)
                        sendResponse(datatosend);
                }
                else if (msg.subject == MSG_SUBJECT_RERUNEVENT) {
                    console.log("Background received opencpu rerun event: " + msg.data);
                    var data = JSON.parse(msg.data);
                    var tabid = data["sourceTabId"];
                    var guid = data["rscriptGuid"];
                    var parameters = data["parameters"];
                    console.log("Background tabid " + tabid + " guid: " + guid);
                    if (tabid != null) {
                        cg_util.getTabById(parseInt(tabid), function(tab) {
                            if (tab != null) {
                                console.log("Found original tab, now send message...");
                                var msg = new Message(MSG_FROM_BACKGROUND, chrome.tabs, tab.id, MSG_SUBJECT_RERUNTOPAGE,
                                                     {rscriptGuid: guid,
                                                      parameters: data["parameters"],
                                                     }, null);
                                msg.send();
                            }
                        });
                    }
                    if (sendResponse != null)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_ECHO) {
                    // If the extension is installed and enabled, the background page should be able to echo back
                    if (sendResponse != null)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_GGBWEB) {
                    var jsondata = JSON.parse(msg.data);
                    if (jsondata != null) {
                        var type = jsondata.type;
                        var data = jsondata.data;
                        chrome.tabs.getAllInWindow(null, function(tabs){
                            var found = false;
                            for (var i = 0; i < tabs.length; i++) {
                                if (tabs[i].url.toLowerCase().indexOf(GGBWEB_SERVER) >= 0) {
                                    found = true;
                                    chrome.tabs.update(tabs[i].id, {active: true}, function(tab) {
                                        /*cg_util.injectJavascriptToTab(tabs[i].id, 'handlers/ggbweb.js', function(result) {
                                            cg_util.injectCodeToTab(tabs[i].id, "", null);
                                        });*/
                                        // Send data to the gaggle.js of the ggbweb page
                                        var ggbmsg = new Message(MSG_FROM_BACKGROUND, chrome.tabs, tabs[i].id,
                                                              MSG_SUBJECT_GGBWEB,
                                                              {type: type, data: data }, null);
                                        ggbmsg.send();
                                    });
                                    break;
                                }
                            }
                            if (!found) {
                                cg_util.openNewTab(GGBWEB_SERVER, function(tab) {
                                    // Send data to the gaggle.js of the ggbweb page
                                    var ggbmsg = new Message(MSG_FROM_BACKGROUND, chrome.tabs, tab.id,
                                                          MSG_SUBJECT_GGBWEB,
                                                          {type: type, data: data, newpage: "1" }, null);
                                    ggbmsg.send();
                                });
                            }
                        });
                    }
                    if (sendResponse != null)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_RSCRIPTEVENT) {
                    console.log("Received RScriptEvent from content script: " + msg.data);
                    var data = JSON.parse(msg.data);
                    if (data != null) {
                        var url = data['outputurl'];
                        var scripturl = data['script'];
                        var senderTabId = sender.tab.id;
                        console.log("Open url for RScript: " + url + " script url: " + scripturl + " sender tab: " + senderTabId);
                        // We inject the data to the output page
                        chrome.tabs.getAllInWindow(null, function(tabs){
                            var found = false;
                            for (var i = 0; i < tabs.length; i++) {
                                if (tabs[i].url.toLowerCase().indexOf(GAGGLE_OUTPUT_PAGE) >= 0) {
                                    found = true;
                                    chrome.tabs.update(tabs[i].id, {active: true}, function(tab) {
                                        injectOutput(tabs[i], data, senderTabId);
                                    });
                                    break;
                                }
                            }
                            if (!found) {
                                cg_util.openNewTab(GAGGLE_SERVER + "/static/" + GAGGLE_OUTPUT_PAGE, function(tab) {
                                    injectOutput(tab, data, senderTabId);
                                });
                            }
                        });

                        //cg_util.openNewTab(url, function(tab) {
                        //
                        //});
                    }
                    if (sendResponse != null)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_OPENURL) {
                    console.log("Background open url: " + msg.data);
                    var data = JSON.parse(msg.data);
                    var url = data["Url"];
                    var target = data["Target"];
                    var geneId = data["GeneId"];
                    var geneName = data["GeneName"];
                    var source = data["Source"];
                    var iframeId = data["IFrameId"];
                    var tabUrlSearchPattern = data["TabUrlSearchPattern"];
                    var containerClass = data["ContainerClass"];
                    var iframeDivClass = data["IFrameDivClass"];
                    var iframeClass = data["IFrameClass"];
                    var embedHtml = data["EmbedHtml"];

                    var iframeurlpair = {IFrameId: iframeId, Url: url};
                    dictIFrameIdUrl.push(iframeurlpair);

                    console.log("Searching for tab with pattern: " + tabUrlSearchPattern);
                    chrome.tabs.query({url: tabUrlSearchPattern}, function(tabs) {
                        console.log("gaggle_output.html tab: " + tabs.length);
                        if (tabs.length > 0) {
                            var tab = tabs[0];
                            var msg = new Message(MSG_FROM_BACKGROUND, chrome.tabs, tab.id, MSG_SUBJECT_OPENURL,
                                                 {Url: url, Target: target, GeneId: geneId, GeneName: geneName,
                                                  Source: source,
                                                  IFrameId: iframeId,
                                                  ContainerClass: containerClass, IFrameDivClass: iframeDivClass,
                                                  IFrameClass: iframeClass,
                                                  EmbedHtml: embedHtml
                                                  }, null);
                            msg.send();
                        }
                    });
                }
                else if (msg.subject == MSG_SUBJECT_GAGGLEPARSERESULT) {
                    console.log("Background received gaggle parse result from web handler: " + msg.data);
                    var data = JSON.parse(msg.data);
                    var geneId = data["GeneId"];
                    var geneName = data["GeneName"];
                    var type = data["Type"];
                    var source = data["Source"];
                    var desc = data["Description"];
                    var url = data["Url"];
                    var tabUrlSearchPattern = data["TabUrlSearchPattern"];
                    var iframeUrl = data["IFrameUrl"];

                    var index = findIFrameIdFromUrl(iframeUrl);
                    var iframeid = "";
                    if (index >= 0) {
                        iframeid = dictIFrameIdUrl[index].IFrameId;
                    }
                    console.log("IFrame Id for " + url + ": " + iframeid);
                    chrome.tabs.query({url: tabUrlSearchPattern}, function(tabs) {
                        console.log("gaggle_output.html tab: " + tabs.length);
                        if (tabs.length > 0) {
                            var tab = tabs[0];
                            var msg = new Message(MSG_FROM_BACKGROUND, chrome.tabs, tab.id, MSG_SUBJECT_GAGGLEPARSERESULT,
                                                 {
                                                  GeneId: geneId, GeneName: geneName, Url: url, IFrameId: iframeid,
                                                  Source: source, Type: type, Source: source, Description: desc
                                                 }, null);
                            msg.send();
                        }
                    });
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
                                        var handlerdata = findHandlerData("PIPE2");
                                        if (handlerdata != null) {
                                            var datasaved = JSON.parse(handlerdata);
                                            var pipe2URL = datasaved['handler_pageurl'];
                                            //alert("Open PIPE2 Url: " + pipe2URL);
                                            cg_util.openNewTab(pipe2URL, function(tab) {

                                            });
                                        }
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
                                var handlerdata = findHandlerData("PIPE2");
                                if (handlerdata != null) {
                                    var data = parseJSONdataToGaggle(handlerdata);
                                    sendResponse(data, null);
                                }
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
                    console.log("Received data storage request from content page: " + msg.data);
                    dataToBeProcessed.push(msg.data);
                    console.log(dataToBeProcessed);
                    if (sendResponse != null)
                        sendResponse("Done!");
                }
                else if (msg.subject == MSG_SUBJECT_STARTGAGGLEOUTPUT) {
                    console.log("Background received message to start gaggle output page: " + msg.data);
                    var jsonobj = JSON.parse(msg.data);
                    var id = jsonobj["ID"];
                    if (id == null || id.length == 0)
                        id = websocketid;
                    var action = jsonobj["Action"];
                    var data = jsonobj["Data"];

                    // Now we start the poller to verify whether boss is started
                    var poller = new Object();
                    poller.timerCount = 0;
                    poller.poll = function() {
                        poller.timerCount++;
                        cg_util.bossStarted(function (started) {
                          console.log("Background page Check boss response: " + started);
                          if (!started) {
                             console.log("Boss not started: " + poller.timerCount);
                             if (poller.timerCount == 20) {
                                console.log("Failed to start boss");
                                clearInterval(poller.timerId);
                             }
                          }
                          else {
                              console.log("Boss started! Stop polling " + poller.timerId);
                              clearInterval(poller.timerId);
                              sendDataWebSocket(id, action, data, true, function(success) {
                                 if (success)
                                     console.log("Start Gaggle Output Page: Send to websocket succeeded!");
                                 else
                                     console.log("Start Gaggle Output Page: Send to websocket failed!");
                              });
                          }
                        });
                      };
                      console.log("Background page: Starting startboss poller...");
                      poller.timerId = setInterval(function() { poller.poll(); }, 3000);
                      if (sendResponse != null)
                          sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_DISCONNECTBOSS) {
                    console.log("Background disconnecting Boss...");
                    stopPolling(bossPollerId);
                    bossPollerId = null;
                    if (websocketconnection != null)
                        // HACK HACK
                        // the onclose function might be reset by pollAndStartBossIfNotConnected
                        // if we don't set it back to onWebsocketClose, cg_util.startBoss will be called to
                        // download the boss.jnlp, which is not right
                        websocketconnection.onclose = onWebsocketClose;
                    webSocketClose();
                    geeseJSONString = null;

                    if (sendResponse)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_CONNECTTOBOSS) {
                    console.log("Background connecting to Boss...");
                    pollAndStartBossIfNotConnected();

                    if (sendResponse)
                        sendResponse();
                }
                else if (msg.subject == MSG_SUBJECT_GETGEESE) {
                    console.log("Received get geese request: " + bossConnected + " " + geeseJSONString);
                    
                    if (sendResponse != null)
                       sendResponse(geeseJSONString);
                }
                else if (msg.subject == MSG_SUBJECT_WEBSOCKETSEND) {
                    console.log("Received data to be sent to websocket " + msg.data);
                    var jsonobj = JSON.parse(msg.data);
                    var id = jsonobj["ID"];
                    if (id == null || id.length == 0)
                        id = websocketid;
                    var action = jsonobj["Action"];
                    var data = jsonobj["Data"];

                    console.log("ID: " + id + " Action: " + action + " Data: " + data);
                    sendDataWebSocket(id, action, data, true, function(success) {
                        if (success)
                            console.log("Send to websocket succeeded!");
                        else
                            console.log("Send to websocket failed!");
                    });

                    if (sendResponse != null)
                        sendResponse();
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
                else if (msg.subject == MSG_SUBJECT_GETORGANISMSHTML) {
                    if (sendResponse != null) {
                        sendResponse(organismSelectionHtml);
                    }
                }
                else if (msg.subject == MSG_SUBJECT_GOOGLEANALYTICS) {
                    console.log("GOOGLE Analytics data " + msg.data);
                    if (!DEBUGGING) {
                        var data = JSON.parse(msg.data);
                        var category = data['category'];
                        var action = data['action'];
                        var datapoint = data['data'];
                        console.log("Category: " + category + " Action: " + action + " Data: " + datapoint);
                        _gaq.push(['_trackEvent', category, action, datapoint]);
                    }

                    if (sendResponse != null) {
                        sendResponse(organismSelectionHtml);
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
                      var jsondata = JSON.stringify(broadcastdata);
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
//createWebSocket(BossWebSocketUrl, webSocketOpenCallback, parseData);

var organismSelectionHtml = "";
function getOrganisms(callback) {
    cg_util.httpGet(GAGGLE_SERVER + "/workflow/getorganisms", function(jsonorganisms) {
        // Get organisms from network portal
        //alert(jsonorganisms);
        var organismsobj = JSON.parse(jsonorganisms);
        // Generate the organism selection html
        organismSelectionHtml = "<select class='selectOrganism'>";
        for (var i in organismsobj) {

            var organism = organismsobj[i];
            if (organism.name != "Generic")
                organismSelectionHtml += "<option value='" + organism.shortname + "'>" + organism.name + "</option>";
        }

        // manually add option for chlamy
        organismSelectionHtml += "<option value='chlamy'>Chlamydomonas reinhardtii</option>";

        organismSelectionHtml += "</select>";
        if (callback)
            callback(organismSelectionHtml);
    });
}
getOrganisms(null);


// Google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-53406317-1']);
if (!DEBUGGING) {
    console.log("Logging page on google analytics");
    _gaq.push(['_trackPageview']);
}

(function() {
  console.log("Initializing google analytics...");
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

/* Enable the page-action for the requesting tab */
            //chrome.pageAction.show(sender.tab.id);
