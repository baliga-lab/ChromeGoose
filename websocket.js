var BossWebSocketUrl = 'ws://localhost:8083/BossWebSocket';

function websocket(svrUrl, options, onOpenCallback, onMessageCallback) {
    this.connectionID;
	this.ws = null;
	this.connected = false;
    this.serverUrl = svrUrl;
    this.options = options;
    this.onOpenCallback = onOpenCallback;
    this.onMessageCallback = onMessageCallback;

	this.onOpen = function() {
		console.log('Web Socket OPENED');
		this.connected = true;
		if (this.onOpenCallback != null)
		    this.onOpenCallback();
	};

	this.onClose = function(event) {
		console.log('Web Socket CLOSED');
		alert("Websocket closed with code: " + event.code + " reason: " + event.reason);
		this.ws = null;
	};

	this.onMessage = onMessageCallback;

	this.onError = function(event) {
		alert("Websocket failed: " + event);
	};
};

websocket.prototype.open = function() {
    console.log("Open " + this.serverUrl);
    this.ws = new WebSocket(this.serverUrl, this.options);
    this.ws.onopen = this.onOpen;
    this.ws.onclose = this.onClose;
    this.ws.onmessage = this.onMessage;
    this.ws.onerror = this.onError;
};

websocket.prototype.close = function() {
    if (this.ws != null) {
        console.log('Web Socket CLOSING ...');
        ws.close();
    }
    this.connected = false;
};

