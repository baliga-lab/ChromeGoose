var dataToBeProcessed = null;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* First, validate the message's structure */
    console.log("Event page event received: " + msg.from + " " + msg.subject + " " + MSG_FROM_CONTENT);
    try {
        if (msg.from && (msg.from == MSG_FROM_CONTENT)) {
             if (msg.subject && (msg.subject == MSG_SUBJECT_RETRIEVEDATA)) {
                console.log("Received retrieval request from content script " + dataToBeProcessed);
                if (sendResponse != null)
                    sendResponse(dataToBeProcessed);
             }

        }
        else if (msg.from && (msg.from == MSG_FROM_POPUP)) {
            if (msg.subject && (msg.subject == MSG_SUBJECT_STOREDATA))  {
                // data is json stringified
                console.log("Received data storage request from popup " + msg.data);
                dataToBeProcessed = msg.data;
                if (sendResponse != null)
                    sendResponse("Done!");
            }
        }
    }
    catch (e) {
        alert(e);
    }
});


cg_util.retrieveFrom("KEGG", "http://localhost:8000/static/javascripts/handlers/kegg-server.js", null);

// Establish a websocket with the Boss
var websocketconnection = new websocket(BossWebSocketUrl, ['soap', 'xmpp'], connectionOpened, parseData);
websocketconnection.open();

function connectionOpened() {
    //alert("Ping websocket...");
    connection.send('GetID'); // Send the message 'Ping' to the server
};

function parseData(data) {
    if (data != null) {
        alert(data);
        var jsondata = JSON.parse(data);
        if (jsondata['socketid'] != null) {
            websocket.socketid = jsondata['socketid'];
        }
    }
};

/* Enable the page-action for the requesting tab */
            //chrome.pageAction.show(sender.tab.id);
