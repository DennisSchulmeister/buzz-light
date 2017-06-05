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

    // Base path where your website sits on the server (prefix for the
    // url configuration, e.g. "/subsdir").
    basePath: "",

    // We don't really care for older browsers withouth HTML5 History API.
    // However hashbang based routing (with an # in the URL) makes life easier
    // during development. It's safe to set this value to false in production
    // as it makes for pretier URLs.
    hashBang: true,

    // Set to false once you go into production. When set to true it is possible
    // to test the 404 and 500 screen via the URLs /404/ and /500/.
    developmentMode: true,

    // URL where the user gets redirects to when requesting the home page
    home: "/course/overview/",

    // URL of your external website
    website: "https://www.github.com/DennisSchulmeister/buzz-light",

    // URL prefix from where all static course files are served
    // Don't change to "/course" because this will conflict with the URL
    // scheme of the single page router! This URL is only used "internally"
    // to get the course definition and static files.
    courseUrlPrefix: "/courses",

    // Available courses (sub-directories below static/courses or in a production
    // environmant sub-paths below the courses/ URL path)
    courses: [
        "overview",
        "buzz-tutorial",
    ],

    // Default language (leave empty for auto-detect)
    language: "",

    // Timeout in mili-seconds after which global messages (toasts) disappear
    toastTimeout: 25000,

    // Additional plugin classes
    plugins: [],
};

export default config;
