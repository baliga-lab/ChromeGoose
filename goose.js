var broadcastData = new Array();

function broadcastData()
{
    console.log("Broadcasting ...");
    var target = $("#selTarget").val();
    //alert(target);
    var selecteddataindex = $("#selGaggleData").val();
    alert(target + " " + selecteddataindex);
    if (target != "-1" && selecteddataindex != "-1") {
        var handler = webHandlers[parseInt(target)];
        var data = currentPageData[parseInt(selecteddataindex)];  //  data is not json stringified
        if (handler == null) {
            // this is a goose, we pass the data to Boss
            if (data != null) {
                var jsonobj = {};
                jsonobj.source = "ChromeGoose";
                jsonobj.target = target;
                jsonobj.data = data;
                cg_util.doPost((HTTPBOSS_ADDRESS + "?command=Broadcast"), JSON.stringify(jsonobj),
                                "application/json", "json", function(response) {
                });
            }
        }
        else {
            // this is a web handler
            var type = data.getType();
            if (type == "Namelist") {
                if (handler.handleNameList != null) {
                    // First pass the data to the Event page
                    console.log("Sending data to event page");
                    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                           { handler: handler.getName(), source: data }, handlerResponse);
                    msg.send();

                    // Now we call the handler to handle data
                    handler.handleNameList(data);
                }
            }
        }


        /*cg_util.getActiveTab(function (tab) {
            if (tab != null) {

               var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_HANDLER,
                                {handler: target, dataindex: selecteddataindex}, handlerResponse);
               msg.send();
            }
        }); */
    }
}

// Pass this to the onMessage callback of the websocket
function handleBroadcastData(event) {
    if (event != null && event.data != null) {
        // event.data is json object
        var data = JSON.parse(event.data);
        var type = data["_type"];
        if (type == "Namelist") {
            gaggledata = new Namelist("", 0, "", null);
            gaggledata.parseJSON(pagedata);
            broadcastData.push(gaggledata);
        }
    }
}