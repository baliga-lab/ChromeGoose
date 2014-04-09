var dataToBeProcessed = null;
var geeseJSONString = null;  //  JSON result of calling GetGeese from the Boss
var broadcastData = new Array();

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* First, validate the message's structure */
    console.log("Event page event received: " + msg.from + " " + msg.subject + " " + MSG_FROM_CONTENT);
    try {
        if (msg.from && (msg.from == MSG_FROM_CONTENT)) {
             if (msg.subject && (msg.subject == MSG_SUBJECT_RETRIEVEDATA)) {
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
                    //alert("Popup gets broadcast data " + sendResponse);
                    if (sendResponse != null)  {
                        //alert("Get broadcast data " + broadcastData);
                        var broadcastGaggleData = new Array();
                        for (var i = 0; i < broadcastData.length; i++) {
                            // gaggleMicroFormat.scan returns js objects for networks and matrices, which
                            // have to be converted to Java objects before being broadcast to the Boss.
                            var pagedata = {};
                            var jsonobj = JSON.parse(broadcastData[i]);
                            pagedata.data = jsonobj["data"];
                            var jsondata = JSON.stringify(pagedata);
                            //alert("GaggleMicroformatParser JSON data: " + jsondata);
                            pagedata.jsondata = jsondata;
                            broadcastGaggleData.push(pagedata); //.setConvertToJavaOnGetData());
                        }
                        sendResponse(broadcastGaggleData);
                    }
                }
            }
        }
        else if (msg.from && (msg.from == MSG_FROM_WEBSOCKET)) {
            if (msg.subject) {
               if (msg.subject == MSG_SUBJECT_WEBSOCKETRECEIVEDDATA)  {
                  var gaggledata = msg.data;
                  //alert(gaggledata);
                  if (gaggledata != null)
                      broadcastData.push(gaggledata);
               }
            }
        }
    }
    catch (e) {
        alert(e);
    }
});


cg_util.retrieveFrom("KEGG", "http://localhost:8000/static/javascripts/handlers/kegg-server.js", null);

// Establish a websocket with the Boss


createWebSocket(BossWebSocketUrl, webSocketOpenCallback, parseData);

/* Enable the page-action for the requesting tab */
            //chrome.pageAction.show(sender.tab.id);
