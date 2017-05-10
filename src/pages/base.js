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
 * Base-class for page plugins. This just extracts a bit of common code
 * around webpack's import() handling for lazy-loading the Knockout
 * components used by the SPA router.
 */
class PagePlugin {
    /**
     * Override this method to add your routes to the SPA router.
     * @param {Object} routes Route list for ko-component-router
     * @param {Array} plugins Runtime objects of all plugins
     */
    defineUrlRoutes(routes, plugins) {
    }

    /**
     * Returns an Array which causes the SPA router to first lazyLoad the
     * webpack bundle which contains the Knockout component to be shwon.
     *
     *     defineUrlRoutes(routes) {
     *         Object.assign(routes, {
     *             "/": this.lazyLoad("home-page"),
     *         });
     *     }
     *
     * @param  {String} componentName Name of the desired Knockout component
     * @return {function} Function to be called by the router on navigation
     */
    lazyLoad(componentName) {
        return [this.importHook, componentName];
    }
}

export default PagePlugin;
