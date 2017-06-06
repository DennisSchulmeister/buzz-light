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

import styles from "./course.less";

import $ from "jquery";
import ko from "knockout";
import Screen from "../../router/screen.js";
import CourseScreenMain from "./course.js";

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

let pageTypes = {
    plain: {
        subpages: false,
        template: null,
    },
    fullscreen: {
        subpages: false,
        template: null,
        surfaceClasses: ["fullscreen",],
    },
    "grid-large": {
        subpages: false,
        template: null,
        surfaceClasses: ["container", "grid-1280",],
    },
    "grid-medium": {
        subpages: false,
        template: null,
        surfaceClasses: ["container", "grid-960",],
    },
    "grid-small": {
        subpages: false,
        template: null,
        surfaceClasses: ["container", "grid-480",],
    },
    "tabs-large": {
        subpages: true,
        template: require("./tabs.html"),
        surfaceClasses: ["container", "grid-1280",],
    },
    "tabs-medium": {
        subpages: true,
        template: require("./tabs.html"),
        surfaceClasses: ["container", "grid-960",],
    },
    "tabs-small": {
        subpages: true,
        template: require("./tabs.html"),
        surfaceClasses: ["container", "grid-480",],
    },
    /*
    "impress.js": {
        subpages: false,
        template: require("./impressjs.html"),
        surfaceClasses: "fullscreen",
    },
    */
}

/**
 * Interface to the SPA router for the course screen. When this is called the
 * SPA router already contains one route per course page with each route holding
 * its own instance of this class.
 */
class CourseScreen extends Screen {
    /**
     * Store parameters which are needed in order to display the screen
     * with the given page content.
     *
     * @param {Object} course Cleaned course definition
     * @param {String} pagePath Path of a page inside the course
     * @param {String} subpagePath Path of a subpage if this is a subpage
     */
    constructor(course, pagePath, subpagePath) {
        super();

        this.course = course;
        this.pagePath = pagePath;
        this.subpagePath = subpagePath;

        this.page;
        this.subpage;
        this.pageType;

        this.the500screen = null;
    }

    /**
     * Register needed ko components on during navigation to this screen.
     */
    async onShow(oldPath, newPath) {
        // Find best matching page definition for the current language
        let definition = this.course.getPageDefinition(this.pagePath, this.subpagePath);
        let errorMessage = definition.errorMessage;

        this.page = definition.page;
        this.subpage = definition.subpage;

        // Check correctness of the page definition
        if (!errorMessage) {
            this.pageType = pageTypes[this.page.type];

            if (!this.pageType) {
                errorMessage = _("Unknown page type: ${pageType}").replace("${pageType}", this.page.type);
            } else if (this.pageType.subpages && !this.subpage) {
                errorMessage = _("No subpage defined for page type ${pageType}.").replace("${pageType}", this.page.type);
            } else if (!this.pageType.subpages && this.subpage) {
                errorMessage = _("Page type ${pageType} does not support subpages.").replace("${pageType}", this.page.type);
            }
        }

        if (errorMessage) {
            errorMessage = _("Error in the course definition.") + ` ${errorMessage}`;
            plugins["Toast"].error(errorMessage);

            this.the500screen = await plugins["500Screen"].getScreen();
            return this.the500screen.onShow(oldPath, newPath);
        }

        // Register ko-components according to page type
        let viewModel = new CourseScreenMain(this);

        try {
            if (this.pageType.template) {
                ko.components.register("course-screen-template", {
                    viewModel: { instance: viewModel },
                    template: this.pageType.template,
                });
            }

            if (this.pageType.subpages) {
                ko.components.register("course-screen-content", {
                    viewModel: { instance: viewModel },
                    template: await $.get({
                        url: `${this.course.contentUrl}${this.subpage.file}`,
                        dataType: "html",
                    }),
                });
            } else {
                ko.components.register("course-screen-content", {
                    viewModel: { instance: viewModel },
                    template: await $.get({
                        url: `${this.course.contentUrl}${this.page.file}`,
                        dataType: "html",
                    }),
                });
            }
        } catch (error) {
            let errorText = error.toString();
            if (error.statusText) errorText = error.statusText;

            errorMessage = _("The page content could not be loaded. (Technical error: ${error})").replace("${error}", errorText);
            plugins["Toast"].error(errorMessage);

            this.the500screen = await plugins["500Screen"].getScreen();
            return this.the500screen.onShow(oldPath, newPath);
        }
    }

    /**
     * Unregister ko components on navigation to the next screen and reset
     * router rules when the user navigates away from the current course.
     */
    onLeave(oldPath, newPath) {
        if (!newPath.startsWith(plugins["CourseScreen"].getCourseUrl(this.course.courseId))) {
            plugins["CourseScreen"].removeCourseRoutes(this.course.courseId);
        }

        if (this.pageType.template) {
            ko.components.unregister("course-screen-template");
        }

        ko.components.unregister("course-screen-content");

        if (this.the500screen) {
            this.the500screen.onLeave(oldPath, newPath);
        }
    }

    /**
     * Return the ko-component names which render the page content.
     *
     * @param  {String} id Surface id whose content is requested
     * @return {String} Name of the ko-component to be shown inside the surface
     */
    async getSurfaceContent(id) {
        if (this.the500screen) {
            return this.the500screen.getSurfaceContent(id);
        } else {
            let componentName = "";

            if (id === "main-content") {
                componentName = this.pageType.template ? "course-screen-template" : "course-screen-content";
            }

            return {
                componentName: componentName,
                surfaceClasses: this.pageType.surfaceClasses || "",
                componentClasses: this.pageType.componentClasses || "",
            }
        }
    }
}

export { CourseScreen }
