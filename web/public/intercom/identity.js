var userId = document.currentScript.getAttribute("data-user-id");
if (typeof userId === "undefined") {
  userId = undefined;
}

var userHash = document.currentScript.getAttribute("data-user-hash");
if (typeof userHash === "undefined") {
  userHash = undefined;
}

window.intercomSettings = {
  app_id: "ozxx8n5h",
  custom_launcher_selector: ".intercom-button",
  user_id: userId,
  user_hash: userHash,
};

// re-init
(function () {
  var w = window;
  var ic = w.Intercom;
  if (typeof ic === "function") {
    ic("reattach_activator");
    ic("update", w.intercomSettings);
  } else {
    var d = document;
    var i = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    w.Intercom = i;
    var l = function () {
      var s = d.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://widget.intercom.io/widget/ozxx8n5h";
      var x = d.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
    };
    if (w.attachEvent) {
      w.attachEvent("onload", l);
    } else {
      w.addEventListener("load", l, false);
    }
  }
})();
