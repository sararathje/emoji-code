
(function(chrome) {
  // I actually don't want this on completed. I just want it to persist on any tab...
  // so I guess when completed, start the content script
  chrome.webNavigation.onCompleted.addListener(function(details) {
    console.log('please call me');
    // console.log(document.body.innerHTML);
    // chrome.tabs.executeScript(details.tabId, {file: '.\content.js'});
  });

  // document.onkeydown = function (event) {
  //   console.log(event.keyCode);
  //   // if (event.shiftKey) {
  //   //   alert("Wooohoo");
  //   // }
  // };
})(chrome);