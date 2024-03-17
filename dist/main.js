/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/backgrounds.png":
/*!********************************!*\
  !*** ./assets/backgrounds.png ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "0cf532bff767a70b1f42a0fbad6e2993.png");

/***/ }),

/***/ "./assets/backgrounds_houses.png":
/*!***************************************!*\
  !*** ./assets/backgrounds_houses.png ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "8187ace7b4001245dd05b63fe2dafb86.png");

/***/ }),

/***/ "./assets/player.png":
/*!***************************!*\
  !*** ./assets/player.png ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "f3db62483c3871176da392987e68805e.png");

/***/ }),

/***/ "./src/bitmap.ts":
/*!***********************!*\
  !*** ./src/bitmap.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Bitmap: () => (/* binding */ Bitmap),
/* harmony export */   BitmapPallete: () => (/* binding */ BitmapPallete),
/* harmony export */   TileableBitmap: () => (/* binding */ TileableBitmap)
/* harmony export */ });
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* Bitmap */
var Bitmap = /** @class */ (function () {
    /** Create new Bitmap with empty pixels
    * @param width new Bitmap width
    * @param height new Bitmap height */
    function Bitmap(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint32Array(width * height);
    }
    /** Create Bitmap from buffer
    * @param buffer buffer with color values
    * @param width new Bitmap width
    * @param height new Bitmap height
    * @returns new Bitmap */
    Bitmap.from = function (buffer, width, height) {
        var bitmap = new Bitmap(width, height);
        bitmap.data = new Uint32Array(buffer);
        return bitmap;
    };
    Object.defineProperty(Bitmap.prototype, "pixels", {
        /** Get pixels array
        * @returns Uint32Array which represents pixels */
        get: function () {
            return this.data;
        },
        enumerable: false,
        configurable: true
    });
    /** Draw Bitmap on self
    * @param bitmap source Bitmap to draw
    * @param x destination offset x
    * @param y destination offset y
    * @returns self */
    Bitmap.prototype.draw = function (bitmap, x, y) {
        var _a = this, dest = _a.data, dw = _a.width, dh = _a.height;
        var src = bitmap.data, sw = bitmap.width;
        var i = src.length;
        while (i--) {
            if (src[i] === 0)
                continue;
            var px = x + (i % sw);
            var py = y + (i / sw | 0);
            if (px < 0 || px >= dw || py < 0 || py >= dh)
                continue;
            dest[px + py * dw] = src[i];
        }
        return this;
    };
    /** Copy to Bitmap area of self
    * @param bitmap destination Bitmap
    * @param x destination offset x
    * @param y destination offset y
    * @param sx source offset x
    * @param sy source offset y
    * @param width area width to copy
    * @param height area height to copy
    * @returns self */
    Bitmap.prototype.copy = function (bitmap, x, y, sx, sy, width, height) {
        var dest = bitmap.data, dw = bitmap.width, dh = bitmap.height;
        var _a = this, src = _a.data, sw = _a.width;
        var i = width * height;
        while (i--) {
            var j = (sx + i % width) + (sy + (i / width | 0)) * sw;
            if (src[j] == 0)
                continue;
            var px = x + (i % width);
            var py = y + (i / width | 0);
            if (px < 0 || px >= dw || py < 0 || py >= dh)
                continue;
            dest[px + py * dw] = src[j];
        }
        return this;
    };
    /** Extract pixels to new Bitmap
    * @param x source offset x
    * @param y source offset y
    * @param width new Bitmap width
    * @param height new Bitam height
    * @returns new Bitmap */
    Bitmap.prototype.extract = function (x, y, width, height) {
        var bitmap = new Bitmap(width, height);
        var _a = this, src = _a.data, sw = _a.width, sh = _a.height;
        var dest = bitmap.data, dw = bitmap.width;
        var i = dest.length;
        while (i--) {
            var px = x + (i % dw);
            var py = y + (i / dw | 0);
            if (px < 0 || px >= sw || py < 0 || py >= sh)
                continue;
            dest[i] = src[px + py * sw];
        }
        return bitmap;
    };
    /** Clone self to new Bitmap
    * @returns new Bitmap */
    Bitmap.prototype.clone = function () {
        var bitmap = new Bitmap(this.width, this.height);
        var dest = bitmap.data;
        var src = this.data;
        var i = dest.length;
        while (i--)
            dest[i] = src[i];
        return bitmap;
    };
    /** Fill self with color
    * @param color color to fill
    * @returns self */
    Bitmap.prototype.fill = function (color) {
        this.data.fill(color);
        return this;
    };
    /** Vertical flip
    * @returns self */
    Bitmap.prototype.flipV = function () {
        var _a = this, data = _a.data, width = _a.width;
        var i = data.length;
        while (i--) {
            var px = width - (i % width) - 1;
            if (px >= width / 2)
                continue;
            var py = i / width | 0;
            var pi = px + py * width;
            var temp = data[i];
            data[i] = data[pi];
            data[pi] = temp;
        }
        return this;
    };
    /** Horizontal flip
    * @returns self */
    Bitmap.prototype.flipH = function () {
        var _a = this, data = _a.data, width = _a.width, height = _a.height;
        var i = data.length / 2;
        while (i--) {
            var px = i % width;
            var py = height - (i / width | 0) - 1;
            var pi = px + py * width;
            var temp = data[i];
            data[i] = data[pi];
            data[pi] = temp;
        }
        return this;
    };
    return Bitmap;
}());

/* TileableBitmap */
var TileableBitmap = /** @class */ (function (_super) {
    __extends(TileableBitmap, _super);
    /** Create new TileableBitmap with empty pixels
    * @param twidth width of the tile
    * @param theight height of the tile
    * @param cols total number of tiles in horizontal
    * @param rows total number of tiles in vertical */
    function TileableBitmap(twidth, theight, cols, rows) {
        var _this = _super.call(this, twidth * cols, theight * rows) || this;
        _this.twidth = twidth;
        _this.theight = theight;
        _this.cols = cols;
        _this.rows = rows;
        return _this;
    }
    /** Create TileableBitmap from buffer
    * @param buffer buffer with color values
    * @param twidth width of the tile
    * @param theight height of the tile
    * @param cols total number of tiles in horizontal
    * @param rows total number of tiles in vertical
    * @returns new TileableBitmap */
    TileableBitmap.from = function (buffer, twidth, theight, cols, rows) {
        if (cols === void 0) { cols = 1; }
        if (rows === void 0) { rows = 1; }
        var tbitmap = new TileableBitmap(twidth, theight, cols, rows);
        tbitmap.data = new Uint32Array(buffer);
        return tbitmap;
    };
    /** Extract tile to new Bitmap
    * @param col tile location by x
    * @param row tile location by y
    * @returns new Bitmap */
    TileableBitmap.prototype.extractTile = function (col, row) {
        return this.extract(col * this.twidth, row * this.theight, this.twidth, this.theight);
    };
    /** Copy to Bitmap one tile of self
    * @param bitmap destination Bitmap
    * @param x destination offset x
    * @param y destination offset y
    * @param col tile location by x
    * @param row tile location by y
    * @returns self */
    TileableBitmap.prototype.copyTile = function (bitmap, x, y, col, row) {
        return this.copy(bitmap, x, y, col * this.twidth, row * this.theight, this.twidth, this.theight);
    };
    /** Split TileableBitmap to array of Bitmaps
    * @returns array of Bitmaps */
    TileableBitmap.prototype.split = function () {
        var bitmaps = [];
        for (var row = 0; row < this.rows; row++) {
            for (var col = 0; col < this.cols; col++) {
                var x = col * this.twidth;
                var y = row * this.theight;
                bitmaps.push(this.extract(x, y, this.twidth, this.twidth));
            }
        }
        return bitmaps;
    };
    /** Create new TileableBitmap by reordering tiles of self
    * @param order indexes of source tiles by col * row
    * @param cols total number of tiles in horizontal
    * @param rows total number of tiles in vertical
    * @returns new TileableBitmap */
    TileableBitmap.prototype.reorder = function (order, cols, rows) {
        var _a = this, twidth = _a.twidth, theight = _a.theight, scols = _a.cols;
        var tbitmap = new TileableBitmap(twidth, theight, cols, rows);
        var i = cols * rows;
        while (i--) {
            var j = order[i];
            var _b = [i % cols, i / cols | 0], dc = _b[0], dr = _b[1];
            var _c = [j % scols, j / scols | 0], sc = _c[0], sr = _c[1];
            this.copyTile(tbitmap, dc * twidth, dr * theight, sc, sr);
        }
        return tbitmap;
    };
    return TileableBitmap;
}(Bitmap));

/* BitmapPallete */
var BitmapPallete = /** @class */ (function () {
    /** Create new BitmapPallete attached to Bitmap
    * @param bitmap source Bitmap */
    function BitmapPallete(bitmap) {
        this.bitmap = bitmap;
        var pixels = bitmap.pixels;
        var map = [];
        var colors = [];
        var i = pixels.length;
        while (i--) {
            var pixel = pixels[i];
            var idx = colors.indexOf(pixel);
            if (idx < 0) {
                map[i] = colors.length;
                colors.push(pixel);
            }
            else
                map[i] = idx;
        }
        this.palleteMap = new Uint8Array(map);
        this.palleteData = new Uint32Array(colors);
    }
    Object.defineProperty(BitmapPallete.prototype, "colors", {
        /** Get pallete as array of numbers
        * @returns colors */
        get: function () {
            return Array.from(this.palleteData);
        },
        /** Set new pallete and apply on source Bitmap
        * @param pallete new pallete to apply */
        set: function (pallete) {
            var length = this.palleteData.length;
            this.palleteData.set(pallete.slice(0, length));
            this.remap();
        },
        enumerable: false,
        configurable: true
    });
    /** Apply pallete on source Bitmap */
    BitmapPallete.prototype.remap = function () {
        var _a = this, pixels = _a.bitmap.pixels, palleteData = _a.palleteData, palleteMap = _a.palleteMap;
        var i = pixels.length;
        while (i--)
            pixels[i] = palleteData[palleteMap[i]];
    };
    return BitmapPallete;
}());



/***/ }),

/***/ "./src/components.ts":
/*!***************************!*\
  !*** ./src/components.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   c2AnimatedBg: () => (/* binding */ c2AnimatedBg),
/* harmony export */   cAnimation: () => (/* binding */ cAnimation),
/* harmony export */   cInput: () => (/* binding */ cInput),
/* harmony export */   cInputRunner: () => (/* binding */ cInputRunner),
/* harmony export */   cPlayer: () => (/* binding */ cPlayer),
/* harmony export */   cPosition: () => (/* binding */ cPosition),
/* harmony export */   cShape: () => (/* binding */ cShape),
/* harmony export */   cSprite: () => (/* binding */ cSprite),
/* harmony export */   cVelocity: () => (/* binding */ cVelocity)
/* harmony export */ });
/* harmony import */ var _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecs/simple.ecs */ "./src/ecs/simple.ecs.ts");

console.debug("COMPONENTS: definitions");
var cPosition = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    x: 0,
    y: 0,
});
var cVelocity = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    vx: 0,
    vy: 0,
});
var cShape = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    w: 0,
    h: 0,
});
var cSprite = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    spriteIdx: 0,
    sprites: [],
    flipped: false,
    offsetX: 0,
    offsetY: 0
});
var cAnimation = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    animations: [[]],
    current: 0,
    length: 0,
    time: 0,
    coef: 0,
});
var cInput = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    keys: new Set(),
});
var cInputRunner = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    actions: new Set(),
    jumping: false,
    acceleration: 0,
});
var cPlayer = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    air: false,
    speed: 0,
    power: 0,
});
var c2AnimatedBg = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({});
// export const cWorld = new Component<{
//   time?: number,
//   width: number,
//   height: number,
//   gravity: number,
//   friction: number,
//   viewport: Bitmap,
// }>({
//   time: 0,
//   width: 0,
//   height: 0,
//   gravity: 0,
//   friction: 0,
//   viewport: new Bitmap(0, 0),
// });


/***/ }),

/***/ "./src/data/runner_stages.ts":
/*!***********************************!*\
  !*** ./src/data/runner_stages.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([
    {
        name: "MorningCity", bgwidth: 10, length: 2000,
        bgfill: 0xfff5ca75, fgfill: 0xff002200,
        bgrows: [
            { layout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xffe5aa45, 0xffeac770] },
            { layout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xffd59a55, 0xffb57a35] },
            { layout: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], offset: 2.5, speed: 2.0, colors: [0xff556622, 0x00000000, 0x00000000] },
            { layout: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], offset: 3.0, speed: 3.0, colors: [0xff445522, 0x00000000, 0x00000000] },
            { layout: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], offset: 3.5, speed: 3.5, colors: [0xff33312e, 0x00000000, 0x00000000] },
            { layout: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], offset: 4.0, speed: 4.0, colors: [0xff222120, 0xff303030, 0x00000000] },
        ],
    },
    {
        name: "SunsetCity", bgwidth: 10, length: 3000,
        bgfill: 0xff4499fd, fgfill: 0xff202122,
        bgrows: [
            { layout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xff3366ee, 0xff2244aa] },
            { layout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xff113388, 0xff2255bb] },
            { layout: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], offset: 2.5, speed: 2.0, colors: [0xff40424b, 0x00000000, 0x00000000] },
            { layout: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], offset: 3.0, speed: 3.0, colors: [0xff303236, 0xff206090, 0x00000000] },
            { layout: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], offset: 3.5, speed: 3.5, colors: [0xff28292b, 0xff206090, 0x00000000] },
            { layout: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], offset: 4.0, speed: 4.0, colors: [0xff202122, 0xff206090, 0x00000000] },
        ],
    },
    {
        name: "NightCity", bgwidth: 10, length: 5000,
        bgfill: 0xff361d20, fgfill: 0xff2b1b1b,
        bgrows: [
            { layout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], offset: 0.5, speed: 1.0, colors: [0x00000000, 0xff402026, 0xff6a3e4f] },
            { layout: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], offset: 0.0, speed: 2.0, colors: [0x00000000, 0xff683b46, 0xff321e1e] },
            { layout: [4, 4, 5, 4, 4, 4, 5, 4, 3, 3], offset: 2.5, speed: 2.0, colors: [0xff2b1b1b, 0x00000000, 0x00000000] },
            { layout: [5, 5, 4, 4, 4, 4, 5, 4, 4, 4], offset: 3.0, speed: 3.0, colors: [0xff2d1f1e, 0xff304090, 0x00000000] },
            { layout: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], offset: 3.5, speed: 3.5, colors: [0xff302422, 0xff5060a0, 0x00000000] },
            { layout: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], offset: 4.0, speed: 4.0, colors: [0xff362824, 0xff80a0f0, 0x00000000] },
        ],
    }
]);


/***/ }),

/***/ "./src/ecs/simple.ecs.ts":
/*!*******************************!*\
  !*** ./src/ecs/simple.ecs.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component: () => (/* binding */ Component),
/* harmony export */   EntityManager: () => (/* binding */ EntityManager),
/* harmony export */   System: () => (/* binding */ System)
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/* EntityManager */
var EntityManager = /** @class */ (function () {
    /** Create new Entity Manager
    * @param components components dictionary */
    function EntityManager(components) {
        this.components = components;
        this.idx = 0;
    }
    /** Add new entity with properties for components
    * @param components components entity have
    * @returns entity index */
    EntityManager.prototype.add = function (components) {
        var entries = Object.entries(components);
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var _a = entries_1[_i], componentName = _a[0], component = _a[1];
            this.components[componentName].set(this.idx, component);
        }
        return this.idx++;
    };
    /** Assign new properties for components for entity
    * @param idx entity index
    * @param components new components values
    * @returns entity index */
    EntityManager.prototype.set = function (idx, components) {
        var entries = Object.entries(this.components);
        for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
            var _a = entries_2[_i], componentName = _a[0], component = _a[1];
            component.set(idx, (components === null || components === void 0 ? void 0 : components[componentName]) || {});
        }
        return idx;
    };
    /** Build readonly object of all entity components
    * @param idx entity index
    * @returns readonly entity object */
    EntityManager.prototype.get = function (idx) {
        var entries = Object.entries(this.components);
        var result = {};
        for (var _i = 0, entries_3 = entries; _i < entries_3.length; _i++) {
            var _a = entries_3[_i], componentName = _a[0], component = _a[1];
            result[componentName] = component.get(idx);
        }
        return result;
    };
    /** Reset Entity Manager and remove all entities data */
    EntityManager.prototype.reset = function () {
        var components = Object.values(this.components);
        for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
            var component = components_1[_i];
            component.reset();
        }
        this.idx = 0;
    };
    return EntityManager;
}());

var Component = /** @class */ (function () {
    /** Create new Component
    * @param schema Plain object with properties */
    function Component(schema) {
        this.schema = schema;
        this.storage = Object.keys(schema).reduce(function (acc, key) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[key] = [], _a)));
        }, {});
    }
    /** Build readonly object of Component element
    * @param idx entity index
    * @returns readonly Component object */
    Component.prototype.get = function (idx) {
        var storage = this.storage;
        var element = {};
        for (var prop in storage)
            element[prop] = storage[prop][idx];
        return element;
    };
    /** Assign new values for Component element
    * @param idx entity index
    * @param data new values
    * @returns entity index */
    Component.prototype.set = function (idx, data) {
        var storage = this.storage;
        for (var prop in storage)
            storage[prop][idx] = data[prop] || this.schema[prop];
        return idx;
    };
    /** Reset Component storage */
    Component.prototype.reset = function () {
        var storage = this.storage;
        for (var prop in storage)
            storage[prop].length = 0;
    };
    return Component;
}());

var System = /** @class */ (function () {
    /** Create new System
    * @param components components to use in the System
    * @param handler callback with access to components */
    function System(components, handler) {
        this.components = components;
        this.handler = handler;
    }
    /** Create callback to execute the System
    * @param entityGroups array of entity groups assigned to the System
    * @returns callback */
    System.prototype.setup = function () {
        var _this = this;
        var entityGroups = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entityGroups[_i] = arguments[_i];
        }
        return function (dt) { return _this.handler.apply(_this, __spreadArray([dt, _this.components], entityGroups, false)); };
    };
    return System;
}());



/***/ }),

/***/ "./src/engine.ts":
/*!***********************!*\
  !*** ./src/engine.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Engine: () => (/* binding */ Engine),
/* harmony export */   TimeoutEngine: () => (/* binding */ TimeoutEngine),
/* harmony export */   WindowRafEngine: () => (/* binding */ WindowRafEngine)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var Engine = /** @class */ (function () {
    function Engine(rate, update, render, deltaCoef) {
        if (deltaCoef === void 0) { deltaCoef = 0.05; }
        this.rate = rate;
        this.update = update;
        this.render = render;
        this.deltaCoef = deltaCoef;
        this.timestamp = 0;
        this.running = false;
    }
    Engine.prototype.start = function () {
        if (this.running)
            return;
        this.running = true;
        this.tick();
    };
    Engine.prototype.stop = function () {
        this.running = false;
    };
    Engine.prototype.isRunning = function () {
        return this.running;
    };
    Engine.prototype.getTimestamp = function () {
        return this.timestamp;
    };
    Engine.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, dt, time;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.running) return [3 /*break*/, 2];
                        now = _utils__WEBPACK_IMPORTED_MODULE_0__.timeHelpers.now();
                        dt = (now - this.timestamp) * this.deltaCoef;
                        time = now * this.deltaCoef;
                        this.timestamp = now;
                        return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_0__.timeHelpers.sleep(this.rate)];
                    case 1:
                        _a.sent();
                        this.update(dt, time);
                        this.render(dt, time);
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return Engine;
}());

var TimeoutEngine = /** @class */ (function (_super) {
    __extends(TimeoutEngine, _super);
    function TimeoutEngine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeoutEngine.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, dt, time;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.running)
                    return [2 /*return*/];
                now = _utils__WEBPACK_IMPORTED_MODULE_0__.timeHelpers.now();
                dt = (now - this.timestamp) * this.deltaCoef;
                time = now * this.deltaCoef;
                this.timestamp = now;
                setTimeout(function () { return _this.tick(); }, this.rate);
                this.update(dt, time);
                this.render(dt, time);
                return [2 /*return*/];
            });
        });
    };
    return TimeoutEngine;
}(Engine));

var WindowRafEngine = /** @class */ (function (_super) {
    __extends(WindowRafEngine, _super);
    function WindowRafEngine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WindowRafEngine.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var step;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.running)
                    return [2 /*return*/];
                step = function (now) {
                    var dt = (now - _this.timestamp) * _this.deltaCoef;
                    var time = now * _this.deltaCoef;
                    _this.timestamp = now;
                    _this.update(dt, time);
                    _this.render(dt, time);
                    window.requestAnimationFrame(step);
                };
                step(_utils__WEBPACK_IMPORTED_MODULE_0__.timeHelpers.now());
                return [2 /*return*/];
            });
        });
    };
    return WindowRafEngine;
}(Engine));



/***/ }),

/***/ "./src/runnerGame.ts":
/*!***************************!*\
  !*** ./src/runnerGame.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./engine */ "./src/engine.ts");
/* harmony import */ var _bitmap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bitmap */ "./src/bitmap.ts");
/* harmony import */ var _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ecs/simple.ecs */ "./src/ecs/simple.ecs.ts");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components */ "./src/components.ts");
/* harmony import */ var _systems__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./systems */ "./src/systems.ts");
/* harmony import */ var _world__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./world */ "./src/world.ts");
/* harmony import */ var _stage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./stage */ "./src/stage.ts");
/* harmony import */ var _data_runner_stages__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./data/runner_stages */ "./src/data/runner_stages.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _assets_player_png__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../assets/player.png */ "./assets/player.png");
/* harmony import */ var _assets_backgrounds_houses_png__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../assets/backgrounds_houses.png */ "./assets/backgrounds_houses.png");
/* harmony import */ var _assets_backgrounds_png__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../assets/backgrounds.png */ "./assets/backgrounds.png");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};












/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var width, height, actions, screen, fps, screenCtx, screenImageData, viewport, _a, tilesPlayer, tilesHouses, tilesBg, spritesPlayer, spritesHouses, colors, palletesHouses, world, currentStage, stages, eManager, eSystems, ePlayer, createBuilding, eBuildings, collideBounds, collideShapes, platforms, move, draw, control, animate, _b, x, y, render, update, engine;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                width = config.width, height = config.height, actions = config.actions, screen = config.screen, fps = config.fps;
                screenCtx = screen.getContext("2d", {
                    alpha: false,
                    colorSpace: 'srgb',
                    willReadFrequently: true,
                });
                screenImageData = screenCtx.getImageData(0, 0, width, height);
                viewport = _bitmap__WEBPACK_IMPORTED_MODULE_1__.Bitmap.from(screenImageData.data.buffer, width, height);
                return [4 /*yield*/, _utils__WEBPACK_IMPORTED_MODULE_8__.fileHelpers.loadImagesAsTileableBitmaps([_assets_player_png__WEBPACK_IMPORTED_MODULE_9__["default"], 16, 16, 4, 1], [_assets_backgrounds_houses_png__WEBPACK_IMPORTED_MODULE_10__["default"], 48, 32, 5, 1], [_assets_backgrounds_png__WEBPACK_IMPORTED_MODULE_11__["default"], 32, 32, 6, 1])];
            case 1:
                _a = _c.sent(), tilesPlayer = _a[0], tilesHouses = _a[1], tilesBg = _a[2];
                spritesPlayer = tilesPlayer.split().concat(tilesPlayer.flipV().split());
                spritesHouses = [
                    tilesHouses.reorder([1, 0, 2, 2, 0, 1], 2, 3),
                    tilesHouses.reorder([2, 2, 1, 1, 1, 1], 2, 3),
                    tilesHouses.reorder([3, 4, 3, 1, 2, 2], 2, 3),
                    tilesHouses.reorder([2, 2, 2, 2, 0, 0, 0, 0], 4, 2),
                    tilesHouses.reorder([1, 2, 3, 1, 0, 2, 2, 0], 4, 2),
                    tilesHouses.reorder([3, 4, 1, 4, 1, 3, 2, 4], 4, 2),
                    tilesHouses.reorder([1, 1, 1, 1], 2, 2),
                    tilesHouses.reorder([3, 2, 1, 1], 2, 2),
                    tilesHouses.reorder([1, 2, 2, 1, 1, 2, 2, 1, 0, 2, 2, 0], 4, 3),
                    tilesHouses.reorder([2, 0, 1, 4, 2, 0, 1, 1, 0, 0, 0, 0], 4, 3),
                    tilesHouses.reorder([1, 1, 1, 1, 2, 2, 3, 3], 2, 4),
                    tilesHouses.reorder([2, 4, 3, 1, 2, 2, 1, 3, 0, 2, 0, 0, 3, 0, 0], 5, 3),
                    tilesHouses.reorder([0], 1, 1),
                ];
                colors = [0xff101010, 0xff303030, 0];
                palletesHouses = spritesHouses.map(function (sprite) { return new _bitmap__WEBPACK_IMPORTED_MODULE_1__.BitmapPallete(sprite); });
                palletesHouses.forEach(function (p) { return p.colors = colors; }); // TODO: remove
                world = new _world__WEBPACK_IMPORTED_MODULE_5__.World({
                    width: width,
                    height: height,
                    gravity: 0.5,
                    friction: 0.75,
                    skyColor: 0xffa09080,
                });
                stages = _data_runner_stages__WEBPACK_IMPORTED_MODULE_7__["default"].map(function (config) { return new _stage__WEBPACK_IMPORTED_MODULE_6__.Stage(world, config, tilesBg, tilesHouses); });
                // TODO: check what should be removed
                // TODO: make 0 - entry, 3 - morning, 4 - ending
                stages.forEach(function (stage, i) { return i > 0 && stages[i - 1].setNext(stage); });
                stages.forEach(function (stage, i) { return stage.onfinish(function (curr, next) {
                    currentStage = next;
                    console.debug("Switching ".concat(i));
                }); });
                currentStage = stages[0];
                stages[stages.length - 1].onfinish(function () {
                    window.alert("Дякую за увагу! Будьте щасливі!");
                    engine.stop();
                    // console.log("You win!");
                });
                eManager = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_2__.EntityManager(_components__WEBPACK_IMPORTED_MODULE_3__);
                eSystems = (0,_systems__WEBPACK_IMPORTED_MODULE_4__.Systems)(world, viewport);
                ePlayer = eManager.add({
                    cPosition: { x: 32, y: 64 },
                    cVelocity: { vx: 0, vy: 0 },
                    cShape: { w: 10, h: 14 },
                    cPlayer: { air: true, speed: 0.8, power: 6 },
                    cInputRunner: { actions: actions, jumping: false, acceleration: 0 },
                    cSprite: { spriteIdx: 0, sprites: spritesPlayer, offsetX: -3, offsetY: -2 },
                    cAnimation: { animations: [[0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2]], current: 0, length: 4, time: 0, coef: 0.4 },
                });
                createBuilding = function (spriteIdx, col, row) { return eManager.add({
                    cPosition: { x: col * 16, y: row * 20, },
                    cSprite: { spriteIdx: spriteIdx, sprites: spritesHouses },
                    cShape: { w: spritesHouses[spriteIdx].width, h: spritesHouses[spriteIdx].height },
                }); };
                eBuildings = [
                    // createBuilding(11, 0, 6),
                    createBuilding(0, 0, 5),
                    createBuilding(6, 8, 6),
                    createBuilding(1, 16, 5),
                    createBuilding(2, 24, 6),
                    createBuilding(1, 32, 6),
                    createBuilding(0, 40, 7),
                    createBuilding(7, 48, 5),
                    // createBuilding(3,  24, 6),
                ];
                collideBounds = eSystems.sCollideBounds.setup([ePlayer]);
                collideShapes = eSystems.sCollideShapes.setup([ePlayer], eBuildings);
                platforms = eSystems.sBuildingsRunner.setup(eBuildings);
                move = eSystems.sMovement.setup([ePlayer]);
                draw = eSystems.sDrawing.setup(__spreadArray([ePlayer], eBuildings, true));
                control = eSystems.sControllerRunner.setup([ePlayer]);
                animate = eSystems.sAnimation.setup([ePlayer]);
                _b = _components__WEBPACK_IMPORTED_MODULE_3__.cPosition.storage, x = _b.x, y = _b.y;
                render = function (dt, time) {
                    currentStage.renderBg(dt, viewport);
                    animate(dt);
                    draw(dt);
                    screenCtx.putImageData(screenImageData, 0, 0);
                };
                update = function (dt, time) {
                    currentStage.update(dt);
                    // if (y[ePlayer] > 200) { // reset player
                    //   x[ePlayer] = 32;
                    //   y[ePlayer] = 64;
                    // }
                    platforms(dt),
                        move(dt);
                    collideBounds(dt);
                    collideShapes(dt);
                    control(dt);
                };
                engine = new _engine__WEBPACK_IMPORTED_MODULE_0__.WindowRafEngine(fps, update, render, 60 / 1000);
                return [2 /*return*/, { engine: engine }];
        }
    });
}); });


/***/ }),

/***/ "./src/stage.ts":
/*!**********************!*\
  !*** ./src/stage.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Stage: () => (/* binding */ Stage)
/* harmony export */ });
/* harmony import */ var _bitmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bitmap */ "./src/bitmap.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");


var Stage = /** @class */ (function () {
    function Stage(world, config, bgTiles, fgTiles) {
        var bgfill = config.bgfill, fgfill = config.fgfill, bgwidth = config.bgwidth, bgrows = config.bgrows, length = config.length;
        this.world = world;
        this.config = config;
        this.bgFill = bgfill;
        this.fgFill = fgfill;
        this.width = bgwidth * bgTiles.twidth;
        this.progress = length;
        this.handlers = {
            onstart: function () { },
            onfinish: function () { },
        };
        this.bgRows = [];
        var speedQuickFix = 0.5; // TODO: remove, handle properly, later ofc
        for (var i = 0; i < bgrows.length; i++) {
            var _a = bgrows[i], layout = _a.layout, colors = _a.colors, offset = _a.offset, speed = _a.speed;
            var sprite = bgTiles.reorder(layout.concat(layout), bgwidth * 2, 1);
            var pallete = new _bitmap__WEBPACK_IMPORTED_MODULE_0__.BitmapPallete(sprite);
            pallete.colors = colors;
            this.bgRows[i] = { sprite: sprite, pallete: pallete, speed: speed * speedQuickFix, shift: 0, offset: offset * sprite.theight };
        }
    }
    Stage.prototype.update = function (dt) {
        var _this = this;
        this.progress -= dt;
        if (this.progress <= 100 && !this.bgFadeoutTimer) {
            this.bgFadeoutTimer = setInterval(function () { return _this.interpolateBgPallete((100 - _this.progress) / 100); }, 100);
        }
        if (this.progress <= 0) {
            this.finish();
            this.next.start();
            return;
        }
    };
    Stage.prototype.renderBg = function (dt, viewport) {
        var _a = this, width = _a.width, bgRows = _a.bgRows, bgFill = _a.bgFill;
        viewport.fill(bgFill);
        for (var _i = 0, bgRows_1 = bgRows; _i < bgRows_1.length; _i++) {
            var row = bgRows_1[_i];
            row.shift -= row.speed * dt;
            if (-width >= row.shift)
                row.shift = 0;
            viewport.draw(row.sprite, Math.round(row.shift), row.offset);
        }
    };
    Stage.prototype.renderFg = function (dt, viewport) {
    };
    Stage.prototype.interpolateBgPallete = function (step) {
        if (!this.next)
            return;
        var _a = this.config, sbgrows = _a.bgrows, sbgfill = _a.bgfill;
        var _b = this.next.config, dbgrows = _b.bgrows, dbgfill = _b.bgfill;
        this.bgFill = _utils__WEBPACK_IMPORTED_MODULE_1__.colorHelpers.interpolate(sbgfill, dbgfill, step);
        this.bgRows.forEach(function (row, i) {
            var spal = sbgrows[i].colors;
            var dpal = dbgrows[i].colors;
            var colors = spal.map(function (_, j) { return _utils__WEBPACK_IMPORTED_MODULE_1__.colorHelpers.interpolate(spal[j], dpal[j], step); });
            row.pallete.colors = colors;
        });
    };
    Stage.prototype.setNext = function (stage) {
        this.next = stage;
        var _a = _utils__WEBPACK_IMPORTED_MODULE_1__.colorHelpers.calccoefs(_utils__WEBPACK_IMPORTED_MODULE_1__.colorHelpers.hex2abgr(this.config.bgfill), _utils__WEBPACK_IMPORTED_MODULE_1__.colorHelpers.hex2abgr(stage.config.bgfill)), _ = _a[0], B = _a[1], G = _a[2], R = _a[3];
        // TODO: no need for now. interpolation is used for all rows
        this.bgFadeoutCoefs = [B, G, R];
    };
    Stage.prototype.start = function () {
        this.handlers.onstart(this, this.next);
        clearInterval(this.bgFadeoutTimer);
        console.debug("Start: ".concat(this.config.name));
    };
    Stage.prototype.finish = function () {
        this.handlers.onfinish(this, this.next);
        clearInterval(this.bgFadeoutTimer);
        console.debug("Finish: ".concat(this.config.name));
    };
    Stage.prototype.onstart = function (cb) { this.handlers.onstart = cb; };
    Stage.prototype.onfinish = function (cb) { this.handlers.onfinish = cb; };
    return Stage;
}());



/***/ }),

/***/ "./src/systems.ts":
/*!************************!*\
  !*** ./src/systems.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Systems: () => (/* binding */ Systems)
/* harmony export */ });
/* harmony import */ var _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ecs/simple.ecs */ "./src/ecs/simple.ecs.ts");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components */ "./src/components.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");



var rectangle = _utils__WEBPACK_IMPORTED_MODULE_2__.collisionHelpers.rectangle, bounds = _utils__WEBPACK_IMPORTED_MODULE_2__.collisionHelpers.bounds;
function Systems(world, viewport) {
    console.debug("SYSYEMS: initialization");
    var width = world.width, height = world.height;
    return {
        /* Collide entities with world bounds */
        sCollideBounds: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cShape: _components__WEBPACK_IMPORTED_MODULE_1__.cShape, cPlayer: _components__WEBPACK_IMPORTED_MODULE_1__.cPlayer }, function (_, comp, entities) {
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var _c = comp.cShape.storage, w = _c.w, h = _c.h;
            var air = comp.cPlayer.storage.air;
            for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
                var e = entities_1[_i];
                var eRight = x[e] + w[e];
                var eBottom = y[e] + h[e];
                var collisionSide = bounds(x[e], y[e], eRight, eBottom, 0, 0, width, height);
                if (collisionSide == _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.None)
                    continue;
                switch (collisionSide) {
                    case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Bottom:
                        x[e] = 32;
                        y[e] = 32;
                        break;
                    case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Left:
                        vx[e] = 0;
                        x[e] = 0;
                        break;
                    case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Right:
                        vx[e] = 0;
                        x[e] = width - w[e];
                        break;
                    case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Top:
                        vy[e] = 1;
                        y[e] = 0;
                        break;
                }
            }
        }),
        /* Collide entities from groupA with entities from groupB */
        sCollideShapes: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cShape: _components__WEBPACK_IMPORTED_MODULE_1__.cShape, cPlayer: _components__WEBPACK_IMPORTED_MODULE_1__.cPlayer }, function (_, comp, entities, blocks) {
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var _c = comp.cShape.storage, w = _c.w, h = _c.h;
            var air = comp.cPlayer.storage.air;
            for (var _i = 0, entities_2 = entities; _i < entities_2.length; _i++) {
                var e = entities_2[_i];
                var eRight = x[e] + w[e];
                var eBottom = y[e] + h[e];
                var totalCollisions = 0;
                for (var _d = 0, blocks_1 = blocks; _d < blocks_1.length; _d++) {
                    var b = blocks_1[_d];
                    if (totalCollisions > 2)
                        break;
                    var bRight = x[b] + w[b];
                    var bBottom = y[b] + h[b];
                    var collisionSide = rectangle(x[e], y[e], eRight, eBottom, x[b], y[b], bRight, bBottom);
                    if (collisionSide === _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.None)
                        continue;
                    totalCollisions++;
                    switch (collisionSide) {
                        case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Bottom:
                            vy[e] = 0;
                            y[e] = y[b] - h[e];
                            air[e] = false;
                            break;
                        case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Right:
                            vx[e] = 0;
                            x[e] = x[b] - w[e] - 0.01;
                            break;
                        case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Left:
                            vx[e] = 0;
                            x[e] = bRight + 0.01;
                            break;
                        case _utils__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Top:
                            vy[e] = 1;
                            y[e] = bBottom;
                            break;
                    }
                }
            }
        }),
        /* Move entity using velocity values */
        sMovement: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cPlayer: _components__WEBPACK_IMPORTED_MODULE_1__.cPlayer }, function (dt, comp, entities) {
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var air = comp.cPlayer.storage.air;
            var friction = world.friction, gravity = world.gravity;
            for (var _i = 0, entities_3 = entities; _i < entities_3.length; _i++) {
                var e = entities_3[_i];
                x[e] += vx[e] * dt;
                y[e] += vy[e] * dt;
                // TODO: think to move it separately, to avoid dependency with cPlayer.air
                vx[e] *= friction;
                vy[e] += gravity;
            }
        }),
        /* Render frame of spritesheet by index */
        sDrawing: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cSprite: _components__WEBPACK_IMPORTED_MODULE_1__.cSprite, cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition }, function (_, comp, entities) {
            var _a = comp.cSprite.storage, sprites = _a.sprites, spriteIdx = _a.spriteIdx, flipped = _a.flipped, offsetX = _a.offsetX, offsetY = _a.offsetY;
            var _b = comp.cPosition.storage, x = _b.x, y = _b.y;
            for (var _i = 0, entities_4 = entities; _i < entities_4.length; _i++) {
                var e = entities_4[_i];
                var half = sprites[e].length / 2;
                var idx = flipped[e] ? spriteIdx[e] + half : spriteIdx[e];
                viewport.draw(sprites[e][idx], Math.round(offsetX[e] + x[e]), Math.round(offsetY[e] + y[e]));
            }
        }),
        /* Calculate next frame needed to draw */
        sAnimation: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation, cSprite: _components__WEBPACK_IMPORTED_MODULE_1__.cSprite }, function (dt, comp, entities) {
            var _a = comp.cAnimation.storage, animations = _a.animations, current = _a.current, length = _a.length, time = _a.time, coef = _a.coef;
            var spriteIdx = comp.cSprite.storage.spriteIdx;
            for (var _i = 0, entities_5 = entities; _i < entities_5.length; _i++) {
                var e = entities_5[_i];
                var frameTime = (time[e] + dt * coef[e]) % length[e];
                spriteIdx[e] = animations[e][current[e]][frameTime | 0];
                time[e] = frameTime;
            }
        }),
        /* Listen for user input */
        sController: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cInput: _components__WEBPACK_IMPORTED_MODULE_1__.cInput, cSprite: _components__WEBPACK_IMPORTED_MODULE_1__.cSprite, cPlayer: _components__WEBPACK_IMPORTED_MODULE_1__.cPlayer, cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation }, function (_, comp, entities) {
            var flipped = comp.cSprite.storage.flipped;
            var current = comp.cAnimation.storage.current;
            var keys = comp.cInput.storage.keys;
            var _a = comp.cVelocity.storage, vx = _a.vx, vy = _a.vy;
            var _b = comp.cPlayer.storage, air = _b.air, speed = _b.speed;
            for (var _i = 0, entities_6 = entities; _i < entities_6.length; _i++) {
                var e = entities_6[_i];
                if (!keys[e].size) {
                    current[e] = air[e] ? 2 : 0;
                    continue;
                }
                if (keys[e].has("KeyQ"))
                    vx[e] -= speed[e], current[e] = 1, flipped[e] = true;
                else if (keys[e].has("KeyW"))
                    vx[e] += speed[e], current[e] = 1, flipped[e] = false;
                if (keys[e].has("KeyP"))
                    !air[e] && (air[e] = true, vy[e] = -10);
            }
        }),
        /* Listen for user input for runner mode */
        sControllerRunner: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cInputRunner: _components__WEBPACK_IMPORTED_MODULE_1__.cInputRunner, cPlayer: _components__WEBPACK_IMPORTED_MODULE_1__.cPlayer, cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation }, function (_, comp, entities) {
            var _a = comp.cAnimation.storage, current = _a.current, coef = _a.coef;
            var _b = comp.cInputRunner.storage, actions = _b.actions, jumping = _b.jumping;
            var _c = comp.cVelocity.storage, vx = _c.vx, vy = _c.vy;
            var _d = comp.cPlayer.storage, air = _d.air, speed = _d.speed, power = _d.power;
            for (var _i = 0, entities_7 = entities; _i < entities_7.length; _i++) {
                var e = entities_7[_i];
                if (!actions[e].size) {
                    current[e] = air[e] ? 2 : 1;
                    coef[e] = 0.24;
                    if (air[e] == false)
                        jumping[e] = false;
                    continue;
                }
                if (actions[e].has("Jump")) {
                    if (!jumping[e] && !air[e]) {
                        jumping[e] = true;
                        air[e] = true;
                        vy[e] = -power[e];
                    }
                }
                else if (air[e] == false)
                    jumping[e] = false;
                if (actions[e].has("Left"))
                    vx[e] -= speed[e], coef[e] = 0.12, current[e] = 1;
                else if (actions[e].has("Right"))
                    vx[e] += speed[e], coef[e] = 0.48, current[e] = 1;
            }
        }),
        /* Generate platforms */
        sBuildingsRunner: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cShape: _components__WEBPACK_IMPORTED_MODULE_1__.cShape }, function (dt, comp, entities) {
            var speed = 1.5;
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cShape.storage, w = _b.w, h = _b.h;
            for (var _i = 0, entities_8 = entities; _i < entities_8.length; _i++) {
                var e = entities_8[_i];
                x[e] -= speed * dt;
                // no replace if still visible
                if (x[e] >= -w[e])
                    continue;
                x[e] += width + w[e];
                //const [dx, dy] = platformPlacer(x[e], y[e], w[e], h[e], e);
                // x[e] += width + w[e] + dx;
                // y[e] += dy;
            }
        }),
    };
}


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollisionSide: () => (/* binding */ CollisionSide),
/* harmony export */   benchmark: () => (/* binding */ benchmark),
/* harmony export */   collisionHelpers: () => (/* binding */ collisionHelpers),
/* harmony export */   colorHelpers: () => (/* binding */ colorHelpers),
/* harmony export */   fileHelpers: () => (/* binding */ fileHelpers),
/* harmony export */   timeHelpers: () => (/* binding */ timeHelpers)
/* harmony export */ });
/* harmony import */ var _bitmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bitmap */ "./src/bitmap.ts");

var fileHelpers = {
    loadImage: function (src) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () {
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                var width = image.width, height = image.height;
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0);
                var imageData = context.getImageData(0, 0, width, height);
                return resolve({ width: width, height: height, data: imageData.data.buffer });
            };
            image.onerror = function (err) {
                console.error("Error loading image:", err);
                reject(err);
            };
            image.src = src;
        });
    },
    loadImageAsBitmap: function (src) {
        return fileHelpers
            .loadImage(src)
            .then(function (img) { return _bitmap__WEBPACK_IMPORTED_MODULE_0__.Bitmap.from(img.data, img.width, img.height); })
            .catch(function (err) {
            console.error("Error loading bitmap:", src);
            throw err;
        });
    },
    loadImagesAsTileableBitmaps: function () {
        var configs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            configs[_i] = arguments[_i];
        }
        return Promise.all(configs.map(function (_a) {
            var src = _a[0], w = _a[1], h = _a[2], c = _a[3], r = _a[4];
            return fileHelpers
                .loadImage(src)
                .then(function (img) { return _bitmap__WEBPACK_IMPORTED_MODULE_0__.TileableBitmap.from(img.data, w, h, c, r); })
                .catch(function (err) {
                console.error("Error loading tileable bitmap:", src, err);
                return _bitmap__WEBPACK_IMPORTED_MODULE_0__.TileableBitmap.from(new ArrayBuffer(w * h), w, h, c, r);
            });
        }));
    },
};
var colorHelpers = {
    hex2abgr: function (hex) { return ([hex >>> 24 & 0xff, hex >>> 16 & 0xff, hex >>> 8 & 0xff, hex & 0xff]); },
    abgr2hex: function (_a) {
        var a = _a[0], b = _a[1], g = _a[2], r = _a[3];
        return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
    },
    hexadjust: function (hex, _a) {
        var A = _a[0], B = _a[1], G = _a[2], R = _a[3];
        var _b = colorHelpers.hex2abgr(hex), a = _b[0], b = _b[1], g = _b[2], r = _b[3];
        return colorHelpers.abgr2hex([Math.min(a * A, 255), Math.min(b * B, 255), Math.min(g * G, 255), Math.min(r * R, 255)]);
    },
    calccoefs: function (colora, colorb, K) {
        if (K === void 0) { K = 1; }
        var A = colora[0] == 0 ? 255 : colorb[0] / colora[0] * K;
        var B = colora[1] == 0 ? 255 : colorb[1] / colora[1] * K;
        var G = colora[2] == 0 ? 255 : colorb[2] / colora[2] * K;
        var R = colora[3] == 0 ? 255 : colorb[3] / colora[3] * K;
        return [A, B, G, R];
    },
    interpolate: function (hexa, hexb, step) {
        var colora = colorHelpers.hex2abgr(hexa);
        var colorb = colorHelpers.hex2abgr(hexb);
        var a = colora[0] + (colorb[0] - colora[0]) * step | 0;
        var b = colora[1] + (colorb[1] - colora[1]) * step | 0;
        var g = colora[2] + (colorb[2] - colora[2]) * step | 0;
        var r = colora[3] + (colorb[3] - colora[3]) * step | 0;
        return colorHelpers.abgr2hex([a, b, g, r]);
    }
};
// timeHelpers
var timeHelpers = {
    sleep: function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    },
    now: function () {
        return performance.now();
    }
};
// colision helpers
var CollisionSide;
(function (CollisionSide) {
    CollisionSide["None"] = "none";
    CollisionSide["Left"] = "left";
    CollisionSide["Right"] = "right";
    CollisionSide["Top"] = "top";
    CollisionSide["Bottom"] = "bottom";
})(CollisionSide || (CollisionSide = {}));
var collisionHelpers = {
    circle: function (x0, y0, d0, x1, y1, d1) {
        var dist = Math.sqrt(Math.pow((x1 - x0), 2) +
            Math.pow((y1 - y0), 2));
        return dist <= (d0 + d1);
    },
    rectangle: function (x0, y0, r0, b0, x1, y1, r1, b1) {
        if (x0 > r1 || x1 > r0 || y0 > b1 || y1 > b0)
            return CollisionSide.None;
        var dx = Math.min(r0 - x1, r1 - x0);
        var dy = Math.min(b0 - y1, b1 - y0);
        return dx < dy
            ? x0 > x1 ? CollisionSide.Left : CollisionSide.Right
            : y0 > y1 ? CollisionSide.Top : CollisionSide.Bottom;
    },
    bounds: function (x0, y0, r0, b0, bl, bt, br, bb) {
        if (y0 < bt)
            return CollisionSide.Top;
        if (b0 > bb)
            return CollisionSide.Bottom;
        if (x0 < bl)
            return CollisionSide.Left;
        if (r0 > br)
            return CollisionSide.Right;
        return CollisionSide.None;
    },
};
// benchmark tools
var benchmark = function (name, calcMiddleRate, fixedDigit) {
    if (name === void 0) { name = "default"; }
    if (calcMiddleRate === void 0) { calcMiddleRate = 10; }
    if (fixedDigit === void 0) { fixedDigit = 4; }
    var minimumtime = Infinity;
    var maximumtime = 0;
    var lasttime = 0;
    var calcMiddleIter = calcMiddleRate;
    var history = [];
    var middles = [];
    var A = function () { return lasttime = performance.now(); };
    var B = function () {
        var dt = performance.now() - lasttime;
        if (dt <= 0 && dt >= Infinity) {
            console.log("lol", dt);
            return;
        }
        calcMiddleIter--;
        history.push(dt);
        if (minimumtime > dt)
            minimumtime = dt;
        if (maximumtime < dt)
            maximumtime = dt;
        if (calcMiddleIter > 0)
            return;
        calcMiddleIter = calcMiddleRate;
        middles.push(middle(history));
        clear();
    };
    var fps = function (time) { return 1 / (time * 0.001); };
    var clear = function () { return history.length = 0; };
    var middle = function (arr) { return arr.reduce(function (acc, v) { return acc += v; }, 0) / arr.length; };
    var fixed = function (num) { return +num.toFixed(fixedDigit); };
    var filter = function (num) { return num > 0 && num < Infinity; };
    var resultsTime = function () { return ({
        name: name,
        min: fixed(minimumtime),
        max: fixed(maximumtime),
        middles: middles.filter(filter).map(fixed),
    }); };
    var resultsFps = function () { return ({
        name: name,
        maxFps: fixed(fps(minimumtime)),
        minFps: fixed(fps(maximumtime)),
        fps: fixed(fps(middle(middles))),
        middlesFps: middles.filter(filter).map(fps).map(fixed),
    }); };
    return { A: A, B: B, resultsTime: resultsTime, resultsFps: resultsFps };
};


/***/ }),

/***/ "./src/world.ts":
/*!**********************!*\
  !*** ./src/world.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   World: () => (/* binding */ World)
/* harmony export */ });
var World = /** @class */ (function () {
    function World(_a) {
        var width = _a.width, height = _a.height, gravity = _a.gravity, friction = _a.friction, skyColor = _a.skyColor;
        this.width = width;
        this.height = height;
        this.gravity = gravity;
        this.friction = friction;
        this.skyColor = skyColor;
        this.time = 0;
    }
    return World;
}());



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug)
/* harmony export */ });
/* harmony import */ var _runnerGame__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./runnerGame */ "./src/runnerGame.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var debug = {};
window.addEventListener("load", function () { return __awaiter(void 0, void 0, void 0, function () {
    var debugEl, width, height, screen, overlay, buttons, actions, actionsMapping, _i, buttons_1, btn, game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                debugEl = document.getElementById("debug");
                debug.set = function () {
                    var msg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        msg[_i] = arguments[_i];
                    }
                    return (debugEl.innerHTML = msg.join(", "));
                };
                debug.add = function () {
                    var msg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        msg[_i] = arguments[_i];
                    }
                    return (debugEl.innerHTML += "<br>" + msg.join(", "));
                };
                width = 320;
                height = 160;
                console.log(document);
                screen = document.getElementById("screen");
                overlay = document.getElementById("overlay");
                overlay.set = function () {
                    var msg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        msg[_i] = arguments[_i];
                    }
                    return (debugEl.innerHTML = msg.join("<br>"));
                };
                overlay.add = function () {
                    var msg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        msg[_i] = arguments[_i];
                    }
                    return (debugEl.innerHTML += msg.join("<br>"));
                };
                buttons = [
                    document.getElementById("btn-left"),
                    document.getElementById("btn-right"),
                    document.getElementById("btn-jump"),
                ];
                screen.width = width;
                screen.height = height;
                actions = new Set();
                actionsMapping = {
                    KeyQ: "Left", KeyW: "Right", KeyP: "Jump",
                    KeyA: "Left", KeyD: "Right", Space: "Jump",
                    ArrowLeft: "Left", ArrowRight: "Right", ArrowUp: "Jump",
                    "btn-left": "Left", "btn-right": "Right", "btn-jump": "Jump",
                };
                window.addEventListener("keydown", function (_a) {
                    var code = _a.code;
                    return actionsMapping[code] && actions.add(actionsMapping[code]);
                });
                window.addEventListener("keyup", function (_a) {
                    var code = _a.code;
                    return actionsMapping[code] && actions.delete(actionsMapping[code]);
                });
                for (_i = 0, buttons_1 = buttons; _i < buttons_1.length; _i++) {
                    btn = buttons_1[_i];
                    btn.addEventListener("touchstart", function (_a) {
                        var id = _a.target.id;
                        return actionsMapping[id] && actions.add(actionsMapping[id]);
                    });
                    btn.addEventListener("touchend", function (_a) {
                        var id = _a.target.id;
                        return actionsMapping[id] && actions.delete(actionsMapping[id]);
                    });
                    btn.addEventListener("mousedown", function (_a) {
                        var id = _a.target.id;
                        return actionsMapping[id] && actions.add(actionsMapping[id]);
                    });
                    btn.addEventListener("mouseup", function (_a) {
                        var id = _a.target.id;
                        return actionsMapping[id] && actions.delete(actionsMapping[id]);
                    });
                }
                ;
                return [4 /*yield*/, (0,_runnerGame__WEBPACK_IMPORTED_MODULE_0__["default"])({ screen: screen, overlay: overlay, width: width, height: height, actions: actions, fps: 1000 / 60 })];
            case 1:
                game = _a.sent();
                game.engine.start();
                console.log("INITIALIZED");
                return [2 /*return*/];
        }
    });
}); });

})();

/******/ })()
;
//# sourceMappingURL=main.js.map