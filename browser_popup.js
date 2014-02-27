// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var currentPageData = null;

function setDOMInfo(pageData) {
    //alert("Set DOM Info... " + pageData + " " + pageData.length);
    currentPageData = pageData;
    //alert("Page data stored");
    if (pageData != null) {
        for (var i = 0; i < pageData.length; i++) {
            var pagedataobj = JSON.parse(pageData[i]);
            var pagedata = pagedataobj["data"];
            var pagedatavalue = pagedataobj["value"];
            var type = pagedata["_type"];
            var gaggledata = null;
            if (type == "Namelist") {
                try {
                    gaggledata = new Namelist("", 0, "", null);
                    gaggledata.parseJSON(pagedata);
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


document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({
      active: true,
      currentWindow: true
  }, function(tabs) {
      /* ...and send a request for the DOM info... */
      chrome.tabs.sendMessage(
              tabs[0].id,
              { from: "popup", subject: "DOMInfo" },
              /* ...also specifying a callback to be called
               *    from the receiving end (content script) */
              setDOMInfo);
  });

  $("#btnBroadcast").click(broadcastData);

});

function broadcastData()
{
    alert("Broadcasting...");
}
