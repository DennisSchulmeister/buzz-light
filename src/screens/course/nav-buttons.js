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

import ko from "knockout";

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

/**
 * Ko-component with the course specific HTML tag <subpage-nav-buttons>. If the
 * current page is a subpage this tag renders "Previous" and "Next" buttons to
 * move between the subpages.
 */
class SubpageNavButtons {
    /**
     * Register ko-component for this custom HTML tag.
     * @param {Object} courseModel CourseScreenMain instance
     */
    static register(courseModel) {
        this.courseModel = courseModel;

        ko.components.register("subpage-nav-buttons", {
            viewModel: SubpageNavButtons,
            template: require("./nav-buttons.html"),
        });
    }

    /**
     * Unregister ko-component for this custom HTML tag.
     */
    static unregister() {
        ko.components.unregister("subpage-nav-buttons");
    }

    /**
     * Constructor called by knockout.js when the HTML tag is used.
     * @param {Array} params Parameters from the params-binding
     */
    constructor(params) {
        let courseModel = SubpageNavButtons.courseModel;

        this.prevLabel = ko.computed(() => {
            let label = _("Previous");
            return params.prevLabel ? params.prevLabel : label;
        });

        this.nextLabel = ko.computed(() => {
            let label = _("Next");
            return params.nextLabel ? params.nextLabel : label;
        });

        this.prevHref = "";
        this.nextHref = "";

        if (courseModel.subpage) {
            let index = courseModel.subpages.findIndex(e => e.pos == courseModel.subpage.pos);
            let prevSubpage = courseModel.subpages[index - 1];
            let nextSubpage = courseModel.subpages[index + 1];

            if (prevSubpage) this.prevHref = `#${prevSubpage.fullPath}`;
            if (nextSubpage) this.nextHref = `#${nextSubpage.fullPath}`;
        }
    }
}

export default SubpageNavButtons;
