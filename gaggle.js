var pageGaggleData = [];

function getPageData()
{
    //alert("Parsing page...");
    var names = new Array("BC0478", "BC0706", "BC0772");
    var nl = new Namelist("bcu namelist (5)", 5, "bcu", names);
    var pagedata = {value: "0", data: nl};
    //alert(JSON.stringify(pagedata));
    pageGaggleData.push(JSON.stringify(pagedata));

    // Send to background.js
    //chrome.runtime.sendMessage({
    //    from: "content",
    //    subject: "showPageAction"
    //});
}

/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    //alert("Message received subject " + msg.subject);

    if (msg.from && (msg.from == "popup")
            && msg.subject && (msg.subject == "DOMInfo")) {
        /* Collect the necessary data
         * (For your specific requirements `document.querySelectorAll(...)`
         *  should be equivalent to jquery's `$(...)`)*/

        /* Directly respond to the sender (popup),
         * through the specified callback */
        response(pageGaggleData);
    }
});


getPageData();