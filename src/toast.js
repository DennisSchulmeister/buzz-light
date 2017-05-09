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

import "./templates/toasts.less";

import $ from "jquery";
import ko from "knockout";
import plugins from "./app.js";
import config from "../config.js";

/**
 * This plugin allows to display global messages like warnings and success
 * messages. The user can dismiss a message by clicking it. Otherwise it will
 * automatically disappear after a set timeout.
 */
class ToastPlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        this.name = "Toast";
        this.messages = ko.observableArray([]);

        let plugin = this;

        ko.components.register("buzz-toasts", {
            viewModel: class ToastsViewModel {
                constructor() {
                    this.messages = plugin.messages;
                }

                dismiss(message) {
                    plugin._dismissMessage(message.id);
                }

                fadeIn(element) {
                    if (element.nodeType === 1) {
                        $(element).hide().slideDown(300);
                    }
                }

                fadeOut(element) {
                    if (element.nodeType === 1) {
                        $(element).slideUp(300, () => $(element).remove());
                    }
                }
            },
            template: require("./templates/toasts.html"),
        });
    }

    /**
     * Show a neutral message.
     * @param {String} message Toast content
     */
    message(message) {
        this._addMessage(message, "");
    }

    /**
     * Show a primary message.
     * @param {String} message Toast content
     */
    primary(message) {
        this._addMessage(message, "primary");
    }

    /**
     * Show a success message.
     * @param {String} message Toast content
     */
    success(message) {
        this._addMessage(message, "success");
    }

    /**
     * Show a warning message.
     * @param {String} message Toast content
     */
    warning(message) {
        this._addMessage(message, "warning");
    }

    /**
     * Show an error message.
     * @param {String} message Toast content
     */
    error(message) {
        this._addMessage(message, "error");
    }

    /**
     * Internal implementation called by message(), primary() and so on.
     * It stores the given message to be shown in the UI.
     *
     * @param {String} message Toast content
     * @param {String} style   "", "primary", "succes", "warning" or "error"
     */
    _addMessage(message, style) {
        let classes = "toast visible";
        if (style) classes = `${classes} toast-${style}`;
        let id = parseInt(Math.random() * 65536);

        this.messages.push({
            "content": message,
            "classes": classes,
            "id": id,
        });

        setTimeout(() => this._dismissMessage(id), config.toastTimeout);
    }

    /**
     * Dismiss (remove) the message with the given ID.
     * @param {int} id Internal message ID
     */
    _dismissMessage(id) {
        this.messages.remove(item => item.id == id);
    }
}

export default ToastPlugin;
