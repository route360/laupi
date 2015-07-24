angular.module('cfg', [])
    .constant('$config', {
        mapboxId            : 'mi.94c056dc',
        maxAutoCompletes    : 1,
        markerMinPercent    : 0.6,
        markerMaxPercent    : 0.9,
        notyLayout          : 'topCenter',
        isProduction        : true
    });

r360.config.i18n.language   = 'de';
r360.config.i18n.configuredLanguages = ['de'];

// hier bitte eigene API und KEY eingeben
r360.config.serviceUrl = 'http://api.route360.net/api_brandenburg/';
r360.config.serviceKey = '<<API KEY>>';

// der tolerance Wert sollte immer geringer sein als der StrokeWidth Wert
r360.config.defaultPolygonLayerOptions.strokeWidth = 20
r360.config.defaultPolygonLayerOptions.tolerance = 13;