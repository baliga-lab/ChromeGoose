/**
 * handler for ensemble EGRIN
 */


function Egrin2Handler()
{
    console.log("Initializing Egrin2...");
    handler_base.call(this, "EGRIN2", true, "handlers/egrin2.js", "http://egrin2.systemsbiology.net/");
}

Egrin2Handler.prototype = new handler_base();

Egrin2Handler.prototype.constructor = Egrin2Handler;


Egrin2Handler.prototype.show = function() {
	var newTab = getBrowser().addTab(this.egrinUrl);
	getBrowser().selectedTab = newTab;
}

// getting data from EGRIN2 pages is implemented using the microformat

Egrin2Handler.prototype.recognize = function() {
	return false;
}

Egrin2Handler.prototype.getPageData = function() {
	return null;
}

Egrin2Handler.prototype.handleNameList = function(namelist) {
    if (namelist != null) {
        var names = namelist.getData();
        var url = this._pageUrl
        + "search_biclusters?search_text=" + cg_util.join(names, "+");

        // open the URL in a new tab
        console.log("Open tab " + url);
        chrome.tabs.create({ url: url });;
    }
}

var egrin2 = new Egrin2Handler();

//FG_addWebsiteHandler("EGRIN2", FG_egrin2Handler);