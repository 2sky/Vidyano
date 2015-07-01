var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var PersistentObject = (function (_super) {
            __extends(PersistentObject, _super);
            function PersistentObject() {
                _super.apply(this, arguments);
                this._uniqueId = Unique.get();
                this._styles = {};
            }
            PersistentObject.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this.asElement.setAttribute("style-scope-id", this._uniqueId);
                if (!this.masterWidth)
                    this.masterWidth = "40%";
            };
            PersistentObject.prototype.detached = function () {
                if (this._styleElement) {
                    document.head.removeChild(this._styleElement);
                    this._styleElement = undefined;
                }
                _super.prototype.detached.call(this);
            };
            PersistentObject.prototype._persistentObjectChanged = function (persistentObject, isAttached) {
                if (persistentObject && isAttached) {
                    this._cacheEntry = this.app.cache(new WebComponents.PersistentObjectAppCacheEntry(this.persistentObject));
                    this.selectedMasterTab = this._cacheEntry.selectedMasterTab || this._computeMasterTabs(this.persistentObject, this.persistentObject.tabs)[0];
                    this.selectedDetailTab = this._cacheEntry.selectedDetailTab || this._computeDetailTabs(this.persistentObject, this.persistentObject.tabs)[0];
                }
                else
                    this._cacheEntry = this.selectedMasterTab = this.selectedDetailTab = undefined;
            };
            PersistentObject.prototype._masterWidthChanged = function () {
                this._setStyle("masterWidth", ".master { width: " + this.masterWidth + "; }");
            };
            PersistentObject.prototype._setStyle = function (name) {
                var _this = this;
                var css = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    css[_i - 1] = arguments[_i];
                }
                var cssBody = "";
                css.forEach(function (c) {
                    cssBody += "vi-persistent-object[style-scope-id=\"" + _this._uniqueId + "\"] " + c + (css.length > 0 ? "\n" : "");
                });
                if (!this._styleElement)
                    this._styleElement = document.head.appendChild(document.createElement("style"));
                var node = this._styles[name] || (this._styles[name] = this._styleElement.appendChild(document.createTextNode("")));
                node.textContent = cssBody;
            };
            PersistentObject.prototype._computeMasterTabs = function (persistentObject, tabs) {
                if (persistentObject.queryLayoutMode == Vidyano.PersistentObjectLayoutMode.FullPage)
                    return tabs.filter(function (t) { return t.isVisible; });
                return tabs ? tabs.filter(function (t) { return t.isVisible && t.tabGroupIndex == 0; }) : [];
            };
            PersistentObject.prototype._computeDetailTabs = function (persistentObject, tabs) {
                if (persistentObject.queryLayoutMode == Vidyano.PersistentObjectLayoutMode.FullPage)
                    return [];
                return tabs ? tabs.filter(function (t) { return t.isVisible && t.tabGroupIndex == 1; }) : [];
            };
            PersistentObject.prototype._detailTabsChanged = function () {
                if (!this.detailTabs || this.detailTabs.length == 0) {
                    this.selectedDetailTab = null;
                    return;
                }
            };
            PersistentObject.prototype._masterTabsChanged = function () {
                if (!this.masterTabs || this.masterTabs.length == 0) {
                    this.selectedMasterTab = null;
                    return;
                }
            };
            PersistentObject.prototype._selectedMasterTabChanged = function () {
                if (!this._cacheEntry)
                    return;
                this._cacheEntry.selectedMasterTab = this.selectedMasterTab;
            };
            PersistentObject.prototype._selectedDetailTabChanged = function () {
                if (!this._cacheEntry)
                    return;
                this._cacheEntry.selectedDetailTab = this.selectedDetailTab;
            };
            PersistentObject.prototype._computeLayout = function (persistentObject, masterTabs, detailTabs) {
                if (masterTabs === void 0) { masterTabs = []; }
                if (detailTabs === void 0) { detailTabs = []; }
                if (!persistentObject)
                    return undefined;
                var hasDetailTabs = detailTabs.length > 0;
                var hasMasterTabs = masterTabs.length > 0;
                var layoutFlags = [hasDetailTabs ? (hasMasterTabs ? 'master-detail' : 'details-only') : 'full-page'];
                if (hasDetailTabs)
                    layoutFlags.push("dt");
                if (hasMasterTabs && (hasDetailTabs || masterTabs.length > 1))
                    layoutFlags.push("mt");
                if (hasMasterTabs && masterTabs.some(function (t) { return t.parent.actions.some(function (a) { return a.isVisible || a.name == "Filter"; }); }))
                    layoutFlags.push("ma");
                if (hasDetailTabs && detailTabs.some(function (t) { return t.parent.actions.some(function (a) { return a.isVisible || a.name == "Filter"; }); }))
                    layoutFlags.push("da");
                return layoutFlags.join(" ");
            };
            PersistentObject.prototype._hasMasterTabs = function (tabs) {
                return tabs && tabs.length > 1;
            };
            PersistentObject.prototype._hasDetailTabs = function (tabs) {
                return tabs && tabs.length > 0;
            };
            PersistentObject.prototype._trackSplitter = function (e, detail) {
                if (detail.state == "track") {
                    var px = parseInt(this.masterWidth);
                    this.masterWidth = (px + detail.ddx) + "px";
                }
                else if (detail.state == "start") {
                    this.app.classList.add("dragging");
                    if (this.masterWidth.endsWith("%"))
                        this.masterWidth = (this.asElement.offsetWidth * (parseInt(this.masterWidth) / 100)).toString() + "px";
                }
                else if (detail.state == "end") {
                    this.app.classList.remove("dragging");
                    window.getSelection().removeAllRanges();
                    if (this.masterWidth.endsWith("px")) {
                        var px = parseInt(this.masterWidth);
                        this.masterWidth = (100 / this.asElement.offsetWidth * px).toString() + "%";
                    }
                }
                e.stopPropagation();
            };
            return PersistentObject;
        })(WebComponents.WebComponent);
        WebComponents.PersistentObject = PersistentObject;
        Vidyano.WebComponents.WebComponent.register(Vidyano.WebComponents.PersistentObject, Vidyano.WebComponents, "vi", {
            properties: {
                persistentObject: {
                    type: Object,
                },
                tabs: {
                    type: Array,
                    computed: "persistentObject.tabs"
                },
                masterWidth: {
                    type: Number,
                    observer: "_masterWidthChanged"
                },
                masterTabs: {
                    type: Array,
                    computed: "_computeMasterTabs(persistentObject, tabs)",
                    observer: "_masterTabsChanged"
                },
                hasMasterTabs: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_hasMasterTabs(masterTabs)"
                },
                selectedMasterTab: {
                    type: Object,
                    observer: "_selectedMasterTabChanged"
                },
                detailTabs: {
                    type: Array,
                    computed: "_computeDetailTabs(persistentObject, tabs)",
                    observer: "_detailTabsChanged"
                },
                hasDetailTabs: {
                    type: Boolean,
                    reflectToAttribute: true,
                    computed: "_hasDetailTabs(detailTabs)"
                },
                selectedDetailTab: {
                    type: Object,
                    observer: "_selectedDetailTabChanged"
                },
                layout: {
                    type: String,
                    reflectToAttribute: true,
                    computed: "_computeLayout(persistentObject, masterTabs, detailTabs)"
                },
            },
            observers: [
                "_persistentObjectChanged(persistentObject, isAttached)"
            ],
            forwardObservers: [
                "persistentObject.tabs.isVisible"
            ]
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
