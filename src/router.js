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
import Router from "./router/router.js";
import config from "../config.js";

/**
 * Plugin to manage the singleton SPA router instance. This plugin queries the
 * other plugins to add routes to the SPA router. The screen plugins in turn
 * add their routes which asynchronously load the screens with their respective
 * ko-components.
 *
 * Also this plugin adds a few global context values which are available inside
 * the screens' ko-components, like the page name, the translation object and
 * so on.
 */
class RouterPlugin {
    /**
     * Constructor which initializes this.values to a dictionary with the
     * following observable bindings.
     *
     *   * screenTitle: Heading title of the currently visible page
     *   * title: <head> <title> ... </title> </head> string
     *   * config: The configration object from config.js
     *   * language: The currently active language
     *   * languages: A list of all available languages
     *   * _: Translation function to be called in the HTML templates
     *   * mainClass: CSS class to set for the <main> content
     *   * loading: Flag, whether the router is loading a screen (read-only)
     *   * currentPath: Currently visible path (read-only)
     */
    constructor() {
        this.name = "Router";
        this._router = null;

        this.values = {
            "screenTitle": ko.observable(""),
            "title": this.title,
            "config": config,
            "language": ko.observable(""),
            "languages": ko.observable({}),
            "_": undefined,
            "loading": ko.observable(false),
            "currentPath": ko.observable(""),
        };

        this.title = ko.computed(() => {
            let title = config.title ? config.title : "";
            return this.values.screenTitle() ? title + ": " + this.values.screenTitle() : title
        });
    }

    /**
     * Initialize the single page router and start routing. This should be
     * the last plugin which gets initialized because otherwise some page
     * plugins might not be fully initialized, yet.
     *
     * @param {Array} plugins Runtime objects of all plugins
     */
    initialize(plugins) {
        // Add current language to the binding context
        this.values.language = plugins["I18n"].language;
        this.values.languages(plugins["I18n"].languages);
        this.values._ = plugins["I18n"].translate;

        // Configure router and query plugins for routes
        this._router = new Router({
            basePath: config.basePath || "",
            hashBang: config.hashBang || false,
            bindingContext: this.values,
        });

        this._router.loading.subscribe(v => this.values.loading(v));
        this._router.currentPath.subscribe(v => this.values.currentPath(v));
        this._router.currentTitle.subscribe(v => this.values.screenTitle(v));

        this._router.addSurface("main-content");

        for (let name in plugins) {
            let plugin = plugins[name];
            if (!plugin.addRoutes) continue;
            plugin.addRoutes(this._router);
        }

        // Start routing
        this._router.activate();
        ko.applyBindings(this.values, document.getElementsByTagName("html")[0]);
    }

    /**
     * Return the SPA router instance.
     * @return {Object} The senna.js App object
     */
    get router() {
        return this._router;
    }
}

export default RouterPlugin;
