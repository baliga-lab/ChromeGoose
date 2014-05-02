/*
 * Copyright (C) 2007 by Institute for Systems Biology,
 * Seattle, Washington, USA.  All rights reserved.
 *
 * This source code is distributed under the GNU Lesser
 * General Public License, the text of which is available at:
 *   http://www.gnu.org/copyleft/lesser.html
 */

function GeneEnrichment()
{
    console.log("Loading GeneEnrichment handler...");
    handler_base.call(this, "Gene Enrichment", true, "handlers/geneenrichment.js", "script:opencpu", null);
}

GeneEnrichment.prototype = new handler_base();

GeneEnrichment.prototype.constructor = GeneEnrichment;

GeneEnrichment.prototype.scanPage = function ()
{
    return null;
};

GeneEnrichment.prototype.processData = function (jsondata) {

};


/**
 * takes a species and a Java Array of names,
 */
GeneEnrichment.prototype.handleNameList = function(namelist) {

	// store the species and names in this object
	console.log("DAVID handling namelist " + namelist);
	if (namelist == null)
	    return;

    // Pass the
};


GeneEnrichment.prototype.processUI = function(pageData) {
    //$("#divScript").empty();

    console.log("Generating UI for Gene Enrichment handler...");
    if (pageData != null) {
        var resulthtml = "<div id='divGEDataDialog' style='display: none'><select id='selNetwork'><option value='0'>TB Network</option></select>";
        resulthtml += "<br/><select id='selGEData'>";


        var firstdata = true;
        for (var i = 0; i < pageData.length; i++) {
            if (pageData[i].jsondata == undefined)
                continue;

            var pagedataobj = JSON.parse(pageData[i].jsondata);
            var pagedata = pagedataobj["data"];
            var guid = pagedataobj["guid"];
            console.log("Page data GUID: " + guid);

            var text = (pagedata["_name"] != null) ? pagedata["_name"] : pagedata["name"];
            if (text == null)
                text = (pagedata["_type"] != null) ? pagedata["_type"] : pagedata["type"];
            console.log("option text: " + text);
            if (text != null) {
                if (firstdata) {
                    resulthtml += "<option value='-1'>----- Select a data item -----</option>";
                    firstdata = false;
                }
                var gaggledata = (pagedata["_data"] != null) ? pagedata["_data"] : pagedata["gaggle-data"];
                if (gaggledata != null && gaggledata.length > 0)
                    text += " (" + gaggledata.length + ")";
                resulthtml += "<option value='" + guid + "'>" + text + "</option>";
            }
        }

        resulthtml += "<option value='-2'>------- Select an action -------</option>";
        resulthtml += "<option value='0'>Upload a gene list file</option>";
        resulthtml += "</select><br/>";
        resulthtml += "<div class='divGEFileInput' style='display:none;'><input id='inputGEFileData' type='file'/><input id='btnGECancelFileInput' type='button' value='Cancel' /></div>";
        resulthtml += "<br/><input class='btnGERunScript' type='button' value='Run'/></div>";
        console.log("Gene enrichment html: " + resulthtml);

        // Now we inject the resulthtml to current page

        cg_util.getActiveTab(
            function (tab) {
                if (tab != null) {
                    console.log("Gene Enrichment injecting html");
                    try {
                        // Send message to the content page to inject the code and pop up the dialogbox
                        var code = "var gehandler;var currentScriptToRun;processGeneEnrichmentInputDataUI();";
                        var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_INSERTRSCRIPTDATAHTML,
                                          {html: resulthtml, tabid: tab.id.toString(), packagename: this._name,
                                           injectscripturl: geneEnrichment.getExtensionUrl(),
                                           injectcode: code,
                                           opencpuurl: '' },
                                           function(response) {
                                               console.log("Post injecting processing...");

                                           });
                        msg.send();
                    }
                    catch(e) {
                        console.log("Failed to pass html to the content page " + e);
                    }
                }
            }
        );
    }
};

// Show the dialog after injecting the code to the current page
function processGeneEnrichmentInputDataUI()
{
   console.log("Processing data input UI for Gene Enrichment");
   gehandler = new GeneEnrichment();
   currentScriptToRun = gehandler;

   $("#selGEData").change(geGaggleDataItemSelected);
   $("#btnGECancelFileInput").click(cancelGEFileInput);

   $("#btnGeneEnrichmentRunScript").click(runGEScript);

   // Now open it as a dialog
   $('#divGEDataDialog').dialog( { height:350, width:500,  modal: false,
       /*buttons: {
           "Cancel": function() {
                $('#divDataDialog').dialog('close');
                $(this).dialog('destroy').remove();
           }
       } */
   });
}

function showGEDataInput(source, inputclass)
{
    var parentdiv = $(source).parent();
    console.log("Parent div: " + parentdiv);
    var textdiv = ($(parentdiv).find(inputclass))[0];
    console.log(textdiv);
    if (textdiv != null) {
        $(textdiv).show();
    }
}


function geGaggleDataItemSelected(event)
{
    console.log("Gaggle data item selected for Gene Enrichment"); // + $("#selGaggleMenu").val());

    var source = event.target;
    console.log("gaggleDataItemSelected: event source: " + source);
    var selected = $(source).val();
    console.log("Selected data value: " + selected);
    if (selected == "0") {
        showGEDataInput(source, ".divGEFileInput");
    }
}

function runGEScript(event)
{
}

function cancelGEFileInput(event)
{

}

var geneEnrichment = new GeneEnrichment();
