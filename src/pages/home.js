"use strict";

import PagePlugin from "./base.js";

/**
 * Page plugin for the initial home page.
 */
class HomePagePlugin extends PagePlugin {
    constructor() {
        super();
        this.name = "HomePage";
    }

    /**
     * Append URL routes for the SPA router
     * @param {Object} routes At this point already existing routes
     */
    defineUrlRoutes(routes) {
        Object.assign(routes, {
            "/": this.lazyLoad("home-page"),
        });
    }

    /**
     * Leverage webpack's import() handling to create a new bundle which
     * will be lazy-loaded on runtime.
     */
    importHook() {
        return import("./home/");
    }
}

export default HomePagePlugin;
