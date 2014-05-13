/*
 * Copyright (C) 2009 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

/*
 * handler for STAMP 
 * Alignment, Similarity, & Database Matching for DNA Motifs
 *
 * http://www.benoslab.pitt.edu/stamp/
 */

function StampHandler()
{
    handler_base.call(this, "STAMPS", true, "handlers/stamp.js", "http://www.benoslab.pitt.edu/stamp/", null);
}

StampHandler.prototype = new handler_base();

StampHandler.prototype.constructor = StampHandler;


/**
 * check the given doc to see if we can parse it.
 */
StampHandler.recognize = function(doc) {
	if (doc) {
		var url = doc.location.href;
		return url.indexOf("http://www.benoslab.pitt.edu/stamp/") == 0;
	}
	else
		return false;
};


/**
 * open STAMP in a browser tab
 */
StampHandler.prototype.show = function() {
	var url = "http://www.benoslab.pitt.edu/stamp/";
	var newTab = getBrowser().addTab(url);
	getBrowser().selectedTab = newTab;
};


/**
 * Retrieve the data from the page. Returns a list of GaggleData objects.
 * (see firefox/chrome/content/gaggleData.js).
 */
StampHandler.prototype.getPageData = function(doc) {
	FG_trace("STAMPE getPageData");
	var results = [];

	return results;
};


/**
 * takes a species and a Java Array of names and submits them for
 * processing by the website.
 */
//FG_stampHandler.handleNameList = function(species, names) {
//	alert("Website handler got namelist(" + names.length + ") species=" + species + ".");
//}


StampHandler.prototype.handleMatrix = function(matrix) {
	console.log("STAMP handleMatrix");

	try {
		var url = "http://www.benoslab.pitt.edu/stamp/";
		console.log("STAMP injecting " + this._extensionUrl);
        this.openTabAndExecute(url, this._extensionUrl, "stampHandler.scanPage();", null);
	}
	catch (e) {
		FG_trace("Error loading STAMP page:" + e);
	}
};

StampHandler.prototype.processData = function(jsondata) {
    console.log("STAMP processData called " + jsondata);

    var doc = document;

    try
    {
        if (jsondata != null) {
            //alert("Data received: " + jsondata);

            var jsonobj = JSON.parse(jsondata);
            if (jsonobj != null) {
                var handler = jsonobj["handler"];
                var sourceobj = jsonobj["source"];
                var type = sourceobj["_type"];
                //alert(type);
                var gaggledata = null;
                if (type == "DataMatrix") {
                    matrix = new DataMatrix("", "", null, 0, 0, null, null, null);
                    matrix.parseJSON(sourceobj);
                    // build position-specific scoring matrix as a string
                    console.log("building PSSM string " + matrix.getName());
                    var pssm = ">" + matrix.getName() + "\n";
                    var rowNames = matrix.getRowTitles();
                    console.log("Row names " + rowNames);
                    var len = rowNames.length;
                    console.log("Row names length " + len);
                    for (var i=0; i<len; i++) {
                        var values = (matrix.getData())[i];
                        console.log("row values " + values);
                        if (values.length > 0) {
                            pssm += values[0];
                        }
                        for (var j=1; j<values.length; j++) {
                            pssm += " " + values[j];
                        }
                        pssm += "\n";
                    }
                }
            }
        }
    }
    catch (e)
    {
        console.log("Failed to build PSSM string " + e);
    }

    // find input field and dump matrix into it.
    console.log("finding input element");
    var elements = doc.getElementsByName("input");
    if (elements && elements.length > 0) {
        elements[0].value = pssm;
    }
    else {
        console.log("STAMP handler: input field not found!");
    }
};


// create and register website handler
var stampHandler = new StampHandler();

