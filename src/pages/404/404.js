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

import ko from "knockout";
import plugins from "../../app.js";

const _ = plugins["I18n"].translate;

/**
 * ViewModel class for the course content page. This is actually the page
 * behind most if not everything which can be seen inside a course. Because
 * in reality a course is just a container for content pages.
 */
class The404Page {
    constructor() {
        plugins["Router"].pageName(_("Page not found"));
    }
}

ko.components.register("the-404-page", {
    viewModel: The404Page,
    template: require("./404.html"),
});

export default The404Page;
