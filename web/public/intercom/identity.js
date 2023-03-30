let userId = document.currentScript.getAttribute("data-user-id");
if (typeof userId === "undefined") {
  userId = undefined;
}

let userHash = document.currentScript.getAttribute("data-user-hash");
if (typeof userHash === "undefined") {
  userHash = undefined;
}

let userName = document.currentScript.getAttribute("data-user-name");
if (typeof userName === "undefined") {
  userName = undefined;
}

let userEmail = document.currentScript.getAttribute("data-user-email");
if (typeof userEmail === "undefined") {
  userEmail = undefined;
}

let userOperatingPhase = document.currentScript.getAttribute("data-user-operating-phase");
if (typeof userOperatingPhase === "undefined") {
  userOperatingPhase = undefined;
}

let userUuid = document.currentScript.getAttribute("data-user-uuid");
if (typeof userUuid === "undefined") {
  userUuid = undefined;
}

let userLegalStructure = document.currentScript.getAttribute("legal-structure");
if (typeof userLegalStructure === "undefined") {
  userLegalStructure = undefined;
}

let userIndustry = document.currentScript.getAttribute("industry");
if (typeof userIndustry === "undefined") {
  userIndustry = undefined;
}

let userBusinessPersona = document.currentScript.getAttribute("businessPersona");
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
  let w = window;
  let ic = w.Intercom;
  if (typeof ic === "function") {
    ic("reattach_activator");
    ic("update", w.intercomSettings);
  } else {
    let d = document;
    let i = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    w.Intercom = i;
    let l = function () {
      let s = d.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://widget.intercom.io/widget/ozxx8n5h";
      let x = d.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
    };
    if (w.attachEvent) {
      w.attachEvent("onload", l);
    } else {
      w.addEventListener("load", l, false);
    }
  }
})();
