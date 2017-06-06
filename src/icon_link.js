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
 * A simple <buzz-icon-button> element which can be used to insert clickable
 * icons in the navigation header which redirect to another page or external
 * URL. The following parameters exist:
 *
 *   * icon: Name of the icon
 *   * href: Link destination
 *   * target: Link target (e.g. "_blank" for new tab page or window)
 *   * tooltip: Tooltip text
 *
 * For example:
 *
 *   <buzz-icon-link params="icon: 'home', path:'/'"></buzz-icon-link>
 */
class IconLinkPlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        this.name = "IconLink";
    }

    /**
     * Plugin initialization.
     * @param {Array} plugins Runtime objects of all plugins
     */
    initialize(plugins) {
        let _ = plugins["I18n"].translate;
        let plugin = this;

        ko.components.register("buzz-icon-link", {
            viewModel: class IconLinkViewModel {
                constructor(params) {
                    if (!params.icon) params.icon = "tux";
                    if (!params.href) params.href = "";
                    if (!params.target) params.target = "";
                    if (!params.tooltip) params.tooltip = "";
                    if (!params.class) params.class = "";

                    this.icon = params.icon;
                    this.href = params.href;
                    this.target = params.target;
                    this.tooltip = params.tooltip;
                    this.classes = "btn btn-link";

                    if (params.tooltip) {
                        this.classes = `${this.classes} tooltip`;
                    }

                    if (params.class) {
                        this.classes = `${this.classes} ${params.class}`;
                    }
                }
            },
            template: require("./templates/icon-link.html"),
        });
    }
}

export default IconLinkPlugin;
