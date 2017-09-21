/** ********************************************************
* DataLayer - Class to handle AJAX IO
*
**********************************************************/
/* eslint-disable */
define(['domlib', 'modules/tesco.utils', 'modules/tesco.analytics', 'modules/checkout/loader'], function ($, utils, analytics, loader) {
  function DataLayer(settings) {
    if (settings) {
      $.extend(DataLayer.Properties, settings);
    }

    if (DataLayer.Properties.singleton) {
      if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
      }
      arguments.callee._singletonInstance = this;
    }
    this.init.apply(this, arguments);
  }

  DataLayer.Properties = {
    postUrl: '',
    lastPostUrl: '',
    lastRequest: '',
    lastResponseCode: '',
    method: 'POST',
    dataType: 'json',
    singleton: false,
    currentlyExecuting: false,
    maxQueueLength: 99,
    delayBetweenRequests: false,
    delayRequest: 1000,
    isDestroyed: false,
    timeout: 60000,
    errorHandler: {
      409: 'refresh',
      500: 'refresh'
    }
  },

	DataLayer.prototype = {
  init: function () {
    this._queue = [];
  },

  get: function (url, dataobj, oElem, handlerNS, sRequest, doneCallback, failCallback, completeCallback, overrideTransportType) {
			// if the timeout is the default check if the backend is returning a different value
    if (DataLayer.Properties.timeout === 60000) {
      DataLayer.Properties.timeout = Data.Global.getTimeout();
    }

    $.ajaxSetup({
      timeout: DataLayer.Properties.timeout
    });

			// If Safari 6, then add cache-control header to stop the infamous Ajax POST cache issue.
    try {
      var userAgent = navigator.userAgent;
      if (userAgent.indexOf('Safari') > 0) {
        userAgent = userAgent.substring(userAgent.indexOf('Version/') + 8);
        version = userAgent.substring(0, userAgent.indexOf('.'));
        if (version === '6') {
          $.ajaxSetup({
            headers: { 'cache-control': 'no-cache, must-revalidate, max-age=0, no-store' }
          });
        }
      }
    }
			catch (e) {

}

			// No handler object passed, so use our TESCO default handler
    if (handlerNS === null) {
      handlerNS = Data.Common;
    }

    if (DataLayer.Properties.singleton === true && DataLayer.Properties.currentlyExecuting) {
      if (this._queue.length <= DataLayer.Properties.maxQueueLength) {
        Data.Utils.addAjaxLoaderPerRequest(sRequest, oElem);
        this._queue.push(arguments);
      }
    }
    else {
      this.execute(url, dataobj, oElem, handlerNS, sRequest, doneCallback, failCallback, completeCallback, overrideTransportType);
    }
  },
  execute: function (url, dataobj, oElem, handlerNS, sRequest, doneCallback, failCallback, completeCallback, overrideTransportType) {
    DataLayer.Properties.currentlyExecuting = true;

    var _self = this;
    this.objXHTTP = $.ajax({
      url: url,
      type: overrideTransportType || DataLayer.Properties.method,
      dataType: DataLayer.Properties.dataType,
      data: dataobj,
      beforeSend: function (jqXHR, settings) {
        // Add ajax loaders over relevant modules
        settings.url = url;
        Data.Utils.addAjaxLoaderPerRequest(sRequest, oElem);
      },
      success: function (oResp, textStatus, jqXHR) {
        var _callbackRes;
        if ($.isFunction(doneCallback)) {
          _callbackRes = doneCallback(oResp, oElem);
        }

        if (_callbackRes === 'destroy') {
          DataLayer.Properties.isDestroyed = true;
          return;
        }

					// If request is inline, e.g. store details, surpress default complete method as this call the default data handler method.
        if (!Data.Utils.isInlineRequest(sRequest)) {
          _self.done(oResp, oElem, sRequest, handlerNS);
        }
      },
      error: function (xhr, status, errorThrown) {
        if ($.isFunction(failCallback)) {
          failCallback(xhr, status, errorThrown, oElem);
        }
        _self.fail(xhr, status, errorThrown, oElem);
      },
      complete: function (xhr, status) {
        DataLayer.Properties.currentlyExecuting = false;

        if ($.isFunction(completeCallback)) {
          DataLayer.Properties.currentlyExecuting = true;
          completeCallback(xhr, status, oElem, sRequest);
        }

        _self.complete(xhr, status, oElem, sRequest);
      }
    });
  },

  fail: function (xhr, status, errorThrown, oElem) {
			/* Below check is to re-direct the user to sign-in/register page if session expires
			 * href is hard-coded as per dev team. should find a generic way to handle this.
			 * */
    if (status == 'parsererror' && xhr.responseText.indexOf('Sign In') > 0) {
      location.href = '/' + utils.getSiteContext() + '/my/register.page?stimeout=true';
    }

			 /*
			  * This is for the epic 3185 to prevent XSS attack on the site.
			  * On the server side if any request contains any malicious HTML or JS scripts the server will send a 404 response.
			  * However for Ajax requests  page needs to get refreshed
			  * */
    if (status == 'parsererror' && xhr.responseText.indexOf('Sorry, we can') > 0) {
      location.reload(true);
    }

			// Default timeout behaviour is to reload the current page and also on error.
			// || status === 'error'
    if (status === 'timeout') {
      utils.refreshCurrentPage();
    }

			// Handler for HTTP error codes
    switch (DataLayer.Properties.errorHandler[xhr.status]) {
      case 'refresh': utils.refreshCurrentPage();
        break;
    }

    DataLayer.Properties.currentlyExecuting = false;
    DataLayer.Properties.isDestroyed = false;
  },

  done: function (oResp, oElem, sRequest, handlerNS) {
    handlerNS.handler(oResp, oElem);
    Data.Utils.removeAjaxLoadersPerRequest(oElem, sRequest);
  },

  complete: function (xhr, status, oElem, sRequest) {
    var $completeEvent;
			// If the request needs to be thrown out
    if (DataLayer.Properties.isDestroyed) {
      DataLayer.Properties.isDestroyed = false;
    }
    else {
      DataLayer.Properties.lastResponseCode = this.objXHTTP.status;
      DataLayer.Properties.lastPostUrl = this.objXHTTP.url;
      DataLayer.Properties.lastRequest = sRequest;
      DataLayer.Properties.currentlyExecuting = false;

				// Check if the dependency has been loaded
      if (analytics) {
        var _oMVT = new analytics.MVT();
        _oMVT.testAndTarget.apply(undefined, arguments);
      }
    }
    this.processQueue();
    $completeEvent = new $.Event('ajaxFrameworkCallComplete');
    $completeEvent.data = {};
    $completeEvent.data.request = sRequest;
    $completeEvent.data.status = status;
    $(window).trigger($completeEvent);
  },
  processQueue: function () {
    if (DataLayer.Properties.singleton === true) {
      if (this._queue.length > 0) {
        if (DataLayer.Properties.delayBetweenRequests) {
          setTimeout(function () {
            this.execute.apply(this, this._queue.shift());
          }, DataLayer.Properties.delayRequest);
        }
        else {
          this.execute.apply(this, this._queue.shift());
        }
      }
    }
  }
};

  var Global = function () {
    var myInlineRequests = [];
    var myRequests = [];
    var myModules = {};
    var myActions = {};
    var myDefaultActions = {};
    var myTimeout = 60000;

    return {
      init: function (oOptions) {
        $.merge(myInlineRequests, oOptions.inlineRequests);
        $.extend(true, myRequests, oOptions.requests);
        $.extend(true, myModules, oOptions.modules);
        $.extend(true, myActions, oOptions.actions);
        $.extend(true, myDefaultActions, oOptions.defaultActions);
        if (oOptions.timeout) {
          if (!isNaN(oOptions.timeout)) {
            myTimeout = parseInt(oOptions.timeout);
          }
        }
      },
      addInlineRequests: function (oRequests) {
        $.extend(true, myInlineRequests, oRequests);
      },
      getInlineRequests: function () {
        return myInlineRequests;
      },
      addRequests: function (oRequests) {
        $.extend(true, myRequests, oRequests);
      },
      getRequests: function () {
        return myRequests;
      },
      addModules: function (oModules) {
        $.extend(true, myModules, oModules);
      },
      getModules: function () {
        return myModules;
      },
      addActions: function (oActions) {
        $.extend(true, myActions, oActions);
      },
      getActions: function () {
        return myActions;
      },
      addDefaultActions: function (oDefaultActions) {
        $.extend(true, myDefaultActions, oDefaultActions);
      },
      getDefaultActions: function () {
        return myDefaultActions;
      },
      setTimeout: function (iVal) {
        myTimeout = parseInt(iVal);
      },
      getTimeout: function () {
        return myTimeout;
      }
    };
  }();


  var Data = {
    DataLayer: DataLayer,
    Utils: {
				/** * Return array of modules affected by user request/action **/
      getModulesForRequest: function (oRequest) {
        var _requests = Data.Global.getRequests();
        if (_requests) {
          return _requests[oRequest];
        }
      },
      getModuleInformation: function (sModule) {
        var _modules = Data.Global.getModules();
        if (_modules) {
          return _modules[sModule];
        }
      },
      isInlineRequest: function (sRequest) {
        var _inlineRequests = Data.Global.getInlineRequests();
        if ($.inArray(sRequest, _inlineRequests) >= 0) {
          return true;
        }
        else {
          return false;
        }
      },
      getAction: function (sRequest, oForm) {
        var _formAction = utils.getFormAction(oForm);
        var _actions = Data.Global.getActions();
        if (_formAction !== '') {
          return _formAction;
        }
        else {
          if (_actions) {
            try {
              if (_actions[sRequest][0] === '') {
                throw 'not found';
              }
              return _actions[sRequest][0];
            }
			                catch (e) {
                  var _defaultActions = Data.Global.getDefaultActions();
                  return _defaultActions[sRequest][0];
                }
          }
        }
      },
      removeAjaxLoadersPerRequest: function (oElem, sRequest) {
        var _affectedModules = Data.Utils.getModulesForRequest(sRequest);
        for (var i = 0; i < _affectedModules.length; i++) {
          var val = _affectedModules[i];
          var _moduleInfo = Data.Utils.getModuleInformation(val);
          if (_moduleInfo.length > 0) {
            if (_moduleInfo[2] === false) {
              var $selector = utils.getDeliveryGroup(oElem).find(_moduleInfo[0]);
            }
            else {
              var $selector = $(_moduleInfo[0]);
            }
            utils.removeAjaxLoader($selector);
          }
        }
      },


				/** *
				* We need to add an ajax loader to each specific module on what action the user has taken, this function maps the request to the modules
				*/
      addAjaxLoaderPerRequest: function (oRequest, oElem) {
        var _affectedModules = Data.Utils.getModulesForRequest(oRequest);
        for (var i = 0; i < _affectedModules.length; i++) {
          var val = _affectedModules[i];
          var _moduleInfo = Data.Utils.getModuleInformation(val);
          if (_moduleInfo.length > 0) {
            if (_moduleInfo[3] === false || _moduleInfo[3] === undefined) {
              if (typeof _moduleInfo[3] !== 'object') {
                if (_moduleInfo[2] === false) {
                  var $selector = utils.getDeliveryGroup(oElem).find(_moduleInfo[0]);
                }
                else if (_moduleInfo[2] === 'basket') {
                  var $selector = utils.getProductTile(oElem).find(_moduleInfo[0]);
                }
                else {
                  var $selector = $(_moduleInfo[0]);
                }
                loader($selector, _moduleInfo[1]);
									// utils.addAjaxLoader($selector, _moduleInfo[1]);
              }
            }
            else {
						 		// We have passed a custom object to be performed as the Ajax loader
              if (typeof _moduleInfo[3] === 'object') {
                _moduleInfo[3].ajaxLoader.apply(undefined, arguments);
              }
              if (typeof _moduleInfo[3] === 'function') {
                _moduleInfo[3]();
              }
            }
          }
        }
      }
    },
    Common: {
				/** *
			    *   From the oElem (DOM element which triggered data), we can determine which module has been triggered
			    **/
      handler: function (oJSON, oElem) {
			        // Based on JSON response, we need to look up each element in object, relate it to the module and then lookup the module for the DOM element
        $.each(oJSON, function (k, v) {
          if (k === 'analytics') {
            if (analytics) {
              var _oWebAnalytics = new analytics.WebMetrics();
              _oWebAnalytics.submit(v);
            }
          }
          else if (k === 'redirection') {
            var sLocation = v;
			            	// Added condition to check if "error" attribute exists
            if (oJSON.error != undefined) {
              sLocation += '&error=' + oJSON.error;
            }
            location.href = sLocation;
          }
          else {
            if (Data.Handlers.Checkout.isCustomModule(k)) {
              var _myModuleSelector = '#' + k;
            }
            else {
                                  // Get Module information, dom element, message and if it is a global element
              var _myModuleInfo = Data.Utils.getModuleInformation(k);
              var _myModuleSelector = _myModuleInfo[0];
            }

			                // Update DOM with markup returned
            var _markup = Data.Common.cleanMarkup(v);
            try {
			                    // Do not allow no html to be inserted
              if (_markup != '') {
                if (_myModuleInfo !== undefined && _myModuleInfo[4] === true) {
                  $(_myModuleSelector).replaceWith(_markup);
                }
                else {
                  $(_myModuleSelector).get(0).innerHTML = _markup;
                }
              }
            }
			                catch (e) {

                }
          }
        });
      },
      cleanMarkup: function (sHTML) {
        if (sHTML != null) {
          return sHTML.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g, '');
        }
        else {
          return '';
        }
      }
    },
    Global: Global,
    Handlers: {
      Checkout: {
				    /** *
				    *   From the oElem (DOM element which triggered data), we can determine which module has been triggered and which, if applicable, delivery group.
				    **/
        handler: function (oJSON, oElem) {
				        // Based on JSON response, we need to look up each element in object, relate it to the module and then lookup the module for the DOM element
          $.each(oJSON, function (k, v) {
            if (k === 'analytics') {
              var _oWebAnalytics = new analytics.WebMetrics();
              _oWebAnalytics.submit(v);
            }
            else if (k === 'redirection') {
              location.href = v;
            }
            else {
				                // Get the module DOM element
              if (Data.Handlers.Checkout.isCustomModule(k)) {
                var _myModuleSelector = '#' + k;
              }
              else {
				                    // Get Module information, dom element, message and if it is a global element
                var _myModuleInfo = Data.Utils.getModuleInformation(k);
                var _myModuleSelector = _myModuleInfo[0];
                if (_myModuleInfo[2] == false) {
				                        // Get the module within the delivery group if we are not updating all the delivery groups
                  _myModuleSelector = utils.getDeliveryGroup(oElem).find(_myModuleSelector);
                }
              }
				                // Update DOM with markup returned
              var _markup = Data.Handlers.Checkout.cleanMarkup(v);
				                // $(_myModuleSelector).html(_markup);
              try {
				                    // Do not allow no html to be inserted
                if (_markup != '') {
                  $(_myModuleSelector).get(0).innerHTML = _markup;
                }
              }
				                catch (e) {

                }
            }
          });
        },
        cleanMarkup: function (sHTML) {
          if (sHTML != null) {
            return sHTML.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g, '');
          }
          else {
            return '';
          }
        },
        isCustomModule: function (sModule) {
				        // If module contains "dg-", we know the backend is targeting a specific delivery group
          return sModule.match(/dg-/g) ? true : false;
        }
      }
    }

  };

  return Data;
});
