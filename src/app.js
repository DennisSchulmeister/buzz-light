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
import "../node_modules/spectre.css/spectre-icons.less";
import "./app.less";

// Built-in plugins
import RedirectHomePlugin from "./home.js";
import CoursePagePlugin from "./pages/course.js";
import RouterPlugin from "./router.js";

// Local configuration (may contain extra plugins)
import config from "../config.js";

// Instantiate all plugins
let pluginClasses = [
    RedirectHomePlugin,
    CoursePagePlugin,
    RouterPlugin,
];

if (config.plugins) {
    pluginClasses.concat(config.plugins);
}

let plugins = {};

pluginClasses.forEach(plugin => {
    let instance = new plugin();
    let name = instance.name ? instance.name : plugin.name;
    plugins[name] = instance;
});

// Initialize all plugins separatly so that they may access other plugins
for (let name in plugins) {
    let instance = plugins[name];
    if (!instance.initialize) continue;
    instance.initialize(plugins);
}

export default plugins;
