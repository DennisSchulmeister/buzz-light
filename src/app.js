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

// Instantiate all plugins
let pluginClasses = [
    HomePagePlugin,
    UsersPagePlugin,
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
