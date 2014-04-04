// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var webHandlers = [];
var currentPageData = [];

function init()
{
    console.log("Browser action init...");

    $("#selGaggleMenu").change(gaggleMenuItemSelected);

    // Load web handlers at the browser action side. Note we need to load instances of web handlers
    // for both browser action (to process data) and content scripts (to parse web pages).
    webHandlers = webhandlers.loadHandlers();
    for (var i = 0; i < webHandlers.length; i++) {
        //alert("Browser action loading " + webHandlers[i].getName());
        if (webHandlers[i].showInMenu())
            $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(webHandlers[i].getName()));
    }



    // Verify if Boss is started
    cg_util.bossStarted(function (started) {
        console.log("Check boss response: " + started);
        if (started) {
            $("#imgGaggleConnected").attr("src", "img/connected.png");
            cg_util.getGeese(function (results) {
                console.log("Listening geese: " + results);

                if (results != null) {
                   try {
                       var jsonobj = JSON.parse(results);
                       //alert(jsonobj);
                       var geesestring = jsonobj["result"];
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
                $("#selTarget").prepend($("<option></option>").attr("value", "Boss").text("Boss"));
                $("#selTarget").prepend($("<option></option>").attr("value", "-1").text("-- Select a Target to Broadcast --"));
            });
        }
        else {
            $("#selTarget").prepend($("<option></option>").attr("value", "-1").text("-- Select a Target to Broadcast --"));
        }
    });

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

    currentPageData = [];
    //alert("Page data stored");
    if (pageData != null) {
        for (var i = 0; i < pageData.length; i++) {
            //alert("JSON data: " + pageData[i].jsondata);
            if (pageData[i].jsondata == undefined)
                continue;

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
            $("#selGaggleData").append($("<option></option>").attr("value", i.toString()).text(pagedata["_name"]));
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



function handlerResponse()
{

}

function broadcastFetchedData(jsonobj)
{
    //alert(jsonobj);
    try {
        var jsonObj = JSON.parse(jsonobj);
        var handlerindexstr = jsonObj["handlerindex"];
        var handler = webHandlers[parseInt(handlerindexstr)];
        var data = jsonObj["data"];
        var type = data["_type"];
        //alert(type);
        var gaggledata = null;
        if (type == "NameList") {
            gaggledata = new Namelist("", 0, "", null);
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
        else if (type == "Cluster") {
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
    catch(e) {
        alert("Failed to dispatch data " + e);
    }
}

function broadcastData()
{
    //alert("Broadcasting ...");
    var target = $("#selTarget").val();
    var selecteddataindex = $("#selGaggleData").val();
    //alert(target + " " + selecteddataindex);
    if (target != "-1" && selecteddataindex != "-1") {
        var handler = webHandlers[parseInt(target)];
        //alert(handler.getName());

        //var data = currentPageData[parseInt(selecteddataindex)];  //  data is not json stringified

        if (handler != null) {// && data != null) {
            //alert("Fetching async data ");
            try {
                cg_util.getActiveTab(function (tab) {
                    if (tab != null) {
                        //var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_PAGEDATA, null, setDOMInfo);
                        var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_GETDATABYINDEX,
                                               {handlerindex: target, dataindex: selecteddataindex }, broadcastFetchedData);
                        msg.send();
                    }
                });
            }
            catch(e) {
                alert(e);
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

  cg_util.getActiveTab(function (tab) {
    if (tab != null) {
       // get gaggle data of the currently active tab
       var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_PAGEDATA, null, setDOMInfo);
       msg.send();

       //chrome.tabs.sendMessage(
       //      tab.id,
       //      { from: "popup", subject: "PageData" },
             /* ...also specifying a callback to be called
              *    from the receiving end (content script) */
       //      setDOMInfo);
    }
  });

  $("#btnBroadcast").click(broadcastData);

});