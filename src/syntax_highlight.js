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

import "../node_modules/highlight.js/styles/atom-one-dark.css";

import ko from "knockout";
import hljs from "highlight.js";

import utils from "./utils.js";

/**
 * Defines the <source-code>-tag which can be used to syntaxh highlight
 * source code examples like this:
 *
 *     <source-code language="javascript" filename="filename.js">
 *          …
 *     </source-code>
 *
 * This renders a <pre data-lang="filename.js"><code>...</code></pre> block.
 * For inlined source code, the following can be used:
 *
 *   <src-code language="javascript">if (x == 1)</src-code>
 */
class SyntaxHighlightPlugin {
    /**
     * Plugin constructor.
     */
    constructor() {
        this.name = "SyntaxhHighlight";
    }

    /**
     * Plugin initialization.
     * @param {Array} plugins Runtime objects of all plugins
     */
    initialize(plugins) {
        ko.components.register("source-code", {
            viewModel: {
                createViewModel: (params, componentInfo) => {
                    return new SyntaxHighlightViewModel(params, componentInfo);
                },
            },
            template: require("./templates/syntax_highlight_block.html"),
        });

        ko.components.register("src-code", {
            viewModel: {
                createViewModel: (params, componentInfo) => {
                    return new SyntaxHighlightViewModel(params, componentInfo);
                },
            },
            template: require("./templates/syntax_highlight_inline.html"),
        });
    }
}

/**
 * Knockout.js view model class for the <source-code> tag.
 */
class SyntaxHighlightViewModel {
    /**
     * Constructor method.
     *
     * @param {Object} params Parameters given to the ko-component in HTML
     * @param {Object} componentInfo knockout component info which also contains
     *     the HTML tags inside the <assign-words-quiz>-element
     */
    constructor(params, componentInfo) {
        this.language = componentInfo.element.getAttribute("language") || "";
        this.filename = componentInfo.element.getAttribute("filename") || "";

        let code = "";
        let result = null;

        componentInfo.templateNodes.forEach(node => {
            if (node.outerHTML) code += node.outerHTML
            else if (node.textContent) code += node.textContent;
        });

        code = utils.trimLines(code);
        code = utils.shiftLinesLeft(code);
        code = utils.removeLeadingLinebreaks(code);
        code = utils.removeTrailingLinebreaks(code);

        if (this.language != "") result = hljs.highlight(this.language, code, true);
        else result = hljs.highlightAuto(code);

        this.highlighted = result.value;
    }
}

export default SyntaxHighlightPlugin;
