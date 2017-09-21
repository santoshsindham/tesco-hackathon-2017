/*globals window, define*/
define([
    'domlib',
    'modules/common',
    'modules/tesco.data',
    'modules/pdp-configurator/product-updater',
    'modules/tesco.utils',
    'modules/breakpoint'
], function ($, common, data, productUpdater) {
    'use strict';
    var init,
        addQueryParam,
        globalOptions;

    globalOptions = {
        'inlineRequests': [],
        'requests': {
            'tablet': ['tablet'],
            'productDetailOverlay': ['productDetailOverlay'],
            'case': ['case'],
            'accessory': ['accessory']
        },
        'modules': {
            'productDetailOverlay': ['.pdp-configurator-info', '', true, false, true, true],
            'tablet': ['.configurator-container .product-selector.tablet .product-selector-block', '', true, false, true, true],
            'case': ['.configurator-container .product-selector.case .product-selector-block', '', true, false, true, true],
            'accessory': ['.configurator-container .accessory .product-selector-block', '', true, false, true, true]
        },
        'actions': {
            'productDetailOverlay': ['/direct/json/productdetails/hudlMediaData.jsp']
        },
        'defaultActions': {
            'productDetailOverlay': ['/direct/json/productdetails/hudlMediaData.jsp']
        }
    };

    init = function init() {
        productUpdater.subscribe(function (requestParams, requestName, onCompleteCallback) {
            var url = requestParams.actionurl || data.Utils.getAction(requestName, null),
                dataLayer = new data.DataLayer(),
                requestModule = {
                    modules: globalOptions.requests[requestName]
                };

            dataLayer.get(addQueryParam(url, 'dataBlockId', window.PDPCONFIGURATOR.dataBlockId), $.extend(requestParams, requestModule), null, null, requestName, null, null, onCompleteCallback);
        });
    };

    addQueryParam = function addQueryParam(url, key, val) {
        url = url + (url.indexOf('?') > -1 ? '&' : '?');
        url = url + key + '=' + val;
        return url;
    };

    common.init.push(function () {
        if ($('.pdp-configurator').length > 0) {

            if ($('.pdp-configurator').hasClass('BUILDKIT')) {
                globalOptions.actions.productDetailOverlay = ['/stubs/hudl2-variants.php'];
                globalOptions.defaultActions.productDetailOverlay = ['/stubs/hudl2-variants.php'];
            }

            data.Global.init(globalOptions);
            init();
        }
    });

    return {
        addQueryParam : addQueryParam
    };

});