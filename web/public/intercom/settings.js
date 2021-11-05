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
