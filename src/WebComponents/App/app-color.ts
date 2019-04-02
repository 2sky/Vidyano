namespace Vidyano.WebComponents {
    interface IRGB {
        r: number;
        g: number;
        b: number;
    }

    /// Based on Material Design Color Generator by fireflight1 (https://github.com/fireflight1/mcg)
    export class AppColor {
        private _rgb: IRGB;
        private _faint: string;
        private _semiFaint: string;
        private _lighter: string;
        private _light: string;
        private _dark: string;
        private _darker: string;

        constructor(private _base: string) {
            this._rgb = this._hexToRgb(_base);

            this._faint = this._calculateVariant(this._rgb, 0.07);
            this._semiFaint = this._calculateVariant(this._rgb, 0.15);
            this._lighter = this._calculateVariant(this._rgb, 0.31);
            this._light = this._calculateVariant(this._rgb, 0.7);
            this._dark = this._calculateVariant(this._rgb, 0.81, true);
            this._darker = this._calculateVariant(this._rgb, 0.52, true);
        }

        get rgb(): string {
            return `${this._rgb.r}, ${this._rgb.g}, ${this._rgb.b}`;
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