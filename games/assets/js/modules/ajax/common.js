/*jslint regexp: true, nomen: true */
/*globals window,document,console,define,require,jQuery */
define('modules/ajax/common', ['domlib', 'modules/errors/common', 'modules/settings/common'], function ($, errorsModule, SETTINGS) {
    'use strict';
    /**
    * The mvAPI Framework
    * @version 1.1.02
    * @exports ajax
    * @namespace AJAX
    */
    var self = {},
        isExecuting = false,
        ajaxQueue = [],
        maxQueueLength = 100,
        isValidJsonString = function isValidJsonString(str) {
            var isValid = false;
            if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                isValid = true;
            }
            return isValid;
        },
        handleAtg = function handleAtg(params) {
            var id = params.id || null,
                sourceObject = params.sourceObject || null,
                updateModel = (params.actions && params.actions.updateModel) ? params.actions.updateModel : null;

            return updateModel(id, sourceObject);
        },
        executeRequest = function executeRequest(params) {
            isExecuting = true;
            $.ajax({
                url: params.url,
                data: params.data || '',
                type: params.type || 'GET',
                async: params.async || 'true',
                dataType: params.dataType || 'html',
                contentType: params.contentType || 'application/x-www-form-urlencoded; charset=UTF-8',
                success: params.callbacks.success,
                error: params.callbacks.error,
                complete: params.callbacks.complete
            });
        },
        processAjaxQueue = function processAjaxQueue() {
            if (ajaxQueue.length) {
                executeRequest(ajaxQueue.shift());
            }
        },
        handleHeader = function handleHeader(data) {
            if (isValidJsonString(data) && self.handleAtgResponseHeader) {
                self.handleAtgResponseHeader(JSON.parse(data));
            }
        },
        extendSuccessCallback = function extendSuccessCallback(callback) {
            var callbackBeforeExtension = callback,
                callbackAfterExtension = function callbackAfterExtension(data) {
                    callbackBeforeExtension.apply(this, arguments);
                    handleHeader(data);
                };
            return callbackAfterExtension;
        },
        sendRequest = function sendRequest(params) {
            var errorDetails = {},
                callbacks = {
                    success: (params.callbacks && params.callbacks.success) ? extendSuccessCallback(params.callbacks.success) : function (data) {
                        console.log('[AJAX] Request successful.', data);
                    },
                    error: (params.callbacks && params.callbacks.error) ? params.callbacks.error : function (error) {
                        errorDetails.message = error.message || '[AJAX] Request failed.';
                        errorsModule.handle(errorDetails);
                    },
                    complete: function () {
                        isExecuting = false;
                        if (params.callbacks.userComplete) {
                            params.callbacks.userComplete();
                        }
                        processAjaxQueue();
                    },
                    userComplete: (params.callbacks && params.callbacks.complete) ? params.callbacks.complete : null
                };

            params.callbacks = callbacks;

            params.url = params.url || SETTINGS.CONSTANTS.URL.GENERIC.TEST_DATA_ENDPOINT;

            if (ajaxQueue.length <= maxQueueLength && isExecuting) {
                ajaxQueue.push(params);
            } else {
                executeRequest(params);
            }

        },
        AjaxDataLayer = function AjaxDataLayer() {
            if (AjaxDataLayer.prototype._singletonInstance) {
                return AjaxDataLayer.prototype._singletonInstance;
            }
            AjaxDataLayer.prototype._singletonInstance = self;
            return AjaxDataLayer.prototype._singletonInstance;
        };

    self = {
        /**
        * @method get
        * @memberof AJAX
        * @param {object} params - An AJAX request related parameters
        *    @param {string} [params.url] - Request URL to a service | If not provided, no AJAX request will be send
        *    @param {object} [params.data] - Request data to be send to a service | If not provided, an empty JSON object will be send
        *    @param {bool} [params.async] - States if request should be sent asynchronously | True by default
        *    @param {string} [params.dataType] - States what type of data to expect from service | If not provided, type of 'html' will be expected
        *    @param {string} [params.contentType] - States what type of data is being send to a service | If not provided, type of 'application/x-www-form-urlencoded; charset=UTF-8' will be set
        *    @param {object} [params.callbacks] - Response callbacks, possible values: success, error
        *        @param {callback} [params.callbacks.success] - A method to be invoked after receiving success response from a service
        *        @param {callback} [params.callbacks.error] - A method to be invoked after receiving error response from a service
        */
        get: function get(params) {
            params.type = "GET";
            sendRequest(params);
        },
        /**
        * @method post
        * @memberof AJAX
        * @param {object} params - An AJAX request related parameters
        *    @param {string} [params.url] - Request URL to a service | If not provided, no AJAX request will be send
        *    @param {object} [params.data] - Request data to be send to a service | If not provided, an empty JSON object will be send
        *    @param {bool} [params.async] - States if request should be sent asynchronously | True by default
        *    @param {string} [params.dataType] - States what type of data to expect from service | If not provided, type of 'html' will be expected
        *    @param {string} [params.contentType] - States what type of data is being send to a service | If not provided, type of 'application/x-www-form-urlencoded; charset=UTF-8' will be set
        *    @param {object} [params.callbacks] - Response callbacks, possible values: success, error
        *        @param {callback} [params.callbacks.success] - A method to be invoked after receiving success response from a service
        *        @param {callback} [params.callbacks.error] - A method to be invoked after receiving error response from a service
        */
        post: function post(params) {
            params.type = "POST";
            sendRequest(params);
        },
        /**
        * @method handleAtg
        * @memberof AJAX
        * @param {object} params
        */
        handleAtg: handleAtg
    };

    //Exposing public methods
    return new AjaxDataLayer();
});