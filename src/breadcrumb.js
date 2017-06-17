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

/**
 * A simple <buzz-breadcrumb> element which renders a breadcrumb line for the
 * SPA router. The element takes one parameter with the breadcrumb entries:
 *
 *   <buzz-breadcrumb params="items: breadcrumb"></buzz-breadcrumb>
 *
 * The items parameter must be an array like this:
 *
 *   [{
 *       path: "/",
 *       title: "Home"
 *     },{
 *       path: "/help/",
 *       title: "Help",
 *     }, {
 *        path: "/help/breadcrumbs",
 *        title, "Breadcrumbs 1&1",
 *     }]
 *
 * This will be rendered similar to this, with each entry being a link:
 *
 *   Home / Help / Breadcrumbs 1&1
 *
 * The title can also be a ko-observable in order to return the title according
 * to the current language.
 */
class BreadcrumbPlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        this.name = "Breadcrumb";
    }

    /**
     * Plugin initialization.
     * @param {Array} plugins Runtime objects of all plugins
     */
    initialize(plugins) {
        ko.components.register("buzz-breadcrumb", {
            viewModel: class IconLinkViewModel {
                constructor(params) {
                    this.items = params.items || ko.observableArray();
                }
            },
            template: require("./templates/breadcrumb.html"),
        });
    }
}

export default BreadcrumbPlugin;
