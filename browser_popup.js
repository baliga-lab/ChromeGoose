// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var webHandlers = [];
var currentPageData = [];
var bossConnected = false;
var currentScriptToRun = null;

function getGeese(callback) {
    //var url = HTTPBOSS_ADDRESS + "?command=getGeese";
    //cg_util.getFileFromUrl(url, callback);
    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETSEND,
                                   {ID: "", Action: "GetGeese", data: "" }, callback);
    //alert(callback);
    msg.send();
}

function init()
{
    //alert("Browser action init...");
    currentPageData = new Array();
    currentScriptToRun = null;
    $("#divScript").empty();

    $("#selGaggleMenu").change(gaggleMenuItemSelected);

    $(".selGaggleData").change(gaggleDataItemSelected);
    $(".btnCancelTextInput").click(cancelTextInput);
    $(".btnCancelFileInput").click(cancelFileInput);

    getGeese(function (response) {
        //alert("Listening geese: " + response);
        if (response == null)
            bossConnected = false;
        else {
           try {
               var jsonobj = JSON.parse(response);
               var geesestring = jsonobj["Data"];
               var socketid = jsonobj["ID"];
               //alert(socketid);
               bossConnected = (socketid != null && socketid.length > 0) ? true : false;
               if (geesestring != null) {
                   var splitted = geesestring.split(";;;");
                   for (var i = 0; i < splitted.length; i++) {
                        if (splitted[i] != null && splitted[i].length > 0)
                            $("#selTarget").prepend($("<option></option>").attr("value", splitted[i]).text(splitted[i]));
                   }
               }
           }
           catch (e) {
               console.log(e);
           }
        }

        console.log("Check boss response: " + bossConnected);
        if (bossConnected) {
            $("#imgGaggleConnected").attr("src", "img/connected.png");
            $("#selTarget").prepend($("<option></option>").attr("value", "Boss").text("Boss"));
            $("#selTarget").prepend($("<option></option>").attr("value", "-1").text("-- Select a Target to Broadcast --"));
        }
        else {
            $("#selTarget").prepend($("<option></option>").attr("value", "-1").text("-- Select a Target to Broadcast --"));
        }
    });


    // Load web handlers at the browser action side. Note we need to load instances of web handlers
    // for both browser action (to process data) and content scripts (to parse web pages).
    webHandlers = webhandlers.loadHandlers();
    for (var i = 0; i < webHandlers.length; i++) {
        //alert("Browser action loading " + webHandlers[i].getName());
        if (webHandlers[i].showInMenu())
            $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(webHandlers[i].getName()));
    }

    // Load R packages from OpenCPU
    var selGaggleDataParent = $(".selGaggleData").parent();
    //alert($(selGaggleDataParent)[0].outerHTML);
    webhandlers.loadOpenCPU(selGaggleDataParent, function(rscriptwrapper) {
        if (rscriptwrapper != null)
            $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(rscriptwrapper.getName()));
    });

    webhandlers.loadWorkflowComponents("selGaggleData", function(rscriptwrapper) {
        if (rscriptwrapper != null)
            $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(rscriptwrapper.getName()));
    });

    // Verify if Boss is started
    //cg_util.bossStarted(function (bossConnected) {

    //});

    /*try {
        alert(websocketconnection);
        if (websocketconnection == null) {
            alert("Browser action opens websocket");
            createWebSocket(BossWebSocketUrl, webSocketOpenCallback, parseData);
        }
    }
    catch(e) {
        alert(e);
    } */
}

function setDOMInfo(pageData) {
    console.log("Set DOM Info... " + pageData + " " + pageData.length);
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

            //alert(pagedata["_name"]);

            //var pagedatavalue = pagedataobj["value"];

            //var type = pagedata["_type"];
            //alert(type);

            /*var gaggledata = null;
            if (type == "NameList") {
                try {
                    gaggledata = new Namelist("", 0, "", null);
                    gaggledata.parseJSON(pagedata);
                    currentPageData.push(gaggledata);
                }
                catch (e) {
                    //alert("Failed to parse gaggle data " + e);
                }
            } */


            //alert(pagedata.data.getName); //.data.getName());
            //if (gaggledata != null)
            var text = (pagedata["_name"] != null) ? pagedata["_name"] : pagedata["name"];
            if (text == null)
                text = (pagedata["_type"] != null) ? pagedata["_type"] : pagedata["type"];
            //alert(text);
            if (text != null) {
                var gaggledata = (pagedata["_data"] != null) ? pagedata["_data"] : pagedata["gaggle-data"];
                if (gaggledata != null && gaggledata.length > 0)
                    text += " (" + gaggledata.length + ")";
                $(".selGaggleData").append($("<option></option>").attr("value", (i).toString()).text(text));

                // Change the text of the "no data" option
                $(".selGaggleData option[value=-1]").text("--- Select a data item ----");
            }
        }
    }
}

function gaggleMenuItemSelected(event) {
    console.log("Gaggle menu item selected "); // + $("#selGaggleMenu").val());

    var selected = $("#selGaggleMenu").val();
    if (selected == "0") {
        // Start the Boss
        cg_util.bossStarted(function (started) {
            console.log("Check boss response: " + started);
            if (!started) {
                cg_util.startBoss();
                $("#imgGaggleConnected").attr("src", "img/connected.png");
            }
            else {
                $("#imgGaggleConnected").attr("src", "img/connected.png");
            }
        });
    }
    else if (selected == "1") {
        // Open the Gaggle Website
        cg_util.openNewTab(GAGGLE_HOME);
    }
    else if (selected == "1000") {
        // DEBUG send data through the websocket
        alert("Send data to websocket");
        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_WEBSOCKETSEND,
                               { data: "GetID" }, null);
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

function gaggleDataItemSelected(event)
{
    console.log("Gaggle data item selected "); // + $("#selGaggleMenu").val());

    var source = event.target;
    console.log("gaggleDataItemSelected: event source: " + source);
    var selected = $(source).val();
    console.log("Selected data value: " + selected);
    if (selected == "OtherText") {
        showDataInput(source, ".divTextInput");
    }
    else if (selected == "OtherFile") {
        showDataInput(source, ".divFileInput");
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
            //alert(type);
            var gaggledata = null;
            if (type.toLowerCase() == "namelist") {
                gaggledata = new Namelist("", 0, "", null);
                //alert(handler.getName() + " " + data);
                gaggledata.parseJSON(data);
                if (handler.handleNameList != null) {
                    // First pass the data to the Event page
                    console.log("Sending data to event page");
                    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                           { handler: handler.getName(), source: gaggledata }, handlerResponse);
                    msg.send();

                    // Now we call the handler to handle data
                    handler.handleNameList(gaggledata.getData());
                }
            }
            else if (type == "DataMatrix") {
                gaggledata = new DataMatrix("", "", null, 0, 0, null, null, null);
                gaggledata.parseJSON(data);
                if (gaggledata.getData() != null) {
                    if (handler.handleDataMatrix != null)
                    {
                        var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                             { handler: handler.getName(), source: gaggledata }, handlerResponse);
                        msg.send();
                        handler.handleDataMatrix(gaggledata);
                    }
                    else {
                        var namelist = gaggledata.getDataAsNameList();
                        var newdata = new Namelist(gaggledata.getName(), gaggledata.getSize(),
                                                   gaggledata.getSpecies(),
                                                   namelist);
                        //alert(namelist);

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
                handler.processUI();
        }
    }
    catch(e) {
        console.log("broadcastFetchedData: Failed to broadcast data " + e);
    }
}

function broadcastData()
{
    //alert("Broadcasting ...");
    var target = $("#selTarget").val();
    var selecteddataindex = $(".selGaggleData").val();
    //alert(target + " " + selecteddataindex);
    if (target != "-1") {
        var handler = webHandlers[parseInt(target)];
        console.log("Handler name: " + handler.getName());

        //var data = currentPageData[parseInt(selecteddataindex)];  //  data is not json stringified

        if (handler != null) {
            console.log("broadcastData: Fetching async data ");
            try {
                var pagedata = null;
                var source = null;
                if (selecteddataindex >= 0) {
                    pagedata = currentPageData[parseInt(selecteddataindex)];
                    source = (pagedata["source"] == null) ? pagedata.source : pagedata["source"];
                }
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

document.addEventListener('DOMContentLoaded', function () {
  init();

  var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_BROADCASTDATA,
                                                 null, setDOMInfo);
  msg.send();

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

function runScript(event)
{
    //alert(event.srcElement);
    if (currentScriptToRun != null) {
        console.log("Script to run: " + currentScriptToRun.getName());
        var parameters = {};
        var source = event.target; // The Run button
        var parentdiv = $(source).parent();
        $(parentdiv).find(".selGaggleData").each(function () {
            console.log("selGaggleData: " + $(this).val());
            var selected = $(this).val();
            if (selected != "-1") {
                var paramlabel = $(this).parent().parent().find("label");
                console.log("Parameter Name: " + $(paramlabel).html());
                if (selected == "OtherText") {
                    var textinput = $(this).parent().find(".inputTextData");
                    console.log("Parameter value: " + $(textinput).val());
                    if ($(textinput).val() != null) {
                        parameters[$(paramlabel).html()] = $(textinput).val();
                    }
                }
                else if (selected == "OtherFile") {
                    var fileinput = $(this).parent().find(".inputFileData");
                    var file = $(fileinput)[0].files[0];
                    console.log("File parameter: " + file);
                    if (file != null) {
                        parameters[$(paramlabel).html()] = file;
                    }
                }
            }
        });

        if (parameters != null) {
            var resultdiv = ($(parentdiv).find(".divResult"))[0];
            console.log("Result div: " + resultdiv);
            var parafunc = $(parentdiv).parent().find("p");
            var packageindex = $("#selTarget").val();
            var packagename = $("#selTarget option[value=" + packageindex + "]").text();
            console.log("Package name: " + packagename + ", Function name: " + $(parafunc).text());
            ocpu.seturl(OPENCPU_SERVER + "/library/" + packagename + "/R");
            console.log("Parameter JSON string: " + JSON.stringify(parameters));
            var req = ocpu.call($(parafunc).text(), parameters, function(session){
                console.log("Session ID: " + session.getKey() + " session URl: " + session.getLoc());
                var openurl = OPENCPU_SERVER + "/library/" + packagename + "/www/" + $(parafunc).text()
                    + "_output.html?host=" + OPENCPU_SERVER + "&sessionID=" + session.getKey();
                console.log("Open output html page: " + openurl);
                cg_util.openNewTab(openurl);

                session.getObject(function(data) {
                    console.log("Function return: " + JSON.stringify(data));
                    var result = data["message"];
                    console.log("Result text: " + result + " result div: " + resultdiv);
                    if (result != null) {
                        // Open a tab and show the result
                        $(resultdiv).show();
                        $(resultdiv).html(result);
                    }
                });
            });

            req.fail(function(){
                console.log("Server error: " + req.responseText);
            });
        }
    }
    //closeScript();
}

function closeScript()
{
    $("#divScript").attr("style", "display: none");
}