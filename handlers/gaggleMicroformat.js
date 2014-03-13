/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

/**
 * gaggleMicroformat
 *
 * functions for reading gaggle data types from the gaggle microformat
 */

function gaggleMicroformatPlaceHolder() {
    handler_base.call(this, "gaggleMicroformatPlaceHolder", false, null,
                       (WEBHANDLER_BASEURL + "gaggleMicroformat.js"));
}

gaggleMicroformatPlaceHolder.prototype = new handler_base();

gaggleMicroformatPlaceHolder.prototype.constructor = gaggleMicroformatPlaceHolder;

gaggleMicroformatPlaceHolder.prototype.scanPage = function ()
{
    cg_util.retrieveFrom(this._name, this._parserUrl, function(code) {
        //alert("Got gaggleMicroformat code " + code);
        if (code != null) {
            cg_util.executeCode(code);
        }
    });
}

