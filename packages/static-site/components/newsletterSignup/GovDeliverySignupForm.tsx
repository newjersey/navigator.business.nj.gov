"use client";

import { useEffect, useRef } from "react";

const GOVDELIVERY_ACCOUNT_CODE = "NJGOV";
const GOVDELIVERY_SIGNUP_ID = "31933";
const GOVDELIVERY_SIGNUP_LOADER_SRC = "https://public.govdelivery.com/assets/Signup.js";

/**
 * GovDelivery injects an iframe and sizes it itself, so the container has no
 * height until the iframe loads. Reserving the settled height keeps the card
 * from expanding underneath the user mid-read. The height is a little taller
 * on mobile screens, but setting min-height for desktop is sufficient to cover
 * the most jarring scenario of no height without resorting to media queries.
 */
const GOVDELIVERY_FORM_HEIGHT_PX = 371;

/**
 * This uses a plain `<script>` rather than `next/script` because `next/script`
 * hoists the tag to `<body>`, and GovDelivery injects the form next to its own
 * tag so it would render outside the card. React-created script elements never
 * execute on the client. Manual injection into a `ref`'d div makes sure the
 * script executes while keeping the tag inline where the form should appear.
 */
export const GovDeliverySignupForm = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector("script")) {
      return;
    }

    const script = document.createElement("script");
    script.src = GOVDELIVERY_SIGNUP_LOADER_SRC;
    script.setAttribute("data-account-code", GOVDELIVERY_ACCOUNT_CODE);
    script.setAttribute("data-signup-id", GOVDELIVERY_SIGNUP_ID);
    container.appendChild(script);
  }, []);

  return <div ref={containerRef} style={{ minHeight: GOVDELIVERY_FORM_HEIGHT_PX }} />;
};
