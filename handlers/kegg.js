function KEGG()
{
    handler_base.call(this, "KEGG", true, "http://www.genome.jp/kegg-bin/", (WEBHANDLER_BASEURL + "kegg-server.js"));
}

KEGG.prototype = new handler_base();

KEGG.prototype.constructor = KEGG;

/*KEGG.prototype.scanPage = function ()
{
    console.log("KEGG scan page...");

    // Then scan the page
    cg_util.retrieveFrom("KEGG", WEBHANDLER_BASEURL + "kegg-server.js", function(code) {
        console.log("Got KEGG code");
        if (code != null) {
            cg_util.executeCode(code);
        }
    });
} */

KEGG.prototype.handleNameList = function(namelist) {
	// construct a query string out of the name list
	console.log("KEGG handle namelist: " + namelist);
	if (namelist == null)
	    return;

	var species = namelist.getSpecies();
	var names = namelist.getData();
	console.log("Species: " + species + " Names: " + names);

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

/**
 * convert a standard species name to a KEGG
 * species code
 */
KEGG.prototype.toKeggSpeciesCode = function(s) {
    // if no species, return "map" which means reference pathway
    // NOTE: this fails 'cause the gene names aren't recognized
	if (!s) return "map";

	// make sure we're dealing with a javascript string, not a java string
	s = "" + s;
	s = s.toLowerCase();

	s = s.replace(" str. ", " ");
	s = s.replace(" substr. ", " ");
	console.log("converting species: " + s + "\n");

	// fudge for species synonyms
	if (s in this.speciesSynonyms) {
		return this.speciesSynonyms[s];
	}

	// linear search through the list of species names
	// NOTE: that we're using "starts with" to be liberal
	for (var code in this.speciesCodes) {
		if (cg_util.startsWith(this.speciesCodes[code], s)) {
			return code;
		}
	}

	// return "map" which means get the reference pathway
	return "map";
}


/**
 * special hack to be liberal about names
 */
KEGG.prototype.speciesSynonyms = {
"halobacterium sp.": "hal",
"halobacterium nrc-1": "hal",
"halobacterium salinarum": "hal",
"halobacterium salinarum nrc-1": "hal",
"halobacterium": "hal",
"human": "hsa",
"h. sapiens": "hsa",
"escherichia coli": "eco",
"escherichia coli k12": "eco",
"escherichia coli k12 mg1655": "eco",
"escherichia coli k12 w3110": "ecj",
"escherichia coli k12 dh10b": "ecd",
"e. coli": "eco",
"chimpanzee": "ptr",
"rhesus monkey": "mcc",
"mouse": "mmu",
"rat": "rno",
"rattus": "rno",
"dog": "cfa",
"cow": "bta",
"pig": "ssc",
"opossum": "mdo",
"chicken": "gga",
"african clawed frog": "xla",
"western clawed frog": "xtr",
"zebrafish": "dre",
"purple sea urchin": "spu",
"sea anemone": "nve",
"fruit fly": "dme",
"mosquito": "aga",
"nematode": "cel",
"thale cress": "ath",
"japanese rice": "osa",
"eremothecium gossypii": "ago",
"methanococcus maripaludis": "mmp",
"m. maripaludis": "mmp",
"rhodopseudomonas palustris": "rpa",
"prochlorococcus marinus": "pmn",
"pyrococcus furiosus dsm 3638": "pfu",
"sulfolobus solfataricus p2": "sso",
"synechococcus elongatus pcc 7942": "syf"
}


var kegg = new KEGG();
//kegg.scanPage();