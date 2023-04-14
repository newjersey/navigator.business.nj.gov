var userId = document.currentScript.getAttribute("data-user-id");
if (typeof userId === "undefined") {
  userId = undefined;
}

var userHash = document.currentScript.getAttribute("data-user-hash");
if (typeof userHash === "undefined") {
  userHash = undefined;
}

var userName = document.currentScript.getAttribute("data-user-name");
if (typeof userName === "undefined") {
  userName = undefined;
}

var userEmail = document.currentScript.getAttribute("data-user-email");
if (typeof userEmail === "undefined") {
  userEmail = undefined;
}

var userOperatingPhase = document.currentScript.getAttribute("data-user-operating-phase");
if (typeof userOperatingPhase === "undefined") {
  userOperatingPhase = undefined;
}

var userUuid = document.currentScript.getAttribute("data-user-uuid");
if (typeof userUuid === "undefined") {
  userUuid = undefined;
}

var userLegalStructure = document.currentScript.getAttribute("data-user-legal-structure");
if (typeof userLegalStructure === "undefined") {
  userLegalStructure = undefined;
}

var userIndustry = document.currentScript.getAttribute("data-user-industry-id");
if (typeof userIndustry === "undefined") {
  userIndustry = undefined;
}

var userBusinessPersona = document.currentScript.getAttribute("data-user-business-persona");
if (typeof userBusinessPersona === "undefined") {
  userBusinessPersona = undefined;
}

window.intercomSettings = {
  app_id: "ozxx8n5h",
  custom_launcher_selector: ".intercom-button",
  user_id: userId,
  user_hash: userHash,
  user_uuid: userUuid,
  name: userName,
  email: userEmail,
  operatingPhase: userOperatingPhase,
  legalStructure: userLegalStructure,
  industry: userIndustry,
  businessPersona: userBusinessPersona,
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
