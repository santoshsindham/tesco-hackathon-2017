define('modules/pdp/controllers/BaseController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/BaseViewController'
], function ($, fn, BaseViewController) {
  'use strict';

  /**
   *
   * @param {Array<Object>|Object} models
   * @param {Object} options
   * @return {void}
   */
  function BaseController(models, options) {
    var _options = options || {};

    this.type = 'controller';
    this.id = this.createUniqueId();
    this._activeView = null;
    this._activePanel = {};
    this._pendingActions = [];
    this._actionInViewport = [];
    fn.mergeObjects(this, _options, { extend: true });

    if (fn.isArray(models)) {
      this.models = {};

      fn.loopArray.call(this, models, function loopModels(i) {
        this.models[models[i].sNamespace] = models[i];
      });

      if (this.sNamespace !== 'inherit') {
        this.oModel = this.models[this.sNamespace];
      }
    } else {
      this.oModel = models || null;
    }

    if (typeof this._bindEvents === 'function') {
      this._bindEvents();
    }
  }

  fn.inherit(BaseController, BaseViewController);

  /**
   * Method creates a view and runs post render actions on the view. This method is used for when
   * a component is bieng rendered from the server and we still want to create a view and bind
   * events in the client.
   * @param {Object} oData The data required to create the view.
   * @return {void}
   */
  BaseController.prototype.createView = function (oData) {
    var _oData = oData,
      ClsView = this.views.classes[_oData.sViewName],
      oView = null;

    if (typeof ClsView !== 'function') {
      return false;
    }

    _oData.oModel = this.oModel;
    oView = new ClsView(_oData);

    this._storeView(oView);

    if (this.isArray(_oData.methods, true)) {
      _oData.oView = oView;

      this.forLoop(_oData.methods, function (i) {
        this[_oData.methods[i]](oData);
      });
    }

    return oView;
  };

  BaseController.prototype.destroyView = function (args) {
    var view = this._getStoredView(args.sViewName, args.getView);

    if (this.isObject(view, true)) {
      view.destroy();
      this._deleteStoredView(args.sViewName, args.getView);
    }
  };

  BaseController.prototype.postRenderHook = function (oData) {
    oData.oView.postRenderHook();
    this._storeView(oData.oView);

    if (this._bindEventsPostRender !== undefined) {
      this._bindEventsPostRender();
    }

    if (this._bindViewEvents !== undefined) {
      this._bindViewEvents(oData);
    }

    this._resolvePendingActions();
  };

  BaseController.prototype._storeView = function (view) {
    var i = 0;

    if (!this.hasOwnProperty('views')) {
      this.views = {};
    }

    if (!this.views.hasOwnProperty('objects')) {
      this.views.objects = {};
    }

    if (!this.views.objects.hasOwnProperty(view.sViewName)) {
      this.views.objects[view.sViewName] = [];
    }

    i = this.views.objects[view.sViewName].length - 1;

    for (; i >= 0; i -= 1) {
      if (view.sViewId === this.views.objects[view.sViewName][i].sViewId) {
        this.views.objects[view.sViewName].splice(i, 1);
      } else if (!document.getElementById(this.views.objects[view.sViewName][i].sViewId)) {
        this.views.objects[view.sViewName].splice(i, 1);
      }
    }

    this.views.objects[view.sViewName].push(view);
  };

  BaseController.prototype._resolvePendingActions = function () {
    var i = 0,
      resolved = false;

    if (this.isArray(this._pendingActions, true)) {
      i = this._pendingActions.length - 1;

      for (; i >= 0; i -= 1) {
        if (typeof this._pendingActions[i] === 'function') {
          resolved = this._pendingActions[i].call(this);

          if (resolved) {
            this._pendingActions.splice(i, 1);
          }
        }
      }
    }
  };

  BaseController.prototype._getDataFromModel = function (oData, _fnCallback) {
    var _this = this,
      oPromise = _this.oModel.promise({
        sSearchKey: oData.oGetParams.sSearchKey,
        mSearchValue: oData.oGetParams.mSearchValue,
        sPropKey: oData.oGetParams.sPropKey
      });

    oPromise.done(function (mPromiseData) {
      var oParams = {};

      if (_this.isArray(mPromiseData, true)
          || (!_this.isArray(mPromiseData, true) && mPromiseData)) {
        oParams.oData = oData;
        oParams.mPromiseData = mPromiseData;
        _fnCallback.call(_this, oParams);
      }
    });
  };

  BaseController.prototype.renderView = function (params) {
    var _this = this,
      _params = params,
      view = undefined;

    this._collateData(_params).done(function collateDataResponse(updatedParams) {
      var _updatedParams = updatedParams,
        toObserve = _params.oView === false,
        renderParams = toObserve ? { observe: true } : {};

      if (_updatedParams.toRefresh) {
        _updatedParams.noCollate = true;
        _this.refreshView(_updatedParams);
        return;
      }

      view = !_params.oView ? _this.createView(_updatedParams) : _params.oView;

      if (view) {
        view.render(renderParams);
      }
    });
  };

  BaseController.prototype.refreshView = function (params) {
    var _params = params,
      view = this._getStoredView(_params.sViewName, _params.getView);

    if (!view && this.isObject(_params.render, true)) {
      $.extend(_params, _params.render);
      delete _params.render;
      this.renderView(_params);
      return;
    }

    if (_params.noCollate) {
      view.refresh(_params);
      return;
    }

    this._collateData(_params).done(function collateDataResponse(updatedParams) {
      view.refresh(updatedParams);
    });
  };

  BaseController.prototype._collateData = function (params) {
    var _params = params,
      flags = {},
      modelData = null,
      deferred = $.Deferred();

    if (this._collateDataDependancies !== undefined) {
      flags = this.sanityCheckData(_params.mParamData.mvc[_params.sNamespace]);

      if (flags.ids && !flags.objects) {
        if (this.isObject(this.oModel, true)) {
          modelData = this.oModel.get({
            mSearchValue: _params.mParamData.mvc[this.sNamespace],
            noFetch: true
          });

          if (this.sanityCheckData(modelData).objects) {
            _params.mParamData.mvc[this.sNamespace] = modelData;
          }
        } else if (this.isObject(this.models, true)
            && this.isObject(this.models[_params.sNamespace])) {
          modelData = this.models[_params.sNamespace].get({
            mSearchValue: _params.mParamData.mvc[_params.sNamespace],
            noFetch: true
          });

          if (this.sanityCheckData(modelData).objects) {
            _params.mParamData.mvc[_params.sNamespace] = modelData;
          }
        }
      }
    }

    if ((this._collateDataDependancies !== undefined
          && this._collateDataConditional === undefined)
        || (this._collateDataDependancies !== undefined
          && this._collateDataConditional !== undefined
          && this._collateDataConditional(_params))) {
      _params.deferred = deferred;
      this._collateDataDependancies(_params);
    } else {
      deferred.resolve(_params);
    }

    return deferred.promise();
  };

  BaseController.prototype._getStoredView = function (name, method) {
    if (!this.isObject(this.views) || !this.isObject(this.views.objects)
        || !this.isArray(this.views.objects[name])) {
      return false;
    }

    return this.forLoop(this.views.objects[name], function loopViews(i) {
      if (method.call(this, this.views.objects[name][i])) {
        return this.views.objects[name][i];
      }
      return undefined;
    });
  };

  BaseController.prototype._deleteStoredView = function (name, method) {
    this.forLoop(this.views.objects[name], function loopViews(i) {
      if (method.call(this, this.views.objects[name][i])) {
        this.views.objects[name].splice(i, 1);
        return true;
      }
      return undefined;
    });
  };

  BaseController.prototype.fetchData = function (params) {
    var _params = params,
      callback = undefined;

    if (!_params.queryParams.searchValue
        || (Array.isArray(_params.queryParams.searchValue)
            && !_params.queryParams.searchValue.length)) {
      return;
    }

    callback = function fetchDataCallback(data) {
      if (_params.queryParams.doneCallback) {
        _params.queryParams.doneCallback.call(this, data);
      }
    };

    this.oModel.fetch({
      sSearchKey: _params.queryParams.searchKey || 'id',
      mSearchValue: _params.queryParams.searchValue,
      sModelMethod: _params.queryParams.modelMethod,
      createEndpointCallback: _params.queryParams.createEndpointCallback,
      doneCallback: callback.bind(this)
    });
  };


  /**
   *
   * @param {Function|Undefined} destroyRootView
   * @param {JQueryDeferred} deferred
   * @return {Function}
   */
  BaseController.prototype._setRejectDeferredMethod = function (destroyRootView, deferred) {
    /**
     *
     * @param {any} data optional
     * @return {void}
     */
    return function rejectDeferred(data) {
      if (typeof destroyRootView === 'function') {
        destroyRootView();
      }
      deferred.reject(data);
    };
  };


  /**
   *
   * @param {string} viewID
   * @param {JQueryDeferred} _deferred Used for unit tests
   * @return {void}
   */
  BaseController.prototype._checkInViewport = function (viewID, _deferred) {
    var checkInViewport = { name: 'checkInViewport' };

    checkInViewport.data = { _deferred: _deferred, scope: this, viewID: viewID };
    fn.createEvent(checkInViewport).fire();
  };


  /**
   *
   * @return {Array<Object>}
   */
  BaseController.prototype.getActionInViewport = function () {
    return this._actionInViewport;
  };


  /**
   *
   * @param {Object} args
   * @param {Element} args.element
   * @param {Object} args.callbackArgs
   * @return {this}
   */
  BaseController.prototype.setActionInViewport = function (args) {
    var _args = args || {};

    if (!(_args.element instanceof Element)
        || !fn.isObject(args.callbackArgs, { notEmpty: true })) {
      return this;
    }

    this._actionInViewport.push(args);
    return this;
  };


  return BaseController;
});
