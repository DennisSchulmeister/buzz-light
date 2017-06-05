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
import config from "../config.js";
import RedirectScreen from "./router/redirect.js";

/**
 * Simple plugin which redirects the user to the start URL when the root
 * URL "/" is requested. This allows to set up kind of a meta course which
 * contains all static page content.
 */
class RedirectHomePlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        this.name = "RedirectHome";
    }

    /**
     * Append URL routes for the SPA router
     * @param {Object} router The SPA router instance
     */
    addRoutes(router) {
        router.addRoute({
            path: "^/$",
            handler: () => new RedirectScreen(config.home),
        });
    }
}

export default RedirectHomePlugin;
