const sendEvent = (event) => {
  // console.log("Tracking event:", event.event, event);
  window.gtm(event);
};

const userUpdate = (user_update) => {
  // console.log("window.user_data", window.userData);
  // console.log("user_update passed", user_update);

  // so my assumption that I'm going to test here is that the window.userData is where we store our userData obj
  // if thats the case what I can probably do is compare the 2 for differences and then grab the keys that are different between the 2
  // Then I can check that they aren't undefined and then push an event or events with those new keys

  // The idea is that from there I will have catches / triggers and tags based on the names of said keys, that pass their corresponding values to GA4

  // in this way, we get data to GA4, we don't pass undefineds, we also don't trigger many many times per page becuase we're only passing when things change not every page load passes an event.

  // 3 cases

  // 1 updateKey doesn't exists in data key -> send event

  // if (
  //   typeof user_update === "object" &&
  //   user_update !== null &&
  //   user_update !== undefined &&
  //   typeof window.userData === "object" &&
  //   window.userData !== null &&
  //   window.userData !== undefined &&
  //   Object.keys(user_update).length > 0
  // ) {
  //   for (let userUpdate_key of Object.keys(user_update)) {
  //     // key value is not undefined
  //     if (
  //       user_update[userUpdate_key] !== undefined &&
  //       user_update[userUpdate_key] !== null &&
  //       user_update[userUpdate_key] !== ""
  //     ) {
  //       // new key
  //       if (!(userUpdate_key in window.userData)) {
  //         console.log("event sent upper", {
  //           event: userUpdate_key,
  //           [userUpdate_key]: userUpdate_key,
  //         });
  //         sendEvent({ event: "user_update_revised", ...window.userData });
  //       }
  //       // updated key
  //       if (
  //         userUpdate_key in window.userData &&
  //         user_update[userUpdate_key] !== window.userData[userUpdate_key]
  //       ) {
  //         console.log("event sent lower", {
  //           event: userUpdate_key,
  //           [userUpdate_key]: userUpdate_key,
  //         });
  //         sendEvent({ event: "user_update_revised", ...window.userData });
  //       }
  //     }
  //   }
  // }

  window.userData = { ...window.userData, ...user_update };
  sendEvent({ event: "user_update_revised", ...window.userData });
};

let analyticsContext = { calendar_view: undefined };

const updateContext = (analytics_context) => {
  analyticsContext = { ...analyticsContext, ...analytics_context };
};

export default { sendEvent, userUpdate, updateContext, context: analyticsContext };
