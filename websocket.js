var BossWebSocketUrl = 'ws://localhost:8083/BossWebSocket';
var websocketconnection = null;
var websocketid = "";
var currentCallback = null;

function webSocketClose()
{
    console.log("Closing websocket " + websocketconnection);
    if (websocketconnection != null) {
        websocketconnection.close();
    }
}

function webSocketOpenCallback()
{
    console.log('Web Socket OPENED ' + websocketconnection);
    if (websocketconnection != null)
        try
        {
            sendDataWebSocket("", "Register", "ChromeGoose", true, null);
            sendDataWebSocket("", "GetGeese", "", true, null);
            //websocketconnection.send('GetID'); // Send the message 'Ping' to the server
        }
        catch (e) {
            console.log("Failed to send GetID " + e);
        }
}

function parseData(result) {
    if (result != null) {
        try {
            //console.log("Received websocket result: " + result);
            var data = result.data;
            //alert(data);
            var jsondata = JSON.parse(data);
            //console.log("JSON data: " + jsondata);
            if (jsondata['ID'] != null) {
                websocketid = jsondata['ID'];
                //alert("websocket id: " + websocketid);
            }

            var gaggledata = jsondata['Data'];
            //console.log("Received data: " + gaggledata + " with action: " + jsondata['Action']);
            if (jsondata['Action'] != null) {
                var action = jsondata["Action"];
                if (action == "GetGeese") {
                    //console.log("Geese: " + data);
                    // Boss returns the getGeese result
                    // Save the result JSON string to geeseJSONString to be retrieved by browser popup
                    geeseJSONString = result.data;
                }
                else if (action == "Broadcast") {
                    // Other goose broadcasts data to me, pass the data to the background page
                    console.log("Websocket received broadcast data " + gaggledata);
                    var msg = new Message(MSG_FROM_WEBSOCKET, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETRECEIVEDDATA,
                                                   { data: gaggledata }, null);
                    msg.send();
                }
            }
        }
        catch (e) {
            console.log("Failed to process websocket server data " + e);
        }
    }
};

function onWebsocketClose(event) {
    console.log('Web Socket CLOSED');
    //alert("Websocket closed with code: " + event.code + " reason: " + event.reason);
    websocketconnection = null;
    geeseJSONString = null;
    bossConnected = false;
};

function onWebsocketError(event)
{
    //alert("Web socket error: " + event.code + " reason: " + event.reason);
    websocketconnection = null;
    geeseJSONString = null;
    bossConnected = false;
}

function createWebSocket(serverurl, onOpenCallback, onMessageCallback, onCloseCallback)
{
    if (websocketconnection == null) {
        try {
            console.log("Websocket server url: " + serverurl);
            websocketconnection = new WebSocket(serverurl); //, ['chat', 'super-awesome-chat']); // (BossWebSocketUrl, ['soap', 'xmpp'], connectionOpened, parseData);
            websocketconnection.onopen = onOpenCallback;
            websocketconnection.onclose = onCloseCallback; // onWebsocketClose;
            websocketconnection.onmessage = onMessageCallback;
            websocketconnection.onerror = onWebsocketError;
        }
        catch (e) {
            console.log("Failed to open web socket: " + e);
        }
    }
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, showloginfo, callback){
    var retries = 0;
    if (socket == null) {
        if (callback != null)
            callback(false);
    }

    var poller = new Object();
    poller.timerCount = 0;
    poller.poll = function() {
        poller.timerCount++;
        if (socket == null || socket.readyState == 3) {
            clearInterval(poller.timerId);
            if (callback != null)
                callback(false);
        }
        else if (socket.readyState === 1) {
            if (showloginfo)
                console.log("Connection is made");
            clearInterval(poller.timerId);
            if(callback != null){
                callback(true);
            }
        } else {
            if (showloginfo)
                console.log("wait for connection " + this.timerCount);
            if (poller.timerCount == 20) {
                if (showloginfo)
                    console.log("time out, clear timer " + this.timerId);
                clearInterval(poller.timerId);
                if (callback)
                    callback(false);
            }
        }
    };
    if (showloginfo)
        console.log("websocket starting poller timer...");
    poller.timerId = setInterval(function() { poller.poll(); }, 500);
}

function sendDataFunc(jsonobj, showloginfo, callback)
{
    if (showloginfo)
        console.log("Send data to websocket: " + jsonobj);
    waitForSocketConnection(websocketconnection, showloginfo,
        function(ready){
            if (ready) {
                if (showloginfo)
                    console.log("message sent!!!");
                try {
                    websocketconnection.send(JSON.stringify(jsonobj));
                    if (callback)
                        callback(true);
                }
                catch (e) {
                    if (showloginfo)
                        console.log("Failed to send data over websocket " + e);
                    websocketconnection = null;
                    if (callback)
                        callback(false);
                }
            }
            else {
                if (showloginfo)
                    console.log("Websocket wait for ready failed");
                if (callback)
                    callback(false);
            }
        }
    );
}

function sendDataWebSocket(id, action, data, showloginfo, callback)
{
    var jsonobj = {};
    jsonobj.ID = id;
    jsonobj.Action = action;
    jsonobj.Data = data;

    if (websocketconnection == null || websocketconnection.readyState == 3) {
       createWebSocket(BossWebSocketUrl, function() {
          webSocketOpenCallback();
          sendDataFunc(jsonobj, showloginfo, callback);
       },
       parseData,
       function() {
          // If boss is not running now, we simply pass false to the callback function
          onWebsocketClose();
          if (callback != null)
            callback(false);
       });
    }
    else  {
        if (showloginfo)
            console.log("Websocket state: " + websocketconnection.readyState);
        sendDataFunc(jsonobj, showloginfo, callback);
    }
}
