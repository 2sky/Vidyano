var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var requestFrame = (function () {
            var raf = requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                function (fn) { return window.setTimeout(fn, 20); };
            return function (fn) { return raf(fn); };
        })();
        var cancelFrame = (function () {
            var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                window.clearTimeout;
            return function (id) { return cancel(id); };
        })();
        var SizeTracker = (function (_super) {
            __extends(SizeTracker, _super);
            function SizeTracker() {
                _super.apply(this, arguments);
                this._resizeTimerQueuedElements = [];
            }
            SizeTracker.prototype.attached = function () {
                if (this.deferred)
                    return;
                this.measure();
            };
            SizeTracker.prototype.detached = function () {
                if (this._scrollListener) {
                    this.$["root"].removeEventListener('scroll', this._scrollListener);
                    this._scrollListener = undefined;
                }
            };
            SizeTracker.prototype.measure = function () {
                this.deferred = false;
                var root = this.$["root"];
                if (!this._scrollListener) {
                    this._resetTriggers(root);
                    root.addEventListener('scroll', this._scrollListener = this._onScroll.bind(this), true);
                }
                this._triggerSizeChanged();
            };
            SizeTracker.prototype._onScroll = function (e) {
                var _this = this;
                if (this._resizeRAF)
                    cancelFrame(this._resizeRAF);
                this._resizeRAF = requestFrame(function () {
                    _this._resetTriggers(_this.$["root"]);
                    _this._triggerSizeChanged();
                });
            };
            SizeTracker.prototype._triggerSizeChanged = function () {
                var root = this.$["root"];
                if (!this._resizeLast || root.offsetWidth != this._resizeLast.width || root.offsetHeight != this._resizeLast.height) {
                    this.fire("sizechanged", this._resizeLast = {
                        width: root.offsetWidth,
                        height: root.offsetHeight
                    }, { onNode: this, bubbles: false });
                }
            };
            SizeTracker.prototype._resizeTimerMicroTask = function () {
                var _this = this;
                this._resizeTimerQueuedElements.slice().forEach(function (element) { return _this._resetTriggers(element); });
            };
            SizeTracker.prototype._resetTriggers = function (element) {
                var expand = element.querySelector("#expand"), contract = element.querySelector("#contract"), expandChild = element.querySelector("#expandChild");
                contract.scrollLeft = contract.scrollWidth;
                contract.scrollTop = contract.scrollHeight;
                var width = expand.offsetWidth;
                var height = expand.offsetHeight;
                if (!width || !height) {
                    if (!element.__resizeTimerQueued__) {
                        this._resizeTimerQueuedElements.push(element);
                        element.__resizeTimerQueued__ = true;
                    }
                    if (!this._resizeTimer)
                        this._resizeTimer = setInterval(this._resizeTimerMicroTask.bind(this), 250);
                }
                else if (element.__resizeTimerQueued__) {
                    this._resizeTimerQueuedElements.splice(this._resizeTimerQueuedElements.indexOf(element), 1);
                    element.__resizeTimerQueued__ = false;
                    if (this._resizeTimerQueuedElements.length == 0) {
                        clearInterval(this._resizeTimer);
                        this._resizeTimer = null;
                    }
                }
                if (!expandChild.__resizeLast__)
                    expandChild.__resizeLast__ = {};
                if (expandChild.__resizeLast__.width != width + 1)
                    expandChild.style.width = (expandChild.__resizeLast__.width = width + 1) + 'px';
                if (expandChild.__resizeLast__.height != height + 1)
                    expandChild.style.height = (expandChild.__resizeLast__.height = height + 1) + 'px';
                expand.scrollLeft = expand.scrollWidth;
                expand.scrollTop = expand.scrollHeight;
            };
            SizeTracker = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        deferred: {
                            type: Boolean,
                            reflectToAttribute: true
                        }
                    }
                })
            ], SizeTracker);
            return SizeTracker;
        })(WebComponents.WebComponent);
        WebComponents.SizeTracker = SizeTracker;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
