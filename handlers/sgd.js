/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

//
// Connect to the Saccharomyces Gene Database (SGD)
//


/**
 * constructors aren't necessary for website handlers as they are usually singleton instances.
 */
// function FG_WebsiteHandler() {
// }

/*SEARCH TYPES*/
SGD.GENE_SEARCH=1;
SGD.GO_SLIM_MAPPER=2;
SGD.GO_TERM_FINDER=3;




/**
 * There are 2 notations in js for creating objects. Creating an object, as we do here,
 * and adding properties to it and "object literal" notation. They are equivalent. I'm
 * inconsistent with their usage only because I was trying them out to see which was
 * more convenient.
 */

function SGD(_searchType, name)
{
    this.searchType = _searchType;
    handler_base.call(this, name, true, "handlers/sdg.js", "http://www.yeastgenome.org/", (WEBHANDLER_BASEURL + "sgd-server.js"));
}

SGD.prototype = new handler_base();

SGD.prototype.constructor = SGD;

/**
 * check the given doc to see if we can parse it.
 */
SGD.prototype.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return url.indexOf("http://www.yeastgenome.org/") == 0;
	}
	else
		return false;
}

/**
 * takes a species and a Java Array of names and submits them for
 * processing by the website.
 * this.searchType should be defined in the constructor
 */
SGD.prototype.handleNameList = function(namelist) {
    // TODO: do we want to support multiple tabs?

    var species = namelist.getSpecies();
    var names = namelist.getData();
    //alert("Species: " + species + " Names: " + names + " search type: " + this.searchType);

	if (this.searchType == SGD.GENE_SEARCH) {
		/**
		 * SGD takes only one query at a time.  
		 * For now open each result in a diff tab. 
		 * Later, build a summary page
		 */
		if (names.length > 0) {
			for (var i=0; i<names.length; i++) {
				// construct a URL to search SGD
				var url =	"http://www.yeastgenome.org/cgi-bin/locus.fpl?locus="
					+ names[i];

				// open the SGD URL in a new tab
				console.log("SGD open url: " + url);
                chrome.tabs.create({ url: url });
			}
		}
	} else {
		/**
		 * Broadcast namelist to SGD Term Finder or Go Slim Mapper.
		 * Let the user set the final parameters.
		 */

		//browser.addEventListener("load", FG_sgd.createOnloadFormFiller(species, names), true);

		if (this.searchType == SGD.GO_SLIM_MAPPER) {
			var url = "http://www.yeastgenome.org/cgi-bin/GO/goSlimMapper.pl";
		} else if (this.searchType == SGD.GO_TERM_FINDER) {
			var url = "http://www.yeastgenome.org/cgi-bin/GO/goTermFinder.pl";
		}

		console.log("SGD open url: " + url);
        chrome.tabs.create({ url: url });
	}	
	
}


/**
 * Create a closure which will be called on the page "load" event that
 * fills in String's List Input form and submits it.
 *
 * Originally copied from emblstring.js
 */
SGD.prototype.processData = function(jsondata) {
    if (jsondata != null) {
        console.log("SGD Data received: " + jsondata);

        var jsonobj = JSON.parse(jsondata);
        if (jsonobj != null) {
            var handler = jsonobj["handler"];
            var sourceobj = jsonobj["source"];
            var type = sourceobj["_type"];
            console.log(type);
            var gaggledata = null;
            if (type == "NameList") {
                try {
                    namelist = new Namelist("", 0, "", null);
                    namelist.parseJSON(sourceobj);
                    this.species = namelist.getSpecies();
                    this.names = namelist.getData();
                    var doc = window.content.document;

                    // find the box to put the names in
                    var loci_text_area = document.getElementsByName("loci")[0];

                    if (loci_text_area) {
                        // construct a string out of the name list
                        var queryString = "";
                        if (names.length > 0) {
                            queryString += names[0];
                        }
                        for (var i=1; i<names.length; i++) {
                            queryString += "\n";
                            queryString += names[i];
                        }

                        // input the new names
                        loci_text_area.value = queryString;
                    }
                }
                catch (e) {
                    console.log("SGD failed to process data: " + e);
                }
            }
        }
    }
}



/* create and register website handler */
//FG_addWebsiteHandler("SGD GO Slim Mapper", new FG_sgd(FG_sgd.GO_SLIM_MAPPER));
//FG_addWebsiteHandler("SGD GO Term Finder", new FG_sgd(FG_sgd.GO_TERM_FINDER));
//FG_addWebsiteHandler("SGD (each gene in a new tab)", new FG_sgd(FG_sgd.GENE_SEARCH));

var sdgSlimMapper = new SGD(SGD.GO_SLIM_MAPPER, "SGD GO Slim Mapper");
var sdgSlimMapper = new SGD(SGD.GO_TERM_FINDER, "SGD GO Term Finder");
