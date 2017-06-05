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
import BreadcrumbPlugin from "./breadcrumb.js";
import IconLinkPlugin from "./icon_link.js";
import ToastPlugin from "./toast.js";
import RedirectHomePlugin from "./home.js";
import CourseScreenPlugin from "./screens/course.js";
import The500ScreenPlugin from "./screens/500.js";
import The404ScreenPlugin from "./screens/404.js";
import RouterPlugin from "./router.js";

// Local configuration (may contain extra plugins)
import config from "../config.js";

// Instantiate all plugins
let pluginClasses = [
    I18nPlugin, // Must be the first plugin
    BreadcrumbPlugin,
    IconLinkPlugin,
    ToastPlugin,
    RedirectHomePlugin,
    CourseScreenPlugin,
    The500ScreenPlugin,
    The404ScreenPlugin, // Must be the last screen
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
function initiliazePlugins() {
    async function _doInitilizePlugins() {
        for (let i in instances) {
            let plugin = instances[i];

            if (!plugin.initialize) continue;
            await plugin.initialize(plugins);
        }
    }

    _doInitilizePlugins();
}

initiliazePlugins();

export default plugins;
