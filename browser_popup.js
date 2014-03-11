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

    try {
        alert(websocketconnection);
        if (websocketconnection == null || !websocketconnection.connected) {
            alert("Open websocket");
            if (websocketconnection == null)
                websocketconnection = new websocket('ws://localhost:8083/BossWebSocket', ['soap', 'xmpp'], connectionOpened, parseData);
            websocketconnection.open();
        }
    }
    catch(e) {
        alert(e);
    }
}

function setDOMInfo(pageData) {
    console.log("Set DOM Info... " + pageData + " " + pageData.length);
    currentPageData = [];
    //alert("Page data stored");
    if (pageData != null) {
        for (var i = 0; i < pageData.length; i++) {
            var pagedataobj = JSON.parse(pageData[i].jsondata);
            var pagedata = pagedataobj["data"];
            //var pagedatavalue = pagedataobj["value"];
            var type = pagedata["_type"];
            var gaggledata = null;
            if (type == "Namelist") {
                try {
                    gaggledata = new Namelist("", 0, "", null);
                    gaggledata.parseJSON(pagedata);
                    currentPageData.push(gaggledata);
                }
                catch (e) {
                    alert(e);
                }
            }
            //alert(pagedata.data.getName); //.data.getName());
            if (gaggledata != null)
                $("#selGaggleData").append($("<option></option>").attr("value", i.toString()).text(gaggledata.getName()));
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
}



function handlerResponse()
{

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