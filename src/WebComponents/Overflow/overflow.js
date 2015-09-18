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
        var Overflow = (function (_super) {
            __extends(Overflow, _super);
            function Overflow() {
                _super.apply(this, arguments);
            }
            Overflow.prototype._visibleSizeChanged = function (e, detail) {
                var _this = this;
                var popup = this.$["overflowPopup"];
                if (popup.open)
                    return;
                requestAnimationFrame(function () {
                    var children = _this._getChildren();
                    children.forEach(function (child) {
                        Polymer.dom(child).removeAttribute("overflow");
                    });
                    _this._setHasOverflow(children.toArray().some(function (child) { return child.offsetTop > 0; }));
                });
            };
            Overflow.prototype._getChildren = function () {
                return Enumerable.from(Enumerable.from(Polymer.dom(this).children).where(function (c) { return c.tagName != "TEMPLATE"; }).selectMany(function (element) {
                    if (element.tagName == "CONTENT")
                        return Enumerable.from(Polymer.dom(element).getDistributedNodes()).where(function (c) { return c.tagName != "TEMPLATE"; }).toArray();
                    return [element];
                }).select(function (child) { return child; }).toArray());
            };
            Overflow.prototype._popupOpening = function () {
                this._overflownChildren = this._getChildren();
                this._overflownChildren.forEach(function (child) {
                    if (child.offsetTop > 0) {
                        child._previousParent = child.parentElement;
                        Polymer.dom(child).setAttribute("overflow", "");
                    }
                });
                Polymer.dom(this).flush();
            };
            Overflow.prototype._popupClosed = function () {
                this._overflownChildren.forEach(function (child) {
                    Polymer.dom(child).removeAttribute("overflow");
                });
                Polymer.dom(this).flush();
                this._overflownChildren.forEach(function (child) {
                    if (child._previousParent) {
                        child._previousParent.appendChild(child);
                        child._previousParent = null;
                    }
                });
                this._setHasOverflow(this._overflownChildren.toArray().some(function (child) { return child.offsetTop > 0; }));
            };
            Overflow.prototype._popup = function (e) {
                var _this = this;
                var children = this._getChildren();
                children.forEach(function (child) {
                    if (child.offsetTop > 0)
                        Polymer.dom(child).setAttribute("overflow", "");
                });
                Polymer.dom(this).flush();
                var popup = this.$["overflowPopup"];
                popup.popup().then(function () {
                    children.forEach(function (child) {
                        Polymer.dom(child).removeAttribute("overflow");
                    });
                    Polymer.dom(_this).flush();
                    _this._setHasOverflow(children.toArray().some(function (child) { return child.offsetTop > 0; }));
                });
                e.stopPropagation();
            };
            Overflow = __decorate([
                WebComponents.WebComponent.register({
                    properties: {
                        hasOverflow: {
                            type: Boolean,
                            reflectToAttribute: true,
                            readOnly: true
                        }
                    }
                })
            ], Overflow);
            return Overflow;
        })(WebComponents.WebComponent);
        WebComponents.Overflow = Overflow;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
