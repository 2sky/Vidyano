var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vidyano;
(function (Vidyano) {
    var WebComponents;
    (function (WebComponents) {
        var resources = {};
        var Resource = (function (_super) {
            __extends(Resource, _super);
            function Resource() {
                _super.apply(this, arguments);
            }
            Resource.prototype.attached = function () {
                _super.prototype.attached.call(this);
                this._load();
            };
            Resource.prototype._nameChanged = function (name, oldName) {
                if (name)
                    resources[(this.tagName + "+" + name.toUpperCase())] = this;
                else
                    delete resources[(this.tagName + "+" + oldName.toUpperCase())];
            };
            Resource.prototype._setHasResource = function (value) { };
            Resource.prototype._load = function () {
                if (this.source) {
                    if (this.source == this._loadedSource)
                        return;
                    this.empty();
                    var resource = Resource.LoadResource(this.source, this.tagName);
                    if (resource)
                        Polymer.dom(this).appendChild(Resource.Load(resource, this.tagName));
                    this._setHasResource(resource != null);
                    this._loadedSource = this.source;
                }
            };
            Resource.register = function (info) {
                if (info === void 0) { info = {}; }
                if (typeof info == "function")
                    return Resource.register({})(info);
                return function (obj) {
                    info.properties = info.properties || {};
                    info.properties["name"] = {
                        type: String,
                        observer: "_nameChanged"
                    };
                    info.properties["model"] = {
                        type: Object,
                        observer: "_load"
                    };
                    info.properties["source"] = {
                        type: String,
                        reflectToAttribute: true,
                        observer: "_load"
                    };
                    info.properties["hasResource"] = {
                        type: Boolean,
                        reflectToAttribute: true,
                        readOnly: true
                    };
                    return WebComponents.WebComponent.register(obj, info);
                };
            };
            Resource.Load = function (source, tagName) {
                var resource = (typeof source === "string") ? resources[(tagName + "+" + source.toUpperCase())] : source;
                var fragment = document.createDocumentFragment();
                var copy = document.createElement(tagName);
                fragment.appendChild(copy);
                Enumerable.from(Polymer.dom(resource).children).forEach(function (child) {
                    Polymer.dom(copy).appendChild(child.cloneNode(true));
                });
                return fragment;
            };
            Resource.LoadResource = function (source, tagName) {
                return resources[(tagName + "+" + source.toUpperCase())];
            };
            Resource.Exists = function (name, tagName) {
                return resources[(tagName + "+" + name.toUpperCase())] != undefined;
            };
            return Resource;
        })(WebComponents.WebComponent);
        WebComponents.Resource = Resource;
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
