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
import Screen from "../../router/screen.js";

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

import styles from "./500.less";

/**
 * Interface to the SPA router for the 500 screen
 */
class The500Screen extends Screen {
    /**
     * Map surface ids to ko components to show inside.
     */
    constructor() {
        super({
            "main-content": {
                componentName: "the-500-screen-main",
                surfaceClasses: ["fullscreen",],
                componentClasses: [styles.background,],
            },
        })
    }

    /**
     * Register needed ko components on during navigation to this screen.
     */
    async onShow(oldPath, newPath) {
        this.title(_("Internal error"));

        ko.components.register("the-500-screen-main", {
            template: require("./500.html"),
        });
    }

    /**
     * Unregister ko components on navigation to the next screen.
     */
    onLeave(oldPath, newPath) {
        ko.components.unregister("the-500-screen-main");
    }
}

export { The500Screen }
