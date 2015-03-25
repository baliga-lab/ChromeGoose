// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var webHandlers = [];
var opencpuHandlers = {};

var currentPageData = [];
var bossConnected = false;
var currentScriptToRun = null;

function getGeese(callback) {
    sendDataWebSocket("", "GetGeese", "", true, callback);
}

function setBossConnected(bossConnected) {
    console.log("setBossConnected: " + bossConnected);

    if (bossConnected) {
        $("#imgGaggleConnected").removeClass("glyphicon glyphicon-remove-circle");
        $("#imgGaggleConnected").addClass("glyphicon glyphicon-ok-circle");
        $("#btnBossConnected").prop("title", "Connected");
        $("#btnBossConnected").removeClass("btn btn-danger");
        $("#btnBossConnected").addClass("btn btn-success");
    }
    else {
        $("#imgGaggleConnected").removeClass("glyphicon glyphicon-ok-circle");
        $("#imgGaggleConnected").addClass("glyphicon glyphicon-remove-circle"); //("src", "img/connected.png");
        $("#btnBossConnected").addClass("btn btn-danger");
        $("#btnBossConnected").prop("title", "Not connected");

    	$("#selTarget").empty();
		$("#selTarget").prepend($("<option></option>").attr("value", "-1").text("-- Select a Target to Broadcast --"));
    }
}

function init()
{
    //alert("Browser action init...");
    currentPageData = new Array();
    currentScriptToRun = null;
    //$("#divScript").empty();
    $(".glyphicon-question-sign").tooltip({html: true });

    $("#selGaggleMenu").change(gaggleMenuItemSelected);
    $("#btnStartBoss").click(startBossFromButton);
    $("#btnBossConnected").click(toggleConnectToBoss);
    $("#btnGaggleWebsite").click(openGaggleWebsite);
    $("#btnGaggleOutput").click(openGaggleOutputPage);
    $("#btnSendFeedback").click(sendFeedback);
    $("#btnHelp").click(openHelp);

    $("#selOrganisms").change(gaggleOrganismSelected);
    $(".selGaggleData").change(gaggleDataItemSelected);
    $(".btnCancelTextInput").click(cancelTextInput);
    $(".btnCancelFileInput").click(cancelFileInput);

    $("#ahreftfoefilter").click(tfoefilterSelected);
    $("#ahreftbfilter").click(tbfilterSelected);
    $("#ahrefGeneSetEnrichment").click(geneSetEnrichmentSelected);
    $("#ahrefplotexpression").click(plotDataSelected);

    $("#btnCytoscape").click(startCytoscape);
    $("#btnR").click(startR);
    $("#btnMeV").click(startMeV);

    // Get geese and boss connect status
    var geeseHandlers = new Array();
    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GETGEESE,
                          {}, function(geeseJSONString) {
                              console.log("Received GetGeese result: " + geeseJSONString);
                              if (geeseJSONString != null) {
                                    var jsonobj = JSON.parse(geeseJSONString);
                                    var geesestring = jsonobj["Data"];
                                    var socketid = jsonobj["ID"];
                                    console.log("web socket ID: " + socketid + " geese string: " + geesestring);
                                    setBossConnected((socketid != null));
                                    if (geesestring != null && geesestring.length > 0) {
                                        var splitted = geesestring.split(";;;");
                                        for (var i = 0; i < splitted.length; i++) {
                                           if (splitted[i] != null && splitted[i].length > 0)
                                               //$("#selTarget").prepend($("<option></option>").attr("value", splitted[i]).text(splitted[i]));
                                               var gaggleHandler = new GaggleHandler(splitted[i]);
                                               geeseHandlers.push(gaggleHandler);
                                        }
                                        //$("#selTarget").prepend($("<option></option>").attr("value", "Boss").text("Boss"));
                                        var gaggleHandler = new GaggleHandler("Boss");
                                        geeseHandlers.push(gaggleHandler);
                                        $("#selTarget").prepend($("<option></option>").attr("value", "-1").text("-- Select a Target to Broadcast --"));
                                    }
                             }
                             else
                                setBossConnected(false);

                             // Load web handlers at the browser action side. Note we need to load instances of web handlers
                             // for both browser action (to process data) and content scripts (to parse web pages).
                             webHandlers = geeseHandlers.concat(webhandlers.loadHandlers());
                             for (var i = 0; i < webHandlers.length; i++) {
                                 console.log("Browser action loading " + webHandlers[i].getName() + " " + webHandlers[i].showInMenu());
                                 if (webHandlers[i].showInMenu())
                                     try {
                                         $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(webHandlers[i].getName()));
                                     }
                                     catch (e) {
                                         console.log("Handler " + i + ": " + e);
                                     }
                             }

                             // Auto-select handler according to current page url
                             cg_util.getActiveTab(function (tab) {
                                 if (tab != null) {
                                     console.log("Get handler by url " + tab.url + " " + webHandlers);
                                     var handler = webhandlers.getHandlerByUrl(tab.url, webHandlers);
                                     if (handler != null) {
                                         $("#selTarget option").each(function() {
                                            var text = $(this).html();
                                            console.log("Option text: " + text);
                                            if (text.indexOf(handler.getName()) >= 0) {
                                                console.log("Setting handler " + $(this).val());
                                                $("#selTarget").val($(this).val());
                                            }
                                         });
                                     }
                                 }
                             });
                          });
    msg.send();

    // Load R packages from OpenCPU
    var selGaggleDataParent = $(".selGaggleData").parent();
    //alert($(selGaggleDataParent)[0].outerHTML);
    webhandlers.loadOpenCPU(selGaggleDataParent, function(handlers) {
        opencpuHandlers = handlers;
    });

    // Populate species select
    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GETORGANISMSHTML,
                              {}, function(organismSelectionHtml) {
                                  if (organismSelectionHtml != null) {
                                      console.log("Organism html: " + organismSelectionHtml);
                                      var start = organismSelectionHtml.indexOf("<option ");
                                      var end = organismSelectionHtml.indexOf("</select>");
                                      var optiontext = organismSelectionHtml.substr(start, end - start);
                                      console.log("Option html: " + optiontext);
                                      optiontext = "<option value='-1'>----- Select a species to explore -----</option>" + optiontext;
                                      $("#selOrganisms").html(optiontext);
                                  }
                              }
                          );
    msg.send();



    /*webhandlers.loadWorkflowComponents("selGaggleData", function(rscriptwrapper) {
        if (rscriptwrapper != null)
            $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(rscriptwrapper.getName()));
    }); */
}

function setDOMInfo(pageData) {
    console.log("Set DOM Info... " + pageData);
    //alert(pageData.length);

    //alert("Page data stored");
    if (pageData != null) {
        for (var i = 0; i < pageData.length; i++) {
            //alert("Page data index: " + currentPageData.length + " Data: " + pageData[i].jsondata + " From: " + pageData[i].source);
            if (pageData[i].jsondata == undefined)
                continue;

            currentPageData.push(pageData[i]);
            var pagedataobj = JSON.parse(pageData[i].jsondata);
            var pagedata = pagedataobj["data"];
            var guid = pagedataobj["guid"];
            console.log("Page data GUID: " + guid);

            var text = (pagedata["_name"] != null) ? pagedata["_name"] : pagedata["name"];
            if (text == null)
                text = (pagedata["_type"] != null) ? pagedata["_type"] : pagedata["type"];
            //alert(text);
            if (text != null) {
                var gaggledata = (pagedata["_data"] != null) ? pagedata["_data"] : pagedata["gaggle-data"];
                if (gaggledata != null && gaggledata.length > 0)
                    text += " (" + gaggledata.length + ")";
                $(".selGaggleData").append($("<option></option>").attr("value", guid).text(text));  //(i).toString()
                var textlower = text.toLowerCase();
                // select the item if it's a gene namelist
                if (textlower.indexOf("gene") >= 0 || textlower.indexOf("regulon") >= 0 || textlower.indexOf("regulator") >= 0) {
                    $(".selGaggleData").val(guid);
                }

                // Change the text of the "no data" option
                //$(".selGaggleData option[value=-2]").text("--- Select a data item ----");
            }
        }
    }
}

function sendFeedback()
{
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=gaggle-chrome-goose@googlegroups.com");
}

function startBossFromButton()
{
    startBoss(true, null);
}

function toggleConnectToBoss()
{
    console.log("Toggle connect to boss...");
    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GETGEESE,
                          {},
                          function(geeseJSONString) {
                              console.log("Received GetGeese result: " + geeseJSONString);
                              var connected = false;
                              if (geeseJSONString != null) {
                                    var jsonobj = JSON.parse(geeseJSONString);
                                    var geesestring = jsonobj["Data"];
                                    var socketid = jsonobj["ID"];
                                    console.log("web socket ID: " + socketid + " geese string: " + geesestring);
                                    connected = (socketid != null)
                              }

                              if (connected) {
                                  cg_util.disconnectFromBoss(null);
                                  setBossConnected(false);
                              }
                              else {
                                  cg_util.connectToBoss(null);
                                  setBossConnected(true);
                              }
                         });
    msg.send();
}

function startBoss(forceStart, callback)
{
    cg_util.bossStarted(function (started) {
          console.log("First check boss response: " + started);
          if (!started) {
              $("#imgGaggleConnected").attr("src", "img/disconnected.png");
              if (forceStart)
                cg_util.startBoss();
              if (callback != null)
                callback(false);
          }
          else {
              $("#imgGaggleConnected").attr("src", "img/connected.png");
              if (callback != null)
                callback(true);
          }
    });


}

function openHelp()
{
    cg_util.openNewTab("http://gaggle.systemsbiology.net/docs/geese/chromegoose/", null);
}

function openGaggleWebsite()
{
    cg_util.openNewTab(GAGGLE_HOME, null);
}

function openGaggleOutputPage()
{
    // Tell the Selenium driver to open the page
    console.log("Open gaggle output page...");

    // Start the Boss
    startBoss(false, function (started) {
        if (started) {
            console.log("Boss started. Now we start the Gaggle Output Page...");
            var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETSEND,
                                   {ID: "", Action: "Chrome", Data: {Command: "Start", Data: {PageUrl: GAGGLE_OUTPUT_PAGE}}},
                                   function() {
                                   });
            msg.send();
        }
        else {
            console.log("Failed to start boss. Now we start Boss and Gaggle Output page from background page...");
            var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STARTGAGGLEOUTPUT,
                                   {ID: "", Action: "Chrome", Data: {Command: "Start", Data: {PageUrl: GAGGLE_OUTPUT_PAGE}}},
                                   function() {
                                   });
            msg.send();
            cg_util.startBoss();
        }
    });
}

function gaggleMenuItemSelected(event) {
    console.log("Gaggle menu item selected "); // + $("#selGaggleMenu").val());

    var selected = $("#selGaggleMenu").val();
    if (selected == "0") {
        // Start the Boss
        cg_util.bossStarted(websocketconnection, function (started) {
            console.log("Check boss response: " + started);
            if (!started) {
                cg_util.startBoss();
                $("#imgGaggleConnected").attr("src", "img/disconnected.png");
            }
            else {
                $("#imgGaggleConnected").attr("src", "img/connected.png");
            }
        });
    }
    else if (selected == "1") {
        // Open the Gaggle Website
        cg_util.openNewTab(GAGGLE_HOME, null);
    }
    else if (selected == "1000") {
        // DEBUG send data through the websocket
        alert("Send data to websocket");
        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETSEND,
                               {ID: "", Action: "Test", data: "GetID" }, null);
        msg.send();
    }
}

function showDataInput(source, inputclass)
{
    var parentdiv = $(source).parent();
    console.log("Parent div: " + parentdiv);
    var textdiv = ($(parentdiv).find(inputclass))[0];
    console.log(textdiv);
    if (textdiv != null) {
        $(textdiv).show();
    }
}

function gaggleOrganismSelected(event)
{
    console.log("Organism selected...");

    var source = event.target;
    console.log("gaggle organism: event source: " + source);
    var selected = $(source).val();
    console.log("Selected data value: " + selected);
    var url = GAGGLE_SERVER + "/" + selected;
    if (selected == "mtu") {
       url = GAGGLE_SERVER + "/" + "mtu";
    }
    else if (selected == "chlamy")
       url = GAGGLE_SERVER + "/" + "chlamy-portal";
    cg_util.openNewTab(url, null);
}

function gaggleDataItemSelected(event)
{
    console.log("Gaggle data item selected "); // + $("#selGaggleMenu").val());

    var source = event.target;
    console.log("gaggleDataItemSelected: event source: " + source);
    var selected = $(source).val();
    console.log("Selected data value: " + selected);
    if (selected == "OtherText") {
        showDataInput(source, ".divTextInput");
        $(".divFileInput").hide();
    }
    else if (selected == "OtherFile") {
        showDataInput(source, ".divFileInput");
        $(".divTextInput").hide();
    }
}

function cancelTextInput(event) {
    console.log("Cancel data text input"); // + $("#selGaggleMenu").val());

    var source = event.target;
    $(source).parent().hide();
    var select = $(source).parent().find(".selGaggleData");
    $(select).val("-1");
}

function cancelFileInput(event) {
    console.log("Cancel data text input"); // + $("#selGaggleMenu").val());

    var source = event.target;
    $(source).parent().hide();
    var select = $(source).parent().find(".selGaggleData");
    $(select).val("-1");
}

function handlerResponse()
{

}

function broadcastFetchedData(jsonobj, handler)
{
    console.log("broadcastFetchedData " + jsonobj);
    try {
        if (jsonobj != null) {
            var jsonObj = JSON.parse(jsonobj);
            var handlerindexstr = jsonObj["handlerindex"];
            if (handler == null)
                handler = webHandlers[parseInt(handlerindexstr)];
            var data = jsonObj["data"];
            var type = (data["_type"] != null) ? data["_type"] : data["type"];
            console.log("Data type: " + type + " Handler: " + handler.getName());

            var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GOOGLEANALYTICS,
                                       { category: 'Broadcast', data: type, action: handler.getName() }, null);
            msg.send();

            var gaggledata = null;
            if (type.toLowerCase() == "namelist") {
                gaggledata = new Namelist("", 0, "", null);
                //alert(handler.getName() + " " + data);
                gaggledata.parseJSON(data);
                //alert(gaggledata.getSpecies());
                if (gaggledata.getSpecies().toLowerCase().indexOf("mycobacterium tuberculosis h37rv") >= 0) {
                    console.log("Processing for TB namelist");
                    gaggledata = cg_util.handleTBNamelist(gaggledata);
                    console.log("Processed namelist: " + gaggledata.getData());
                }
                if (handler.handleNameList != null) {
                    // First pass the data to the Event page
                    console.log("Sending data to event page");
                    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                           { handler: handler.getName(), handler_pageurl: handler.getPageUrl(), source: gaggledata }, handlerResponse);
                    msg.send();

                    // Now we call the handler to handle data
                    handler.handleNameList(gaggledata); //.getData());
                }
            }
            else if (type.toLowerCase() == "datamatrix" || type.toLowerCase() == "matrix") {
                console.log("Handling data matrix...");
                gaggledata = new DataMatrix("", "", null, 0, 0, null, null, null);
                gaggledata.parseJSON(data);
                console.log("getData: " + gaggledata.getData);
                if (gaggledata.getData() != null) {
                    console.log("Handler handleMatrix: " + handler.handleMatrix);
                    if (handler.handleMatrix != null)
                    {
                        console.log("Passing data matrix to " + handler.getName());
                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: gaggledata }, handlerResponse);
                        msg.send();
                        handler.handleMatrix(gaggledata);
                    }
                    else {
                        var namelist = gaggledata.getDataAsNameList();
                        var newdata = new Namelist(gaggledata.getName(), gaggledata.getSize(),
                                                   gaggledata.getSpecies(),
                                                   namelist);
                        //alert(namelist);
                        if (gaggledata.getSpecies().toLowerCase().indexOf("tuberculosis") >= 0)  {
                            newdata = cg_util.handleTBNamelist(newdata);
                        }
                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: newdata }, handlerResponse);
                        msg.send();
                        handler.handleNameList(namelist);
                    }
                }
            }
            else if (type.toLowerCase() == "cluster") {
                gaggledata = new Cluster("", "", null, 0, 0, null, null);
                gaggledata.parseJSON(data);
                if (gaggledata.getData() != null) {
                    if (handler.handleCluster != null)
                    {
                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: gaggledata }, handlerResponse);
                        msg.send();
                        handler.handleCluster(gaggledata);
                    }
                    else {
                        var namelist = gaggledata.getDataAsNameList();
                        var newdata = new Namelist(gaggledata.getName(), gaggledata.getSize(),
                                                   gaggledata.getSpecies(),
                                                   namelist);
                        //alert(namelist);
                        if (gaggledata.getSpecies().toLowerCase().indexOf("tuberculosis") >= 0) {
                            newdata = cg_util.handleTBNamelist(newdata);
                        }

                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: newdata }, handlerResponse);
                        msg.send();
                        handler.handleNameList(namelist);
                    }
                }
            }
            else if (type.toLowerCase() == "network") {
                gaggledata = new Network("", "", null, null);
                gaggledata.parseJSON(data);
                if (gaggledata.getData() != null) {
                    if (handler.handleNetwork != null)
                    {
                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: gaggledata }, handlerResponse);
                        msg.send();
                        handler.handleNetwork(gaggledata);
                    }
                    else if (gaggledata.getDataAsNameList != null) {
                        var namelist = gaggledata.getDataAsNameList();
                        var newdata = new Namelist(gaggledata.getName(), gaggledata.getSize(),
                                                   gaggledata.getSpecies(),
                                                   namelist);
                        //alert(namelist);
                        if (gaggledata.getSpecies().toLowerCase().indexOf("tuberculosis") >= 0) {
                            newdata = cg_util.handleTBNamelist(newdata);
                        }

                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: newdata }, handlerResponse);
                        msg.send();
                        handler.handleNameList(namelist);
                    }
                }
            }
        }
        else {
            // The handler might be a script wrapper, we need to show the UI.
            if (handler.processUI != null)
                console.log("Processing script wrapper...");

                // Record event in google analytics
                var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GOOGLEANALYTICS,
                                           { category: handler.getName(), data: 'data', action: 'View' }, null);
                msg.send();

                var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_GETORGANISMSHTML,
                                     null, function(organismshtml) {
                                        handler.processUI(currentPageData, organismshtml);
                                     });
                msg.send();

        }
    }
    catch(e) {
        console.log("broadcastFetchedData: Failed to broadcast data " + e);
    }
}

function generateNamelist(nameliststring)
{
    if (nameliststring != null && nameliststring.length > 0)
    {
        console.log("Generating namelist from " + nameliststring);
        var list = new Array();
        var splitted = nameliststring.split("\n");
        for (var i = 0; i < splitted.length; i++)
        {
            var line = splitted[i];
            console.log("Line: " + line);
            var delimitted = line.split(";");
            if (delimitted.length == 1)
                delimitted = line.split("\t");
            if (delimitted.length == 1)
                delimitted = line.split(",");
            for (var j = 0; j < delimitted.length; j++) {
                console.log("Name " + delimitted[j]);
                list.push(delimitted[j]);
            }
        }
        var namelist = new Namelist("", list.length, "", list);
        return namelist;
    }
    return null;
}

function broadcastData()
{
    //alert("Broadcasting ...");
    var target = $("#selTarget").val();
    var selecteddataindex = $(".selGaggleData").val();
    console.log("BroadcastData: " + target + " " + selecteddataindex);
    if (target != "-1") {
        var handler = webHandlers[parseInt(target)];
        console.log("Handler name: " + handler.getName());

        //var data = currentPageData[parseInt(selecteddataindex)];  //  data is not json stringified

        if (handler != null) {
            console.log("broadcastData: Fetching async data ");
            try {

                var pagedata = null;
                var source = null;
                if (selecteddataindex == "OtherText") {
                    var namelisttext = $(".inputTextData").val();
                    console.log("Namelist test from input: " + namelisttext);
                    var namelist = generateNamelist(namelisttext);
                    if (namelist != null) {
                        var dataobj = {};
                        dataobj.data = namelist;
                        broadcastFetchedData(JSON.stringify(dataobj), handler);
                    }
                }
                else if (selecteddataindex == "OtherFile") {
                    var reader = new FileReader();
                    var file = $(".inputFileData")[0].files[0];
                    reader.onload = function(e) {
                        var contents = e.target.result;
                        console.log( "Got the file.\n"
                          +"name: " + file.name + "\n"
                          +"type: " + file.type + "\n"
                          +"size: " + file.size + " bytes\n"
                          + "Content: " + contents
                        );
                        var namelist = generateNamelist(contents);
                        if (namelist != null) {
                            var dataobj = {};
                            dataobj.data = namelist;
                            broadcastFetchedData(JSON.stringify(dataobj), handler);
                        }
                    }

                    reader.readAsText(file);
                }
                else {
                    pagedata = cg_util.findDataByGuid(currentPageData, selecteddataindex);
                    if (pagedata != null)
                        source = (pagedata["source"] == null) ? pagedata.source : pagedata["source"];
                    console.log("Data from source: " + source);
                    if (source == "Page") {
                        cg_util.getActiveTab(function (tab) {
                            if (tab != null) {
                                var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_GETDATABYINDEX,
                                                       {handlerindex: target, dataindex: selecteddataindex }, broadcastFetchedData);
                                msg.send();
                            }
                        });
                    }
                    else if (source == "Broadcast" || source == null) {
                        console.log("Send broadcast data to " + handler.getName());
                        if (pagedata != null)
                            broadcastFetchedData(pagedata.jsondata, handler);
                        else
                            broadcastFetchedData(null, handler);
                    }
                }
            }
            catch(e) {
                console.log("broadcastData " + e);
            }
        }


        /*cg_util.getActiveTab(function (tab) {
            if (tab != null) {

               var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_HANDLER,
                                {handler: target, dataindex: selecteddataindex}, handlerResponse);
               msg.send();
            }
        }); */
    }
}

function startCytoscape()
{
    window.open("http://networks.systemsbiology.net/static/jnlp/cytoscape.jnlp");
}

function startMeV()
{
    window.open("http://networks.systemsbiology.net/static/jnlp/mev.jnlp");
}

function startR()
{
    window.open("http://gaggle.systemsbiology.net/2007-04/gaggle_1.19.2.tar.gz");
}

function tfoefilterSelected()
{
    var handler = opencpuHandlers["gaggletfoefilter"];
    console.log("tfoe filter " + handler.getName());
    broadcastFetchedData(null, handler);
}

function tbfilterSelected()
{
    var handler = opencpuHandlers["gaggletbfilter"];
    console.log("tb filter " + handler.getName());
    broadcastFetchedData(null, handler);
}

function geneSetEnrichmentSelected()
{
    var handler = opencpuHandlers["gagglefunctionalenrichment"];
    console.log("Gene set enrichment handler " + handler.getName());
    broadcastFetchedData(null, handler);
}

function plotDataSelected()
{
    var handler = opencpuHandlers["gaggleplotexpression"];
    console.log("Plot Expression handler " + handler.getName());
    broadcastFetchedData(null, handler);
}

document.addEventListener('DOMContentLoaded', function () {
  init();

  // Get data broadcast to me from other geese
  var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_BROADCASTDATA,
                                                 null, setDOMInfo);
  msg.send();

  // Get data from the gaggled page
  cg_util.getActiveTab(function (tab) {
    if (tab != null) {
       // get gaggle data of the currently active tab
       console.log("Get page data...");
       var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_PAGEDATA, null, setDOMInfo);
       msg.send();
    }
  });

  $("#btnBroadcast").click(broadcastData);

});
