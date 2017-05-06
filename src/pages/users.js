"use strict";

import PagePlugin from "./base.js";

/**
 * Page plugin for all user-related pages
 */
class UsersPagePlugin extends PagePlugin {
    /**
     * Append URL routes for the SPA router
     * @param  {Object} routes At this point already existing routes
     */
    defineUrlRoutes(routes) {
        Object.assign(routes, {
            "/users": {
                "/": this.lazyLoad("user-list-page"),
            },
        });
    }

    /**
     * Leverage webpack's import() handling to create a new bundle which
     * will be lazy-loaded on runtime.
     */
    importHook() {
        return import("./users/");
    }
}

export default UsersPagePlugin;
