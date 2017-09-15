/*global dope dopeVars*/

dope.async(
    dopeVars.component,
    dope.component('extensions.string')
        .then(() => {
            Object.defineProperties(Date, {
                localizationComponents: {
                    value: {},
                    enumerable: false,
                    writable: false,
                    configurable: false
                },
                localizations: {
                    value: {},
                    enumerable: false,
                    writable: false,
                    configurable: false
                },
                localizationBase : {
                    value: {
                        R (d) {
                            return d.toUTCString();
                        },
                        s (d) {
                            return dope.sprintf('%04d-%02d-%02dT%02d:%02d:%02d', d.year, d.month + 1, d.date, d.hours, d.minutes, d.seconds);
                        },
                        u (d) {
                            return dope.sprintf('%04d-%02d-%02dT%02d:%02d:%02dZ', d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate() + 1, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
                        }
                    },
                    enumerable: false,
                    writable: false,
                    configurable: false
                }
            });

            Object.assign(Date, {
                loadLocalization (locale) {
                    if (!Date.localizationComponents[locale]) {
                        Date.localizationComponents[locale] = dope.Components.load(`extensions.date.${locale}`);
                    }
                    return Date.localizationComponents[locale];
                }
            });

            let currentLocale = (dope.Interop && dope.Interop.getArg('current-locale')) || 'en-US';
            const currentLocaleLoaded = Date.loadLocalization(currentLocale);

            Date.setDefaultLocale = locale => {
                currentLocale = locale;
                return Date.loadLocalization(currentLocale);
            };

            const toString = Date.prototype.toString;

            Object.assign(Date.prototype, {
                toString (fmt, locale) {
                    var loc;
                    if (!fmt) {
                        return toString.call(this);
                    }
                    if (locale) {
                        if (dope.undef === Date.localizations[locale]) {
                            throw new dope.Exception(`date localizations for ${locale} has not been loaded.`);
                        }
                        loc = Date.localizations[locale];
                    } else {
                        loc = Date.localizations[currentLocale];
                    }
                    if ('function' !== typeof loc[fmt]) {
                        throw new dope.Exception(`format ${fmt} is not dupported by localization for ${locale || currentLocale}.`);
                    }
                    return loc[fmt].call(loc, this);
                }
            });

            return currentLocaleLoaded;
        })
);