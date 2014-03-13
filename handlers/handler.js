function handler_base(name, showinmenu, pageUrl, parserUrl)
{
    this._name = name;
    this._showInMenu = showinmenu;
    this._pageUrl = pageUrl;
    this._parserUrl = parserUrl;
}

handler_base.prototype.getName = function() {
    return this._name;
}

handler_base.prototype.showInMenu = function() {
    return this._showInMenu;
}

handler_base.prototype.getPageUrl = function() {
    return this._pageUrl;
}

handler_base.prototype.scanPage = function() {
    if (this._parserUrl != null && this._parserUrl.length > 0) {
        console.log(this._name + " scanning page...");

        // Then scan the page
        cg_util.retrieveFrom(this._name, this._parserUrl, function(code) {
            //alert("Got gaggleXml code " + code);
            if (code != null) {
                cg_util.executeCode(code);
            }
        });
    }
}