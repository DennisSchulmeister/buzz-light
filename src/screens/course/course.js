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

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

/**
 * ViewModel class for the course screen. This is the shared view model for
 * all course content pages which gives access to the course definition and
 * current page definition.
 */
class CourseScreenMain {
    /**
     * Constructor which sets up the ViewModel instance. The following
     * properties not observable will be created:
     *
     *   * course: Cleaned course definition
     *   * courseName: Display name of the course
     *
     *   * pagePath: URL fragment of the current page
     *   * subpagePath: URL fragment of the current subpage, if any
     *   * thePagePath: URL fragment of the current page or subpage
     *
     *   * page: Page definition of the current page (container)
     *   * subpage: Page definition of the current subpage, if any
     *   * thePage: Page definition of the current page or subpage
     *
     *   * pageName: Display name of the current page
     *   * subpageName: Display name of the current subpage, if any
     *   * thePageName: Display name of the current page or subpage
     */
    constructor(courseScreen) {
        // Course with display name
        this.course = courseScreen.course;
        this.courseName = this._getCourseName();

        // Path of the current page and subpage
        this.pagePath = courseScreen.pagePath;
        this.subpagePath = courseScreen.subpagePath;
        this.thePagePath = this.subpagePath ? this.subpagePath : this.pagePath;

        // Definition of the current page and subpage
        this.page = courseScreen.page;
        this.subpage = courseScreen.subpage;
        this.thePage = this.subpage ? this.subpage : this.page;

        // Display name of the current page and subpage
        this.pageName = this.page.name;
        this.subpageName = this.subpage ? this.subpage.name : undefined;
        this.thePageName = this.subpageName ? this.subpageName : this.pageName;

        // Set overall screen title
        if (this.thePageName) courseScreen.title(this.thePageName);
        else courseScreen.title(this.courseName);
    }

    _getCourseName() {
        let language = plugins["I18n"].language();

        if (language in this.course.manifest.language && "name" in this.course.manifest.language[language]) {
            return this.course.manifest.language[language].name;
        } else if ("" in this.course.manifest.language && "name" in this.course.manifest.language[""]) {
            return this.course.manifest.language[""].name;
        } else {
            return this.course.courseId;
        }
    }
}

export default CourseScreenMain;