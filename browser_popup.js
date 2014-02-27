// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var currentPageData = null;
var webHandlers = [];

function init()
{
    //alert("Browser action init...");
    webHandlers = loadHandlers(false);
    for (var i = 0; i < webHandlers.length; i++) {
        $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(webHandlers[i]));
    }
}

function setDOMInfo(pageData) {
    //alert("Set DOM Info... " + pageData + " " + pageData.length);
    currentPageData = [];
    //alert("Page data stored");
    if (pageData != null) {
        for (var i = 0; i < pageData.length; i++) {
            var pagedataobj = JSON.parse(pageData[i].jsondata);
            var pagedata = pagedataobj["data"];
            var pagedatavalue = pagedataobj["value"];
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
                $("#selGaggleData").append($("<option></option>").attr("value", pagedatavalue).text(gaggledata.getName()));
        }
    }
}


function broadcastData()
{
    alert("Broadcasting...");
    var target = $("#selTarget").val();
    var selecteddataindex = $("#selGaggleData").val();
    //alert(target + " " + selecteddataindex);
    if (target != "-1" && selecteddataindex != "-1") {
        getActiveTab(function (tab) {
            if (tab != null) {
               var msg = new Message(MSG_FROM_POPUP, chrome.tabs, tab.id, MSG_SUBJECT_HANDLER,
                                {handler: target, dataindex: selecteddataindex}, handlerResponse);
               msg.send();
            }
        });
    }
}

function handlerResponse()
{

}



document.addEventListener('DOMContentLoaded', function () {
  init();

  getActiveTab(function (tab) {
    if (tab != null) {
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