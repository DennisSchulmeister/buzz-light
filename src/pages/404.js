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

import PagePlugin from "./base.js";

/**
 * Page plugin for a 404 page. This page will always be shown when an unkown
 * path is requested from the SPA router.
 */
class The404PagePlugin extends PagePlugin {
    /**
     * Simple constructor which merely defines the plugin name.
     */
    constructor() {
        super();
        this.name = "404Page";
    }

    /**
     * Append URL routes for the SPA router
     * @param {Object} routes At this point already existing routes
     */
    defineUrlRoutes(routes) {
        Object.assign(routes, {
            "/*": this.lazyLoad("the-404-page"),
        });
    }

    /**
     * Leverage webpack's import() handling to create a new bundle which
     * will be lazy-loaded on runtime.
     */
    importHook() {
        return import("./404/");
    }

    /**
     * Additional property which can be used to include a 404 route in a nested
     * routing context. We need that in the course plugin becuause there any
     * URL which starts with /course is catched with a "/course/*" pattern
     * which prevents the default 404 route to be run when the user requests
     * an unkown page.
     *
     * @return {Array} Array with SPA router middleware functions
     */
    get route() {
        return this.lazyLoad("the-404-page");
    }

    /**
     * Utility function which replaces the current page with the 404 page.
     * This doesn't redirect but simply changes the visible content. This is
     * needed in the course plugin for when the asynchronous loading of the
     * course manifest fails. In theory the URL is valid but in practice the
     * requested course cannot be shown.
     *
     * * @param {Object} ctx The SPA router context
     */
    show(ctx) {
        this.importHook().then(() => {
            console.log(ctx.router.component);
            ctx.router.component("the-404-page");
        })
    }
}

export default The404PagePlugin;
