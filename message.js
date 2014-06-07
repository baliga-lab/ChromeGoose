var MSG_FROM_POPUP = "popup";
var MSG_FROM_CONTENT = "content";
var MSG_FROM_WEBSOCKET = "websocket";
var MSG_FROM_BACKGROUND = "background";

var MSG_SUBJECT_PAGEDATA = "PageData";
var MSG_SUBJECT_HANDLER = "Handler";
var MSG_SUBJECT_STOREDATA = "StoreData";
var MSG_SUBJECT_RETRIEVEDATA = "RetrieveData";
var MSG_SUBJECT_GETDATABYINDEX = "GetDataByIndex";
var MSG_SUBJECT_WEBSOCKETSEND = "SendToWebSocket";
var MSG_SUBJECT_WEBSOCKETRECEIVEDDATA = "WebSocketReceivedData";
var MSG_SUBJECT_BROADCASTDATA = "GetBroadcastData";
var MSG_SUBJECT_INSERTRSCRIPTDATAHTML = "InsertRScriptDataHTML";
var MSG_SUBJECT_RSCRIPTEVENT = "RScriptEvent";
var MSG_SUBJECT_PIPE2GETALLTABS = "PIPE2GetAllTabs";
var MSG_SUBJECT_INSERTPIPE2SEARCHHANDLE = "InsertPIPE2SearchHandle";
var MSG_SUBJECT_PIPE2DATA = "PIPE2DATA";
var MSG_SUBJECT_PIPE2SEARCHRESULT = "PIPE2SearchResult";
var MSG_SUBJECT_OPENTABANDEXECUTE = "OpenAndExecuteCode";
var MSG_SUBJECT_GETORGANISMSHTML = "GetOrganismsHtml";
var MSG_SUBJECT_OPENURL = "OpenUrl";
var MSG_SUBJECT_GAGGLEPARSERESULT = "GaggleParseResult";


function Message(from, to, targetid, subject, data, callback)
{
    console.log("Message from " + from + " Subject: " + subject + " targetid: " + targetid + " data: " + data);
    this._from = from;
    this._to = to;
    this._targetid = targetid;
    this._subject = subject;
    this._data = data;
    this._callback = callback;
}

Message.prototype.send = function() {
    console.log("Sending message...");
    if (this._to != null) {
        if (this._targetid != null) {
            try {
                this._to.sendMessage(
                     this._targetid,
                     { from: this._from, subject: this._subject, data: ((this._data != null) ? JSON.stringify(this._data) : {}) },
                     /* ...also specifying a callback to be called
                      *    from the receiving end (content script) */
                     this._callback);
            }
            catch (e) {
                console.log("Failed to send message to tab: " + e);
            }
        }
        else {
            try {
                // chrome.runtime.sendMessage
                this._to.sendMessage(
                     { from: this._from, subject: this._subject, data: ((this._data != null) ? JSON.stringify(this._data) : {}) },
                     /* ...also specifying a callback to be called
                      *    from the receiving end (content script) */
                     this._callback);
                }
                catch (e) {
                    console.log("Failed to send message to runtime: " + e);
                }
        }
    }
}