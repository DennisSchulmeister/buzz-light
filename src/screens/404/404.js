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

import $ from "jquery";
import ko from "knockout";
import plugins from "../../app.js";

const _ = plugins["I18n"].translate;

// Background tiles
let tiles = {
    wall: [
        require("./tiles/brick_brown0.png"),
        require("./tiles/brick_brown1.png"),
        require("./tiles/brick_brown2.png"),
        require("./tiles/brick_brown3.png"),
        require("./tiles/brick_brown4.png"),
        require("./tiles/brick_brown5.png"),
        require("./tiles/brick_brown6.png"),
        require("./tiles/brick_brown7.png"),
        require("./tiles/brick_brown-vines1.png"),
        require("./tiles/brick_brown-vines2.png"),
        require("./tiles/brick_brown-vines3.png"),
        require("./tiles/brick_brown-vines4.png"),
    ],
    deco: [
        require("./tiles/banner1.png"),
        require("./tiles/torch1.png"),
        require("./tiles/torch3.png"),
        require("./tiles/torch2.png"),
    ],
    statue: [
        require("./tiles/dngn_blood_fountain2.png"),
        require("./tiles/dngn_dry_fountain.png"),
    ],
    door: [
        require("./tiles/dngn_stone_arch.png"),
        require("./tiles/dngn_closed_door.png"),
        require("./tiles/dngn_open_door.png"),
    ],
    floor1: [
        require("./tiles/grey_dirt1.png"),
        require("./tiles/grey_dirt3.png"),
        require("./tiles/grey_dirt4.png"),
        require("./tiles/grey_dirt5.png"),
    ],
    floor2: [
        require("./tiles/cobble_blood1.png"),
        require("./tiles/cobble_blood2.png"),
        require("./tiles/cobble_blood3.png"),
        require("./tiles/cobble_blood4.png"),
        require("./tiles/cobble_blood5.png"),
        require("./tiles/cobble_blood6.png"),
        require("./tiles/cobble_blood7.png"),
        require("./tiles/cobble_blood8.png"),
        require("./tiles/cobble_blood9.png"),
        require("./tiles/cobble_blood10.png"),
        require("./tiles/cobble_blood11.png"),
        require("./tiles/cobble_blood12.png"),
    ],
    floor3: [
        require("./tiles/floor_sand_rock0.png"),
        require("./tiles/floor_sand_rock1.png"),
        require("./tiles/floor_sand_rock2.png"),
        require("./tiles/floor_sand_rock3.png"),
    ],
    player: [
        require("./tiles/deep_elf_demonologist.png"),
    ],
    scroll: [
        require("./tiles/scroll.png"),
    ]
 };

let tileTypes = {
    " ": "floor1",
    ".": "floor2",
    "x": "floor3",
    "#": "wall",
    "?": "deco",
    "-": "statue",
    "D": "door",
    "P": "player",
    "S": "scroll",
}

let concreteTiles = ["wall", "deco", "statue"];

let tileWidth = 32;
let tileHeight = 32;
let tilesBuffered = false;

// The map
let map = [
    "..   .                                                                   ",
    "    ..                  ##########################   .                   ",
    "  ############?##########xxxxxxxxxxxxxxxxxxxxxxxx#    .             #    ",
    " .                      #xxxxxxxxxxxxxxxxxxxxxxxx#                  #    ",
    "                        #xxxxxxxxxxxxxxxxxxxxxxxx#             .    #    ",
    "   #######?####  S ##  ##xxxxxxxxxxxx##########DD#   ..       .     #    ",
    "   #          #    #    ?xxxxxxxxxxxx#       # ..                   #    ",
    "   #      ..  # .  #    #xxxxxxxxxxxx#  .    #                      #    ",
    "   ####   ##### .  #    #xxxxxxxxxxxx#- ..   #     .. .             #    ",
    "    - #   #   ...  ##########?########       #    ....              #    ",
    "      #   ? P....  D                 ###   ###                      #.   ",
    "   ####   #        D    ...       #                                 #    ",
    "   #      #####DD####?####.       #                                 #    ",
    "   #       #                                                             ",
    "   #####   #                                                             ",
    "       #   ####?######################?##    .  ###  ########  ##?###    ",
    "                       #xxxxxxxxxx   .  #   .   #     ..            #   -",
    "                       #xxxxxxxxxx   .  #   .   #     ..            ?    ",
    "#########?######?#######xxxxxxxxx#  ..  #       #-      .           #   #",
    "       #               #xxxxxxxxx#   .  #   .   ?     ..            #    ",
    "       #               #xxxxxxxxx#   .  #   .   #     ..            #    ",
    "       D    ######?#########xx#####   ###    .  ####?#####?    ########  ",
    "       D               #                #       #     ..              #  ",
    "       #               #                #       #     .               #  ",
    "       #    #                                   #                     #  ",
    "       #    #####   ####                        #    #############    #  ",
    "                                                                         ",
];

let mapWidth = 0;
let mapHeight = map.length;

for (let y in map) {
    mapWidth = Math.max(mapWidth, map[y].length);
}

let mapSeed = [];

for (let y in map) {
    let line = [];
    mapSeed.push(line);

    for (let x in map[y]) {
        let type = tileTypes[map[y][x]];
        let seed = Math.round(Math.random() * (tiles[type].length - 1));
        line.push(seed);
    }
}

 /**
  * Get the map character at the given position. If the position is outside the
  * map, treat the map as inifitely repeating. If the position is a non-integer
  * value round down to get the fractional tile.
  */
function mapCharAt(x, y) {
    if (x > 0) x = Math.floor(x) % mapWidth;
    else x = mapWidth - ((Math.ceil(x) * -1) % mapWidth) - 1;

    if (y > 0) y = Math.floor(y) % mapHeight;
    else y = mapHeight - ((Math.ceil(y) * -1) % mapHeight) - 1;

    return {
        char: map[y][x],
        seed: mapSeed[y][x],
    }
}

/**
 * Get the buffered tile of the given type. If there are more than one possible
 * tiles the X and Y coordinates will be used to return a pseudo-random one.
 *
 * @param  {String}  type Tile type ("floor", "wall", ...)
 * @param  {Integer} seed Which tile when there are more than one available
 * @return {Image}        Buffered image data
 */
function getTile(type, seed) {
    let buffers = tiles[type] || tiles["floor1"];
    if (seed >= buffers.length) seed = 0;
    return buffers[seed];
}

// Draw commands
let CMD_REDRAW = 1;
let CMD_SCROLL = 2;
let CMD_REFRESH = 3;

// Player move directions and actions
let DIR_NONE = -1;
let DIR_WAIT = -2;
let DIR_START = -3;
let DIR_TOAST1 = -4;
let DIR_TOAST2 = -5;
let DIR_TOAST3 = -6;
let DIR_TOAST4 = -7;
let DIR_TOAST5 = -8;

let DIR_UP = 1;
let DIR_DOWN = 2;
let DIR_LEFT = 3;
let DIR_RIGHT = 4;

// First movements of the player
let startDirections = [
    DIR_TOAST1,
    DIR_RIGHT, DIR_RIGHT, DIR_RIGHT, DIR_RIGHT,
    DIR_UP, DIR_UP, DIR_UP, DIR_UP, DIR_UP,
    DIR_TOAST2,
    DIR_WAIT, DIR_WAIT, DIR_WAIT, DIR_WAIT, DIR_WAIT, DIR_WAIT,
    DIR_TOAST3,
    DIR_WAIT, DIR_WAIT,  DIR_WAIT, DIR_WAIT,
    DIR_TOAST4,
    DIR_WAIT, DIR_WAIT, DIR_WAIT, DIR_WAIT,
    DIR_WAIT, DIR_WAIT, DIR_WAIT, DIR_WAIT,
    DIR_TOAST5,
    DIR_UP, DIR_UP,
    DIR_LEFT,
];

let playerStartX = 0;
let playerStartY = 0;
let finish = false;

for (let y in map) {
    for (let x in map) {
        if (tileTypes[map[y][x]] == "player") {
            playerStartX = x;
            playerStartY = y;
            finish = true;
            break;
        }
    }

    if (finish) break;
}

/**
 * Utility which asynchronously loads an image. Because even though Webpack
 * includes the images as base64 data URIs creating an Image() and setting
 * its src attribute causes the Image to be filled asynchronously. Therefor
 * a Promise object is returned for the caller to wait until the images has
 * been loaded or produced an error.
 *
 * @param  {String} src Data-URI with image data
 * @return {Promise}    Promise which returns the new Image()
 */
function loadImage(src) {
    let image = new Image();

    let promise = new Promise((resolve, reject) => {
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", () => reject());
        image.addEventListener("cancel", () => reject());
        image.src = src;
    });

    return promise;
}

/**
 * ViewModel class for the 404 screen main content.
 */
class The404ScreenMain {
    /**
     * Consutrctor of the model view. Here a series of messages is timed and
     * the animation inside the canvas is started.
     */
    constructor() {
        this.screen = {
            buffer: document.getElementById("the-404-page-canvas"),
            backBuffer: document.createElement("canvas"),
            commands: [],
        }

        this.background = {
            buffer: document.createElement("canvas"),
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            width: 0,
            height: 0,
            safeX: 0,
            safeY: 0,
        }

        this.player = {
            sprite: undefined,
            spriteLeft: undefined,
            spriteRight: undefined,
            x: playerStartX,
            y: playerStartY,
            walk: {
                directions: startDirections.slice(),
                direction: DIR_START,
                nSteps: 0,
                stepCount: 0,
                maxSteps: 15,
                startX: playerStartX,
                startY: playerStartY,
                deltaTime: (500 / tileWidth) * 2,
                prevTime: 0,
                waitCount: 0,
                maxWaitCount: tileWidth / 2,
                goon: false,
            },
        };

        this.bufferTiles().then(() => {
            // Render flipped player sprite
            return new Promise((resolve, reject) => {
                let imageLeft = tiles.player[0];
                let canvasRight = document.createElement("canvas");
                canvasRight.width = imageLeft.width;
                canvasRight.height = imageLeft.height;

                let context = canvasRight.getContext("2d");
                context.translate(imageLeft.width, 0);
                context.scale(-1, 1);
                context.drawImage(imageLeft, 0, 0);

                this.player.spriteLeft  = imageLeft;
                this.player.spriteRight = new Image();
                this.player.spriteRight.src = canvasRight.toDataURL();
                this.player.sprite = this.player.spriteRight;

                this.player.spriteRight.addEventListener("load", () => resolve());
            });
        }).then(() => {
            // Get the game going
            this.recalcSizeAndPositions(true);
            this.queueCommand(CMD_REDRAW);
            this.prevTimestamp = performance.now();

            window.addEventListener("resize", () => this.queueCommand(CMD_REDRAW));
            window.requestAnimationFrame(this.animationLoop.bind(this));
        });
    }

    /**
     * Initialization method which once goes through the tiles array which
     * initialy contains URI encoded strings with image data. Each image is
     * replaced with an Image object which acts as a buffer for each tile.
     */
    bufferTiles() {
        // Only do this once
        if (tilesBuffered) return Promise.all([]);
        tilesBuffered = true;

        // Replace all data-uri images with <canvas> elements as buffers
        let promises = [];

        for (let tileType in tiles) {
            for (let i in tiles[tileType]) {
                let promise = loadImage(tiles[tileType][i]);
                promises.push(promise);

                promise.then((image) => {
                    let _i = i;
                    tiles[tileType][_i] = image;
                });
            }
        }

        return Promise.all(promises);
    }

    /**
     * Adds a rendering command to the queue which causes the image to be
     * updated on the browser's next render request.
     *
     * @param {Integer} command  Command constant (CMD_REDRAW, ...)
     */
    queueCommand(command) {
        this.screen.commands.push(command);
    }

    /**
     * This is the main loop of the screen. Here the game state is updated
     * according to the content of this.command_queue and all necessary parts
     * of the screen are redrawn. Durin redraws it is treid to optimize the
     * drawing as to only render what can actually be seen on the screen and
     * which is different from the previous frame.
     *
     * @param {Float} timestamp Milisecond timestamp provided by the browser
     */
    animationLoop(timestamp) {
        this.walkPlayer(timestamp);
        this.followPlayer();
        this.scrollBackground();

        do {
            let command = this.screen.commands.shift();
            if (!command) break;

            switch (command) {
                case CMD_REDRAW:
                    // Redraw entire screen
                    this.recalcSizeAndPositions();
                    this.renderBackground();
                    this.drawBackground();
                    this.drawPlayer();
                    this.flip();
                    break;
                case CMD_SCROLL:
                    // Scroll screen
                    this.drawBackground();
                    this.drawPlayer();
                    this.flip();
                    break;
                case CMD_REFRESH:
                    // Only redraw the player sprite
                    this.drawBackground(this.player.x - 1, this.player.y - 1, 4, 4);
                    this.drawPlayer();
                    this.flip();
                    break;
            }
        } while(true)

        window.requestAnimationFrame(this.animationLoop.bind(this));
    }

    /**
     * Algorithm which makes the player walk through the map.
     * @param {Float} timestamp Milisecond timestamp provided by the browser
     */
    walkPlayer(timestamp) {
        if (timestamp - this.player.walk.prevTime < this.player.walk.deltaTime) return;
        this.player.walk.prevTime = timestamp;

        if (this.player.walk.direction == DIR_START
              || Math.abs(this.player.walk.startX - this.player.x) >= 1
              || Math.abs(this.player.walk.startY - this.player.y) >= 1
              || this.player.walk.goon) {
            // Snap to integer coodrinates at the end of a walking step
            this.player.x = this.player.x > 0 ? Math.floor(this.player.x) : Math.ceil(this.player.x);
            this.player.y = this.player.y > 0 ? Math.floor(this.player.y) : Math.ceil(this.player.y);

            // Remember where the step started
            this.player.walk.startX = this.player.x;
            this.player.walk.startY = this.player.y;
            this.player.walk.waitCount = 0;
            this.player.walk.goon = false;

            // Get new direction
            let direction = this.player.walk.directions.shift();

            if (direction) {
                this.player.walk.direction = direction;
            } else {
                // Randomly change direction away from the walls after the
                // first few pre-defined steps are exhausted. So first check
                // whether we can keep going in the current direction and then
                // find a new one if not.
                function _colision(x, y) {
                    let occupiedTiles = [
                        tileTypes[mapCharAt(x + 0, y + 0).char],
                        tileTypes[mapCharAt(x + 1, y + 0).char],
                        tileTypes[mapCharAt(x + 0, y + 1).char],
                        tileTypes[mapCharAt(x + 1, y + 1).char],
                    ]

                    for (let i in occupiedTiles) {
                        for (let j in concreteTiles) {
                            if (occupiedTiles[i] == concreteTiles[j]) return true;
                        }
                    }

                    // TODO: Statues are double sized!
                    return false;
                }

                _colision = _colision.bind(this);

                let possibleDirections = []

                switch (this.player.walk.direction) {
                    case DIR_LEFT:
                        possibleDirections = [DIR_UP, DIR_RIGHT, DIR_DOWN, DIR_LEFT,];
                        break;
                    case DIR_RIGHT:
                        possibleDirections = [DIR_DOWN, DIR_LEFT, DIR_UP, DIR_RIGHT,];
                        break;
                    case DIR_UP:
                        possibleDirections = [DIR_RIGHT, DIR_DOWN, DIR_LEFT, DIR_UP,];
                        break;
                    default:
                        possibleDirections = [DIR_LEFT, DIR_UP, DIR_RIGHT, DIR_DOWN];
                        break;
                }

                if (this.player.walk.stepCount < this.player.walk.nSteps) {
                    possibleDirections.unshift(this.player.walk.direction);
                    this.player.walk.stepCount++;
                } else {
                    this.player.walk.direction = DIR_WAIT;
                    this.player.walk.nSteps = Math.round(Math.random() * this.player.maxSteps);
                }

                do {
                    if (!possibleDirections.length) break;
                    let index = Math.round((Math.random() * possibleDirections.length) - 1);
                    let direction = possibleDirections[index];
                    possibleDirections = possibleDirections.splice(index, 1);

                    let newX = this.player.x;
                    let newY = this.player.y;

                    if (direction == DIR_LEFT) newX--;
                    if (direction == DIR_RIGHT) newX++;
                    if (direction == DIR_UP) newY--;
                    if (direction == DIR_DOWN) newY++;

                    if (!_colision(newX, newY)) {
                        this.player.walk.direction = direction;
                        break;
                    }
                } while (true)
            }

            // Flip sprite on left and right turns
            switch (this.player.walk.direction) {
                case DIR_LEFT:
                    this.player.sprite = this.player.spriteLeft;
                    break;
                case DIR_RIGHT:
                    this.player.sprite = this.player.spriteRight;
                    break;
            }
        }

        switch (this.player.walk.direction) {
            case DIR_UP:
                this.player.y -= 2 / tileHeight;
                this.queueCommand(CMD_REFRESH);
                break;
            case DIR_DOWN:
                this.player.y += 2 / tileHeight;
                this.queueCommand(CMD_REFRESH);
                break;
            case DIR_LEFT:
                this.player.x -= 2 / tileWidth;
                this.queueCommand(CMD_REFRESH);
                break;
            case DIR_RIGHT:
                this.player.x += 2 / tileWidth;
                this.queueCommand(CMD_REFRESH);
                break;
            case DIR_WAIT:
                this.player.walk.waitCount++;
                if (this.player.walk.waitCount >= this.player.walk.maxWaitCount) this.player.walk.goon = true;
                break;
            case DIR_TOAST1:
                plugins["Toast"].warning(_("You turn around and suddenly a mystical scroll with 404 verses lies behind you."));
                this.player.walk.goon = true;
                break;
            case DIR_TOAST2:
                plugins["Toast"].warning(_("As you read some of them, you notice they all mean something like …"));
                this.player.walk.goon = true;
                break;
            case DIR_TOAST3:
                plugins["Toast"].error('"' + _("The requested page could not be found.") + '"');
                this.player.walk.goon = true;
                break;
            case DIR_TOAST4:
                plugins["Toast"].error('"' + _("This is not the page you were looking for.") + '"');
                this.player.walk.goon = true;
                break;
            case DIR_TOAST5:
                plugins["Toast"].primary(_("Oh, well, that was clear …"));
                this.player.walk.goon = true;
                break;
        }
    }

    /**
     * Make sure that the player cannot walk out of the screen by moving the
     * background window along when the player tries to leave the "safe" zone.
     */
    followPlayer() {
        let xLeft = this.background.x + this.background.safeX;
        let xRight = this.background.x + this.background.width - this.background.safeX;
        let yTop = this.background.y + this.background.safeY;
        let yBottom = this.background.y + this.background.height - this.background.safeY;

        let xLeftDelta = this.player.x - xLeft;
        let xRightDelta = this.player.x - xRight;
        let yTopDelta = this.player.y - yTop;
        let yBottomDelta = this.player.y - yBottom;

        if (xLeftDelta < 0) this.background.x += xLeftDelta;
        if (xRightDelta > 0) this.background.x += xRightDelta;
        if (yTopDelta < 0) this.background.y += yTopDelta;
        if (yBottomDelta > 0) this.background.y += yBottomDelta;
    }

    /**
     * Recalculate the size of all screen buffers and update the relative
     * position of the background compared to the map so that the player
     * still remains visible.
     *
     * After this a full redraw should be done.
     *
     * @param {Boolean} force Reposition map even if player is visible
     */
    recalcSizeAndPositions(force) {
        // Update buffer sizes
        let zoom = 1;

        /*
        // FIXME: Bring back Reponsive plugin from fancy404 branch, but make
        // sure it acutally works.
        if (plugins["Responsive"].screenIsAtLeast("lg")) {
            zoom = 2;
        } else if (plugins["Responsive"].screenIsAtLeast("md")) {
            zoom = 1.5;
        }
        */

        this.screen.buffer.width = this.screen.buffer.clientWidth / zoom
        this.screen.buffer.height = this.screen.buffer.clientHeight / zoom;

        this.screen.backBuffer.width = this.screen.buffer.width;
        this.screen.backBuffer.height = this.screen.buffer.height;

        this.background.buffer.width = this.screen.buffer.width;
        this.background.buffer.height = this.screen.buffer.height;
        this.background.width = this.background.buffer.width / tileWidth;
        this.background.height = this.background.buffer.height / tileHeight;

        // Calculate safe distance from the borders which scrolls the
        // background along if the player is trying to leave
        if (this.background.width > this.background.heigth) {
            this.background.safeX = this.background.width / 4;
            this.background.safeY = (tileWidth / tileHeight) * this.background.safeX
        } else {
            this.background.safeY = this.background.height / 4;
            this.background.safeX = (tileHeight / tileWidth) * this.background.safeY
        }

        // Check if the player is still visible. If not reset the background
        // position so that the player is in the (0.25, 0.75) bottom left
        // corner.
        if (this.player.x < this.background.x
              || this.player.y < this.background.y
              || this.player.x > this.background.x + this.background.width
              || this.player.y > this.background.y + this.background.height
              || force) {
            this.background.x = this.player.x - this.background.width * 0.25;
            this.background.y = this.player.y - this.background.height * 0.75;

            this.background.prevX = this.background.x;
            this.background.prevY = this.background.y;
        }
    }

    /**
     * Rerenders the background with the map. This only updates the background
     * buffer. In order to display the background drawBackground() has to be
     * called followed by flip() later.
     */
    renderBackground() {
        let tileX = this.background.x + this.background.width;
        let xPartial = Math.abs(tileX - Math.floor(tileX));
        let xPos = (this.background.width - xPartial) * tileWidth;

        while (xPos > -tileWidth) {
            let tileY = this.background.y + this.background.height;
            let yPartial = Math.abs(tileY - Math.floor(tileY));
            let yPos = (this.background.height - yPartial) * tileWidth;

            while (yPos > -tileHeight) {
                let mapChar = mapCharAt(tileX, tileY);
                this.blitBackgroundTile(mapChar.char, mapChar.seed, xPos, yPos);

                tileY -= 1;
                yPos -= tileWidth;
            }

            tileX -= 1;
            xPos -= tileHeight;
        }
    }

    /**
     * Scrolls the background when its X,Y coordinates changed. First the whole
     * background image is shifted and then the damaged border region is
     * rerendered. This is much more efficient the rerendering the whole image.
     */
    scrollBackground() {
        // Check if the background has been moved
        let deltaX = this.background.prevX - this.background.x;
        let deltaY = this.background.prevY - this.background.y;
        this.background.prevX = this.background.x;
        this.background.prevY = this.background.y;

        if (!deltaX && !deltaY) return;
/*
        // Blit image to its new position
        let context = this.background.buffer.getContext("2d");
        context.drawImage(this.background.buffer, deltaX * tileWidth, deltaY * tileHeight);

        // TODO: Rerender damaged borders

        // Make sure the whole background gets copied on screen
        this.queueCommand(CMD_SCROLL);
*/
        // FIXME: Make above code work, so that we don't actually rerender
        // the whole background when the screen scolls
        this.renderBackground();
        this.queueCommand(CMD_SCROLL);
    }

    /**
     * Draws a part of the background image on the back buffer.
     */
    drawBackground(x, y, width, heigth) {
        let context = this.screen.backBuffer.getContext("2d");

        if (x === undefined || y === undefined || width === undefined || heigth === undefined) {
            context.drawImage(this.background.buffer, 0, 0);
        } else {
            x = (x - this.background.x) * tileWidth;
            y = (y - this.background.y) * tileHeight;
            width = width * tileWidth;
            heigth = heigth * tileHeight;

            context.drawImage(this.background.buffer, x, y, width, heigth, x, y, width, heigth);
        }
    }

    /**
     * Blit a single tile into the background buffer.
     *
     * @param {String}  char Map character to draw
     * @param {Integer} seed Which tile to draw when there are more than one
     * @param {Integer} xPos X position inside the background buffer in pixels
     * @param {Integer} yPos Y position inside the background buffer in pixels
     */
    blitBackgroundTile(char, seed, xPos, yPos) {
        xPos = Math.floor(xPos);
        yPos = Math.floor(yPos);

        let context = this.background.buffer.getContext("2d");
        let type = tileTypes[char];
        let doubleSize = false;

        if (type == "player") {
            type = "floor1";
        } else if (type == "deco") {
            context.drawImage(getTile("wall", 0), xPos, yPos);
        } else if (type == "door" || type == "scroll" || type == "statue") {
            context.drawImage(getTile("floor1", 0), xPos, yPos);
        }

        if (type == "statue") doubleSize = true;

        if (!doubleSize) {
            context.drawImage(getTile(type, seed), xPos, yPos);
        } else {
            context.save();
            context.scale(2, 2);
            context.drawImage(getTile(type, seed), xPos / 2, yPos / 2);
            context.restore();
        }
    }

    /**
     * Draws the player sprite on the back buffer.
     */
    drawPlayer() {
        let context = this.screen.backBuffer.getContext("2d");
        let xPos = Math.floor((this.player.x - this.background.x) * tileWidth);
        let yPos = Math.floor((this.player.y - this.background.y) * tileHeight);
        // FIXME: Results still okay when map has scrolled ???

        context.save();
        context.scale(2, 2);
        context.drawImage(this.player.sprite, xPos / 2, yPos / 2);
        context.restore();
    }

    /**
     * Blit the back buffer content to screen.
     */
    flip() {
        let context = this.screen.buffer.getContext("2d");
        context.drawImage(this.screen.backBuffer, 0, 0);
    }
}

export default The404ScreenMain;
