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

/**
 * This function takes a text string and shifts all lines to the left so that
 * as most leading spaces are removed as possible. All lines are shifted by
 * the same amount which is determined as the minimum amount of white space
 * at the beginning of all lines.
 *
 * @param  {String} text Original text
 * @return {String} Shifted text
 */
function shiftLinesLeft(text) {
    // Determine type of linebreak
    let lines = [];
    let linebreak = "";

    if (text.includes("\r\n")) linebreak = "\r\n";
    else if (text.includes("\n")) linebreak = "\n";
    else if (text.includes("\r")) linebreak = "\r";
    else return text;

    lines = text.split(linebreak);

    // Find amount to shift lines
    let commonPrefix = null;

    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].length) continue;

        let whitespace = lines[i].match(/^\s*/);
        if (whitespace) whitespace = whitespace[0];
        else whitespace = "";

        if (commonPrefix === null || commonPrefix.startsWith(whitespace)) commonPrefix = whitespace;
    }

    // Shift lines and return result
    text = "";
    let shift = commonPrefix.length;

    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].length) continue;
        lines[i] = lines[i].slice(shift, lines[i].length);
        text += lines[i] + linebreak;
    }

    return text;
}

export default {
    shiftLinesLeft,
}
