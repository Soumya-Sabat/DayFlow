import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";

import "dotenv/config";

const isDevelopment = process.env.NODE_ENV === "development" || process.env.ARCJET_ENV === "development";

// init arcjet
export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: isDevelopment ? [] : ["ip.src"],
  rules: [
    // shield protects our app from common attacks e.g. SQL injection, XSS, CSRF attacks
    shield({ mode: "LIVE" }),
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      // block all bots except search engines
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        // see the full list at https://arcjet.com/bot-list
      ],
    }),
    // rate limiting here
    tokenBucket({
      mode: isDevelopment ? "DRY_RUN" : "LIVE",
      refillRate: 30,
      interval: 5,
      capacity: 20,
    }),
  ],
});
