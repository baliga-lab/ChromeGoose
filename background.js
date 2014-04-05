var dataToBeProcessed = null;
var geeseJSONString = null;  //  JSON result of calling GetGeese from the Boss

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

                    sendResponse(geeseJSONString);
                }
                else if (msg.subject == MSG_SUBJECT_CONNECTBOSS) {
                    // Connect to Boss through websocket

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
