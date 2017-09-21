/*globals window,document,console,define,require */
/*jslint plusplus: true, regexp: true */

define('modules/mvapi/common', ['domlib', 'modules/settings/common', 'modules/mvapi/views', 'modules/mvapi/models', 'modules/mvapi/router', 'modules/ajax/common', 'modules/tesco.analytics'], function ($, SETTINGS, views, models, router, ajax, analytics) {
    'use strict';
    /**
    * The mvApi Framework
    * @version 1.0.11
    * @exports mvapi
    * @namespace mvApi
    */
    var render, navigateTo, getModel, updateModel, checkTemplateExists, loadTemplate, addTemplateToDOM, prepareView, prepareModel, cacheInitialModels, cacheSessionData, mergeModels, checkType, preloadMasterTemplate, registerRoutes, resetModel, getCurrentSection, returnedRouter, subscribe, unsubscribe, publish, o = $({}),
        SESSION = {},
        ROUTER_DATA = {
            routes: {
                "*actions": "defaultRoute"
            },
            actions: {}
        };

    //** Temporary solution due to current Kiosk back button technical limitations - START **/

    /*jslint unparam: true*/ //Due to temporary solution
    navigateTo = function navigateTo(route, replaceHistoryEntry, triggerAction) {
        var trigger = (triggerAction === false) ? false : true;
        if (route === 'login' || route === 'delivery' || route === 'review' || route === 'payment') {
            returnedRouter.navigate(route, { trigger: trigger });
            if (trigger) {
                router.setCurrentSection(route);
            }
        } else {
            if (ROUTER_DATA.actions[route]) {
                ROUTER_DATA.actions[route]();
            }
        }
    };
    /*jslint unparam: false*/

    //navigateTo = function navigateTo(route, replaceHistoryEntry, triggerAction) {
    //    var trigger = (triggerAction === false) ? false : true,
    //        replace = replaceHistoryEntry || false;
    //    returnedRouter.navigate(route, { trigger: trigger, replace: replace });
    //    if (trigger) {
    //        router.setCurrentSection(route);
    //    }
    //};

    //** Temporary solution due to current Kiosk back button technical limitations - END **/

    registerRoutes = function registerRoutes(routes) {
        var id;
        for (id in routes) {
            if (routes.hasOwnProperty(id)) {
                ROUTER_DATA.actions[id] = routes[id];
            }
        }
        returnedRouter = router.init(ROUTER_DATA);
    };

    getCurrentSection = function getCurrentSection() {
        return router.getCurrentSection();
    };

    checkType = function checkType(functionToCheck) {
        var getType = {}, type;

        if (functionToCheck && getType.toString.call(functionToCheck) === '[object Function]') {
            type = 'callback';
        } else if (functionToCheck && getType.toString.call(functionToCheck) === '[object Object]') {
            type = 'model';
        } else {
            type = null;
        }

        return type;
    };

    prepareModel = function prepareModel(modelId, paramOne, paramTwo) {
        var modelChange, callback, MODELS = models.getAll();

        if (checkType(paramOne) === 'model') {
            modelChange = paramOne;
        } else if (checkType(paramTwo) === 'model') {
            modelChange = paramTwo;
        }

        if (checkType(paramOne) === 'callback') {
            callback = paramOne;
        } else if (checkType(paramTwo) === 'callback') {
            callback = paramTwo;
        }

        if (modelChange) {
            if (MODELS[modelId].request) {
                delete MODELS[modelId].request.data;
            }

            $.extend(true, MODELS[modelId], modelChange);

            if (!modelChange.request && MODELS[modelId] && MODELS[modelId].request) {
                delete MODELS[modelId].request;
            }

            if (modelChange.request && !modelChange.request.callbacks && MODELS[modelId] && MODELS[modelId].request && MODELS[modelId].request.callbacks) {
                delete MODELS[modelId].request.callbacks;
            }
        }

        if (MODELS[modelId] && callback) {
            MODELS[modelId].callback = callback;
        } else if (MODELS[modelId] && MODELS[modelId].callback) {
            delete MODELS[modelId].callback;
        }

        models.saveAll(MODELS);

        return MODELS[modelId];
    };

    addTemplateToDOM = function addTemplateToDOM(id, html) {
        var script = document.createElement('script');
        script.type = 'text/template';
        script.id = id;
        $('body').append(script);
        $('#' + id).empty().html(html);
    };

    checkTemplateExists = function checkTemplateExists(templateId) {
        return document.getElementById(templateId);
    };

    prepareView = function renderView(params) {
        if (params.request && params.request.data && params.request.data.session) {
            $.extend(true, params.request.data, SESSION);
            delete params.request.data.session;
        }
        models.getData(params, views.render);
    };

    loadTemplate = function loadTemplate(params) {
        var id = params.templateId,
            section = params.section,
            ajaxParams = {
                url: SETTINGS.CONSTANTS.URL.GENERIC.MVAPI_TEMPLATES_PATH + section + '/' + id + '.html',
                dataType: 'html',
                callbacks: {
                    success: function (html) {
                        console.log('[mvApi] Template "' + id + '" loaded.');
                        addTemplateToDOM(id, html);
                        prepareView(params);
                        return true;
                    },
                    error: function (error) {
                        console.warn('[mvApi] Error during loading template "' + id + '". Aborting...');
                        console.log('[mvApi] Error details: "' + error);
                        return false;
                    }
                }
            };
        console.log('[mvApi] Template "' + id + '" doesn\'t exist, loading...');

        ajax.get(ajaxParams);

    };

    preloadMasterTemplate = function preloadMasterTemplate(params) {
        var filename = params.filename,
            section = params.section,
            proceed = function () {
                if (params.callback) {
                    params.callback();
                }
            },
            ajaxParams = {
                url: SETTINGS.CONSTANTS.URL.GENERIC.MVAPI_TEMPLATES_PATH + section + '/master/' + filename + '.html',
                dataType: 'html',
                callbacks: {
                    success: function (html) {
                        console.log('[mvApi] Master template "' + filename + '" loaded.');
                        if (!$('#' + filename + '_master').length) {
                            $('body').append('<div id="' + filename + '_master"></div>');
                        }
                        $('#' + filename + "_master").html(html);
                        proceed();
                        return true;
                    },
                    error: function () {
                        console.warn('[mvApi] Loading master template "' + filename + '" failed. Proceeding with single templates.');
                        proceed();
                        return false;
                    }
                }
            };

        ajax.get(ajaxParams);
    };

    render = function (modelId, modelChange, callback) {

        var masterDetails,
            params = prepareModel(modelId, modelChange, callback),
            renderTemplate = function renderTemplate() {
                if (params && params.templateId) {
                    if (checkTemplateExists(params.templateId)) {
                        prepareView(params);
                    } else {
                        loadTemplate(params);
                    }
                } else {
                    console.warn('[mvApi] Missing required templateId parameter. Aborting...');
                }
                
                if (modelChange && modelChange.defaults && modelChange.defaults.analytics) {
					var _oWebAnalytics = new analytics.WebMetrics(),
						_webAnalyticsVar = modelChange.defaults.analytics;

					_oWebAnalytics.submit(_webAnalyticsVar);
                }
            };

        if (params && params.master && !$('#' + params.master + '_master').length) {
            masterDetails = {
                'filename': params.master,
                'section': params.section,
                'callback': renderTemplate
            };
            preloadMasterTemplate(masterDetails);
        } else {
            renderTemplate();
        }

    };

    cacheSessionData = function cacheSessionData(sessionData) {
        if (sessionData) {
            $.extend(true, SESSION, sessionData);
        }
    };

    cacheInitialModels = function cacheInitialModels(initialModels) {
        var MODELS = models.getAll();
        if (initialModels) {
            $.extend(true, MODELS, initialModels);
        }
        models.saveAll(MODELS);
        models.cacheInitials(MODELS);
    };

    mergeModels = function mergeModels(sourceModelId, targetModelId) {
        var warningDetails,
            modelsMergedStatus = false,
            MODELS = models.getAll(),
            sourceModel = MODELS[sourceModelId],
            targetModel = MODELS[targetModelId];

        if (sourceModel && sourceModel.defaults && targetModel) {
            $.extend(true, MODELS[targetModelId].defaults, MODELS[sourceModelId].defaults);
            modelsMergedStatus = true;
        } else {
            console.warn('[mvApi] An attempt to merge models failed. Aborting...');
            warningDetails = (!sourceModel) ? 'No source model with id ' + sourceModelId + ' found or model has no defaults.' : 'No target model with id ' + targetModelId + ' found.';
            console.log('[mvApi]' + warningDetails);
        }
        models.saveAll(MODELS);
        return modelsMergedStatus;
    };

    getModel = function getModel(id) {
        var model, MODELS = models.getAll();
        if (id && MODELS[id]) {
            model = MODELS[id];
        } else {
            model = null;
        }
        return model;
    };

    updateModel = function updateModel(id, sourceObject) {
        return models.update(id, sourceObject);
    };

    resetModel = function resetModel(id) {
        return models.reset(id);
    };

    subscribe = function subscribe() {
        o.on.apply(o, arguments);
    };

    unsubscribe = function unsubscribe() {
        o.off.apply(o, arguments);
    };

    publish = function publish() {
        o.trigger.apply(o, arguments);
    };
   
    return {
        /**
        * @method render
        * @memberof mvApi
        * @param {string} modelId - A model id to be loaded from the cached MODELS object.
        * @param {object} [modelChange] - An object containing changes to the model. The cached MODELS object will be extended by this param.
        * @param {callback} [callback] - A callback to be invoked after rendering the model
        * @example
        * Please note the sequence of the optional params provided (model change or callback) is not mandatory.
        * The 'mvApi' recognizes the type of paramater provided and uses them accordingly.
        *
        * So you can do either one of the following:
        * 'mvApi.render(id)'
        * 'mvApi.render(id, modelChange)'
        * 'mvApi.render(id, modelChange, callback)'
        * 'mvApi.render(id, callback)'
        * 'mvApi.render(id, callback, modelChange)'
        */
        render: render,
        /**
        * @method cacheInitialModels
        * @memberof mvApi
        * @param {object} initialModels - a set of initial data for models provided by section using mvApi each of these models is a set of required and optional parameters:
        *    @param {string} initialModels.templateId - A template id that corresponds to a name of html file under 'mvapi/templates/section_name' path        
        *    @param {string} initialModels.section - A section name that corresponds to a name of subfolder in 'mvapi/templates/section_name' path
        *    @param {string} [initialModels.master] - A master template file name that corresponds to a name of html file under 'mvapi/templates/section_name/master' path
        *    @param {string} [initialModels.placeholderClass] - A class of a wrapper around template content | If not provided, will be generated from templateId by default
        *    @param {string} [initialModels.injectType] - Defines a way the single item template will be injected to its placeholder. Possible options: append, prepend | If not provided, the template content will replace existing content
        *    @param {string} [initialModels.target] - A class of parent element in DOM where template placeholder will be appended into | If not provided, template will be appended to #wrapper by default
        *    @param {object} [initialModels.collection] - An object containing addtional data for rendering collection of items based on the same model instead of single item
        *        @param {string} [initialModels.collection.tagName] - An HTML tag name specifying parent element that will be a wrapper around template content, before injecting it to DOM | If not provided, a 'div' tag will be used
        *        @param {array} [initialModels.collection.items] - An array containing objects (models) being used by each item in the collection (framework will display as many items in the collection, as many of them have been defined in 'items') | If not provided, just one item with 'defaults' will be displayed
        *        @param {bool} [initialModels.collection.emptyParent] - A boolean stating if placeholder should be empty before each collection view rendering
        *    @param {object} [initialModels.request] - States if template rendering needs external data request | If {object}, it can contain further params:
        *        @param {string} [initialModels.request.url] - A custom url to a service where data should be requested from | If not provided, an url provided in SETTINGS.CONSTANTS will be used by default
        *        @param {object} [initialModels.request.data] - An object containing data to be sent to the service, so it can respond accordingly | If not provided, an empty object will be send
        *        @param {array} [initialModels.request.session] - An array containing key(s) of session data to be sent to the service | These keys and appropriate session data should be previously stored in mvApi with cacheSessionData method
        *        @param {object} [initialModels.request.callbacks] - An object containing two callback methods:
        *            @param {callback} [initialModels.request.callbacks.success] - A method to be invoked after receiving a successful response from a service
        *            @param {callback} [initialModels.request.callbacks.error] - A method to be invoked after receiving an error response from a service
        *    @param {object} [initialModels.defaults] - An object containing default values for the template variables
        *    @param {callback} [initialModels.callback] - A method that should be called after template is successfully rendered
        */
        cacheInitialModels: cacheInitialModels,
        /**
        * @method cacheSessionData
        * @memberof mvApi
        * @param {object} params - a nested set of key + value pairs that can be send out with every AJAX request, they should contain the following parameters:
        *    @param {string} params.id - An id of the data storage in cache.
        *    @param {object} params.data - A data object that should be stored in cache under the id provided.
        */
        cacheSessionData: cacheSessionData,
        /**
        * @method mergeModels
        * @memberof mvApi
        * @param {string} sourceModelId - An id of the model the defaults will be taken from.
        * @param {string} targetModelId - An id of the model the defaults will be applied to.
        */
        mergeModels: mergeModels,
        /**
        * @method registerRoutes
        * @memberof mvApi
        * @param {object} routes - a set of key + value pairs containing the following parameters:
        *    @param {string} routes.id - An id of the section that the action provided should be registered at and routed from.
        *    @param {method} routes.action - An action that should be invoked for the '#id' route.
        */
        registerRoutes: registerRoutes,
        /**
        * @method navigateTo
        * @memberof mvApi
        * @param {string} route - A page id that the site should be routed to.
        * @param {bool} [replaceHistoryEntry] - States if current route should replace previous entry in browser's history.
        * @param {bool} [triggerAction] - Allows to explicitly turn off action triggering for route | It is set to true by default.
        */
        navigateTo: navigateTo,
        /**
        * @method getModel
        * @memberof mvApi
        * @param {string} id - An id of the model that should be returned.        
        */
        getModel: getModel,
        /**
        * @method updateModel
        * @memberof mvApi
        * @param {string} id - An id of the model that should be updated.        
        * @param {object} sourceObject - An object that model should be updated from.
        */
        updateModel: updateModel,
        /**
        * @method resetModel
        * @memberof mvApi
        * @param {string} id - An id of the model that should be reset to its initial state.
        */
        resetModel: resetModel,
        /**
         * @method getCurrentSection
         * @memberof mvApi
         * @returns {string}
         */
        getCurrentSection: getCurrentSection,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        publish: publish
    };
});