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
 * Base-class for screen plugins. This simply defines the addRoutes() method
 * called by the RouterPlugin to query the page plugins for their SPA router
 * configuration.
 */
class ScreenPlugin {
    /**
     * Override this method to add your routes to the SPA router.
     * @param {Object} router The Senna.js App instance
     */
    addRoutes(router) {
    }

    /**
     * Override this method in order to import() the module which contains
     * your screen object. Only needed if this.lazeyRouteHandler() is used
     * as a route handler for the SPA router.
     *
     * @return {Promise} Loaded module content
     */
    importModule() {
    }

    /**
     * Returns a function to be called by the SPA router on navigation in order
     * to retrieve the Screen which should be displayed. The returned function
     * calls this.importModule() as a callback which in turn needs to simply
     * call import() in order to import the module which contains the screen.
     * After the import-Promise resolves the screen class with the given name
     * is returned to the router.
     *
     * @param  {String} screenName Name of the desired SPA Router Screen
     * @return {function} Function to be called by the router on navigation
     */
    lazyRouteHandler(screenName) {
        return () => {
            return this.importModule().then(module => {
                return module[screenName]
            });
        };
    }
}

export default ScreenPlugin;
