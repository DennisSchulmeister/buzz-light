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
import ko from "knockout";
import Router from "ko-component-router";

import config from "../../config.js";
import PagePlugin from "./base.js";

let pageTypes = {
    single: "course-page-single",
}

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

        // Filled when a course is loaded
        this.course = {};
        this.clearCourse();

        // Filled when a page is loaded
        this.page = {};
        this.clearPage();
    }

    /**
     * Store reference to plugin registry inside this, because otherwise it
     * could be hard to access it from deep within the router callbacks.
     * @param  {Object} plugins Plugin instances
     */
    initialize(plugins) {
        this.plugins = plugins;
    }

    /**
     * Reset the current course obejct.
     */
    clearCourse() {
        this.course.id = "";
        this.course.manifest = undefined;
        this.course.page = "";
        this.course.baseUrl = "";
    }

    /**
     * Reset the current page object.
     */
    clearPage() {
        this.page.path = "";
        this.page.language = "";
        this.page.page = undefined;
        this.page.subPage = undefined;
        this.page.xhr = undefined;
    }

    /**
     * Get the display name of the current course.
     *
     * @param {String} courseId Course ID of the current course
     * @param {Object} manifest Course definition from course.json
     * @return {String} Display name in the current language
     */
    getCourseName(courseId, manifest) {
        let language = this.plugins["I18n"].language();

        if (language in manifest.language && "name" in manifest.language[language]) {
            return manifest.language[language].name;
        } else if ("" in manifest.language && "name" in manifest.language[""]) {
            return manifest.language[""].name;
        } else {
            return courseId;
        }
    }

    /**
     * Append URL routes for the SPA router. Each course gets its own path
     * below /course, e,g, /course/example. Of course each course may contain
     * its own files and sub-directories which will be added to the path.
     *
     * Since the static files of each course are in the static/courses directory
     * there is no name colission between real file URLs and virtual SPA urls.
     *
     * @param {Object} routes At this point already existing routes
     * @param {Array} plugins Runtime objects of all plugins
     */
    defineUrlRoutes(routes) {
        let courseRoutes = {};

        config.courses.forEach((courseId) => {
            courseRoutes[`/${courseId}`] = [
                // Root router: Page template
                this.importHook.bind(this),
                this.loadCourse(courseId),
                this.loadPage(courseId),
                // WTF: Between these two lines a nested router is introduced !?!?
                this.renderPageTemplate.bind(this),
                {
                    // Nested router: Page content
                    "/*": [
                        this.renderPageContent.bind(this),
                    ],
                },
            ];
        })

        courseRoutes["/*"] = this.plugins["404Page"].route,

        Object.assign(routes, {
            "/course": courseRoutes,
        });
    }

    /**
     * Leverage webpack's import() handling to create a new bundle which
     * will be lazy-loaded on runtime.
     */
    importHook() {
        return import("./course/");
    }

    /**
     * Called in defineUrlRoutes() above. This returns a URL configuration bit
     * which causes the SPA router to first load the course manifest before
     * the course-content page can be loaded.
     *
     * If the course can be found it is stored in this.course. Otherwise the
     * content of the 404 page is shown which shortcuts the routing.
     *
     * @param {Array} plugins Runtime objects of all plugins
     * @param {String} courseId Course name (directory in static/courses)
     * @return {Function} Middleware function which loads the course
     */
    loadCourse(courseId) {
        return (ctx) => {
            if (courseId == this.course.id) {
                // Still in the same course
                return;
            };

            this.clearCourse();
            this.clearPage();

            let baseUrl = `${config.courseUrlPrefix}/${courseId}`;

            return $.get({
                url: `${baseUrl}/course.json`,
                dataType: "json"
            }).done((data) => {
                // Store manifest data as an attribute to the plugin object
                // so that the page's view model can pick it up there
                this.course.id = courseId;
                this.course.manifest = this.cleanManifest(courseId, data);
                this.course.page = "";
                this.course.baseUrl = baseUrl;
            }).fail((xhr, textStatus, error) => {
                // Failed to load the course.json manifest
                let _ = this.plugins["I18n"].translate;
                let msg = _("The course definition could not be loaded. (Technical error: ${error})").replace("${error}", error);
                this.plugins["Toast"].error(msg);
                this.plugins["404Page"].show(ctx);
            });
        };
    }

    /**
     * Return a cleaned version of the course manifest which irons out different
     * possible ways to express the page content. Beware that the returned object
     * is the same object is was passed in!
     *
     * @param {String} courseId Course ID from URL
     * @param {Object} manifest Raw manifest data
     * @return {Object} Cleaned manifest data
     */
    cleanManifest(courseId, manifest) {
        function _clean(url, page) {
            if (typeof(page) === "string") {
                page = {
                    file: page,
                };
            }

            if (!page.file) page.file = "";
            if (!page.pages) page.pages = {};
            if (!page.type) page.type = "single";

            if (!page.name) {
                if (url == "/") page.name = this.getCourseName(courseId, manifest);
                else page.name = page.file;
            }

            // Recursively traverse sub-pages
            if ("pages" in page) {
                for (let path in page.pages) {
                    page.pages[url + path] = _clean(path, page.pages[path]);
                }
            }

            return page;
        }

        _clean = _clean.bind(this);

        if ("language" in manifest) {
            for (let language in manifest.language) {
                if ("pages" in manifest.language[language]) {
                    for (let url in manifest.language[language].pages) {
                        manifest.language[language].pages[url] = _clean(url, manifest.language[language].pages[url]);
                    }
                }
            }
        }

        return manifest;
    }

    /**
     * Called in defineUrlRoutes() above. This returns a URL configuration bit
     * which causes the SPA router to load the requested course page.
     *
     * If the page can be found it is stored in this.course.page. Otherwise the
     * content of the 404 page is shown which shortcuts the routing.
     *
     * @param {Array} plugins Runtime objects of all plugins
     * @param {String} courseId Course name (directory in static/courses)
     * @return {Function} Middleware function which loads the page
     */
    loadPage(courseId) {
        return (ctx) => {
            this.course.page = ctx.path.slice(this.course.id.length + 1);
            if (!this.course.page) this.course.page = "/";

            if (this.course.page.length > 1 && this.course.page.slice(-1) == "/") {
                this.course.page = this.course.page.slice(0, -1);
            }

            let language = this.plugins["I18n"].language();

            if (courseId == this.course.id
                  && this.course.page == this.page.path
                  && language == this.page.language) {
                // Still the same page in the same language
                return;
            };

            // Find the page to load for the current language. Usually this simply
            // means to look up the URL path in the course manifest. However it could
            // also be a sub-page where we actually need to find the parent page, first.
            this.clearPage();

            let parentUrl = this.course.page.split("/");
            let subUrl = parentUrl.pop();
            parentUrl = parentUrl.join("/");

            if (language in this.course.manifest.language
                  && "pages" in this.course.manifest.language[language]
                  && this.course.page in this.course.manifest.language[language].pages) {
                // Direct page in current language
                this.page.language = language;
                this.page.page = this.course.manifest.language[language].pages[this.course.page];
            } else if ("" in this.course.manifest.language
                         && "pages" in this.course.manifest.language[""]
                         && this.course.page in this.course.manifest.language[""].pages) {
                // Direct page in fallback language
                this.page.language = "";
                this.page.page = this.course.manifest.language[""].pages[this.course.page];
            } else if (language in this.course.manifest.language
                         && "pages" in this.course.manifest.language[language]
                         && parentUrl in this.course.manifest.language[language].pages
                         && typeof(this.course.manifest.language[language].pages[parentUrl]) === "object"
                         && "pages" in this.course.manifest.language[language].pages[parentUrl]
                         && subUrl in this.course.manifest.language[language].pages[parentUrl].pages) {
                // Sub-page in current language
                this.page.language = language;
                this.page.page = this.course.manifest.language[language].pages[parentUrl];
                this.page.subPage = this.course.manifest.language[language].pages[parentUrl].pages[subUrl];
            } else if ("" in this.course.manifest.language
                         && "pages" in this.course.manifest.language[""]
                         && parentUrl in this.course.manifest.language[""].pages
                         && typeof(this.course.manifest.language[""].pages[parentUrl]) === "object"
                         && "pages" in this.course.manifest.language[""].pages[parentUrl]
                         && subUrl in this.course.manifest.language[""].pages[parentUrl].pages) {
                // Sub-page in fallback language
                this.page.language = "";
                this.page.page = this.course.manifest.language[""].pages[parentUrl];
                this.page.subPage = this.course.manifest.language[""].pages[parentUrl].pages[subUrl];
            }

            if (!this.page.page) {
                this.plugins["404Page"].show(ctx);
                return;
            }

            this.page.path = this.course.page;

            // Load page content
            let contentUrl = this.course.baseUrl;

            if (this.page.subPage) {
                contentUrl += this.page.subPage.file;
            } else {
                contentUrl += this.page.page.file;
            }

            this.page.xhr = $.get({
                url: contentUrl
            }).fail((xhr, textStatus, error) => {
                // Failed to load the page content
                let _ = this.plugins["I18n"].translate;
                let msg = _("The page content could not be loaded. (Technical error: ${error})").replace("${error}", error);
                this.plugins["Toast"].error(msg);
                this.plugins["404Page"].show(ctx);
            });

            return this.page.xhr;
        };
    }

    /**
     * Called from the parent router in order to load the right page template
     * accoring to the page type as defined in the manifest file.
     */
    renderPageTemplate(ctx) {
        // WTF: Why is ctx.router not the root router here !?!?!?!
        if (!this.page.page) return;

        if (this.page.page.type in pageTypes) {
            // Display page name
            this.plugins["Router"].pageName(this.page.page.name);

            // Display page template
            let component = pageTypes[this.page.page.type];
            ctx.router.$root.component(component);
        } else {
            let _ = this.plugins["I18n"].translate;
            let msg = _("Error in the course definition. Unknown page type: ${pageType}").replace("${pageType}", this.page.page.type);
            this.plugins["Toast"].error(msg);
            this.plugins["404Page"].show(ctx.router.$root.ctx);
        }
    }

    /**
     * Called from the nested router in order to load the page content. Here
     * an anonymous ko component is registered to be included by the router.
     */
    renderPageContent(ctx) {
        // WTF: Why is there another nested router ?!?!??!?
        if (!this.page.page) return;

        let router = Router.get(ctx.router.depth - 1);

        this.importHook().then((pageModule) => {
            let component = pageModule.CoursePage.createPageContentComponent();
            router.component(component);
        })
    }
}

export default CoursePagePlugin;
