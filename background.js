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



/* Enable the page-action for the requesting tab */
            //chrome.pageAction.show(sender.tab.id);
