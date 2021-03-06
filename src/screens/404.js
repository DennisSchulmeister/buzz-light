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

import config from "../../config.js";
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
        if (config.developmentMode) {
            router.addRoute({
                path: "^/404/$",
                handler: this.handler,
            });
        }

        router.addRoute({
            path: ".*",
            handler: this.handler,
        });
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
     * Only call this while the SPA router isn't navigation to another page,
     * already. If it is, call the handler function provided by the handler
     * propoerty directly.
     */
    show() {
        let handler = this.lazyRouteHandler("The404Screen");
        this.plugins["Router"].router.applyHandler(handler);
    }

    /**
     * Route handler which calls the 404 screen. Use this when you want to
     * trigger the 404 page while the router is navigating but the request
     * cannot be completed.
     *
     * @return {Function} Route handle function
     */
    get handler() {
        return this.lazyRouteHandler("The404Screen");
    }

    /**
     * Use this when you need the 404 screen directly.
     * @return {Promise} The404Screen class
     */
    async getScreen() {
        let ScreenClass = await this.handler();
        return new ScreenClass();
    }
}

export default The404ScreenPlugin;
