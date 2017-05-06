"use strict";

// Stylesheets
import "../node_modules/spectre.css/spectre.less";
import "../node_modules/spectre.css/spectre-exp.less";
import "../node_modules/spectre.css/spectre-icons.less";
import "./app.less";

// Built-in plugins
import HomePagePlugin from "./pages/home.js";
import UsersPagePlugin from "./pages/users.js";
import RouterPlugin from "./router.js";

// Local configuration (may contain extra plugins)
import config from "../config.js";

// Initialization of all plugins
let plugins = [
    HomePagePlugin,
    UsersPagePlugin,
    RouterPlugin,
];

if (config.plugins) {
    plugins.concat(config.plugins);
}

let pluginInstances = [];

plugins.forEach(plugin => {
    pluginInstances.push(new plugin(pluginInstances));
});
