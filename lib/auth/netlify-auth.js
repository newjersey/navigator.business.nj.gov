/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import netlifyIdentity from "netlify-identity-widget";
import { mapToUser } from "./mapToUser";

const netlifyAuth = {
  initialize(callback) {
    window.netlifyIdentity = netlifyIdentity;
    netlifyIdentity.on("init", (user) => {
      callback(mapToUser(user));
    });
    netlifyIdentity.init();
  },
  authenticate(callback) {
    netlifyIdentity.open();
    netlifyIdentity.on("login", (user) => {
      callback(mapToUser(user));
      netlifyIdentity.close();
    });
  },
  signout(callback) {
    netlifyIdentity.logout();
    netlifyIdentity.on("logout", () => {
      callback(null);
    });
  },
};

export default netlifyAuth;
