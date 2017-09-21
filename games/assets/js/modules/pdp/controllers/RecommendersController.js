define('modules/pdp/controllers/RecommendersController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/OutfitItemsView',
  'modules/pdp/views/CarouselItemsView'
], function (fn, BaseController, OutfitItemsView, CarouselItemsView) {
  'use strict';

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function RecommendersController(models) {
    var pageController = fn.getValue(window, 'oAppController', 'oPageController');

    this.sNamespace = 'inherit';
    this.sTag = 'recommender';
    this.views = { classes: {
      OutfitItemsView: OutfitItemsView,
      CarouselItemsView: CarouselItemsView
    } };

    this.parent.constructor.call(this, models);

    if (fn.isObject(pageController) && typeof pageController.setScrollAction === 'function') {
      pageController.setScrollAction({
        callback: this._analyticsTracking,
        once: true,
        scope: this
      });
    }
  }


  fn.inherit(RecommendersController, BaseController);
  RecommendersController.modelNames = [
    'products', 'sku', 'formHandler', 'inventorySKU', 'inventoryProduct'
  ];


  RecommendersController.prototype._collateDataDependancies = function (params) {
    var _this = this,
      _params = params,
      data = _params.mParamData.mvc,
      filterOptions = _params.filterOptions || {},
      masterDeferred = _params.deferred,
      namespace = _params.sNamespace;

    if (typeof data.destroyRootView !== 'function') {
      data.destroyRootView = function () {};
    }

    /**
     *
     * @return {void}
     */
    function destroyAndReject() {
      data.destroyRootView();
      masterDeferred.reject();
    }

    if (!fn.isArray(data.items) || data.items.length === 0) {
      destroyAndReject();
      return;
    }

    data.flags = this.isObject(data.flags) ? data.flags : {};

    this._filterItems(data.items, namespace, filterOptions)
      .fail(function hanldFilterItemsFailure() {
        destroyAndReject();
      })
      .done(function handleFilterItemsSuccess(filteredItems) {
        if (!fn.isArray(filteredItems, { notEmpty: true })) {
          destroyAndReject();
          return;
        }

        _this._collateViewModelData(filteredItems, namespace, data.flags)
          .done(function handleCollateViewModelDataSuccess(viewModel) {
            data.viewModel = viewModel;
            _params.mParamData.mvc = data;
            masterDeferred.resolve(_params);
          })
          .fail(function handleCollateViewModelDataFailure() {
            destroyAndReject();
          });
      });
  };


  RecommendersController.prototype._filterItems = function (items, namespace, opts) {
    var filterDeferred = $.Deferred(),
      filteredItems = this._defaultFilter(items, namespace);

    this._fetchAndFilterInventory(filteredItems, namespace, opts.inventory)
      .fail(function handleInventoryFailure() {
        filterDeferred.reject();
      })
      .done(function handleInventorySuccess(inventoryFilteredItems) {
        filterDeferred.resolve(inventoryFilteredItems);
      });

    return filterDeferred.promise();
  };


  /**
   * The default filter checks for the presence of a prices object on a product/sku.
   * If a product/sku does not have a prices object then it means the product/sku does not
   * have any listings and so there is no point in rendering it out.
   *
   * @param {Array<Object>} items
   * @param {String} namespace
   * @return {Array<Object>}
   */
  RecommendersController.prototype._defaultFilter = function (items, namespace) {
    fn.loopArray.call(this, items, function loopItems(i) {
      if (!fn.isObject(this.models[namespace].getPrices(items[i]), { notEmpty: true })) {
        items.splice(i, 1);
      }
    }, { backward: true });

    return items;
  };


  RecommendersController.prototype._fetchAndFilterInventory = function (items, namespace, opts) {
    var _this = this,
      inventoryFetchPromise = null,
      inventoryDeferred = $.Deferred(),
      filteredItems = [];

    inventoryFetchPromise = this._fetchInventory(items, namespace, opts, inventoryDeferred);

    if (inventoryFetchPromise) {
      inventoryFetchPromise
        .fail(function handleInventoryFetchFailure() {
          inventoryDeferred.reject();
        }).done(function handleInventoryFetchSuccess(inventory) {
          if (!fn.isArray(inventory, { notEmpty: true })) {
            inventoryDeferred.reject();
            return;
          }
          filteredItems = _this._filterInventory(items, inventory, opts);
          inventoryDeferred.resolve(filteredItems);
        });
    }

    return inventoryDeferred.promise();
  };


  RecommendersController.prototype._fetchInventory = function (items, namespace, opts, deferred) {
    var inventoryModel = namespace === 'products'
        ? this.models.inventoryProduct : this.models.inventorySKU;

    if (!opts) {
      deferred.resolve(items);
      return null;
    }

    return inventoryModel.promise({
      mSearchValue: items.map(function loopItems(item) {
        return item.id;
      })
    });
  };


  RecommendersController.prototype._filterInventory = function (items, inventory, opts) {
    var _opts = opts || {},
      matchFound = false;

    fn.loopArray(items, function loopItems(i) {
      matchFound = false;

      fn.loopArray(inventory, function loopInventory(j) {
        if (fn.isObject(items[i], { notEmpty: true })) {
          if (items[i].id === inventory[j].id) {
            matchFound = true;

            if (_opts.available && !inventory[j].available) {
              items.splice(i, 1);
            } else if (_opts.subscribable && !inventory[j].subscribable) {
              items.splice(i, 1);
            }
          }
        }
      });

      if (!matchFound) {
        items.splice(i, 1);
      }
    }, { backward: true });

    return items;
  };


  RecommendersController.prototype._collateViewModelData = function (items, namespace, flags) {
    var deferred = $.Deferred();

    this._createViewModel(items, namespace, flags, deferred);
    return deferred.promise();
  };


  RecommendersController.prototype._createViewModel = function (items, namespace, flags, deferred) {
    var create = this._createDefaultViewModel,
      viewModel = [];

    if (flags.shopTheRange) {
      create = this._createRangeViewModel;
    }

    fn.loopArray.call(this, items, function loopItems(i) {
      viewModel.push(create.call(this, items[i], namespace));
    });

    deferred.resolve(viewModel);
  };


  RecommendersController.prototype._createDefaultViewModel = function (item, namespace) {
    var obj = {};

    obj[namespace] = item;
    return obj;
  };


  RecommendersController.prototype._createRangeViewModel = function (item, namespace) {
    var obj = {};

    obj[namespace] = item;
    obj.formHandler = this._cloneFormhandler(item, 'range');
    obj.sellers = { buyBoxMessage: 'buy', buyButtonLabel: 'Add to basket' };

    return obj;
  };


  RecommendersController.prototype._cloneFormhandler = function (skuData, component) {
    var models = this.models,
      productID = models.sku.getParentProduct(skuData).id;

    return models.formHandler.clone({
      component: component,
      config: [{
        key: 'catalogRefIds',
        value: models.sku.getPrimaryListing(skuData).id
      }, {
        key: 'productId',
        value: productID
      }, {
        key: 'skuId',
        value: skuData.id
      }],
      name: 'addToBasket',
      publicLink: models.products.getPublicLink(productID)
    }, { add: true });
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.oView
   * @param {JQueryDeferred} _deferred Used for unit tests
   * @return {void}
   */
  RecommendersController.prototype._bindViewEvents = function (args, _deferred) {
    var view = args.oView,
      flags = view.oData.mvc.flags || {};

    if (view.sViewName !== 'OutfitItemsView' && view.sViewName !== 'CarouselItemsView') {
      return;
    }

    if (flags.completeTheLook || flags.outfitBuilder || flags.shopTheRange) {
      this._actionInViewport.push({ element: view.oElms.elWrapper, callbackArgs: { view: view } });
      this._checkInViewport(view.sViewId, _deferred);
    }
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.view
   * @return {void}
   */
  RecommendersController.prototype._analyticsTracking = function (args) {
    var mvcData = args.view.oData.mvc,
      viewModel = mvcData.viewModel,
      flags = mvcData.flags,
      relationship = '',
      id = '',
      ids = [],
      joinedIDs = '',
      _s = fn.copyObject(window.s);

    relationship = flags.completeTheLook ? 'Complete the Look' : relationship;
    relationship = flags.outfitBuilder ? 'Outfit Block' : relationship;
    relationship = flags.shopTheRange ? 'Shop The Range' : relationship;
    relationship = flags.bundle ? 'Frequently Bought Together' : relationship;

    if (fn.isArray(viewModel, { notEmpty: true })) {
      fn.loopArray(viewModel, function (i) {
        if (fn.isObject(viewModel[i], { notEmpty: true })) {
          if (viewModel[i].hasOwnProperty('products')) {
            id = viewModel[i].products.id;
          } else if (viewModel[i].hasOwnProperty('sku')) {
            id = viewModel[i].sku.id;
          }
          ids.push(id);
        }
      });

      joinedIDs = ids.join(';;,;');
    }

    if (relationship) {
      _s.linkTrackEvents = 'event3,event32,event45';
      _s.linkTrackVars = 'prop19,eVar45,prop42,eVar59,events,products';
      _s.products = ';' + joinedIDs + ';;';
      _s.prop19 = 'product impressions';
      _s.eVar45 = _s.prop19;
      _s.prop42 = 'pdp - ' + relationship + ' - product impressions';
      _s.eVar59 = _s.prop42;
      _s.events = 'event3,event32,event45';
      if (!window.pageLoadAnalyticsSuccess) {
        $(window).one('pageLoadAnalyticsSuccess',
        function bundleControllerAsyncAnalytics() {
          _s.tl(true, 'o', relationship + ' - product impressions');
        });
      } else {
        _s.tl(true, 'o', relationship + ' - product impressions');
      }
    }
  };


  return RecommendersController;
});
