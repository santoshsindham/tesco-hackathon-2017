/*globals window,document,console,define */
/*jslint regexp: true, plusplus: true */
define('modules/mvapi/models', ['domlib', 'modules/settings/common', 'backbone', 'modules/ajax/common', 'modules/errors/common', 'modules/chip-and-pin/atg-data'], function ($, SETTINGS, Backbone, ajax, errorsModule, atg) {
    'use strict';

    var getAll, saveAll, update, cacheInitials, reset, atgStringParsed,
        MODELS = {},
        INIT_MODELS = {},
        isArray = function isArray(element) {
            return Object.prototype.toString.call(element) === '[object Array]';
        },
        getData = function getData(params, render) {

            var dataRequestParams = {
                url: (params.request && params.request.url) ? params.request.url : SETTINGS.CONSTANTS.URL.KIOSK_DATA,
                data: (params.request && params.request.data) ? params.request.data : {},
                callbacks: {
                    success: function success(response) {
                        var item, key;

                        if (response) {
                            response = JSON.parse(response);
                            console.log('[mvAPI] Received data from service', response);

                            if (isArray(response)) {
                                params.collection = params.collection || {};
                                params.collection.items = response;
                                render(params);
                            } else {
                                for (item in response) {
                                    if (response.hasOwnProperty(item)) {
                                        if (item === "atgData") {
                                            atgStringParsed = atg.parse(response);
                                            if (atgStringParsed.defaults) {
                                                for (key in atgStringParsed.defaults) {
                                                    if (atgStringParsed.defaults.hasOwnProperty(key)) {
                                                        params.defaults[key] = atgStringParsed.defaults[key];
                                                    }
                                                }
                                            }
                                            if (atgStringParsed.atgData) {
                                                params.atgData = atgStringParsed.atgData;
                                            }

                                        } else {
                                            params.defaults[item] = response[item];
                                        }
                                    }
                                }
                                render(params);
                            }
                        }

                        if (params.request && params.request.callbacks && params.request.callbacks.success) {
                            params.request.callbacks.success(response);
                        }

                        if (params.callback) {
                            params.callback(response);
                        }

                    },
                    error: function error(errorData) {

                        var errorDetails = {
                            'message': '[mvAPI] AJAX Error while requesting data from service, rendering defaults',
                            'public': false,
                            'details': errorData
                        };

                        errorsModule.handle(errorDetails);

                        if (params.request && params.request.callbacks && params.request.callbacks.error) {
                            params.request.callbacks.error();
                        }

                        render(params);
                    }
                }
            };

            if (params.request) {
                ajax.post(dataRequestParams);
            } else {
                render(params);
                if (params.callback) {
                    params.callback();
                }
            }
        };

    getAll = function getAll() {
        return MODELS;
    };

    saveAll = function saveAll(models) {
        if (models && typeof models === 'object') {
            MODELS = models;
        }
    };

    cacheInitials = function cacheInitials(models) {
        var key;
        if (models && typeof models === 'object') {
            for (key in models) {
                if (models.hasOwnProperty(key) && !INIT_MODELS[key]) {
                    INIT_MODELS[key] = models[key];
                }
            }
        }
    };

    update = function update(id, sourceObject) {
        var key, model = (id && MODELS[id] && sourceObject && typeof sourceObject === 'object') ? MODELS[id] : null;
        if (model) {
            if (sourceObject.atgData && typeof sourceObject.atgData === 'string') {
                atgStringParsed = atg.parse(sourceObject);
                if (atgStringParsed && atgStringParsed.defaults) {
                    for (key in atgStringParsed.defaults) {
                        if (atgStringParsed.defaults.hasOwnProperty(key)) {
                            MODELS[id].defaults[key] = atgStringParsed.defaults[key];
                        }
                    }
                }
                if (atgStringParsed && atgStringParsed.atgData) {
                    MODELS[id].atgData = atgStringParsed.atgData;
                }
            } else {
                $.extend(true, MODELS[id], sourceObject);
            }
        }
        return MODELS[id];
    };

    reset = function reset(id) {
        var model = MODELS[id],
            init_model = INIT_MODELS[id];
        if (model && init_model) {
            MODELS[id] = {};
            $.extend(true, MODELS[id], init_model);
        } else {
            console.warn('[mvApi] No model or initial model found for reset operation, aborting...');
        }

        return MODELS[id];
    };

    return {
        getData: getData,
        getAll: getAll,
        saveAll: saveAll,
        cacheInitials: cacheInitials,
        update: update,
        reset: reset,
        create: function get(params) {
            var Model = Backbone.Model.extend({
                defaults: function () {
                    return params;
                }
            });
            return new Model();
        }
    };
});