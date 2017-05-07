"use strict";

import ko from "knockout";
import plugins from "../../app.js";

/**
 * ViewModel class for the course content page. This is actually the page
 * behind most if not everything which can be seen inside a course. Because
 * in reality a course is just a container for content pages.
 */
class CourseContentPage {
    constructor() {
        plugins["Router"].page_name("Course ...");
    }
}

ko.components.register("course-content-page", {
    viewModel: CourseContentPage,
    template: require("./course-content.html"),
});

export { CourseContentPage };
