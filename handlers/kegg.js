function KEGG()
{
    this._name = "KEGG";
}

KEGG.prototype.getName = function ()
{
    return this._name;
}

KEGG.prototype.getPageUrl = function ()
{
    return "http://www.genome.jp/kegg-bin/";
}

KEGG.prototype.scanPage = function ()
{
    console.log("KEGG scan page...");

    // Then scan the page
    cg_util.retrieveFrom("KEGG", "http://localhost:8000/static/javascripts/handlers/kegg-server.js", function(code) {
        console.log("Got KEGG code");
        if (code != null) {
            cg_util.executeCode(code);
        }
    });
}

KEGG.handleNameList = function(species, names) {
	// construct a query string out of the name list
	var queryString = "";
	if (names.length > 0) {
		queryString += names[0];
	}
	for (var i=1; i<names.length; i++) {
		queryString += "+";
		queryString += names[i];
	}


	// construct a URL to search kegg
	console.log("\nKEGG ===  About to map species " + species);
	var keggurl =	"http://www.genome.jp/kegg-bin/search_pathway_object?"
			+ "org_name=" + this.toKeggSpeciesCode(species)
			+ "&warning=yes"
			+ "&submit=Exec"
			+ "&unclassified=" + queryString;

	// open the kegg URL in a new tab
	console.log("KEGG open url: " + keggurl);
    chrome.tabs.create({ url: keggurl });
}

var kegg = new KEGG();
kegg.scanPage();