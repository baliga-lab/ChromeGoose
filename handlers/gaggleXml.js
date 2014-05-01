/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

/**
 * Handle gaggle XML embedded in web pages
 *
 * depends on: gaggleMicroformat.js
 */
function gaggleXml()
{
    handler_base.call(this, "gaggleXml", false, "handlers/gaggleXml.js", null, WEBHANDLER_BASEURL + "gaggleXml-server.js");
}

gaggleXml.prototype = new handler_base();

gaggleXml.prototype.constructor = gaggleXml;

gaggleXml.prototype.scanPage = function ()
{
    console.log("gaggleXml scan page...");

    // Then scan the page
    cg_util.retrieveFrom("gaggleXml", WEBHANDLER_BASEURL + "gaggleXml-server.js", function(code) {
        //alert("Got gaggleXml code " + code);
        if (code != null) {
            cg_util.executeCode(code);
        }
    });
}



