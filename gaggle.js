var pageGaggleData = [];
var webHandlers = null;

function init()
{
    // Load web handler content script
    webHandlers = webhandlers.loadHandlers();
}

function getPageData()
{
    //alert("Parsing page...");
    var names = new Array("BC0478", "BC0706", "BC0772");
    var nl = new Namelist("bcu namelist (5)", 5, "bcu", names);
    var pagedata = {data: nl};
    var jsondata = JSON.stringify(pagedata);
    pagedata.jsondata = jsondata;
    pageGaggleData.push(pagedata);

    console.log("Scanning page for gaggle data...");
    for (var i = 0; i < webHandlers.length; i++) {
        var handler = webHandlers[i];
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
    console.log("Content script message received from " + msg.from + " subject: " + msg.subject);

    if (msg.from && (msg.from == MSG_FROM_POPUP))
    {
        if (msg.subject && (msg.subject == MSG_SUBJECT_PAGEDATA)) {
            /* Collect the necessary data
             * (For your specific requirements `document.querySelectorAll(...)`
             *  should be equivalent to jquery's `$(...)`)*/

            /* Directly respond to the sender (popup),
             * through the specified callback */
            console.log("Sending page data: " + pageGaggleData.length);
            if (response != null)
                response(pageGaggleData);
        }
        
    }
});

init();
getPageData();