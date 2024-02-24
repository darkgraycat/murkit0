/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/adapter.ts":
/*!************************!*\
  !*** ./src/adapter.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Adapter: () => (/* binding */ Adapter)
/* harmony export */ });
var Adapter = /** @class */ (function () {
    function Adapter() {
    }
    /** Load image
    * @param src URI
    * @returns image
    * */
    Adapter.prototype.loadImage = function (src) {
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
            image.onerror = function (error) {
                console.error("ADAPTER: Error loading image:", src);
                reject(error);
            };
            image.src = src;
        });
    };
    /** Pause execution
    * @param ms period in milliseconds
    * */
    Adapter.prototype.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /** Get current time in milliseconds
    * @returns time
    * */
    Adapter.prototype.now = function () {
        return performance.now();
    };
    return Adapter;
}());



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
    Object.defineProperty(BitmapPallete.prototype, "pallete", {
        /** Get pallete as array of numbers
        * @returns colors */
        get: function () {
            return Array.from(this.palleteData);
        },
        /** Set new pallete and apply on source Bitmap
        * @param pallete new pallete to apply */
        set: function (pallete) {
            this.palleteData.set(pallete);
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
/* harmony export */   cAnimation: () => (/* binding */ cAnimation),
/* harmony export */   cInput: () => (/* binding */ cInput),
/* harmony export */   cMeta: () => (/* binding */ cMeta),
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
var cMeta = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.Component({
    air: false,
    speed: 0,
});
// export const cAnimatedBg = new Component<{ x: number, w: number, vx: number, lastx?: number }>({
//   x: 0,
//   w: 0,
//   vx: 0,
//   lastx: 0,
// });
// 
// // TODO: investigate possibility of using world as a component
// export const cWorld = new Component<{
//   width: number,
//   height: number,
//   gravity: number,
//   friction: number,
//   viewport: Bitmap,
// }>({
//   width: 0,
//   height: 0,
//   gravity: 0,
//   friction: 0,
//   viewport: new Bitmap(0, 0),
// });


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
    * @param components new components values */
    EntityManager.prototype.set = function (idx, components) {
        var entries = Object.entries(this.components);
        for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
            var _a = entries_2[_i], componentName = _a[0], component = _a[1];
            component.set(idx, (components === null || components === void 0 ? void 0 : components[componentName]) || {});
        }
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
/* harmony export */   Engine: () => (/* binding */ Engine)
/* harmony export */ });
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
    function Engine(adapter, rate, update, render, deltaCoef) {
        if (deltaCoef === void 0) { deltaCoef = 0.05; }
        this.adapter = adapter;
        this.rate = rate;
        this.update = update;
        this.render = render;
        this.deltaCoef = deltaCoef;
        this.timestamp = 0;
        this.running = false;
    }
    Engine.prototype.tick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var time, dt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.running) return [3 /*break*/, 2];
                        time = this.adapter.now();
                        dt = (time - this.timestamp) * this.deltaCoef;
                        this.timestamp = this.adapter.now();
                        // calc next interval
                        return [4 /*yield*/, this.adapter.sleep(this.rate)];
                    case 1:
                        // calc next interval
                        _a.sent();
                        this.update(dt);
                        this.render(dt);
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Engine.prototype.tickTimeout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var time, dt;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.running)
                    return [2 /*return*/];
                time = this.adapter.now();
                dt = (time - this.timestamp) * this.deltaCoef;
                this.timestamp = this.adapter.now();
                this.update(dt);
                this.render(dt);
                setTimeout(function () { return _this.tick(); }, this.rate);
                return [2 /*return*/];
            });
        });
    };
    Engine.prototype.start = function () {
        if (this.running)
            return;
        this.running = true;
        this.tick();
        //this.tickTimeout();
    };
    Engine.prototype.stop = function () {
        this.running = false;
    };
    return Engine;
}());



/***/ }),

/***/ "./src/entities.ts":
/*!*************************!*\
  !*** ./src/entities.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Entities: () => (/* binding */ Entities)
/* harmony export */ });
/* harmony import */ var _bitmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bitmap */ "./src/bitmap.ts");
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
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


// TODO: I dont like this function at all, added temporary
function Entities(em, world, adapter, keys) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, playerTiles, blockTiles, bgTiles, houseTiles, playerSprites, blockSprites, bgSprites, houseSprites, animatedBgLength, animatedBgLayers, animatedBgPalletes, animatedFgOrder, animatedFgOrder2, animatedFgLayers, animatedFgPalletes, playerEntity, createPlatformEntity, createAnimatedBgEntity, animatedBgLayersEntities, createAnimatedFgEntity, animatedFgLayersEntities;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.debug("ENTITIES: load assets");
                    return [4 /*yield*/, (0,_helpers__WEBPACK_IMPORTED_MODULE_1__.bulkTileableBitmapLoad)(adapter, ["./assets/player.png", 16, 16, 4, 1], ["./assets/platforms.png", 16, 16, 4, 1], ["./assets/backgrounds.png", 32, 32, 6, 1], ["./assets/backgrounds_houses.png", 48, 32, 5, 1])];
                case 1:
                    _a = _b.sent(), playerTiles = _a[0], blockTiles = _a[1], bgTiles = _a[2], houseTiles = _a[3];
                    console.debug("ENTITIES: build graphics");
                    playerSprites = playerTiles.split().concat(playerTiles.flipV().split());
                    blockSprites = blockTiles.split();
                    bgSprites = bgTiles.split();
                    houseSprites = houseTiles.split();
                    animatedBgLength = 20;
                    animatedBgLayers = [
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(0), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(0), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(2), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(1), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(4), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(5), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(5), animatedBgLength, 1),
                        bgTiles.reorder(Array.from({ length: animatedBgLength }).fill(5), animatedBgLength, 1),
                    ];
                    animatedBgPalletes = animatedBgLayers.map(function (bitmap) { return new _bitmap__WEBPACK_IMPORTED_MODULE_0__.BitmapPallete(bitmap); });
                    animatedFgOrder = [9, 9, 2, 9, 9, 3, 9, 9];
                    animatedFgOrder2 = [9, 9, 0, 9, 9, 0, 9, 9];
                    animatedFgLayers = [
                        houseTiles.reorder(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], animatedFgOrder, true), animatedFgOrder, true), animatedFgOrder2, true), animatedFgOrder2, true), animatedFgOrder, true), animatedFgOrder, true), animatedFgOrder2, true), animatedFgOrder2, true), 16, 4),
                    ];
                    animatedFgPalletes = animatedFgLayers.map(function (bitmap) { return new _bitmap__WEBPACK_IMPORTED_MODULE_0__.BitmapPallete(bitmap); });
                    console.debug("ENTITIES: define entities");
                    playerEntity = em.add({
                        cPosition: { x: 32, y: 128 },
                        cVelocity: { vx: 0, vy: 0 },
                        cShape: { w: 10, h: 14 },
                        cMeta: { air: true, speed: 0.4 },
                        cInput: { keys: keys },
                        cSprite: { spriteIdx: 0, sprites: playerSprites, offsetX: -3, offsetY: -2 },
                        cAnimation: {
                            animations: [[0, 0, 3, 3], [1, 2, 3, 0], [1, 1, 2, 2]],
                            current: 0,
                            length: 4,
                            time: 0,
                            coef: 0.4,
                        },
                    });
                    createPlatformEntity = function (spriteIdx, x, y) { return em.add({}); };
                    createAnimatedBgEntity = function (spriteIdx, alt, speed) { return em.add({
                        cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
                        cSprite: { sprites: animatedBgLayers, spriteIdx: spriteIdx, offsetX: 0, offsetY: alt * 16 },
                    }); };
                    animatedBgLayersEntities = [
                        createAnimatedBgEntity(2, 4, -1.0),
                        createAnimatedBgEntity(3, 5, -1.5),
                        createAnimatedBgEntity(4, 6, -2.0),
                        createAnimatedBgEntity(5, 7, -2.5),
                        createAnimatedBgEntity(6, 8, -3.0),
                        createAnimatedBgEntity(7, 9, -3.5),
                        createAnimatedBgEntity(0, 2, -1.0),
                        createAnimatedBgEntity(1, 1, -1.5),
                        createAnimatedBgEntity(0, 0, -2.0),
                    ];
                    createAnimatedFgEntity = function (spriteIdx, alt, speed) { return em.add({
                        cAnimation: { animations: [[0]], current: 0, length: 0, time: 0, coef: speed },
                        cSprite: { sprites: animatedFgLayers, spriteIdx: spriteIdx, offsetX: 0, offsetY: alt * 16 },
                    }); };
                    animatedFgLayersEntities = [createAnimatedFgEntity(0, 5, -3)];
                    return [2 /*return*/, {
                            // return graphics, just in case
                            tiles: { playerTiles: playerTiles, blockTiles: blockTiles, bgTiles: bgTiles, houseTiles: houseTiles },
                            sprites: { playerSprites: playerSprites, blockSprites: blockSprites, bgSprites: bgSprites, houseSprites: houseSprites },
                            fgBgLayers: { animatedFgLayers: animatedFgLayers, animatedFgPalletes: animatedFgPalletes, animatedBgLayers: animatedBgLayers, animatedBgPalletes: animatedBgPalletes },
                            // entities
                            playerEntity: playerEntity,
                            animatedFgLayersEntities: animatedFgLayersEntities,
                            animatedBgLayersEntities: animatedBgLayersEntities,
                        }];
            }
        });
    });
}


/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollisionSide: () => (/* binding */ CollisionSide),
/* harmony export */   bulkTileableBitmapLoad: () => (/* binding */ bulkTileableBitmapLoad),
/* harmony export */   collision: () => (/* binding */ collision),
/* harmony export */   createStaticDrawableEntity: () => (/* binding */ createStaticDrawableEntity)
/* harmony export */ });
/* harmony import */ var _bitmap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bitmap */ "./src/bitmap.ts");

var bulkTileableBitmapLoad = function (adapter) {
    var configs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        configs[_i - 1] = arguments[_i];
    }
    return Promise.all(configs.map(function (_a) {
        var path = _a[0], w = _a[1], h = _a[2], cols = _a[3], rows = _a[4];
        return adapter
            .loadImage(path)
            .then(function (img) { return _bitmap__WEBPACK_IMPORTED_MODULE_0__.TileableBitmap.from(img.data, w, h, cols, rows); })
            .catch(function (error) {
            console.error("HELPERS: bulkTileableBitmapLoad", path, error);
            return _bitmap__WEBPACK_IMPORTED_MODULE_0__.TileableBitmap.from(new ArrayBuffer(w * h), w, h, cols, rows);
        });
    }));
};
var createStaticDrawableEntity = function (em, sprites, spriteIdx, x, y, w, h) { return em.add({
    cPosition: { x: x, y: y },
    cShape: { w: w, h: h },
    cSprite: { sprites: sprites, spriteIdx: spriteIdx, flipped: false },
}); };
var CollisionSide;
(function (CollisionSide) {
    CollisionSide["None"] = "none";
    CollisionSide["Left"] = "left";
    CollisionSide["Right"] = "right";
    CollisionSide["Top"] = "top";
    CollisionSide["Bottom"] = "bottom";
})(CollisionSide || (CollisionSide = {}));
var collision = {
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
    }
};


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debug: () => (/* binding */ debug)
/* harmony export */ });
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main */ "./src/main.ts");

// require('file-loader?name=[name].[ext]!../index.html');
var debug = {};
window.addEventListener("load", function () {
    var debugEl = document.getElementById("debug");
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
    var keys = new Set();
    window.addEventListener("keydown", function (_a) {
        var code = _a.code;
        return keys.add(code);
    });
    window.addEventListener("keyup", function (_a) {
        var code = _a.code;
        return keys.delete(code);
    });
    var width = 320;
    var height = 160;
    console.log(document);
    var screen = document.getElementById("screen");
    screen.width = width;
    screen.height = height;
    (0,_main__WEBPACK_IMPORTED_MODULE_0__.init)({
        screen: screen,
        width: width,
        height: height,
        keys: keys,
        fps: 1000 / 60,
    });
});


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   init: () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _adapter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./adapter */ "./src/adapter.ts");
/* harmony import */ var _engine__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./engine */ "./src/engine.ts");
/* harmony import */ var _bitmap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bitmap */ "./src/bitmap.ts");
/* harmony import */ var _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ecs/simple.ecs */ "./src/ecs/simple.ecs.ts");
/* harmony import */ var _world__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./world */ "./src/world.ts");
/* harmony import */ var _systems__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./systems */ "./src/systems.ts");
/* harmony import */ var _entities__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./entities */ "./src/entities.ts");
/* harmony import */ var _components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components */ "./src/components.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
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









var init = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var width, height, keys, screen, fps, screenCtx, screenImageData, screenBitmap, adapter, world, _a, sMovement, sAnimation, sCollideBounds, sDrawing, sControllerRunner, sDrawAnimatedBg, sDrawAnimatedFg, em, _b, playerEntity, animatedBgLayersEntities, animatedFgLayersEntities, _c, animatedBgPalletes, animatedFgPalletes, collideBounds, move, draw, control, animate, animateBg, animateFg, renderBench, updateBench, render, update, engine;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.debug("MAIN: init");
                width = config.width, height = config.height, keys = config.keys, screen = config.screen, fps = config.fps;
                screenCtx = screen.getContext("2d");
                screenImageData = screenCtx.getImageData(0, 0, width, height);
                screenBitmap = _bitmap__WEBPACK_IMPORTED_MODULE_2__.Bitmap.from(screenImageData.data.buffer, width, height);
                adapter = new _adapter__WEBPACK_IMPORTED_MODULE_0__.Adapter();
                console.debug("MAIN: init world");
                world = new _world__WEBPACK_IMPORTED_MODULE_4__.World({
                    width: width,
                    height: height,
                    gravity: 0.9,
                    friction: 0.95,
                    skyColor: 0xffa09080,
                });
                console.debug("MAIN: init systems");
                _a = (0,_systems__WEBPACK_IMPORTED_MODULE_5__.Systems)(world, screenBitmap), sMovement = _a.sMovement, sAnimation = _a.sAnimation, sCollideBounds = _a.sCollideBounds, sDrawing = _a.sDrawing, sControllerRunner = _a.sControllerRunner, sDrawAnimatedBg = _a.sDrawAnimatedBg, sDrawAnimatedFg = _a.sDrawAnimatedFg;
                console.debug("MAIN: init entities");
                em = new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_3__.EntityManager(_components__WEBPACK_IMPORTED_MODULE_7__);
                return [4 /*yield*/, (0,_entities__WEBPACK_IMPORTED_MODULE_6__.Entities)(em, world, adapter, keys)];
            case 1:
                _b = _d.sent(), playerEntity = _b.playerEntity, animatedBgLayersEntities = _b.animatedBgLayersEntities, animatedFgLayersEntities = _b.animatedFgLayersEntities, _c = _b.fgBgLayers, animatedBgPalletes = _c.animatedBgPalletes, animatedFgPalletes = _c.animatedFgPalletes;
                console.debug("MAIN: attach entities with systems");
                collideBounds = sCollideBounds.setup([playerEntity]);
                move = sMovement.setup([playerEntity]);
                draw = sDrawing.setup([playerEntity]);
                control = sControllerRunner.setup([playerEntity]);
                animate = sAnimation.setup([playerEntity]);
                animateBg = sDrawAnimatedBg.setup(animatedBgLayersEntities);
                animateFg = sDrawAnimatedFg.setup(animatedFgLayersEntities);
                // colors
                world.skyColor = 0xff4499ff;
                animatedBgPalletes[0].pallete = [0, 0xff3366ee, 0xff2244aa];
                animatedBgPalletes[1].pallete = [0, 0xff113388, 0xff2255bb];
                animatedBgPalletes[2].pallete = [0xff303030, 0];
                animatedBgPalletes[3].pallete = [0xff292929, 0];
                animatedBgPalletes[4].pallete = [0xff333333, 0xff206090];
                animatedBgPalletes[5].pallete = [0xff303030, 0xff206090];
                animatedBgPalletes[6].pallete = [0xff252525, 0xff206090];
                animatedBgPalletes[7].pallete = [0xff202020, 0xff206090];
                animatedFgPalletes[0].pallete = [0, 0xff101010, 0xff303030];
                renderBench = (0,_utils__WEBPACK_IMPORTED_MODULE_8__.benchmark)("render bench", 2);
                updateBench = (0,_utils__WEBPACK_IMPORTED_MODULE_8__.benchmark)("update bench", 2);
                render = function (dt) {
                    renderBench.A();
                    screenBitmap.fill(world.skyColor);
                    animateBg(dt);
                    animate(dt);
                    draw(dt);
                    animateFg(dt);
                    screenCtx.putImageData(screenImageData, 0, 0);
                    renderBench.B();
                };
                update = function (dt) {
                    updateBench.A();
                    move(dt);
                    collideBounds(dt);
                    control(dt);
                    updateBench.B();
                };
                console.debug("MAIN: run engine");
                engine = new _engine__WEBPACK_IMPORTED_MODULE_1__.Engine(adapter, fps, update, render, 0.03);
                engine.start();
                // TODO: live limited time. for dev only
                setTimeout(function () {
                    engine.stop();
                    console.debug("MAIN: engine stopped");
                    console.log(renderBench.resultsFps());
                    console.log(updateBench.resultsFps());
                }, 1000 * 30); // for development only, to stop after 30 sec
                return [2 /*return*/];
        }
    });
}); };


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
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! . */ "./src/index.ts");




var rectangle = _helpers__WEBPACK_IMPORTED_MODULE_2__.collision.rectangle, bounds = _helpers__WEBPACK_IMPORTED_MODULE_2__.collision.bounds;
function Systems(world, viewport) {
    console.debug("SYSYEMS: initialization");
    var width = world.width, height = world.height;
    return {
        /* Collide entities with world bounds */
        sCollideBounds: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cShape: _components__WEBPACK_IMPORTED_MODULE_1__.cShape, cMeta: _components__WEBPACK_IMPORTED_MODULE_1__.cMeta }, function (_, comp, entities) {
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var _c = comp.cShape.storage, w = _c.w, h = _c.h;
            var air = comp.cMeta.storage.air;
            for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
                var e = entities_1[_i];
                var eRight = x[e] + w[e];
                var eBottom = y[e] + h[e];
                var collisionSide = bounds(x[e], y[e], eRight, eBottom, 0, 0, width, height);
                if (collisionSide == _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.None)
                    continue;
                switch (collisionSide) {
                    case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Left:
                        vx[e] = 0;
                        x[e] = 0;
                        break;
                    case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Right:
                        vx[e] = 0;
                        x[e] = width - w[e];
                        break;
                    case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Top:
                        vy[e] = 1;
                        y[e] = 0;
                        break;
                    case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Bottom:
                        vy[e] = 0;
                        y[e] = height - h[e];
                        air[e] = false;
                        break;
                }
            }
        }),
        /* Collide entities with a world tiles */
        sCollideLevel: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cShape: _components__WEBPACK_IMPORTED_MODULE_1__.cShape, cMeta: _components__WEBPACK_IMPORTED_MODULE_1__.cMeta }, function (_, comp, entities) {
            throw new Error("Not implemented yet");
            // get entity cell cx, cy - current row and column
            // get index world.level.collisions[top * columns + left]
            // and collide with top, left, bottom, right
            // input: same as collide shapes + level collision map
            // algo:
            // for all entities:
            //  get top, left, right, bottom cells (ghost, no actualy an object)
            //  check if collide for each side
        }),
        /* Collide entities from groupA with entities from groupB */
        sCollideShapes: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cShape: _components__WEBPACK_IMPORTED_MODULE_1__.cShape, cMeta: _components__WEBPACK_IMPORTED_MODULE_1__.cMeta }, function (_, comp, entities, blocks) {
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var _c = comp.cShape.storage, w = _c.w, h = _c.h;
            var air = comp.cMeta.storage.air;
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
                    // TODO: remove debug
                    ___WEBPACK_IMPORTED_MODULE_3__.debug.set(collisionSide.toUpperCase(), air[e] ? "^" : "_", "".concat(x[e].toFixed(2).padStart(6, "0"), ":").concat(y[e].toFixed(2).padStart(6, "0")), vy[e].toFixed(2));
                    if (collisionSide === _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.None)
                        continue;
                    if (collisionSide !== _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Bottom)
                        console.log(collisionSide, b);
                    totalCollisions++;
                    switch (collisionSide) {
                        case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Bottom:
                            vy[e] = 0;
                            y[e] = y[b] - h[e];
                            air[e] = false;
                            break;
                        case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Right:
                            vx[e] = 0;
                            x[e] = x[b] - w[e] - 0.01;
                            break;
                        case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Left:
                            vx[e] = 0;
                            x[e] = bRight + 0.01;
                            break;
                        case _helpers__WEBPACK_IMPORTED_MODULE_2__.CollisionSide.Top:
                            vy[e] = 1;
                            y[e] = bBottom;
                            break;
                    }
                }
            }
        }),
        /* Move entity using velocity values */
        sMovement: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cPosition: _components__WEBPACK_IMPORTED_MODULE_1__.cPosition, cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cMeta: _components__WEBPACK_IMPORTED_MODULE_1__.cMeta }, function (dt, comp, entities) {
            var _a = comp.cPosition.storage, x = _a.x, y = _a.y;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var air = comp.cMeta.storage.air;
            var friction = world.friction, gravity = world.gravity;
            for (var _i = 0, entities_3 = entities; _i < entities_3.length; _i++) {
                var e = entities_3[_i];
                x[e] += vx[e] * dt;
                y[e] += vy[e] * dt;
                // TODO: think to move it separately, to avoid dependency with cMeta.air
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
        sController: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cInput: _components__WEBPACK_IMPORTED_MODULE_1__.cInput, cSprite: _components__WEBPACK_IMPORTED_MODULE_1__.cSprite, cMeta: _components__WEBPACK_IMPORTED_MODULE_1__.cMeta, cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation }, function (_, comp, entities) {
            var flipped = comp.cSprite.storage.flipped;
            var current = comp.cAnimation.storage.current;
            var keys = comp.cInput.storage.keys;
            var _a = comp.cVelocity.storage, vx = _a.vx, vy = _a.vy;
            var _b = comp.cMeta.storage, air = _b.air, speed = _b.speed;
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
        /*Listen for user input for runner mode*/
        sControllerRunner: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cVelocity: _components__WEBPACK_IMPORTED_MODULE_1__.cVelocity, cInput: _components__WEBPACK_IMPORTED_MODULE_1__.cInput, cMeta: _components__WEBPACK_IMPORTED_MODULE_1__.cMeta, cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation }, function (_, comp, entities) {
            var _a = comp.cAnimation.storage, current = _a.current, coef = _a.coef;
            var keys = comp.cInput.storage.keys;
            var _b = comp.cVelocity.storage, vx = _b.vx, vy = _b.vy;
            var _c = comp.cMeta.storage, air = _c.air, speed = _c.speed;
            for (var _i = 0, entities_7 = entities; _i < entities_7.length; _i++) {
                var e = entities_7[_i];
                if (!keys[e].size) {
                    current[e] = air[e] ? 2 : 1;
                    coef[e] = 0.4;
                    continue;
                }
                if (keys[e].has("KeyQ"))
                    vx[e] -= speed[e], coef[e] = 0.2, current[e] = 1;
                else if (keys[e].has("KeyW"))
                    vx[e] += speed[e], coef[e] = 0.8, current[e] = 1;
                if (keys[e].has("KeyP"))
                    !air[e] && (air[e] = true, vy[e] = -10);
            }
        }),
        // TODO: ability to add modifiers to the system
        // Modifier can store 32 and 48
        // Also it can store pointer to World
        /* Dynamic background */
        sDrawAnimatedBg: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cSprite: _components__WEBPACK_IMPORTED_MODULE_1__.cSprite, cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation }, function (dt, comp, entities) {
            var _a = comp.cSprite.storage, offsetX = _a.offsetX, offsetY = _a.offsetY, sprites = _a.sprites, spriteIdx = _a.spriteIdx;
            var _b = comp.cAnimation.storage, time = _b.time, coef = _b.coef, animations = _b.animations;
            // use animations to build up new layouts
            for (var _i = 0, entities_8 = entities; _i < entities_8.length; _i++) {
                var e = entities_8[_i];
                var frameTime = (time[e] + dt * coef[e]) % width;
                viewport.draw(sprites[e][spriteIdx[e]], Math.round(offsetX[e] + frameTime), Math.round(offsetY[e]));
                time[e] = frameTime;
            }
        }),
        sDrawAnimatedFg: new _ecs_simple_ecs__WEBPACK_IMPORTED_MODULE_0__.System({ cSprite: _components__WEBPACK_IMPORTED_MODULE_1__.cSprite, cAnimation: _components__WEBPACK_IMPORTED_MODULE_1__.cAnimation }, function (dt, comp, entities) {
            var _a = comp.cSprite.storage, offsetX = _a.offsetX, offsetY = _a.offsetY, sprites = _a.sprites, spriteIdx = _a.spriteIdx;
            var _b = comp.cAnimation.storage, time = _b.time, coef = _b.coef;
            for (var _i = 0, entities_9 = entities; _i < entities_9.length; _i++) {
                var e = entities_9[_i];
                var frameTime = (time[e] + dt * coef[e]) % 384;
                viewport.draw(sprites[e][spriteIdx[e]], Math.round(offsetX[e] + frameTime), Math.round(offsetY[e]));
                time[e] = frameTime;
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
/* harmony export */   ContinualArray: () => (/* binding */ ContinualArray),
/* harmony export */   ContinualList: () => (/* binding */ ContinualList),
/* harmony export */   benchmark: () => (/* binding */ benchmark)
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
var ContinualList = /** @class */ (function () {
    function ContinualList(schema, data, next) {
        if (data === void 0) { data = []; }
        if (next === void 0) { next = [0]; }
        this.schema = schema;
        this.data = data;
        this.next = next;
    }
    ContinualList.prototype.push = function () {
        var es = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            es[_i] = arguments[_i];
        }
        var inserted = [];
        for (var _a = 0, es_1 = es; _a < es_1.length; _a++) {
            var e = es_1[_a];
            var i = this.next.pop() || this.data.length;
            this.data[i] = e || this.schema;
            inserted.push(i);
            // TODO: rewrite to efficient fast and elegant
            // we can use capacity to allocate memory at init
            if (this.next.length == 0)
                this.next.push(this.data.length);
        }
        return inserted;
    };
    ContinualList.prototype.delete = function () {
        var is = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            is[_i] = arguments[_i];
        }
        for (var _a = 0, is_1 = is; _a < is_1.length; _a++) {
            var i = is_1[_a];
            // because we cant store nulls
            this.data[i] = this.schema;
            this.next.push(i);
        }
        return is;
    };
    Object.defineProperty(ContinualList.prototype, "length", {
        // set data(e: T) {
        //   this
        // }
        //
        get: function () {
            return this.data.length - this.vacant.length + 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContinualList.prototype, "vacant", {
        get: function () {
            return this.next;
        },
        enumerable: false,
        configurable: true
    });
    return ContinualList;
}());

// or maybe we can do this?
var ContinualArray = /** @class */ (function (_super) {
    __extends(ContinualArray, _super);
    function ContinualArray() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ContinualArray;
}(Array));

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
/* harmony export */   Level: () => (/* binding */ Level),
/* harmony export */   LevelCellType: () => (/* binding */ LevelCellType),
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
        this.currentLevel = "start";
        this.levelList = new Map();
    }
    World.prototype.addLevel = function (level) {
        this.levelList.set(level.name, level);
    };
    World.prototype.getCurrentLevel = function () {
        return this.levelList.get(this.currentLevel);
    };
    return World;
}());

/*
IDEA: to define cell type I can use bits.
for example first bit is block/notblock
*/
var LevelCellType;
(function (LevelCellType) {
    LevelCellType[LevelCellType["Block"] = 1] = "Block";
})(LevelCellType || (LevelCellType = {}));
// TODO: rewrite implementation and data structure
var Level = /** @class */ (function () {
    function Level(name, map, mapping) {
        this.name = name;
        this.map = map;
        this.mapping = mapping;
        this.width = map[0].length;
        this.height = map.length;
        this.collisions = Array(this.height).fill(Array(this.width).fill(false));
        this.refreshCollistions();
    }
    Level.from = function (name, config) {
        // TODO: make normal level parser
        var map = config.map, mapping = config.mapping;
        var parsedMapping = new Map();
        Object.entries(mapping).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            return parsedMapping.set(+key, value);
        });
        Object.entries(mapping).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            // const cell: LevelCell = {}
        });
        return new Level(name, map, parsedMapping);
    };
    Level.prototype.filterMap = function (type) {
        var filtered = this.map.map(function (row) { return row.map(function (col) { return !!(col & type); }); });
        return filtered;
    };
    Level.prototype.refreshCollistions = function () {
        this.collisions = this.filterMap(LevelCellType.Block);
    };
    return Level;
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
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map