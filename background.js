var dataToBeProcessed = null;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from == MSG_FROM_CONTENT) {
         if (msg.subject && (msg.subject == MSG_SUBJECT_RETRIEVEDATA)) {
            if (sendResponse != null)
                sendResponse(dataToBeProcessed);
         }
            /* Enable the page-action for the requesting tab */
            //chrome.pageAction.show(sender.tab.id);
    }
    else if (msg.from &&(msg.from == MSG_FROM_POPUP)) {
        if (msg.subject && (msg.subject == MSG_SUBJECT_STOREDATA))  {
            // data is json stringified
            dataToBeProcessed = msg.data;
            if (sendResponse != null)
                sendResponse("Done!");
        }
    }
});


