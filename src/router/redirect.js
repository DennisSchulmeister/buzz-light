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

import Screen from "./screen.js";

/**
 * SPA router screen which redirects to another path.
 */
class RedirectScreen extends Screen {
    /**
     * The constructor, yes.
     * @param {String} path Redirection target
     */
    constructor(path) {
        super();
        this.path = path;
    }

    /**
     * Redirects to the given path when called by the router.
     * @return {String} The new path
     */
    onShow() {
        return this.path;
    }
}

export default RedirectScreen;
