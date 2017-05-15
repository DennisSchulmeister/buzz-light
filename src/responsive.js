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

/**
 * This plugin allows to query the screen size category as defined by
 * spectre.css. This means with this plugin it is possible to ask whether the
 * screen is e.g. medium ("md") or large ("lg") without needing to know the
 * exact resolution numbers.
 */
class ResponsivePlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        this.name = "Responsive";
    }

    /**
     * Insert hidden <div> elements into the <body> whose visibility can be
     * queried in order to find out the screen type.
     */
    initialize() {
        this.sizes = ["xs", "sm", "md", "lg", "xl"];
        let parent = document.createElement("div");

        this.sizes.forEach((size) => {
            parent.innerHTML += `<div id="__responsive__${size}" class="hide-${size}"></div>`
        });

        parent.style.position = "absolute";
        parent.style.top = -10;
        parent.style.left = -10;
        parent.style.display = "inline-block";

        document.querySelector("body").appendChild(parent);
    }

    /**
     * Get the screen size category, e.g. "sm" or "lg".
     * @return {String} spectre.css size category of the screen
     */
    get screenSize() {
        let screenSize = this.sizes[0];

        this.sizes.forEach((size) => {
            let div = document.getElementById(`__responsive__${size}`);
            console.log(size, "--", String(div.style.display).toLowerCase());
            if (String(div.style.display).toLowerCase() != "none") return;
            screenSize = size;
        });

        return screenSize;
    }

    /**
     * Checks whether the screen is at least of the given size category.
     * @param  {String}  size spectre.css size category, e.g. "xl"
     * @return {Boolean}      Whether the screen is at least as large
     */
    screenIsAtLeast(size) {
        let div = document.getElementById(`__responsive__${size}`);
        return String(div.style.display).toLowerCase() == "none";
    }
}

export default ResponsivePlugin;
