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
import plugins from "../../app.js";

const _ = plugins["I18n"].translate;

/**
 * ViewModel class for a course content page. This is actually the view model
 * behind most if not everything which can be seen inside a course. Because
 * in reality a course is just a thin container for content pages.
 *
 * To make things easier the same view model class is used for the template
 * pages as well as the page contents.
 */
class CoursePage {
    /**
     * This method registers a new ko-component with an anonymous name which
     * can be used by the SPA router to display the page content. The component
     * will unregister itself when it is disposed().
     *
     * @return {String} Name of the new anonymous ko-component
     */
    static createPageContentComponent() {
        let component = "course-page-content-" + Math.round(Math.random() * 65536);

        ko.components.register(component, {
            viewModel: CoursePage,
            template: plugins["CoursePage"].page.xhr.responseText,
        });

        return component;
    }

    /**
     * View model constructor.
     */
    constructor() {
        this.course = plugins["CoursePage"].course;
        this.page = plugins["CoursePage"].page;
    }

    /**
     * If this is an anonymous ko-component which is only there to display the
     * content of a course page, unregister it after the router navigates to
     * another page and the component thus gets disposed.
     */
    dispose() {
        if (this.unregisterComponent) {
            ko.components.unregister(this.unregisterComponent);
        }
    }
}

ko.components.register("course-page-single", {
    viewModel: CoursePage,
    template: require("./single.html"),
});

export default CoursePage;
