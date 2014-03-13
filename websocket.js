var BossWebSocketUrl = 'ws://localhost:8083/BossWebSocket';
var websocketconnection = null;
var websocketid = null;

function webSocketOpenCallback()
{
    alert('Web Socket OPENED ' + websocketconnection);
    if (websocketconnection != null)
        try
        {
            websocketconnection.send('GetID'); // Send the message 'Ping' to the server
        }
        catch (e) {
            alert("Failed to send GetID " + e);
        }
}

function parseData(data) {
    if (data != null) {
        alert(data);
        var jsondata = JSON.parse(data);
        if (jsondata['socketid'] != null) {
            websocketid = jsondata['socketid'];
        }
    }
};

function onWebsocketClose(event) {
    console.log('Web Socket CLOSED');
    alert("Websocket closed with code: " + event.code + " reason: " + event.reason);
    websocketconnection = null;
};

function onWebsocketError(event)
{
    //alert("Web socket error: " + event.code + " reason: " + event.reason);
    websocketconnection = null;
}

function createWebSocket(serverurl, onOpenCallback, onMessageCallback)
{
    if (websocketconnection == null) {
        try {
            websocketconnection = new WebSocket(serverurl); // (BossWebSocketUrl, ['soap', 'xmpp'], connectionOpened, parseData);
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


