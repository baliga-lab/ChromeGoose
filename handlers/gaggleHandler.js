function GaggleHandler(name)
{
    handler_base.call(this, name, true, "handlers/gaggleHandler.js", null, null);
}

GaggleHandler.prototype = new handler_base();

GaggleHandler.prototype.constructor = GaggleHandler;

GaggleHandler.prototype.handleNameList = function(namelist) {
    console.log(this._name + " handling namelist: " + namelist);
    if (namelist != null) {
        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETSEND,
                               {ID: "", Action: "Broadcast", Data: {Source: "ChromeGoose", Target: this._name, GaggleData: namelist}},
                               function() {
                               });
        msg.send();
    }
};
