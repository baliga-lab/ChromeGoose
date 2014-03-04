var MSG_FROM_POPUP = "popup";
var MSG_FROM_CONTENT = "content";

var MSG_SUBJECT_PAGEDATA = "PageData";
var MSG_SUBJECT_HANDLER = "Handler";
var MSG_SUBJECT_STOREDATA = "StoreData";
var MSG_SUBJECT_RETRIEVEDATA = "RetrieveData";

function Message(from, to, targetid, subject, data, callback)
{
    console.log("Message from " + from + " Subject: " + subject + " targetid: " + targetid);
    this._from = from;
    this._to = to;
    this._targetid = targetid;
    this._subject = subject;
    this._data = data;
    this._callback = callback;
}

Message.prototype.send = function() {
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
                alert(e);
            }
        }
        else {
            try {
                this._to.sendMessage(
                     { from: this._from, subject: this._subject, data: ((this._data != null) ? JSON.stringify(this._data) : {}) },
                     /* ...also specifying a callback to be called
                      *    from the receiving end (content script) */
                     this._callback);
                }
                catch (e) {
                    alert(e);
                }
        }
    }
}