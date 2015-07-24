var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
            Resource.prototype._nameChanged = function () {
                if (this.name)
                    resources[this.name.toUpperCase()] = this;
                else
                    delete resources[this.name.toUpperCase()];
            };
            Resource.prototype._setIcon = function (value) { };
            Resource.prototype._setHasResource = function (value) { };
            Resource.prototype._load = function () {
                if (this.isAttached && this.source) {
                    if (this.source == this._loadedSource)
                        return;
                    this.empty();
                    var resource = Resource.LoadResource(this.source);
                    if (resource)
                        Polymer.dom(this).appendChild(Resource.Load(resource));
                    this.icon = resource != null ? resource.icon : false;
                    this._setHasResource(resource != null);
                    this._loadedSource = this.source;
                }
            };
            Resource.Load = function (source) {
                var resource = (typeof source === "string") ? resources[source.toUpperCase()] : source;
                var copy = document.createDocumentFragment();
                Enumerable.from(Polymer.dom(resource).children).forEach(function (child) {
                    copy.appendChild(child.cloneNode(true));
                });
                return copy;
            };
            Resource.LoadResource = function (source) {
                return resources[source.toUpperCase()];
            };
            Resource.Exists = function (name) {
                return resources[name.toUpperCase()] != undefined;
            };
            return Resource;
        })(WebComponents.WebComponent);
        WebComponents.Resource = Resource;
        WebComponents.WebComponent.register(Resource, WebComponents, "vi", {
            properties: {
                name: {
                    type: String,
                    observer: "_nameChanged"
                },
                model: {
                    type: Object,
                    observer: "_load"
                },
                source: {
                    type: String,
                    reflectToAttribute: true,
                    observer: "_load"
                },
                hasResource: {
                    type: Boolean,
                    reflectToAttribute: true,
                    readOnly: true
                },
                icon: {
                    type: Boolean,
                    reflectToAttribute: true
                },
            }
        });
    })(WebComponents = Vidyano.WebComponents || (Vidyano.WebComponents = {}));
})(Vidyano || (Vidyano = {}));
