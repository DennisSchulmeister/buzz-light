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

        // Filled when a course is loaded
        this.course = {
            id: "",
            manifest: {},
            page: "",
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
    defineUrlRoutes(routes, plugins) {
        let course_routes = {};

        config.courses.forEach((course) => {
            let urlConfig = [
                this.loadCourse(plugins, course),
                this.lazyLoad("course-content-page"),
            ];

            course_routes[`/${course}`] = {
                "": urlConfig,
                "/*": urlConfig
            };
        })

        course_routes["/*"] = plugins["404Page"].route,

        Object.assign(routes, {
            "/course": course_routes,
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
     * the course-content page is shown.
     *
     * If the course manifest can be found it is stored in ctx.courseData.
     * Otherwise the content of the 404 page is shown which shortcuts the
     * routing and replaces the course content page.
     *
     * @param {Array} plugins Runtime objects of all plugins
     * @param  {String} courseId Course name (directory in static/courses)
     * @return {Array} Array with URL configuration for the SPA router
     */
    loadCourse(plugins, courseId) {
        return [(ctx) => {
            if (courseId == this.course.id) {
                // Still in the same course. Just set the path and leave.
                this.course.page = ctx.path;
                return;
            };

            return $.get({
                url: `${config.courseUrlPrefix}/${courseId}/course.json`,
                dataType: "json"
            }).done((data) => {
                // Store manifest data as an attribute to the plugin object
                // so that the page's view model can pick it up there
                this.course.id = courseId;
                this.course.manifest = data;
                this.course.page = ctx.path;
            }).fail((xhr, textStatus, error) => {
                // Failed to load the course.json manifest
                this.course.id = "";
                this.course.manifest = undefined;
                this.course.page = "";

                let _ = plugins["I18n"].translate;
                let msg = _("The course definition could not be loaded. (Technical error: ${error})").replace("${error}", error);

                plugins["Toast"].error(msg);
                plugins["404Page"].show(ctx);
            });
        }]
    }
}

export default CoursePagePlugin;
