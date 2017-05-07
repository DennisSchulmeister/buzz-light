"use strict";

import config from "../config.js";

/**
 * Page plugin for all user-related pages
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
