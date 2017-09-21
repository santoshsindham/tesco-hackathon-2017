define('modules/pdp/controllers/BasePageController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/BaseClass',
  'modules/pdp/classMap',
  /**
   * Add modules below that need to be required in order to be used later in the code and cannot
   * be required normally because of a cyclical dependancy problem.
   */
  'modules/mvc/ev',
  'modules/pdp/views/TooltipPanelView',
  'modules/pdp/views/OverlayPanelGroupView',
  'modules/pdp/views/OverlayPanelView'
], function ($, fn, BaseClass, classMap) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @param {Boolean} config.isKiosk
   * @param {String} config.baseURL
   * @param {String} config.pageType
   * @return {void}
   */
  function BasePageController(config) {
    var _config = config || {};

    this.mc = { model: {}, controller: {} };
    this._bindEvents();
    this.views = {};
    this.isKiosk = _config.isKiosk || false;
    this.baseURL = _config.baseURL || '';
    this.pageGroup = _config.pageGroup || '';
    this.pageType = _config.pageType || '';
    this.pageEventDelegator = _config.pageEventDelegator || '';
  }

  fn.inherit(BasePageController, BaseClass);

  BasePageController.prototype._bindEvents = function () {
    $(window)
      .on('rendered', this._onRendered.bind(this))
      .on('render', this._onRender.bind(this))
      .on('create', this._onCreate.bind(this))
      .on('destroyView', this._onDestroyView.bind(this))
      .on('refresh', this._onRefresh.bind(this))
      .on('addData', this._onAddData.bind(this))
      .on('fetchData', this._onFetchData.bind(this))
      .on('queryModel', this._onQueryModel.bind(this));
  };

  /**
   * Method is run when a view renders in the DOM, getting the view's controller and then running
   * the controllers post render actions.
   * @param {Object} event The event object that includes the view object.
   * @return {void}
   */
  BasePageController.prototype._onRendered = function (event) {
    var data = event.oData,
      view = event.oData.oView,
      controller = this.getModule(
        'controller',
        data.inherits ? 'inherit' : data.sNamespace,
        data.sTag
      );

    if (controller) {
      controller.postRenderHook(data);
    } else if (view) {
      view.postRenderHook();
    }
  };

  /**
   * Method is run when either a view is rendered in the DOM and requires a sub view to be rendered,
   * and that sub view requires data to be fetched, or when a model or controller wants to render
   * a view independently.
   * @param {Object} event The event object that includes the view configuration object.
   * @return {void}
   */
  BasePageController.prototype._onRender = function (event) {
    this.render(event.oData);
  };

  BasePageController.prototype.render = function (args) {
    var controller = this.getModule(
        'controller',
        args.inherits ? 'inherit' : args.sNamespace,
        args.sTag
      );

    if (controller) {
      controller.renderView(args);
    }
  };

  /**
   * Method creates a view object, gets its controller and model and passes it the relevant
   * data. It can be used for when you are rendering a component from the server, but still want to
   * create a frontend view and bind specific functionality to it.
   * @param {Object} event The jQuery event object.
   * @return {void}
   */
  BasePageController.prototype._onCreate = function (event) {
    this.create(event.oData);
  };

  BasePageController.prototype.create = function (args) {
    var controller = this.getModule(
        'controller',
        args.sNamespace,
        args.sTag
      );

    if (controller) {
      controller.createView(args);
    }
  };

  BasePageController.prototype._onDestroyView = function (event) {
    this.destroyView(event.oData);
  };

  BasePageController.prototype.destroyView = function (args) {
    var controller = this.getModule(
        'controller',
        args.sNamespace,
        args.sTag
      );

    if (controller) {
      controller.destroyView(args);
    }
  };

  /**
   * Method refreshes a view object.
   * @param {Object} $event The jQuery event object.
   * @return {void}
   */
  BasePageController.prototype._onRefresh = function ($event) {
    var controller = this.getModule(
        'controller',
        $event.oData.sNamespace,
        $event.oData.sTag
      );

    if (controller) {
      controller.refreshView($event.oData);
    }
  };

  /**
   * Method runs when the data controller fires its 'addDataToModel' event and the page controller
   * then returns the correct model and adds the data to it.
   * @param {Object} event The event object that includes the view configuration object.
   * @return {void}
   */
  BasePageController.prototype._onAddData = function (event) {
    this.addData(event.oData);
  };

  BasePageController.prototype.addData = function (args) {
    var model = this.getModule(
      'model',
      args.sNamespace
    );

    if (model) {
      model.add(args.mAddData);
    }
  };

  /**
   * Method runs when a controller triggers a 'fetchData' event, and the page controller gets the
   * appropriate controller and passes the data to the controller to action.
   * @param {Object} $event The event object that includes the view configuration object.
   * @return {void}
   */
  BasePageController.prototype._onFetchData = function ($event) {
    var oController = this.getModule(
        'controller',
        $event.oData.sNamespace,
        $event.oData.sTag
      );

    if (oController) {
      oController.fetchData($event.oData);
    }
  };

  /**
   * Method returns a model and the requested data to the view/controller.
   * @param {Object} event The event object that includes the request for the model.
   * @return {void}
   */
  BasePageController.prototype._onQueryModel = function (event) {
    this.queryModel(event.oData);
  };

  BasePageController.prototype.queryModel = function (args) {
    var queryParams = args.oQueryParams,
      deferred = null,
      returnPromise = false,
      output = {},
      model = this.getModule(
      'model',
      args.sNamespace
    );

    if (args.oDeferred) {
      deferred = args.oDeferred;
    } else {
      deferred = $.Deferred();
      returnPromise = true;
    }

    if (model) {
      if (args.sCommand) {
        if (args.sCommand === 'get') {
          queryParams.oDeferred = deferred;
        }

        output = model[args.sCommand](queryParams);
      } else {
        output = model;
      }

      if (args.sCommand !== 'get') {
        deferred.resolve(output);
      }
    } else {
      deferred.resolve(false);
    }

    return returnPromise ? deferred.promise() : undefined;
  };

  /**
   * Method tries to find a model or controller, or creates a new one.
   * @param {String} sType The type of the object, i.e. 'model'.
   * @param {String} sNamespace The namespace of the object, i.e. 'products'.
   * @param {String} sTag The tag of the object, i.e. 'addToBasket'.
   * @return {Object} The object reference to the view, model or controller.
   */
  BasePageController.prototype.getModule = function (sType, sNamespace, sTag) {
    return this._find(sType, sNamespace, sTag) || this._create(sType, sNamespace, sTag);
  };

  /**
   * Method returns a model or constroller.
   * @param {String} sType The type of the object, i.e. 'model'.
   * @param {String} sNamespace The namespace of the object, i.e. 'products'.
   * @param {String} sTag The tag of the object, i.e. 'addToBasket'.
   * @return {Object|Boolean} The object reference to the view, model or controller, or false.
   */
  BasePageController.prototype._find = function (sType, sNamespace, sTag) {
    var DEFAULT = '_default',
      sProp = '',
      hasOwnProp = false,
      mOutput = false;

    if (this.mc[sType][sNamespace]) {
      if (sType === 'model') {
        mOutput = this.mc[sType][sNamespace];
      } else if (sType === 'controller') {
        if (sTag && classMap.classes[sType][sNamespace].hasOwnProperty(sTag)) {
          hasOwnProp = true;
        }

        sProp = hasOwnProp ? sTag : DEFAULT;

        if (this.mc[sType][sNamespace][sProp]) {
          mOutput = this.mc[sType][sNamespace][sProp];
        }
      }
    }

    return mOutput;
  };


  /**
   *
   * @param {String} type
   * @param {String} namespace
   * @param {String} tag
   * @return {Object}
   */
  BasePageController.prototype._create = function (type, namespace, tag) {
    var instance = null,
      _class = classMap.find(type, namespace, tag),
      modelInstances = [];

    if (typeof _class === 'function') {
      if (type === 'model') {
        instance = new _class({ baseURL: this.baseURL });
      } else if (type === 'controller') {
        if (fn.isArray(_class.modelNames, { notEmpty: true })) {
          fn.loopArray.call(this, _class.modelNames, function loopModelNames(i) {
            modelInstances.push(this.getModule('model', _class.modelNames[i]));
          });
        } else {
          modelInstances = this.getModule('model', namespace);
        }

        instance = new _class(modelInstances, {
          pageGroup: this.pageGroup,
          pageType: this.pageType,
          pageEventDelegator: this.pageEventDelegator
        });
      }
    }

    if (fn.isObject(instance, { notEmpty: true })) {
      if (type === 'model') {
        this.mc[type][instance.sNamespace] = instance;
      } else if (type === 'controller') {
        if (typeof instance._initDependancies === 'function') {
          instance._initDependancies();
        }

        if (!fn.isObject(this.mc[type][instance.sNamespace], { notEmpty: true })) {
          this.mc[type][instance.sNamespace] = {};
        }
        this.mc[type][instance.sNamespace][instance.sTag] = instance;
      }
    }

    return instance;
  };


  return BasePageController;
});
