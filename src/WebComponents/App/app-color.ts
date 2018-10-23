namespace Vidyano.WebComponents {
    "use strict";

    interface IRGB {
        r: number;
        g: number;
        b: number;
    }

    interface IHSL {
        h: number;
        s: number;
        l: number;
    }

    /// Based on Material Design Color Generator by fireflight1 (https://github.com/fireflight1/mcg)
    export class AppColor {
        private _faint: string;
        private _semiFaint: string;
        private _lighter: string;
        private _light: string;
        private _dark: string;
        private _darker: string;
        private _foreground: string;

        constructor(private _base: string) {
            const rgb = this._hexToRgb(_base);

            this._faint = this._calculateVariant(rgb, 0.07);
            this._semiFaint = this._calculateVariant(rgb, 0.15);
            this._lighter = this._calculateVariant(rgb, 0.31);
            this._light = this._calculateVariant(rgb, 0.7);
            this._dark = this._calculateVariant(rgb, 0.81, true);
            this._darker = this._calculateVariant(rgb, 0.52, true);

            const baseHsl = this._rgbToHsl(rgb);
            this._foreground = this._rgbToHex(this._hslToRgb({ h: baseHsl.h, s: 0.29, l: 0.29 }));
        }

        get faint(): string {
            return this._faint;
        }

        get semiFaint(): string {
            return this._semiFaint;
        }

        get lighter(): string {
            return this._lighter;
        }

        get light(): string {
            return this._light;
        }

        get base(): string {
            return this._base;
        }

        get dark(): string {
            return this._dark;
        }

        get darker(): string {
            return this._darker;
        }

        get foreground(): string {
            return this._foreground;
        }

        private _rgbToHsl(rgb: IRGB): IHSL {
            const cMax = Math.max(rgb.r, rgb.g, rgb.b);
            const cMin = Math.min(rgb.r, rgb.g, rgb.b);
            const delta = cMax - cMin;
            const hsl: IHSL = {
                h: 0,
                s: 0,
                l: (cMax + cMin) / 2
            };

            if (delta == 0)
                hsl.h = 0;
            else if (cMax === rgb.r)
                hsl.h = 60 * (((rgb.g - rgb.b) / delta) % 6);
            else if (cMax == rgb.g)
                hsl.h = 60 * (((rgb.b - rgb.r) / delta) + 2);
            else
                hsl.h = 60 * (((rgb.r - rgb.g) / delta) + 4);

            if (delta === 0)
                hsl.s = 0;
            else {
                hsl.s = Math.abs(delta / (1 - Math.abs(2 * hsl.l - 1)));
                hsl.s = Math.max(Math.min(hsl.s, 1), 0);
            }

            hsl.l = Math.max(Math.min(hsl.l / 255, 1), 0);

            return hsl;
        }

        private _hslToRgb(hsl: IHSL): IRGB {
            const c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
            const x = c * (1 - Math.abs((hsl.h / 60) % 2 - 1));
            const m = hsl.l - c / 2;
            let rgb: IRGB;

            if (hsl.h < 60) {
                rgb = {
                    r: c,
                    g: x,
                    b: 0
                };
            }
            else if (hsl.h < 120) {
                rgb = {
                    r: x,
                    g: c,
                    b: 0
                };
            }
            else if (hsl.h < 180) {
                rgb = {
                    r: 0,
                    g: c,
                    b: x
                };
            }
            else if (hsl.h < 240) {
                rgb = {
                    r: 0,
                    g: x,
                    b: c
                };
            }
            else if (hsl.h < 300) {
                rgb = {
                    r: x,
                    g: 0,
                    b: c
                };
            }
            else {
                rgb = {
                    r: c,
                    g: 0,
                    b: x
                };
            }

            rgb.r = this._normalizeRgbValue(rgb.r, m);
            rgb.g = this._normalizeRgbValue(rgb.g, m);
            rgb.b = this._normalizeRgbValue(rgb.b, m);

            return rgb;
        }

        private _normalizeRgbValue(value: number, m: number) {
            return Math.max(Math.floor((value + m) * 255), 0);
        }

        private _calculateVariant(rgb: IRGB, a: number, dark?: boolean): string {
            const base = dark ? 0 : 255;

            return this._rgbToHex({
                r: Math.round((1 - a) * base + a * rgb.r),
                g: Math.round((1 - a) * base + a * rgb.g),
                b: Math.round((1 - a) * base + a * rgb.b),
            });
        }

        private _hexToRgb(hex: string): IRGB {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        private _rgbToHex(rgb: IRGB): string {
            return "#" + rgb.r.toString(16).padLeft(2, "0") + rgb.g.toString(16).padLeft(2, "0") + rgb.b.toString(16).padLeft(2, "0");
        }
    }
}