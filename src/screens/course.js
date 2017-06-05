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

import $ from "jquery";
import config from "../../config.js";
import ScreenPlugin from "./base.js";

/**
 * Screen plugin for the course contents. This page plugin will render most
 * if not all contents of a course because in reality a course is just a
 * container for content pages.
 */
class CourseScreenPlugin extends ScreenPlugin {
    /**
     * Simple constructor which merely defines the plugin name.
     */
    constructor() {
        super();
        this.name = "CourseScreen";

        this.router = undefined;
        this.course = new CourseData();
    }

    /**
     * Store reference to the plugin registry.
     * @param  {Object} plugins Plugin instances
     */
    initialize(plugins) {
        this.plugins = plugins;
    }

    /**
     * Append URL routes for the SPA router. At first only one catch-all route
     * for each course is added. These rules lead to the LoadCourseScreen which
     * will load the complete course definition when a course-specific URL
     * is requested for the first time. According to the course definition the
     * catch-all rule will be replaced with specific rules for each course page
     * and the requested URL will be reloaded in order to show its real content.
     *
     * @param {Object} router The SPA router instance
     */
    addRoutes(router) {
        this.router = router;

        config.courses.forEach(courseId => {
            router.addRoute(this.getCourseCatchAllRoute(courseId));
        });

        router.addRoute({
            path: "^/course/.*",
            handler: this.plugins["404Screen"].handler,
        });
    }

    /**
     * Return the generic catch-all route for a course.
     * @param  {String} courseId Course id (directory in static/courses)
     * @return {Object} SPA router rule
     */
    getCourseCatchAllRoute(courseId) {
        let courseUrl = this.getCourseUrl(courseId);

        return {
            id: this.getCourseRouteId(courseId),
            path: `^${courseUrl}.*`,
            handler: this.loadCourseHandler(courseId),
        };
    }

    /**
     * Calculates the route ID which identify all routes or a certain course.
     * @param  {String} courseId Course id (directory in static/courses)
     * @return {String} Route ID for the router routes
     */
    getCourseRouteId(courseId) {
        return `course ${courseId}`;
    }

    /**
    * Calculates the URL prefix of a given course.
    * @param  {String} courseId Course id (directory in static/courses)
    * @return {String} URL prefix with which each URL must start
     */
    getCourseUrl(courseId) {
        return `/course/${courseId}/`;
    }

    /**
     * Called in addRoutes() above. This returns a handler function which
     * when called imports the module with the course screen and loads the
     * course data.
     *
     * @param  {String} courseId Course id (directory in static/courses)
     * @return {Promise} Screen object which rewrites the routing rules
     */
    loadCourseHandler(courseId) {
        return async () => {
            let result = await Promise.all([
                this.importModule(),
                this.loadCourseData(courseId),
            ]);

            this.course = result[1];

            if (this.course) return new RedirectCourseScreen(this);
            else return this.plugins["404Screen"].handler();
        }
    }

    /**
     * Import the module which contains the course screens.
     * @return {Promise} Loaded module content
     */
    importModule() {
        return import("./course/");
    }

    /**
     * Called by loadCourseHandler() above in order to asynchronously load the
     * course definition. Once the definition is loaded the router is advised
     * to call this screen so that the routing rules can be rewritten.
     *
     * @param  {String} courseId Course id (directory in static/courses)
     * @return {Promise} CourseData instance with cleaned course definition
     */
    async loadCourseData(courseId) {
        let contentUrl = `${config.courseUrlPrefix}/${courseId}/`;
        let manifestRaw = undefined;

        try {
            manifestRaw = await $.get({
                url: `${contentUrl}course.json`,
                dataType: "json"
            });
        } catch (error) {
            // Failed to load the course.json manifest
            let _ = this.plugins["I18n"].translate;
            let msg = _("The course definition could not be loaded. (Technical error: ${error})").replace("${error}", error.statusText);
            this.plugins["Toast"].error(msg);
        }

        if (!manifestRaw) return;

        let course = new CourseData();
        course.courseId = courseId;
        course.manifest = this.cleanManifest(courseId, manifestRaw);
        course.contentUrl = contentUrl;
        course.courseUrl = this.getCourseUrl(courseId);
        return course;
    }

    /**
     * Return a cleaned version of the course manifest which irons out different
     * possible ways to express the page content. Beware that the returned object
     * is the same object that was passed in!
     *
     * @param {String} courseId Course ID from URL
     * @param {Object} manifest Raw manifest data
     * @return {Object} Cleaned manifest data
     */
    cleanManifest(courseId, manifest) {
        let _clean = (pagePath, page) => {
            if (typeof(page) === "string") {
                page = {
                    file: page,
                };
            }

            if (!page.file) page.file = "";
            if (!page.pages) page.pages = {};
            if (!page.type) page.type = "single";
            if (!page.name) page.name = "";

            // Recursively traverse sub-pages
            if ("pages" in page) {
                for (let subpagePath in page.pages) {
                    let subpage = page.pages[subpagePath];
                    delete page.pages[subpagePath];

                    if (subpagePath.startsWith("/")) subpagePath = subpagePath.slice(1);
                    if (subpagePath.length > 0 && !subpagePath.endsWith("/")) subpagePath += "/";

                    page.pages[subpagePath] = _clean(subpagePath, subpage);
                }
            }

            return page;
        }

        if ("language" in manifest) {
            for (let language in manifest.language) {
                if ("pages" in manifest.language[language]) {
                    for (let pagePath in manifest.language[language].pages) {
                        let page = manifest.language[language].pages[pagePath];
                        delete manifest.language[language].pages[pagePath];

                        if (pagePath.startsWith("/")) pagePath = pagePath.slice(1);
                        if (pagePath.length > 0 && !pagePath.endsWith("/")) pagePath += "/";

                        manifest.language[language].pages[pagePath] = _clean(pagePath, page);
                    }
                }
            }
        }

        return manifest;
    }

    /**
     * Replace the catch-all route of the current course with specific routes
     * for each course page. This is called indirectly by the SPA router
     * through the RedirectCourseScreen below which in turn is attached with
     * the catch-all route of a course.
     */
    insertCourseRoutes() {
        let routeId = this.getCourseRouteId(this.course.courseId);
        let index = this.router.routes.findIndex(r => r.id === routeId);
        this.router.removeRoute(routeId);

        let newRoutes = [];
        let seenPages = {};

        for (let language in this.course.manifest.language) {
            for (let pagePath in this.course.manifest.language[language].pages) {
                if (pagePath in seenPages) continue;
                seenPages[pagePath] = true;

                let page = this.course.manifest.language[language].pages[pagePath];

                // Add routes in reverse order so we don't need to update the
                // index after each splice() later
                if (!Object.keys(page.pages).length) {
                    // Single page without subpages
                    newRoutes.unshift({
                        id: routeId,
                        path: `^${this.course.courseUrl}${pagePath}$`,
                        handler: async () => {
                            let module = await this.importModule();
                            return new module.CourseScreen(this.course, pagePath, "");
                        },
                    });
                } else {
                    // Container page with subpages
                    for (let subpagePath in page.pages) {
                        newRoutes.unshift({
                            id: routeId,
                            path: `^${this.course.courseUrl}${pagePath}${subpagePath}$`,
                            handler: async () => {
                                let module = await this.importModule();
                                return new module.CourseScreen(this.course, pagePath, subpagePath);
                            },
                        });
                    }
                }
            }
        }

        newRoutes.unshift({
            id: routeId,
            path: `^${this.course.courseUrl}.*`,
            handler: this.plugins["404Screen"].handler,
        });

        newRoutes.forEach(route => this.router.routes.splice(index, 0, route));
    }

    /**
     * This replaces the specific routes of the current course with the
     * generic catch-all route again. Will be called when the user navigates
     * away from the course in order to clean up memory.
     */
    removeCourseRoutes() {
        let routeId = this.getCourseRouteId(this.course.courseId);
        let index = this.router.routes.findIndex(r => r.id === routeId);
        this.router.removeRoute(routeId);

        if (index < 0) index = this.router.routes.length;
        this.router.routes.splice(index, 0, this.getCourseCatchAllRoute(this.course.courseId));
    }
}

/**
 * SPA router screen which rewrites the routing rules according to the course
 * content. Afterwards the requested path is rerequested in order to show its
 * real content.
 */
class RedirectCourseScreen {
    constructor(plugin) {
        this.plugin = plugin;
    }

    onShow(oldPath, newPath) {
        this.plugin.insertCourseRoutes();
        return newPath;
    }
}

/**
 * Container object which contains the cleaned course definition of the
 * currently visible course. There is always an instance of this class stored
 * inside Plugins["CourseScreen"].course, even when no course is currently
 * loaded.
 *
 * The object contains the following properties:
 *
 *   * courseId: The course ID
 *   * manifest: The cleaned course definition from the course.json file
 *   * contentUrl: Root URL where page content must be loaded from
 *   * courseUrl: The final URL of the course itself (root URL for all pages)
 *   *
 */
class CourseData {
    constructor() {
        this.courseId = "";
        this.manifest = undefined;
        this.contentUrl = "";
        this.courseUrl = "";
    }
}

export default CourseScreenPlugin;
