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
     *   * loading: A boolean which indicates, whether the router is loading
     *              a new page
     *   * page_name: Heading title of the currently visible page
     *   * title: <head> <title> ... </title> </head> string
     */
    constructor() {
        this.name = "Router";

        this.loading = ko.observable(true);
        this.page_name = ko.observable("");
        this.title = ko.computed(() => {
            let title = config.title ? config.title : "";
            return this.page_name() ? title + ": " + this.page_name() : title
        });

        this.values = {
            "loading": this.loading,
            "page_name": this.page_name,
            "title": this.title,
        };
    }

    /**
     * Initialize the single page router and start routing. This should be
     * the last plugin which gets initialized because otherwise pluginRuntimes
     * will not be complete and might be missing some page plugins.
     *
     * @param {Array} pluginInstances Runtime objects of all previously initialized plugins
     */
    initialize(plugins) {
        // Auto-update loading flag when the router is loading a new page
        Router.use((ctx) => {
            let self = this;

            return {
                beforeRender() {
                    self.loading(true);
                },
                afterRender() {
                    self.loading(false);
                },
            };
        });

        // Base configuration
        Router.setConfig({
            base: "",
            hashbang: false,
            activePathCSSClass: "active-path",
        });

        // URL routing from page plugins
        let routes = {};

        for (let name in plugins) {
            let plugin = plugins[name];
            if (!plugin.defineUrlRoutes) continue;
            plugin.defineUrlRoutes(routes);
        }

        Router.useRoutes(routes);

        // Start routing
        ko.applyBindings(this.values, document.getElementsByTagName("html")[0]);
    }
}

export default RouterPlugin;
