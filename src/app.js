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

// Stylesheets
import "../node_modules/spectre.css/spectre.less";
import "../node_modules/spectre.css/spectre-exp.less";
import "./icons/style.css";
import "./app.less";

// Built-in plugins
import I18nPlugin from "./i18n.js";
import IconLinkPlugin from "./icon_link.js";
import ToastPlugin from "./toast.js";
import RedirectHomePlugin from "./home.js";
import CoursePagePlugin from "./pages/course.js";
import RouterPlugin from "./router.js";

// Local configuration (may contain extra plugins)
import config from "../config.js";

// Instantiate all plugins
let pluginClasses = [
    I18nPlugin, // Must be first
    IconLinkPlugin,
    ToastPlugin,
    RedirectHomePlugin,
    CoursePagePlugin,
    RouterPlugin,
];

if (config.plugins) {
    pluginClasses.concat(config.plugins);
}

let plugins = {};
let instances = [];

pluginClasses.forEach(pluginClass => {
    let plugin = new pluginClass();
    let name = plugin.name ? plugin.name : pluginClass.name;
    plugins[name] = plugin;
    instances.push(plugin)
});

// Initialize all plugins now so that they may access each other.
// The order is the same as in the pluginClasses list above.
function initiliazePlugins(startAt) {
    for (let i = startAt; i < instances.length; i++) {
        let plugin = instances[i];

        if (!plugin.initialize) continue;
        let result = plugin.initialize(plugins);

        if (result instanceof Promise) {
            // If a Promise came back defer the initialization of all other
            // plugins until the promise resolves
            result.then(() => {
                initiliazePlugins(i + 1);
            }).catch(() => {
                initiliazePlugins(i + 1);
            });

            break;
        }
    }
}

initiliazePlugins(0);

export default plugins;
