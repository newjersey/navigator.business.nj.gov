/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import netlifyIdentity from "netlify-identity-widget";
import { mapToUser } from "./mapToUser";

const netlifyAuth = {
  initialize(callback) {
    window.netlifyIdentity = netlifyIdentity;
    netlifyIdentity.on("init", (user) => {
      callback(mapToUser(user));
    });
    netlifyIdentity.on("close", () => {
      callWithCurrentUser(callback);
    });
    netlifyIdentity.init();
  },
  authenticate(callback) {
    netlifyIdentity.open();
    netlifyIdentity.on("login", (user) => {
      callback(mapToUser(user));
      netlifyIdentity.close();
    });
    netlifyIdentity.on("close", () => {
      callWithCurrentUser(callback);
    });
  },
  signout(callback) {
    netlifyIdentity.logout();
    netlifyIdentity.on("logout", () => {
      callback(null);
    });
  },
};

const callWithCurrentUser = (callback) => {
  let count = 0;
  let called = false;

  const interval = setInterval(() => {
    count += 1;
    if (called || count > 100) {
      clearInterval(interval);
    }
    if (netlifyIdentity.currentUser()) {
      callback(mapToUser(netlifyIdentity.currentUser()));
      netlifyIdentity.close();
      called = true;
    }
  }, 100);
};

export default netlifyAuth;
