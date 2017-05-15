/*
 * Buzz - The Social LMS (https://www.buzzlms.de)
 * © 2017  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */
"use strict";

// Local configuration for a single installation of this web app.
// See the inline comments for possible options.
let config = {
    // Page title
    title: "Buzz Light",

    // URL where the user gets redirects to when requesting the home page
    home: "/course/example",

    // URL of your external website
    website: "https://www.github.com/DennisSchulmeister/buzz-light",

    // Available courses
    courses: {
        // "id": "relative path"
        "example": "example",
    },

    // We don't really care for older browsers withouth HTML5 History API.
    // However hashbang based routing (with an # in the URL) makes life easier
    // during development. It's safe to set this value to false in production
    // as it makes for pretier URLs.
    hashbangUrls: true,

    // Default language (leave empty for auto-detect)
    language: "",

    // Timeout in mili-seconds after which global messages (toasts) disappear
    toastTimeout: 25000,

    // Additional plugin classes
    plugins: [],
};

export default config;
