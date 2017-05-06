"use strict";

// Imports
import ko from "knockout";
import Router from "ko-component-router";

/**
 * The single page router which will load Knockout components as the content
 * of the page.
 */
class RouterPlugin {
    /**
     * Initialize the single page router and start routing. This should be
     * the last plugin which gets initialized because otherwise pluginRuntimes
     * will not be complete and might be missing some page plugins.
     *
     * @param {Array} pluginInstances Runtime objects of all previously initialized plugins
     */
    constructor(pluginInstances) {
        // Loading flag used to display that the router is loading a new page
        const loading = ko.observable(true);

        Router.use((ctx) => {
            return {
                beforeRender() {
                    loading(true);
                },
                afterRender() {
                    loading(false);
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

        pluginInstances.forEach(plugin => {
            if (!plugin.defineUrlRoutes) return;
            plugin.defineUrlRoutes(routes);
        });

        Router.useRoutes(routes);

        // Start routing
        ko.applyBindings({loading});
    }
}

export default RouterPlugin;
