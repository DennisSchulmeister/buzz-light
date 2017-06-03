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
 * Base class for screen which are shown by the SPA router. A screen is just
 * an object which returns the name of a ko-component for each surface element
 * managed by the router. The router then displays the returned ko component
 * inside each surface.
 *
 * The screen contains an ko.observable called title. Use it to change the
 * visible page title when the screen is loaded.
 */
class Screen {
    /**
     * Default constructor which allows child-classes to define a mapping
     * of ko-components for each surface id. If a child-class uses this it
     * doesn't need to override getSurfaceContent().
     *
     * @param {Object} content Dictionary of surface ids mapped to content
     *     definitions. A content definition is an object with the following
     *     properties:
     *
     *       * componentName: Name of the ko-component which provides the content
     *       * surfaceClasses: List of CSS classes for the surface (parent) element
     *       * componentClasses: List of CSS classes for the component (content) element
     */
    constructor(content) {
        this.content = content;
        this.title = ko.observable();
    }

    /**
     * Called during navigation after onLeave() of the previous page has been
     * called but before this page is shown. This allows the page to register
     * the ko-components it needs or to redirect navigation to another path.
     *
     * @param  {String} oldPath Previously visible path
     * @param  {String} newPath New path to be shown
     * @return {String} Navigate to another path instead or undefined
     */
    onShow(oldPath, newPath) {
        return undefined;
    }

    /**
     * Called during navigation when the user tries to leave the current screen.
     * This allows the screen to unregister its ko-components or to prevent
     * navigation on unsaved changes and so on.
     *
     * @param  {String} oldPath Previously visible path
     * @param  {String} newPath New path to be shown
     * @return {Boolean} Navigation to new screen is allowed
     */
    onLeave(oldPath, newPath) {
        return true;
    }

    /**
     * Called at the end of the navigation in order to get the name of each
     * ko-component to be shown inside each surface. By default this uses the
     * mapping give to the constructor so that child-classes don't need to
     * override this method.
     *
     * @param  {String} id Surface id whose content is requested
     * @return {String} Name of the ko-component to be shown inside the surface
     */
    getSurfaceContent(id) {
        if (this.content) {
            return this.content[id];
        } else {
            return {
                componentName: "",
            };
        }
    }
}

export default Screen;
