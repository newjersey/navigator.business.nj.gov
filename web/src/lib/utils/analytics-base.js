const sendEvent = (event) => {
  // console.log("Tracking event:", event.event, event);
  window.gtm(event);
};

const userUpdate = (user_update) => {
  window.userData = { ...window.userData, ...user_update };
  sendEvent({ event: "user_update", ...window.userData });
};

let analyticsContext = { calendar_view: undefined };

const updateContext = (analytics_context) => {
  analyticsContext = { ...analyticsContext, ...analytics_context };
};

export default { sendEvent, userUpdate, updateContext, context: analyticsContext };
