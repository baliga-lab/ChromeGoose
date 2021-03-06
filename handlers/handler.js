function handler_base(name, showinmenu, extensionUrl, pageUrl, parserUrl)
{
    this._name = name;
    this._showInMenu = showinmenu;
    this._extensionUrl = extensionUrl; // The url of the script in the extension (e.g. handlers/david.js)
    this._pageUrl = pageUrl;           // The url to be opened by the page (e.g., http://david.abcc.ncifcrf.gov/)
    this._parserUrl = parserUrl;       // The url to download the parse script and inject into the page( e.g., WEBHANDLER_BASEURL + "gaggleXml-server.js")
}

handler_base.prototype.getName = function() {
    return this._name;
}

handler_base.prototype.showInMenu = function() {
    return this._showInMenu;
}


handler_base.prototype.getExtensionUrl = function() {
    return this._extensionUrl;
}

handler_base.prototype.getPageUrl = function() {
    return this._pageUrl;
}

handler_base.prototype.setKeywords = function(kw) {
    this._keywords = kw;
}

handler_base.prototype.getKeywords = function() {
    return this._keywords;
}

handler_base.prototype.checkData = function() {
    // First check if there is any data to be processed for the page
    console.log(this._name + " checking targeted data... " + this);
    cg_util.checkHandlerData(this, this.processData);
}

handler_base.prototype.scanPage = function() {
    this.checkData();
}

handler_base.prototype.openTabAndExecute = function(pageurl, extensionurl, code, callback) {
    console.log("Open tab for " + pageurl + " " + extensionurl + " " + code);
    if (pageurl != null) {
        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_OPENTABANDEXECUTE,
                                       { handler_url: pageurl, handler_extension_url: extensionurl, runcode: code },
                                       function() {
                                            if (callback != null) {
                                                callback();
                                            }
                                       });
        msg.send();
    }
}