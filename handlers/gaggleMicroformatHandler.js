/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

//
// a website handler for the Gaggle microformat for embedding
// gaggle data types in valid HTML.
//


/**
 * constructor.
 */
function GaggleMicroformatHandler() {
    handler_base.call(this, "GaggleMicroformatHandler", false, null, WEBHANDLER_BASEURL + "gaggleMicroformatHandler-server.js");
}

GaggleMicroformatHandler.prototype = new handler_base();

GaggleMicroformatHandler.prototype.constructor = GaggleMicroformatHandler;

/*GaggleMicroformatHandler.prototype.scanPage = function ()
{
    console.log("GaggleMicroformatHandler scan page...");

    cg_util.retrieveFrom("GaggleMicroformatHandler", WEBHANDLER_BASEURL + "gaggleMicroformatHandler-server.js", function(code) {
        //alert("Got gaggleXml code " + code);
        if (code != null) {
            cg_util.executeCode(code);
        }
    });
} */


/**
 * takes a species and a Java Array of names and submits them for
 * processing by the website.
 */
GaggleMicroformatHandler.prototype.handleNameList = function(species, names) {
	alert("Gaggle microformat handler got namelist(" + names.length + ") species=" + species + ".");
}

