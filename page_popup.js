// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function setDOMInfo(gaggleData) {
    if (gaggleData != null) {
        for (var i = 0; i < gaggleData.length; i++)
            $("#selGaggleData").append($("<option></option>").attr("value", gaggleData[i].value).text(gaggleData[i].text));
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


