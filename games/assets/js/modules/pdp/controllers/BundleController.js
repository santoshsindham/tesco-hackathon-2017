define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BaseController = require('modules/pdp/controllers/BaseController'),
    BundleView = require('modules/pdp/views/BundleView');


  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function BundleController(models) {
    var pageController = fn.getValue(window, 'oAppController', 'oPageController');

    this.sNamespace = 'inherit';
    this.sTag = 'bundle';
    this.views = { classes: { BundleView: BundleView } };
    this.parent.constructor.call(this, models);

    if (fn.isObject(pageController) && typeof pageController.setScrollAction === 'function') {
      pageController.setScrollAction({
        callback: this._analyticsTracking,
        once: true,
        scope: this
      });
    }
  }


  fn.inherit(BundleController, BaseController);
  BundleController.modelNames = [
    'formHandler', 'inventoryProduct', 'inventorySKU', 'products', 'sellers', 'sku'
  ];


  /**
   *
   * @param {Object} args
   * @param {JQueryDeferred} args.deferred
   * @param {Object} [args.filterOptions]
   * @param {Object} args.mParamData
   * @param {Object} args.mParamData.mvc
   * @param {Function} [args.mParamData.mvc.destroyRootView]
   * @param {Array<Object>} args.mParamData.mvc.items
   * @return {void}
   */
  BundleController.prototype._collateDataDependancies = function (args) {
    var _this = this,
      _args = args,
      filterOptions = _args.filterOptions || {},
      flags = {},
      mvcData = _args.mParamData.mvc,
      masterDeferred = _args.deferred,
      promise = {},
      rejectDeferred = this._setRejectDeferredMethod(mvcData.destroyRootView, masterDeferred);

    if (!fn.isArray(mvcData.items, { notEmpty: true })) {
      rejectDeferred();
      return;
    }

    flags = mvcData.flags || {};
    filterOptions.type = flags.richRelevance ? 'products' : 'sku';

    if (flags.richRelevance) {
      promise = this._compileSkuData(mvcData);
    } else {
      promise = this._compileProductData(mvcData);
    }

    promise
      .done(function handleCompileDataSuccess(compiledData) {
        fn.mergeObjects(mvcData, compiledData, { extend: true });
        delete mvcData.items;

        _this._collateListingPrices(mvcData)
          .done(function handleCollateListingPricesSuccess(listingPricesResp) {
            fn.mergeObjects(mvcData, listingPricesResp, { extend: true });

            _this._collateInventoryData(mvcData, filterOptions)
              .done(function handleCollateInventoryDataSuccess(inventoryDataResp) {
                if (inventoryDataResp) {
                  mvcData.recommendations = inventoryDataResp;
                }

                mvcData.recommendations = _this._filterItems(mvcData, filterOptions);

                if (!mvcData.recommendations.length) {
                  rejectDeferred();
                }

                mvcData.flags = flags;
                _args.mParamData.mvc = _this._setViewModel(mvcData, filterOptions.type);
                masterDeferred.resolve(_args);
              })
              .fail(function handleCollateInventoryDataFailure() {
                rejectDeferred();
              });
          })
          .fail(function handleCollateListingPricesFailure() {
            rejectDeferred();
          });
      })
      .fail(function handleCompileDataFailure() {
        rejectDeferred();
      });
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Array<Object>} mvcData.items
   * @return {JQueryPromise}
   */
  BundleController.prototype._compileSkuData = function (mvcData) {
    var activeSku = {},
      deferred = $.Deferred(),
      productModel = this.models.products,
      recommendations = [],
      skuModel = this.models.sku;

    fn.loopArray(mvcData.items, function loopItems(i) {
      var item = mvcData.items[i];

      recommendations.push({
        products: item,
        sellers: {},
        sku: productModel.getDefaultSku(item)
      });
    });

    productModel.getDataStores({
      fetch: true,
      value: fn.isObject(mvcData.products) ? mvcData.products.id : mvcData.products
    })
      .done(function handleGetProductDataStoesSuccess() {
        skuModel.getDataStores({
          fetch: true,
          value: [mvcData.sku].concat(recommendations.map(function (rec) {
            return rec.sku.id;
          }))
        })
          .done(function handleGetSkuDataStoresSuccess(skus) {
            activeSku = skus.shift();

            fn.loopArray(recommendations, function loopRecommendations(i) {
              var recommendation = recommendations[i];

              fn.loopArray(skus, function loopSkus(j) {
                var sku = skus[j];

                if (recommendation.sku.id === sku.id) {
                  recommendation.sku = sku;
                  recommendation.sellers = skuModel.getPrimaryListing(sku);
                }
              });
            });

            deferred.resolve({
              recommendations: recommendations,
              sellers: skuModel.getPrimaryListing(activeSku),
              sku: activeSku
            });
          })
          .fail(function handleGetSkuDataStoresFailure() {
            deferred.reject();
          });
      })
      .fail(function handleGetProductDataStoresFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Object} mvcData.items
   * @return {JQueryPromise}
   */
  BundleController.prototype._compileProductData = function (mvcData) {
    var deferred = $.Deferred(),
      recommendations = [],
      productModel = this.models.products,
      skuModel = this.models.sku;

    fn.loopArray(mvcData.items, function loopItems(i) {
      var item = mvcData.items[i];

      recommendations.push({
        products: skuModel.getParentProduct(item),
        sellers: skuModel.getPrimaryListing(item),
        sku: item
      });
    });

    productModel.getDataStores({
      fetch: true,
      value: fn.isObject(mvcData.products) ? mvcData.products.id : mvcData.products
    })
      .done(function handleGetProductDataStoresSuccess(product) {
        skuModel.getDataStores({
          fetch: true,
          value: fn.isObject(mvcData.sku) ? mvcData.sku.id : mvcData.sku
        })
          .done(function handleGetSkuDataStoresSuccess(sku) {
            deferred.resolve({
              products: product,
              recommendations: recommendations,
              sellers: skuModel.getPrimaryListing(sku)
            });
          })
          .fail(function handleGetSkuDataStoresFailure() {
            deferred.reject();
          });
      })
      .fail(function handleGetProductDataStoresFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Object} mvcData.items
   * @return {JQueryPromise}
   */
  BundleController.prototype._collateListingPrices = function (mvcData) {
    var deferred = $.Deferred(),
      recommendations = mvcData.recommendations,
      sellers = mvcData.sellers,
      skuIDs = [mvcData.sku.id],
      skuModel = this.models.sku;

    skuIDs = skuIDs.concat(recommendations.map(function (rec) {
      return rec.sku.id;
    }));
    skuIDs = skuIDs.join();

    skuModel.fetch({
      mSearchValue: skuIDs,
      sModelMethod: 'price',
      createEndpointCallback: function addQueryParams(url) {
        return url + '?format=standard';
      },
      doneCallback: function fetchPricesDoneCallback(resp) {
        var skuPrices = fn.getValue(resp, 'skus');

        if (!fn.isArray(skuPrices, { notEmpty: true })) {
          deferred.reject();
          return;
        }

        fn.loopArray(skuPrices, function loopSkuPrices(i) {
          var listingPrices = [];

          if (!skuPrices[i] || skuPrices[i].error) {
            return;
          }

          listingPrices = skuPrices[i].listings;

          fn.loopArray(listingPrices, function loopListingPrices(j) {
            var listingPrice = listingPrices[j];

            if (listingPrice.id === sellers.id) {
              sellers.prices = listingPrice;
              return;
            }

            fn.loopArray(recommendations, function loopRecommendations(k) {
              var recommendation = recommendations[k];

              if (listingPrice.id === recommendation.sellers.id) {
                recommendation.sellers.prices = listingPrice;
              }
            });
          });
        });

        deferred.resolve({
          recommendations: recommendations,
          sellers: sellers
        });
      }
    });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Object} filterOptions
   * @return {JQueryPromise}
   */
  BundleController.prototype._collateInventoryData = function (mvcData, filterOptions) {
    var deferred = $.Deferred(),
      flags = mvcData.flags,
      inventoryModel = {},
      models = this.models,
      recommendations = mvcData.recommendations,
      type = filterOptions.type;

    if (!filterOptions.inventory) {
      deferred.resolve();
      return deferred.promise();
    }

    inventoryModel = flags.richRelevance ? models.inventoryProduct : models.inventorySKU;

    inventoryModel.getDataStores({
      fetch: true,
      value: recommendations.map(function (recommendation) {
        return recommendation[type].id;
      })
    })
      .done(function handleInventoryModelSuccess(inventory) {
        fn.loopArray(recommendations, function loopRecommendations(i) {
          fn.loopArray(inventory, function loopInventory(j) {
            if (recommendations[i][type].id === inventory[j].id) {
              recommendations[i][type].inventory = inventory[j];
            }
          });
        });

        deferred.resolve(recommendations);
      })
      .fail(function handleInventoryModelFailure() {
        deferred.reject();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Object} filterOptions
   * @param {Object} [filterOptions.category]
   * @param {Object} [filterOptions.inventory]
   * @param {string} filterOptions.type
   * @return {Array<Object>}
   */
  BundleController.prototype._filterItems = function (mvcData, filterOptions) {
    var recommendations = mvcData.recommendations,
      type = filterOptions.type;

    recommendations = this._defaultFilter(recommendations);

    if (fn.isObject(filterOptions.category, { notEmpty: true })) {
      recommendations = this._filterCategory(recommendations, type, filterOptions.category || {});
    }

    if (fn.isObject(filterOptions.inventory, { notEmpty: true })) {
      recommendations = this._filterInventory(recommendations, type, filterOptions.inventory || {});
    }

    return recommendations;
  };


  /**
   *
   * @param {Array<Object>} recommendations
   * @return {Array<Object>}
   */
  BundleController.prototype._defaultFilter = function (recommendations) {
    var sellerModel = this.models.sellers;

    fn.loopArray(recommendations, function loopRecommendations(i) {
      if (!fn.isObject(sellerModel.getPrices(recommendations[i].sellers), { notEmpty: true })) {
        recommendations.splice(i, 1);
      }
    }, { backward: true });

    return recommendations;
  };


  /**
   *
   * @param {Array<Object>} recommendations
   * @param {string} type
   * @param {Object} options
   * @param {Boolean} [options.unique]
   * @return {Array<Object>}
   */
  BundleController.prototype._filterCategory = function (recommendations, type, options) {
    var _recommendations = recommendations;

    if (options.unique) {
      _recommendations = this._filterUnique(_recommendations, type);
    }

    return _recommendations;
  };


  /**
   *
   * @param {Array<Object>} recommendations
   * @param {string} type
   * @return {Array<Object>}
   */
  BundleController.prototype._filterUnique = function (recommendations, type) {
    var model = this.models[type],
      uniqueIDs = [],
      uniqueRecommendations = [];

    fn.loopArray(recommendations, function loopRecommendations(i) {
      var catID = model.getParentCategory(recommendations[i][type]).id;

      if (uniqueIDs.indexOf(catID) === -1) {
        uniqueIDs.push(catID);
        uniqueRecommendations.push(recommendations[i]);
      }
    });

    return uniqueRecommendations;
  };


  /**
   *
   * @param {Array<Object>} recommendations
   * @param {string} type
   * @param {Object} options
   * @param {boolean} options.available
   * @param {boolean} options.subscribable
   * @return {Array<Object>}
   */
  BundleController.prototype._filterInventory = function (recommendations, type, options) {
    fn.loopArray(recommendations, function loopData(i) {
      if (!recommendations[i][type].inventory.available && options.available) {
        recommendations.splice(i, 1);
      } else if (!recommendations[i][type].inventory.subscribable && options.subscribable) {
        recommendations.splice(i, 1);
      }
    }, { backward: true });

    return recommendations;
  };


  /**
   *
   * @param {Object} mvcData
   * @param {string} type
   * @return {Object}
   */
  BundleController.prototype._setViewModel = function (mvcData, type) {
    return this._setDynamicViewData(this._setStaticViewData(mvcData, type));
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Object} mvcData.flags
   * @param {Object} mvcData.products
   * @param {Array<Object>} mvcData.recommendations
   * @param {Object} mvcData.sku
   * @param {string} type
   * @return {Object}
   */
  BundleController.prototype._setStaticViewData = function (mvcData, type) {
    var _mvcData = mvcData,
      buyButtonLabel = '',
      flags = _mvcData.flags,
      formhandlerModel = this.models.formHandler,
      productModel = this.models.products,
      urlParams = '',
      viewModel = {};

    if (flags.inBasketOverlay) {
      buyButtonLabel = 'Update basket';
      urlParams = '?multipleItems=true&inBasketOverlay=true';
    } else {
      buyButtonLabel = 'Add to basket';
      urlParams = '?multipleItems=true';
    }

    flags.showProductRatings = false;
    flags.hideQuantity = true;

    viewModel = {
      primary: { products: _mvcData.products, sellers: _mvcData.sellers, sku: _mvcData.sku },
      recommendations: _mvcData.recommendations.slice(0, 2),
      type: type
    };

    viewModel.primary.checked = !flags.inBasketOverlay;

    fn.loopArray(viewModel.recommendations, function loopSecondary(i) {
      viewModel.recommendations[i].checked = true;
    });

    _mvcData.viewModel = viewModel;
    _mvcData.sellers = { buyBoxMessage: 'buy', buyButtonLabel: buyButtonLabel };
    _mvcData.formHandler = formhandlerModel.clone({
      component: 'bundle',
      config: [{ key: 'addItemToOrderSuccessURL', value: urlParams, action: 'append' }],
      name: 'addToBasket',
      publicLink: productModel.getPublicLink(_mvcData.products)
    }, { add: true });

    return _mvcData;
  };


  /**
   *
   * @param {Object} mvcData
   * @param {Object} mvcData.flags
   * @param {Object} mvcData.viewModel
   * @return {Object}
   */
  BundleController.prototype._setDynamicViewData = function (mvcData) {
    var _mvcData = mvcData,
      flags = _mvcData.flags,
      model = {},
      price = 0,
      recommendations = [],
      skuModel = this.models.sku,
      skus = [],
      type = '',
      viewModel = _mvcData.viewModel;

    recommendations = viewModel.recommendations;
    type = viewModel.type;
    model = this.models[type];

    if (viewModel.primary.checked) {
      skus.push(viewModel.primary.sku);
    }

    if (viewModel.primary.checked || flags.inBasketOverlay) {
      price += parseFloat(model.getPrice(viewModel.primary.sellers));
    }

    if (flags.inBasketOverlay) {
      viewModel.primary.tileHeading = 'Already in basket';
    } else {
      viewModel.primary.tileHeading = 'Currently viewing';
    }

    fn.loopArray(recommendations, function loopSecondary(i) {
      if (recommendations[i].checked) {
        recommendations[i].checkboxLabel = 'Added to bundle';
        skus.push(recommendations[i].sku);
        price += parseFloat(model.getPrice(recommendations[i].sellers));
      } else {
        recommendations[i].checkboxLabel = 'Add to bundle';
      }

      recommendations[i].id = recommendations[i][type].id;
      recommendations[i].catID = model.getParentCategory(recommendations[i][type]).id;
    });

    viewModel.price = price.toFixed(2);

    _mvcData.formHandler = this._updateFormHandlerModel({
      formHandlerId: _mvcData.formHandler.id,
      updates: {
        catalogRefIds: skus.map(function (sku) {
          return skuModel.getPrimaryListing(sku).id;
        }),
        productId: skuModel.getParentProduct(skus[0]).id || '',
        skuId: fn.getValue(skus[0], 'id') || ''
      }
    });

    return _mvcData;
  };


  /**
   *
   * @param {Object} args
   * @param {String} args.formHandlerID
   * @param {Object} args.updates
   * @return {Object}
   */
  BundleController.prototype._updateFormHandlerModel = function (args) {
    var _args = args,
      formhandlerModel = this.models.formHandler;

    _args.updates.catalogRefIds = _args.updates.catalogRefIds.join();

    fn.loopObject(_args.updates, function loopUpdates(prop) {
      formhandlerModel.update({
        mSearchValue: _args.formHandlerId,
        sUpdateKey: 'oData',
        mUpdateValue: null,
        sUpdatePropKey: prop,
        mUpdatePropValue: _args.updates[prop]
      });
    });

    return formhandlerModel.getDataStores({ value: _args.formHandlerId });
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.oView
   * @param {JQueryDeferred} _deferred Used for unit tests
   * @return {void}
   */
  BundleController.prototype._bindViewEvents = function (args, _deferred) {
    var view = args.oView;

    $(view.oElms.elWrapper).on(
      'change', 'input.bundle-checkbox',
      { view: view },
      this._handleCheckboxClick.bind(this)
    );

    if (view.sViewName !== 'BundleView') {
      return;
    }

    this._actionInViewport.push({ element: view.oElms.elWrapper, callbackArgs: { view: view } });
    this._checkInViewport(view.sViewId, _deferred);
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.view
   * @return {void}
   */
  BundleController.prototype._analyticsTracking = function (args) {
    var mvcData = args.view.oData.mvc,
      viewModel = mvcData.viewModel,
      flags = mvcData.flags,
      relationship = '',
      id = '',
      ids = [],
      joinedIDs = '',
      _s = fn.copyObject(window.s);

    relationship = flags.bundle ? 'Frequently Bought Together' : relationship;
    ids.push(viewModel.primary.id);

    fn.loopArray(viewModel.recommendations, function loopSecondarySkus(i) {
      id = viewModel.recommendations[i][viewModel.type].id;
      ids.push(id);
    });

    joinedIDs = ids.join(';;,;');

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


  /**
   *
   * @param {JQueryEvent} event
   * @return {void}
   */
  BundleController.prototype._handleCheckboxClick = function (event) {
    var activeID = event.currentTarget.id,
      counter = 0,
      view = event.data.view,
      mvcData = view.oData.mvc,
      recommendations = mvcData.viewModel.recommendations,
      type = mvcData.viewModel.type;

    fn.loopArray(recommendations, function loopSecondarySkus(i) {
      if (recommendations[i][type].id === activeID) {
        recommendations[i].checked = !recommendations[i].checked;
      }
      counter = recommendations[i].checked ? counter += 1 : counter;
    });

    mvcData.flags.disableAddToBasket = !mvcData.viewModel.primary.checked && counter === 0;
    view.refresh({ data: this._setDynamicViewData(mvcData), activeID: activeID });
  };


  module.exports = BundleController;
});
