var BossWebSocketUrl = 'ws://localhost:8083/BossWebSocket';
var websocketconnection = null;
var websocketid = null;
var currentCallback = null;

function webSocketOpenCallback()
{
    //alert('Web Socket OPENED ' + websocketconnection);
    if (websocketconnection != null)
        try
        {
            sendDataWebSocket("", "Register", "ChromeGoose");
            sendDataWebSocket("", "GetGeese", "");
            //websocketconnection.send('GetID'); // Send the message 'Ping' to the server
        }
        catch (e) {
            alert("Failed to send GetID " + e);
        }
}

function parseData(result) {
    if (result != null) {
        try {
            //alert(result);
            var data = result.data;
            //alert(data);
            var jsondata = JSON.parse(data);
            //alert("JSON data: " + jsondata);
            if (jsondata['ID'] != null) {
                websocketid = jsondata['ID'];
                //alert("websocket id: " + websocketid);
            }

            var gaggledata = jsondata['Data'];
            //alert("Data: " + gaggledata);
            if (jsondata['Action'] != null) {
                var action = jsondata["Action"];
                if (action == "GetGeese") {
                    //alert("Geese: " + data);
                    // Save the result JSON string to geeseJSONString to be retrieved by browser popup
                    geeseJSONString = result.data;
                }
                else if (action == "Broadcast") {
                    // Other goose broadcasts data to me
                    var msg = new Message(MSG_FROM_WEBSOCKET, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETRECEIVEDDATA,
                                                   { data: gaggledata }, null);
                    msg.send();
                }
            }
        }
        catch (e) {
            alert("Failed to process websocket server data " + e);
        }
    }
};

function onWebsocketClose(event) {
    console.log('Web Socket CLOSED');
    //alert("Websocket closed with code: " + event.code + " reason: " + event.reason);
    websocketconnection = null;
    geeseJSONString = null;
};

function onWebsocketError(event)
{
    //alert("Web socket error: " + event.code + " reason: " + event.reason);
    websocketconnection = null;
    geeseJSONString = null;
}

function createWebSocket(serverurl, onOpenCallback, onMessageCallback)
{
    if (websocketconnection == null) {
        try {
            websocketconnection = new WebSocket(serverurl); //, ['chat', 'super-awesome-chat']); // (BossWebSocketUrl, ['soap', 'xmpp'], connectionOpened, parseData);
            websocketconnection.onopen = onOpenCallback;
            websocketconnection.onclose = onWebsocketClose;
            websocketconnection.onmessage = onMessageCallback;
            websocketconnection.onerror = onWebsocketError;
        }
        catch (e) {
            alert("Failed to open web socket: " + e);
        }
    }
}

function sendDataWebSocket(id, action, data)
{
    var jsonobj = {};
    try {
        jsonobj.ID = id;
        jsonobj.Action = action;
        jsonobj.Data = data;
        if (websocketconnection != null)
            websocketconnection.send(JSON.stringify(jsonobj));
    }
    catch (e) {
        alert("Failed to send data over websocket " + e);
    }
}
