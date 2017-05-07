"use strict";

import PagePlugin from "./base.js";

/**
 * Page plugin for the course contents. This page plugin will render most
 * if not all contents of a course because in reality a course is just a
 * container for content pages.
 */
class CoursePagePlugin extends PagePlugin {
    /**
     * Simple constructor which merely defines the plugin name.
     */
    constructor() {
        super();
        this.name = "CoursePage";
    }

    /**
     * Append URL routes for the SPA router
     * @param {Object} routes At this point already existing routes
     */
    defineUrlRoutes(routes) {
        Object.assign(routes, {
            "/course": {
                "/*": this.lazyLoad("course-content-page"),
            },
        });
    }

    /**
     * Leverage webpack's import() handling to create a new bundle which
     * will be lazy-loaded on runtime.
     */
    importHook() {
        return import("./course/");
    }
}

export default CoursePagePlugin;
