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
r360.config.serviceUrl = 'http://api.route360.net/api_naturtrip_rc1/';
r360.config.serviceKey = 'iWJUcDfMWTzVDL69EWCG';