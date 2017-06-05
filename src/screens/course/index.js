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
import Screen from "../../router/screen.js";
import CourseScreenMain from "./course.js";

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

let pageTypes = {
    single: {
        subpages: false,
        template: null,
    },
    tabs: {
        subpages: true,
        template: require("./tabs.html"),
    },
    /*
    "impress.js": {
        subpages: true,
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
    }

    /**
     * Register needed ko components on during navigation to this screen.
     */
    async onShow(oldPath, newPath) {
        // Find best matching page definition for the current language
        let errorMessage = undefined;
        let language = plugins["I18n"].language();

        if (language in this.course.manifest.language
                && "pages" in this.course.manifest.language[language]
                && this.pagePath in this.course.manifest.language[language].pages) {
            this.page = this.course.manifest.language[language].pages[this.pagePath];
        } else if ("" in this.course.manifest.language
                && "pages" in this.course.manifest.language[""]
                && this.pagePath in this.course.manifest.language[""].pages) {
            this.page = this.course.manifest.language[""].pages[this.pagePath];
        } else {
            errorMessage = _("Page ${pagePath} is neither defined for language ${language} nor the fallback language.")
                           .replace("${pagePath}", this.pagePath)
                           .replace("${language}", language);
        }

        if (this.subpagePath && this.subpagePath.length > 0) {
            this.subpage = this.page.pages[this.subpagePath];

            if (!this.subpage) {
                errorMessage = _("Definition of sub page ${subpagePath} of page ${pagePath} is missing.")
                               .replace("${pagePath}", this.pagePath)
                               .replace("${subpagePath}", this.subpagePath);
            }
        }

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
            return;
        }

        // Register ko-components according to page type
        let viewModel = new CourseScreenMain(this);

        try {
            if (!this.pageType.template) {
                ko.components.register("course-screen-page", {
                    viewModel: { instance: viewModel },
                    template: await $.get({
                        url: `${this.course.contentUrl}${this.page.file}`,
                        dataType: "html",
                    }),
                });
            } else {
                ko.components.register("course-screen-page", {
                    viewModel: { instance: viewModel },
                    template: this.pageType.template,
                });
            }

            if (this.pageType.subpages) {
                ko.components.register("course-screen-subpage", {
                    viewModel: { instance: viewModel },
                    template: await $.get({
                        url: `${this.course.contentUrl}${this.subpage.file}`,
                        dataType: "html",
                    }),
                });
            }
        } catch (error) {
            let errorText = error.toString();
            if (error.statusText) errorText = error.statusText;

            errorMessage = _("The page content could not be loaded. (Technical error: ${error})").replace("${error}", errorText);
            plugins["Toast"].error(errorMessage);
            return;
        }
    }

    /**
     * Unregister ko components on navigation to the next screen and reset
     * router rules when the user navigates away from the current course.
     */
    onLeave(oldPath, newPath) {
        if (!newPath.startsWith(plugins["CourseScreen"].getCourseUrl(this.course.courseId))) {
            plugins["CourseScreen"].removeCourseRoutes();
        }

        ko.components.unregister("course-screen-page");

        if (this.pageType.subpages) {
            ko.components.unregister("course-screen-subpage");
        }
    }

    /**
     * Return the ko-component names which render the page content.
     *
     * @param  {String} id Surface id whose content is requested
     * @return {String} Name of the ko-component to be shown inside the surface
     */
    async getSurfaceContent(id) {
        let componentName = "";
        if (id === "main-content") componentName = "course-screen-page";

        return {
            componentName: componentName,
            surfaceClasses: this.pageType.surfaceClasses || "",
            componentClasses: this.pageType.componentClasses || "",
        }
    }
}

export { CourseScreen }
