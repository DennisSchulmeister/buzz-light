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
import plugins from "./app.js";
import config from "../config.js";

/**
 * Add new languages here and in the function loadTranslation() below.
 */
let availableLanguages = {
    "en": "English",
    "de": "Deutsch",
}

/**
 * Add new languages here by exetending the if-clause. Although overkill at
 * first sight the explicit import() calls make webpack build a lazy-loaded
 * bundle for each language. So don't optimize the explicit import() calls
 * for each language away.
 *
 * @param  {String} language Language to load
 * @return {Promise} Import promise with the translation object (if found)
 */
function loadTranslation(language) {
    if (language === "en") {
        return import("./locale/en.js");
    } else if (language === "de") {
        return import("./locale/de.js");
    }
}

/**
 * Translation service. This plugin maintains the available languages and
 * a message catalog which can be queried to get a translated string. For each
 * language a JavaScript module is asynchronously loaded when needed in order
 * to load the respective message catalog.
 *
 * Using this plugin it is also possible to switch langauges anytime.
 */
class I18nPlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        // Plugin name
        this.name = "I18n";

        // The current message catalog
        this.translations = {};

        // Currently selected language
        this.language = ko.observable("");

        // Custom component with a language menu
        let plugin = this;

        ko.components.register("buzz-language-chooser", {
            viewModel: class LangugeChooserViewModel {
                constructor() {
                    // Value bindings
                    this.visible = Object.keys(availableLanguages).length > 1 ? true : false;
                    this.language = plugin.language;

                    // Alphabeticaly sorted list of langauges
                    this.languageList = [];

                    for (let language in availableLanguages) {
                        let name = availableLanguages[language];
                        this.languageList.push({ language, name });
                    }

                    this.languageList.sort((a, b) => {
                        return a.language > b.language;
                    })
                }

                // Switch current language
                switchLanguage(language, event) {
                    plugin.switchLanguage(language.language, true);
                    event.preventDefault();
                }

                // Check if language is active
                isActive(language) {
                    return language == this.language();
                }
            },
            template: require("./templates/language-chooser.html"),
        });
    }

    /**
     * Initialize the message catalog by loading the first translation set.
     * This returns a promise for the plugin loeader to defer the loading of
     * all other plugins until the message catalog is available.
     *
     * The config.js contains a language setting with the default langauge
     * of the site. If this is empty it is tried to get the language from
     * the browser, which however is a bit unreliable.
     *
     * @return {Promise} A promise to block loading of the other plugins
     *                   or undefined is no translation can be found
     */
    initialize() {
        let languages = [];
        let promise = undefined;

        // Previously used langauge
        if (localStorage.language) {
            languages.push(localStorage.language);
        }

        // Default language from configuration
        if (config.language) {
            languages.push(config.language);
        }

        // Preferred languages by the browser
        if (window.navigator.languages) {
            window.navigator.languages.forEach((language) => {
                languages.push(language);
            });
        }

        if (window.navigator.language) {
            languages.push(window.navigator.language);
        }

        // Fallback language
        languages.push("en");

        // Try to load the first match
        for (let i in languages) {
            promise = this.switchLanguage(languages[i], false);
            if (promise) break;
        }

        return promise;
    }

    /**
     * Switch the currently used language. By default only the new message
     * catalog will be loaded and nothing else happens. This means that the
     * new language will not be used before the next translate() call. If
     * the reload parameter is set the SPA router will reload the currently
     * visible page in order to fully update the UI including the screen title.
     *
     * @param  {String} language The new language to use
     * @param  {Boolean} reload  Flag whether to reload the current page
     * @return {Promise}         Import promise with the translation object
     *                           (if found, otherwise undefined)
     */
    switchLanguage(language, reload) {
        let parts = language.toLowerCase().split("-");
        language = parts[0];
        let promise = loadTranslation(language);
        if (!promise) return;

        return promise.then((messages) => {
            this.translations = messages.default;
            this.language(language);

            localStorage.language = language;

            if (!reload) return;
            plugins["Router"].router.reload();
        });
    }

    /**
     * Get a translated string. This should be called like this:
     *
     *   import plugins from "./app.js";
     *   const _ = plugins["I18n"].translate;
     *   ...
     *
     *   let message = _("Translate this!");
     *
     * If no suitable translation can be found the original text is returned.
     *
     * @param  {String} text Original text
     * @return {String}      Translated text
     */
    get translate() {
        return this._translate.bind(this);
    }

    _translate(text) {
        // Get the current language, so that KO reevaluates all bindings
        // to translated strings. So don't remove the following method call
        // although it might look pointless at first sight.
        this.language();

        if (text in this.translations) {
            return this.translations[text];
        } else {
            return text;
        }
    }

    /**
     * A dictionary with all available languages. Key is the language code,
     * value the name of the language.
     */
    get languages() {
        return availableLanguages;
    }
}

export default I18nPlugin;
