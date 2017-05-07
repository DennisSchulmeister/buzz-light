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

    // Available courses
    courses: {
        // "id": "relative path"
        "example": "example",
    },

    // Additional plugin classes
    plugins: [],
};

export default config;
