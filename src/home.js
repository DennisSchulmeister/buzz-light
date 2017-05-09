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

import config from "../config.js";

/**
 * Simple plugin which redirects the user to the start URL when the root
 * URL "/" is requested. This allows to set up kind of a meta course which
 * contains all static page content.
 */
class RedirectHomePlugin {
    /**
     * Simple constructor which merely defines the plugin name.
     */
    constructor() {
        this.name = "RedirectHome";
    }

    /**
     * Append URL routes for the SPA router
     * @param {Object} routes At this point already existing routes
     */
    defineUrlRoutes(routes) {
        Object.assign(routes, {
            "/": this.redirect,
        });
    }

    /**
     * Called by the SPA router when the home page "/" is requested. This
     * doesn't really load a knockout.js component but instead redirects the
     * user to the real home page as defined in ../config.js.
     *
     * @param {Object} ctx The router context
     */
    redirect(ctx) {
        ctx.router.update(config.home);
    }
}

export default RedirectHomePlugin;
