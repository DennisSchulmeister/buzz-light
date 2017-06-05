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
import The404ScreenMain from "./404.js";

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

/**
 * Interface to the SPA router for the 404 screen
 */
class The404Screen extends Screen {
    /**
     * Map surface ids to ko components to show inside.
     */
    constructor() {
        super({
            "main-content": {
                componentName: "the-404-screen-main",
                surfaceClasses: ["fullscreen",],
            },
        })
    }

    /**
     * Register needed ko components on during navigation to this screen.
     */
    async onShow(oldPath, newPath) {
        this.title(_("Page not found"));

        ko.components.register("the-404-screen-main", {
            viewModel: The404ScreenMain,
            template: require("./404.html"),
        });
    }

    /**
     * Unregister ko components on navigation to the next screen.
     */
    onLeave(oldPath, newPath) {
        ko.components.unregister("the-404-screen-main");
    }
}

export { The404Screen }
