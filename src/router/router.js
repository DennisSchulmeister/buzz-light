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
 * A very simple single page app router which unlike the others that I have
 * tried (ko-component-router and Senna.js) doesn't try the be extra smart
 * and ain't shaken by so many nasty bugs. The main concept is nearly the
 * same as with Senna.js:
 *
 * The router manages a set of surfaces (DOM elements) whose contents need
 * to be swapped when the user navigates to another URL. Therefor the router
 * contains a list of regex routes agains which the current URL is matched.
 * If a match is found a Screen class/object will be found which is queried
 * for the content of each surface element.
 *
 * But unlike Senna.js this implementation allows to load Screens in background
 * (by returning a Promise object) whereas Senna.js wants the Screen class to be
 * defined upfront. In Senna.js the background loading is performed by the Screen
 * object. Here the background loading is performend when the Screen object is
 * loaded and optionally whereas the Screen methods must not be asynchronous.
 * Also this implementation guarantees strict ordering of the surface updates
 * because so a surface may contain another surface which is also managed by
 * the router. And it is possible to remove a surface from the router again.
 * Lastly the router expects to get the name of a ko-component to display
 * inside each surface instead of the final HTML string.
 *
 * Well and unlike ko-component-router this one actually works and doesn't have
 * all those nasty bugs which costed me several days to debug. So call it
 * Not-Invented-Here but this special app has special requirements which are
 * just not met by the other implementations.
 */
class Router {
    /**
     * Constructor of the SPA router. Takes the router configuration but not
     * its routes. config can be an object with the following entries:
     *
     *   * basePath: Prefix for all router paths to match the base path of the
     *         subdirectory where the page lives on the server
     *   * hashBang: If true, dont's use HTML5 history API but fallback to
     *         old hash-bang style routing (which nowadays mostly makes sense
     *         during development but not so much in production)
     *   * pushHistory: Whether to update the browser history upon navigation
     *         (Default: true)
     *   * loadingClass: CSS class name to set for the surfaces while the
     *         router is loading (default: loading)
     *   * bindingContext: Dictionary with ko bindings which will be available
     *         inside the templates which knockout uses to render the surface
     *         contents.
     *
     * @param  {Object} config Router configuration
     */
    constructor(config) {
        this.config = {
            basePath: config.basePath || "",
            hashBang: config.hashBang || false,
            pushHistory: config.pushHistory == undefined ? true : config.pushHistory,
            loadingClass: config.loadingClass || "loading",
            bindingContext: config.bindingContext || {},
        };

        this._surfaces = [];
        this._routes = [];
        this._currentScreen = null;
        this._surfaceClasses = {};

        this.loading = ko.observable(false);
        this.loading.subscribe(this._setLoadingClass.bind(this));

        this.currentPath = ko.observable("");
        this.currentTitle = ko.observable("");
        this.breadcrumb = ko.observableArray();
        this._titleSubscription = null;

        this.active = false;
        window.addEventListener("click", this._onLinkClicked.bind(this));
        window.addEventListener("popstate", this._onHistoryChanged.bind(this));
    }

    /**
     * Add a surface so that its content is managed by the router. The order
     * is important as the surfaces will always be updated in the order they
     * were registered. This allows to have a surface contain a surface itself.
     *
     * @param {String} id DOM ID of the now managed surface element
     */
    addSurface(id) {
        this._surfaces.push(id);
        this._surfaceClasses[id] = [];
        this._setLoadingClass(this.loading(), id);
    }

    /**
     * Remove a surface so that it is not updated by the router anymore.
     * @param {String} id DOM ID of the now unmanaged surface element
     */
    removeSurface(id) {
        this._surfaces = this._surfaces.filter(s => s != id);
        delete this._surfaceClasses[id];
        this._setLoadingClass(false, id);
    }

    /**
     * Get an ordered list of all managed surfaces. This list contains just the
     * DOM IDs of the surface elements.
     *
     * @return {List} DOM IDs of all surface IDs
     */
    get surfaces() {
        return this._surfaces;
    }

    set surfaces(surfaces) {
        this._surfaces = surfaces;
    }

    /**
     * Add another route to the router. This may happen anytime and will be
     * considered upon the next screen navigation. However ordering is important
     * because routes are always checked in the order they were added and the
     * first match wins.
     *
     * The route must be a simple object with the following entries:
     *
     *   * id (optional): ID of the route
     *   * path: Regex to match the current URL
     *   * handler: Handler function which returns one of the following:
     *         1. A Screen class
     *         2. A Screen instance
     *         3. A Promise for one of the above
     *   * breadcrumb: An array with breadcrumb entries (optional). Each entry
     *         must be an object with the following properties:
     *             * path: URL path where the breadcrumb entry leads to
     *             * title: Display title of the breadcrumb entry. This can
     *                   either be a string or ko-observable.
     *
     * Given an breadcurmb array like this:
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
     * The resulting breadcrumb will like similar to this, with each entry
     * being a clickable link:
     *
     *   Home / Help / Breadcrumbs 1&1
     *
     * @param {Object} route Navigational route
     */
    addRoute(route) {
        this._routes.push({
            id: route.id || undefined,
            path: route.path,
            handler: route.handler,
        });
    }

    /**
     * Remove the route with the given id so that the router won't use it anymore.
     * Of course this only works with the route has been given an ID at the time
     * it has been added.
     *
     * @param {[type]} id [description]
     */
    removeRoute(id) {
        this._routes = this._routes.filter(r => r.id != id);
    }

    /**
     * Get an ordered list of all available routes. The list contains one object
     * per route with the following fields:
     *
     *   * id: ID of the rule or undefined
     *   * path: Regex of the matched path
     *   * handler: Handler function to retrieve the screen
     *
     * @return {List} All available routes
     */
    get routes() {
        return this._routes;
    }

    set routes(routes) {
        this._routes = routes;
    }

    /**
     * Go to the given path if there is a route to it and update the browser's
     * URL display and navigation history. This first found route wins.
     *
     * @param {String} newPath Path where the user wants to go to
     * @param {Boolean} updateHistory Whether a new entry should be pushed to
     *     the browser history. Usually this is wanted except when reloading
     *     the current screen or going back in history. (Default: true)
     * @param {Integer} scrollX Horizontal window scroll position (Default: 0)
     * @param {Integer} scrollY Vertical window scroll position (Default: 0)
     */
    async goto(newPath, updateHistory, scrollX, scrollY) {
        // Remember scroll position fro the history entry
        let oldScrollX = window.scrollX;
        let oldScrollY = window.scrollY;
        let newScrollX = scrollX || 0;
        let newScrollY = scrollY || 0;

        // Apply handler for the current path and render screen
        let oldPath = this.currentPath();
        let oldTitle = document.title;
        let newTitle = "";

        newPath = newPath || "/";
        newPath = this._parseRelativePath(oldPath, newPath);

        if (updateHistory == undefined) updateHistory = true;
        this.loading(true);

        while (newPath) {
            // Search first matching handler
            let matchResult = null;
            let matchedRoute = {
                path: ".*",
                handler: null,
            };

            for (let i in this._routes) {
                let route = this._routes[i];
                let regexp = new RegExp(route.path, "g");
                matchResult = newPath.match(regexp);

                if (matchResult) {
                    matchResult = matchResult.slice(1);
                    matchedRoute = route;

                    this.currentPath(newPath);
                    this.breadcrumb(matchedRoute.breadcrumb || []);

                    break;
                }
            }

            // Apply handler and thus update all surfaces
            newPath = await this.applyHandler(matchedRoute.handler, matchResult, oldPath, newPath);
            newTitle = document.title;
            window.scrollTo(newScrollX, newScrollY);
        }

        newPath = this.currentPath();
        this.loading(false);

        // Remember scroll position
        if (history.scrollRestoration) {
            history.scrollRestoration = "manual";
        }

        if (history.state) {
            let url = "";

            if (this.config.hashBang) {
                url = `${this.config.basePath}#${oldPath}`;
            } else {
                url = `${this.config.basePath}${oldPath}`;
            }

            let state = JSON.parse(history.state);
            state.scrollX = oldScrollX;
            state.scrollY = oldScrollY;
            history.replaceState(JSON.stringify(state), "", url);
        }

        // Update browser history
        if (updateHistory && this.config.pushHistory) {
            let url = "";

            if (this.config.hashBang) {
                url = `${this.config.basePath}#${newPath}`;
            } else {
                url = `${this.config.basePath}${newPath}`;
            }

            // state, title, url: title is ignored in favour of document.title
            //
            // BEWARE: Setting the document title modifies the current history
            // entry! So when the new screen has been rendered, most likely a
            // new title has been set which modifies the history entry of the
            // previous screen. That's why the document title is temporarily
            // set to its previous value.
            //
            // But as it turns out it takes a little while for the history
            // object to pick up the changed title. Therefor the history is
            // written after a short timeout. Otherwise the previous history
            // entry would have the name of the next screen.
            document.title = oldTitle; // Modifies previous history entry

            window.setTimeout(() => {
                let state = {
                    path: newPath,
                    scrollX: newScrollX,
                    scrollY: newScrollY,
                };

                if (oldPath.length) history.pushState(JSON.stringify(state), "", url);
                else history.replaceState(JSON.stringify(state), "", url);

                document.title = newTitle; // Modifies current history entry
            }, 50);
        }
    }

    /**
     * Execute the given handler function in order to switch the currently
     * visible screen but don't mess with the current URL. Only switches
     * the visible content which can be handy on some special 404 cases where
     * it is not known upfront whether an URL is valid or not.
     *
     * @param {Function} handler Function to retrieve the Screen class/instance
     * @param {Array} matchResult Matched regexp groups (optional)
     * @param {String} oldPath Path where the user comes from (optional)
     * @param {String} newPath Path where the user is going to (optional)
     * @return {String} Navigate to another path instead or undefined
     */
    async applyHandler(handler, matchResult, oldPath, newPath) {
        matchResult = matchResult || [];
        oldPath = oldPath || this.currentPath();
        newPath = newPath || this.currentPath();

        // Retrieve screen object
        let screen = handler ? await handler() : null;
        if (typeof(screen) === "function") screen = new screen();

        // Subscribe to screen title
        if (this._titleSubscription) this._titleSubscription.dispose();
        if (screen && screen.title) this._titleSubscription = screen.title.subscribe(
            v => this.currentTitle(v)
        );

        // Call life-cycle methods
        if (this._currentScreen && this._currentScreen.onLeave) {
            this._currentScreen.onLeave(oldPath, newPath);
        }

        this._currentScreen = screen;
        let alternativePath = "";

        if (screen && screen.onShow) {
            alternativePath = await screen.onShow(oldPath, newPath);
        }

        if (alternativePath) {
            return alternativePath;
        }

        // Update surfaces
        for (let i in this._surfaces) {
            let surfaceId = this._surfaces[i];
            let surfaceDOM = document.getElementById(surfaceId);
            if (!surfaceDOM) continue;

            for (let i = 0; i < surfaceDOM.children.length; i++) {
                ko.removeNode(surfaceDOM.children[i]);
            }

            let content = screen ? await screen.getSurfaceContent(surfaceId) : null;

            if (content && content.componentName) {
                content.surfaceClasses = content.surfaceClasses || [];
                this._surfaceClasses[surfaceId].forEach(c => surfaceDOM.classList.remove(c));
                content.surfaceClasses.forEach(c => surfaceDOM.classList.add(c));
                this._surfaceClasses[surfaceId] = content.surfaceClasses;

                let componentDOM = document.createElement(content.componentName);
                content.componentClasses.forEach(c => componentDOM.classList.add(c));
                surfaceDOM.appendChild(componentDOM);
                ko.applyBindings(this.config.bindingContext, componentDOM);
            } else {
                surfaceDOM.innerHTML = "";
            }
        }
    }

    /**
     * Reload the current page without navigating away.
     */
    reload() {
        this.goto(this.currentPath(), false);
    }

    /**
     * Activate automatic routing when the user clicks a link. If this method
     * is not called navigation works only by manually calling goto() or
     * applyHandler().
     *
     * @param {Boolean} suppressFirstScreen Activate event listeners but don't
     *                                      actually load the first screen
     */
    activate(suppressFirstScreen) {
        this.active = true;

        if (!suppressFirstScreen) {
            this.goto(this._getPathFromUrl());
        }
    }

    /**
     * Deactivate automatic routing when the user clicks a link. From then on
     * navigation requires someone to call goto() or applyHandler() manually.
     */
    deactivate() {
        this.active = false;
    }

    /**
     * Set the loading CSS class to each surface if the router is loading
     * or remove it if the router isn't loading. If no ID is given the classList
     * of all registered surfaces is modified, otherwise only of the element
     * with the given ID.
     *
     * @param {Boolean} loading Flag whether the router is loading
     * @param {String} id Surface element ID to be modified (optional)
     */
    _setLoadingClass(loading, id) {
        let method = loading ? "add" : "remove";

        let _doSetLoadingClass = (id) => {
            let surfaceDOM = document.getElementById(id);
            if (!surfaceDOM) return;
            surfaceDOM.classList[method](this.config.loadingClass);
        }

        if (id) _doSetLoadingClass(id)
        else this._surfaces.forEach(_doSetLoadingClass);
    }

    /**
     * DOM event handler for clicked links. The event handler is actually added
     * to the window object in order to capture all clicks to all links no matter
     * how and when the link elements were created.
     *
     * Normal links will continue to work as usual, triggering the browser
     * to load a new page. However if the link contains a hash URL the link
     * will be used to render a new screen.
     *
     * Thus the following link loads a new page from the server:
     *
     *   <a href="/goto/new/page">New Page</a>
     *
     * The following link shows a new screen without leaving the page:
     *
     *   <a href="#/goto/new/screen">New Screen</a>
     *
     * @param {DOMEvent} event The captured click event
     */
    _onLinkClicked(event) {
        let target = event.target;
        while (target && target.nodeName != "A") target = target.parentNode;
        if (!target || target.nodeName != "A") return;

        let path = target.hash.slice(1);
        if (!path.length) return;

        event.preventDefault();
        if (this.active) this.goto(path);
    }

    /**
     * DOM event handler for the popstate event which is triggered by the
     * browser everytime the navigation history inside the same page has
     * changed. Usually this means that the user clicked to back or forward
     * buttons of the browser or window.history has been changed via some
     * javascript code.
     *
     * This event causes the router to render a new screen. But please note
     * that the router doesn't cache previous screen objects. Therefor the
     * screen will be rerendered as if if were opened for the first time.
     * Therefor if caching is needed the screen returned by the route handler
     * function must be an object instance instead of a class.
     *
     * @param {DOMEvent} event The captured popstate event
     */
    _onHistoryChanged(event) {
        if (!this.active) return
        let state = null;

        if (event.state) {
            state = JSON.parse(event.state)
        } else {
            state = {
                path: this._getPathFromUrl(),
                scrollX: 0,
                scrollY: 0
            };
        }

        this.goto(state.path, false, state.scrollX, state.scrollY);
    }

    /**
     * Parse the location obejct in order to get the requested path to show.
     * @return {String} Path against which routes can be matched
     */
    _getPathFromUrl() {
        if (this.config.hashBang) {
            return location.hash.slice(1)
        } else if (location.pathname.startsWith(this.config.basePath)) {
            return location.pathname.slice(this.config.basePath.length);
        } else {
            return location.pathname;
        }
    }

    /**
     * Parse a given path string and handle relative movements like ./ or ../.
     * This takes the previously active path as a start and then parses the
     * new path relative to that. If the new path is an absolute path the old
     * path will be ignored. Otherwise both paths will be joined step by step.
     *
     * @param  {String} oldPath Current path
     * @param  {String} newPath New possibly relative path
     * @return {String} The final path to go to
     */
    _parseRelativePath(oldPath, newPath) {
        let result = [];
        if (!newPath.startsWith("/")) result = oldPath.split("/")
        if (oldPath.endsWith("/")) result.pop();

        newPath.split("/").forEach(element => {
            switch (element) {
                case ".":
                    break;
                case "..":
                    result.pop();
                    break;
                default:
                    result.push(element);
            }
        });

        return result.join("/");
    }
}

export default Router;
