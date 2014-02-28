// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var currentPageData = null;
var webHandlers = [];

function init()
{
    //alert("Browser action init...");
    webHandlers = cg_util.loadHandlers(true);
    for (var i = 0; i < webHandlers.length; i++) {
        //alert("Browser action loading " + webHandlers[i].getName());
        $("#selTarget").append($("<option></option>").attr("value", i.toString()).text(webHandlers[i].getName()));
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
        var handler = webHandlers[parseInt(target)];
        var data = currentPageData[parseInt(selecteddataindex)];  //  data is not json stringified
        if (handler != null && data != null) {
            var type = data.getType();
            if (type == "Namelist") {
                if (handler.handleNameList != null) {
                    // First pass the data to the Event page
                    var msg = new Message(MSG_FROM_POPUP, chrome.runtime, null, MSG_SUBJECT_STOREDATA,
                                           data, handlerResponse);
                    msg.send();

                    // Now we call the handler to handle data
                    handler.handleNameList(data);
                }
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

function handlerResponse()
{

}



document.addEventListener('DOMContentLoaded', function () {
  init();

  cg_util.getActiveTab(function (tab) {
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