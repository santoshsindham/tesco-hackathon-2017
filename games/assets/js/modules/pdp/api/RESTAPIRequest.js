define('modules/pdp/api/RESTAPIRequest', [
  'domlib',
  'modules/pdp/HyperMediaModelMap'
], function ($, HyperMediaModelMap) {
  'use strict';

  var RESTAPIRequest = null,
    fnSuccessCallbackDefault = null,
    fnErrorCallbackDefault = null,
    checkIfHyperMediaLinkIsRequired = null;

  fnSuccessCallbackDefault = function (oData, defer) {
    if (defer) {
      defer.resolve(oData);
    }
  };

  fnErrorCallbackDefault = function (args) {
    if (args.deferred) {
      args.deferred.reject({
        params: args.params,
        errorResp: args.errorResp
      });
    }
  };

  checkIfHyperMediaLinkIsRequired = function (oData, oParams) {
    var bResult = false;

    if (!oParams.processHyperMediaType) {
      bResult = oData.href || false;
    } else {
      bResult = (oData.type === oParams.processHyperMediaType) && (oData.href !== undefined);
    }
    return bResult;
  };

  RESTAPIRequest = function (opts) {
    var defOpts = {
      sBaseURL: '/direct/rest/'
    };

    this.options = $.extend({}, defOpts, opts);
    this.aData = [];
    this.oHyperMediaModelMap = new HyperMediaModelMap();
  };

  /* jslint unparam: true*/
  RESTAPIRequest.prototype.send = function send(sEndOfRoute, oParams) {
    var numOfTries = 0,
      maxRetries = 3,
      sUrl = '',
      _this = this,
      params = {};

    if ((oParams && typeof oParams === 'object')) {
      params = oParams;
    }

    if (sEndOfRoute.indexOf('/rest/content/') >= 0) {
      sUrl = sEndOfRoute;
    } else if (sEndOfRoute.indexOf('/direct/blocks/') >= 0) {
      sUrl = sEndOfRoute;
    } else {
      sUrl = this.options.sBaseURL + sEndOfRoute;
    }

    $.ajax({
      method: 'GET',
      timeout: 15000,
      url: sUrl,
      beforeSend: function () {
        var args = arguments;

        args[1].url = sUrl;
      },
      contentType: params.contentType || 'application/json; charset=utf-8',
      dataType: 'json',
      success: function success(oResponseData, sStatusText, oXHR) {
        var parsedResponse = {},
          bCallDefaultSuccessCallback = true,
          aPromises = null;

        try {
          if (oXHR.responseText === undefined
              || oXHR.responseText === ''
              || oXHR.responseText === '{}') {
            throw new SyntaxError('RESTAPIRequest - No data from the server ' + sEndOfRoute);
          }
          parsedResponse = JSON.parse(oXHR.responseText);
        } catch (syntaxError) {
          if (params.fnErrorCallback) {
            params.fnErrorCallback({
              params: oParams,
              deferred: params.oDeferred,
              errorResp: syntaxError
            });
          } else {
            fnErrorCallbackDefault({
              params: oParams,
              deferred: params.oDeferred,
              errorResp: syntaxError
            });
          }
          return;
        }
        if (params.processHyperMedia) {
          if (parsedResponse.links && Array.isArray(parsedResponse.links)) {
            bCallDefaultSuccessCallback = false;
          }
          params.processHyperMedia = false;
          aPromises = _this.processHyperMediaLinks(parsedResponse, params);
        }
        if (aPromises) {
          params.oDeferred.notify(parsedResponse);
          $.when.apply($, aPromises).done(function () {
            fnSuccessCallbackDefault(parsedResponse, params.oDeferred);
          });
        }
        if (params.fnSuccessCallback) {
          params.fnSuccessCallback.call(_this, parsedResponse, params);
        } else if (bCallDefaultSuccessCallback) {
          params.oDeferred.notify(parsedResponse);
          fnSuccessCallbackDefault(parsedResponse, params.oDeferred);
        }
      },
      error: function error(oXHR, sTextStatus) {
        if (sTextStatus === 'timeout') {
          numOfTries += 1;

          if (numOfTries <= maxRetries) {
            $.ajax(this);
            return;
          }
        }

        if (params.fnErrorCallback) {
          params.fnErrorCallback({ params: oParams, deferred: params.oDeferred, errorResp: oXHR });
        } else {
          fnErrorCallbackDefault({ params: oParams, deferred: params.oDeferred, errorResp: oXHR });
        }
      }
    });
  };

  RESTAPIRequest.prototype.fetchData = function fetchData(
    aAPIHrefs, fnSuccessCallback, fnErrorCallback, oParams
  ) {
    var _this = this,
      oDeferred = {},
      params = {},
      fnFetch = function fnFetch(sHref) {
        oDeferred = new $.Deferred();
        params = {
          oDeferred: oDeferred,
          fnSuccessCallback: fnSuccessCallback,
          fnErrorCallback: fnErrorCallback
        };
        if (oParams) {
          params.processHyperMedia = oParams.processHyperMedia || false;
          params.processHyperMediaType = oParams.processHyperMediaType || false;
          params.addHyperMediaLookupToModel = oParams.addHyperMediaLookupToModel || true;
          params.parentDefer = oParams.oDeferred;
          params.sEndpoint = sHref;
        }
        _this.send(sHref, params);
        return oDeferred.promise();
      };

    return $.map(aAPIHrefs, fnFetch, _this);
  };
  RESTAPIRequest.prototype.processHyperMediaLinks = function (oResponseData, oParams) {
    var i = 0,
      aAdditionalRequests = [];

    if (oResponseData.links && Array.isArray(oResponseData.links)) {
      for (i = 0; i < oResponseData.links.length; i += 1) {
        if (checkIfHyperMediaLinkIsRequired(oResponseData.links[i], oParams)) {
          aAdditionalRequests.push({
            id: oResponseData.links[i].id,
            type: oResponseData.links[i].type,
            href: oResponseData.links[i].href
          });
        }
      }
    }
    if (aAdditionalRequests.length) {
      return this.fetchSubsequentHyperMediaLinks(aAdditionalRequests, oParams);
    }
    return null;
  };

  RESTAPIRequest.prototype.fetchSubsequentHyperMediaLinks = function (aAdditionalRequests,
    oParams) {
    var i = 0,
      aHREF = [];

    if (aAdditionalRequests.length) {
      for (i = 0; i < aAdditionalRequests.length; i += 1) {
        aHREF.push(aAdditionalRequests[i].href);
      }
      return this.fetchData(aHREF, this.hyperMediaSuccessHandler, null, oParams);
    }
    return null;
  };

  RESTAPIRequest.prototype.hyperMediaSuccessHandler = function (oData, oParams) {
    var oParsedData = oData,
      oSelfEntity = null;

    if (oParams.parentDefer) {
      oSelfEntity = this.getSelfEntityFromResponse(oParsedData);
      oParsedData.id = oSelfEntity.id;
      oParams.parentDefer.notify(oParsedData);
    }

    /*
    if (oParams.addHyperMediaLookupToModel) {
      this.hyperMediaProgressHandler(oData, oParams);
    }
    */

    oParams.oDeferred.resolve(oParsedData);
  };

  RESTAPIRequest.prototype.hyperMediaProgressHandler = function (oData) {
    var oEventDataAdd = new $.Event('addData'),
      sResponseModelType = '',
      sResponseHyperMediaType = '',
      oSelfHyperMediaEntity = this.getSelfEntityFromResponse(oData);

    if (oSelfHyperMediaEntity) {
      sResponseHyperMediaType = oSelfHyperMediaEntity.type;
      sResponseModelType = this.oHyperMediaModelMap.getModelFromHyperMediaType(
        sResponseHyperMediaType
      );

      oEventDataAdd.namespace = sResponseModelType;
      oEventDataAdd.oData = {
        mAddData: oData
      };
      $(window).trigger(oEventDataAdd);
    }
  };

  RESTAPIRequest.prototype.getSelfEntityFromResponse = function (oData) {
    var i = 0;

    if (oData.links) {
      if (Array.isArray(oData.links)) {
        for (i = 0; i < oData.links.length; i += 1) {
          if (oData.links[i].rel === 'self') {
            return oData.links[i];
          }
        }
      } else {
        return oData.links.self;
      }
    }
    return null;
  };

  return RESTAPIRequest;
});
