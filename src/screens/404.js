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

import ScreenPlugin from "./base.js";

/**
 * Screen plugin for the 404 screen. This screen will always be shown when an
 * unkown path is requested from the SPA router.
 */
class The404ScreenPlugin extends ScreenPlugin {
    /**
     * Simple constructor which merely defines the plugin name.
     */
    constructor() {
        super();
        this.name = "404Screen";
    }

    /**
     * Store reference to the plugin registry.
     * @param  {Object} plugins Plugin instances
     */
    initialize(plugins) {
        this.plugins = plugins;
    }

    /**
     * Append URL routes for the SPA router
     * @param {Object} router The SPA router instance
     */
    addRoutes(router) {
        router.addRoute({
            path: ".*",
            handler: this.handler,
        });
    }

    /**
     * Route handler which calls the 404 screen.
     * @return {Function} Route handle function
     */
    get handler() {
        return this.lazyRouteHandler("The404Screen");
    }

    /**
     * Import the module which contains the Screen itself.
     * @return {Promise} Loaded module content
     */
    importModule() {
        return import("./404/");
    }

    /**
     * Utility function to show the 404 page without actually navigating to it.
     * This is used in certain cases when a course has been matched by an URL
     * but either the course manifest could not be loaded of the requested page
     * is not part of the course (only on first visit when the final course
     * routes have not yet been added to the SPA router).
     */
    show() {
        let handler = this.lazyRouteHandler("The404Screen");
        this.plugins["Router"].router.applyHandler(handler);
    }
}

export default The404ScreenPlugin;
