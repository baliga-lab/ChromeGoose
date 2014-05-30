function MaggieHandler()
{
    handler_base.call(this, "Maggie Data Viewer", true, "handlers/maggie.js", "http://maggie.systemsbiology.net/");
}

MaggieHandler.prototype = new handler_base();

MaggieHandler.prototype.constructor = MaggieHandler;


MaggieHandler.prototype.recognize = function(doc) {
    if (doc) {
        var url = doc.location.href;
        return url.indexOf("http://maggie.systemsbiology.net/") >=0;
    }
    else
        return false;
};

MaggieHandler.prototype.show = function() {
    var url = "http://maggie.systemsbiology.net/main/start";
    var newTab = getBrowser().addTab(url);
    getBrowser().selectedTab = newTab;
};

	// page data for maggie data viewer handled by microformats
/*
	getPageData = function(doc) {
		var results = [];

		// get the species and list of genes in the pathway
		var species = "Moose";
		var names = ["abc", "xyz", "123"];
		var title = "Bogus Moose Genes";

		results.push(
			new FG_GaggleData(
			    title,
			    "NameList",
				names.length,
				species,
				names));

		return results;
	},
*/

MaggieHandler.prototype.handleNameList = function(namelist) {
    var species = namelist.getSpecies();
    var names = namelist.getData();

    //var newTab = getBrowser().addTab();
    //var browser = getBrowser().getBrowserForTab(newTab);

    //browser.addEventListener("load", this.createOnloadFormFiller(species, names), true);

    var url = "http://maggie.systemsbiology.net/main/start";
    console.log("Maggie injecting " + this._extensionUrl);
    this.openTabAndExecute(url, this._extensionUrl, "maggie.scanPage();", null);

    //getBrowser().selectedTab = newTab;
    //browser.loadURI(url);
    //return newTab;
};

MaggieHandler.prototype.processData = function(jsondata) {
    if (jsondata != null) {
        console.log("Maggie data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            //alert(type);
            var gaggledata = null;
            if (type == "NameList") {
                try {
                    namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    var species = namelist.getSpecies();
                    var names = namelist.getData();
                    var doc = document;

                    var search_box = doc.getElementById("search_box");
                    if (search_box) {
                        var search_string = names[0];
                        for (var i=1; i<names.length; i++) {
                            search_string += " ";
                            search_string += names[i];
                        }
                        search_box.value = search_string;
                    }
                    else {
                        console.log("Maggie data viewer handler couldn't find search_box\n");
                    }
                }
                catch (e) {
                    console.log("Maggie failed to process data: " + e);
                }
            }
        }
    }
};


// create and register website handler
var maggie = new MaggieHandler();
if (parent == top)
    maggie.scanPage();