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

// Imports
import ko from "knockout";
import Router from "ko-component-router";
import config from "../config.js";

/**
 * The single page router which will load Knockout components as the content
 * of the page.
 */
class RouterPlugin {
    /**
     * Constructor which initializes this.values to a dictionary with the
     * following observable bindings.
     *
     *   * loading:    A boolean which indicates, whether the router is
     *                 loading a new page
     *   * pageName:  Heading title of the currently visible page
     *   * title:      <head> <title> ... </title> </head> string
     *   * config:     The configration object from config.js
     *   * language:   The currently active language
     *   * languages:  A list of all available languages
     *   * _:          Translation function to be called in the HTML templates
     *   * mainClass:  CSS class to set for the <main> content
     */
    constructor() {
        this.name = "Router";

        this.loading = ko.observable(true);
        this.pageName = ko.observable("");
        this.title = ko.computed(() => {
            let title = config.title ? config.title : "";
            return this.pageName() ? title + ": " + this.pageName() : title
        });

        this.mainClass = ko.observable("");

        this.values = {
            "loading": this.loading,
            "pageName": this.pageName,
            "title": this.title,
            "config": config,
            "language": ko.observable(""),
            "languages": ko.observable({}),
            "_": undefined,
            "mainClass": this.mainClass,
        };
    }

    /**
     * Initialize the single page router and start routing. This should be
     * the last plugin which gets initialized because otherwise pluginRuntimes
     * will not be complete and might be missing some page plugins.
     *
     * @param {Array} plugins Runtime objects of all plugins
     */
    initialize(plugins) {
        // Auto-update loading flag when the router is loading a new page
        Router.use((ctx) => {
            let self = this;

            return {
                beforeRender() {
                    self.loading(true);
                    self.mainClass("");
                },
                afterRender() {
                    self.loading(false);
                },
            };
        });

        // Base configuration
        Router.setConfig({
            base: "",
            hashbang: config.hashbangUrls,
            activePathCSSClass: "active-path",
        });

        // URL routing from page plugins
        let routes = {};

        for (let name in plugins) {
            let plugin = plugins[name];
            if (!plugin.defineUrlRoutes) continue;
            plugin.defineUrlRoutes(routes, plugins);
        }

        Router.useRoutes(routes);

        // Add current language to the binding context
        this.values.language = plugins["I18n"].language;
        this.values.languages(plugins["I18n"].languages);
        this.values._ = plugins["I18n"].translate;

        // Start routing
        ko.applyBindings(this.values, document.getElementsByTagName("html")[0]);
    }

    /**
     * Getter for the underlying ko-component-router.
     * @return {Object} The ko-component-router
     */
    get ko_router() {
        return Router.head;
    }
}

export default RouterPlugin;
