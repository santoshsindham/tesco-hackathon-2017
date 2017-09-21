define('modules/pdp/controllers/SkuController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/AuthorBiographyView',
  'modules/pdp/views/KioskProductPageView',
  'modules/pdp/views/BuyboxView',
  'modules/pdp/views/RelatedSKUView',
  'modules/pdp/views/ProductDetailsView',
  'modules/pdp/views/ProductSpecView',
  'modules/pdp/views/ProductMediaViewerView',
  'modules/tesco.utils',
  'modules/tesco.analytics'
], function (
  fn,
  BaseController,
  AuthorBiographyView,
  KioskProductPageView,
  BuyboxView,
  RelatedSKUView,
  ProductDetailsView,
  ProductSpecView,
  ProductMediaViewerView,
  tescoUtils,
  analytics
) {
  'use strict';

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function SkuController(models) {
    this.sNamespace = 'sku';
    this.sTag = '_default';
    this.views = {
      classes: {
        AuthorBiographyView: AuthorBiographyView,
        KioskProductPageView: KioskProductPageView,
        BuyboxView: BuyboxView,
        RelatedSKUView: RelatedSKUView,
        ProductDetailsView: ProductDetailsView,
        ProductSpecView: ProductSpecView,
        ProductMediaViewerView: ProductMediaViewerView
      }
    };
    this.parent.constructor.call(this, models);
  }


  fn.inherit(SkuController, BaseController);
  SkuController.modelNames = ['products', 'sku', 'sellers', 'promotions'];


  SkuController.prototype.asyncBlockCallbacks = function () {
    var _this = this,
      _skuId = '',
      skuObj = null,
      updatedSkuObj = null,
      newSkuObj = null,
      oResp = null,
      oCallbacks = {};

    oCallbacks.success = function (sResp) {
      _skuId = this.oData.skuID;
      oResp = typeof sResp === 'string'
          ? JSON.parse(sResp)
          : sResp;

      if (oResp.ServerTime !== undefined) {
        window.currentTimeAsync = oResp.ServerTime;
      }

      /**
       * Pass data to data controller, which will pass all data to their respective models so that
       * all models are up to date for when the buybox renders.
       */
      _this.setEvent({
        sName: 'dataFetched',
        mfetchedData: oResp.BuyBoxV2.data
      }, false, true);

      /**
       * Update the sku model with the seller data that has come back from the async call.
       * Use the sku id on the callback oData object to find the right object in the data store.
       */
      skuObj = _this.models.sku.get({
        mSearchValue: _skuId,
        noFetch: true
      });

      if (_this.sanityCheckData(skuObj).objects) {
        updatedSkuObj = _this.models.sku.update({
          mSearchValue: _skuId,
          sUpdateKey: 'sellers',
          mUpdateValue: oResp.BuyBoxV2.data.sellers
        });
      } else {
        newSkuObj = _this.models.sku.add({
          id: _skuId,
          sellers: oResp.BuyBoxV2.data.sellers
        });
      }

      if (!window.isKiosk()) {
        _this.renderView({
          sViewName: 'BuyboxView',
          elTarget: '.buybox-placeholder',
          mParamData: { mvc: { sku: updatedSkuObj || newSkuObj } }
        });
      }
    };

    return oCallbacks;
  };


  SkuController.prototype.createSkuViewModel = function (productData, skuData) {
    return {
      specification: this._transformSpecificationData(skuData),
      miniDescription: this._transformMiniDescriptionData(skuData),
      dynamicAttributes: productData.dynamicAttributes || null
    };
  };


  SkuController.prototype._transformSpecificationData = function (skuData) {
    var formattedSpecs = [],
      group = {},
      specifications = {};

    if (!fn.isObject(skuData, { notEmpty: true })) {
      return null;
    }

    specifications = skuData.specification;

    fn.loopObject(specifications, function loopSpecifications(name) {
      group = {};
      group.groupName = name;
      group.groupAttributes = [];

      fn.loopArray(specifications[name], function loopSpecGroup(i) {
        group.groupAttributes.push(specifications[name][i]);
      }, { check: true });

      formattedSpecs.push(group);
    }, { check: true });

    return formattedSpecs;
  };


  SkuController.prototype._transformMiniDescriptionData = function (skuData) {
    var formattedDesc = {},
      miniDescription = {};

    if (!fn.isObject(skuData, { notEmpty: true })
        || !fn.isObject(skuData.miniDescription, { notEmpty: true })) {
      return null;
    }

    miniDescription = skuData.miniDescription;

    if (miniDescription['Bullet 1'] !== undefined) {
      formattedDesc.feature_1 = miniDescription['Bullet 1'];
    }

    if (miniDescription['Bullet 2'] !== undefined) {
      formattedDesc.feature_2 = miniDescription['Bullet 2'];
    }

    if (miniDescription['Bullet 3'] !== undefined) {
      formattedDesc.feature_3 = miniDescription['Bullet 3'];
    }

    return formattedDesc;
  };


  /**
   *
   * @param {Object} args
   * @param {string} args.sViewName
   * @return {boolean}
   */
  SkuController.prototype._collateDataConditional = function (args) {
    var viewName = args.sViewName;

    if (viewName === 'BuyboxView' || viewName === 'ProductSpecView') {
      return true;
    }
    return false;
  };

  /**
   *
   * @param {Object} args
   * @param {string} args.sViewName
   * @return {void}
   */
  SkuController.prototype._collateDataDependancies = function (args) {
    var viewName = args.sViewName;

    if (viewName === 'BuyboxView') {
      this._collateBuyboxDependancies(args);
    } else if (viewName === 'ProductSpecView') {
      this._collateSpecsDependancies(args);
    }
  };


  /**
   *
   * @param {Object} args
   * @param {JQueryDeferred} args.deferred
   * @param {Object} args.mParamData
   * @return {boolean}
   */
  SkuController.prototype._collateSpecsDependancies = function (args) {
    var deferred = args.deferred,
      mvcData = args.mParamData.mvc;

    mvcData.vm.sku = this.createSkuViewModel(mvcData.products, mvcData.sku);
    deferred.resolve(args);
  };


  /**
   *
   * @param {Object} args
   * @param {JQueryDeferred} args.deferred
   * @param {Object} args.mParamData
   * @return {boolean}
   */
  SkuController.prototype._collateBuyboxDependancies = function (args) {
    var _this = this,
      masterDeferred = args.deferred,
      mvcData = args.mParamData.mvc,
      productModel = this.models.products,
      sellerIDs = [],
      sellerModel = this.models.sellers,
      skuModel = this.models.sku,
      viewName = args.sViewName,
      mvcPage = window.oAppController.oPageController;

    if (!mvcData.flags) {
      mvcData.flags = {};
    }

    mvcData.flags.isKiosk = window.isKiosk();
    mvcData.flags.isSkuSelected = !!mvcPage.getSelectedSku().id;
    mvcData.flags.hasMultipleSellers = !!skuModel.getSecondaryListings(mvcData.sku).length;
    mvcData.flags.isBuybox = viewName === 'BuyboxView';

    this._queryProductModel(args)
      .done(function handleQueryProductsSuccess(productData) {
        if (productData) {
          mvcData.products = productData;
        }

        mvcData.flags.isFF = productModel.isFF(mvcData.products);

        if (!skuModel.getListings(mvcData.sku).length) {
          mvcData.sku.sellers = [];
          mvcData.sellers = [];
          masterDeferred.resolve(args);
          return;
        }

        _this._querySellerModel(args)
          .done(function handleQuerySellersSuccess(sellerData) {
            if (sellerData) {
              mvcData.sellers = sellerData;
            }

            if (viewName === 'BuyboxView' && mvcData.flags.isVariantChange) {
              _this._submitAnalytics(args);
            }

            sellerIDs = mvcData.sellers.map(function (seller) {
              return seller.id;
            });

            mvcData.flags.isSellerPartner = sellerModel.isSellerPartner(sellerIDs);

            if (viewName === 'BuyboxView') {
              _this._queryPriceAPI(args)
                .done(function handleQueryPriceAPISuccess() {
                  masterDeferred.resolve(args);
                });
            }
          });
      });
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.mParamData
   * @return {JQueryPromise}
   */
  SkuController.prototype._queryProductModel = function (args) {
    var check = null,
      deferred = $.Deferred(),
      listingIDs = [],
      mvcData = args.mParamData.mvc,
      observe = null,
      productLink = {},
      productModel = this.models.products,
      skuModel = this.models.sku;

    if (fn.checkData(mvcData.products, ['id', 'displayName', 'links'])) {
      deferred.resolve();
      return deferred.promise();
    }

    productLink = skuModel.getParentProduct(mvcData.sku);

    check = function checkProductData(data) {
      if (!fn.checkData(data, ['id', 'displayName', 'links'])) {
        observe();
      } else {
        deferred.resolve(data);
      }
    };

    observe = function observeProductData() {
      productModel.observe({
        action: 'add',
        callback: function observeCallback(resp) {
          check(resp.data.observe);
        },
        once: true,
        searchValue: listingIDs
      });
    };

    check(productModel.getDataStores({ value: productLink.id, noFetch: true }));
    return deferred.promise();
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.mParamData
   * @return {JQueryPromise}
   */
  SkuController.prototype._querySellerModel = function (args) {
    var check = null,
      deferred = $.Deferred(),
      listingIDs = [],
      mvcData = args.mParamData.mvc,
      observe = null,
      sellerModel = this.models.sellers,
      skuModel = this.models.sku;

    if (fn.checkData(mvcData.sellers, ['id', 'name'])) {
      deferred.resolve();
      return deferred.promise();
    }

    listingIDs = skuModel.getListings(mvcData.sku).map(function (link) {
      return link.id;
    });

    check = function checkSellerData(data) {
      if (!fn.checkData(data, ['id', 'name'])) {
        observe();
      } else {
        deferred.resolve(data);
      }
    };

    observe = function observeSellerData() {
      sellerModel.observe({
        action: 'add',
        callback: function observeCallback(resp) {
          check(resp.data.observe);
        },
        once: true,
        searchValue: listingIDs
      });
    };

    check(sellerModel.getDataStores({ value: listingIDs, noFetch: true }));
    return deferred.promise();
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.mParamData
   * @return {JQueryPromise}
   */
  SkuController.prototype._queryPriceAPI = function (args) {
    var deferred = $.Deferred(),
      skuID = args.mParamData.mvc.sku.id,
      skuModel = this.models.sku,
      sellerModel = this.models.sellers;

    skuModel.fetch({
      mSearchValue: skuID,
      sModelMethod: 'price',
      createEndpointCallback: function addQueryParams(url) {
        return url + '?format=standard';
      },
      doneCallback: function mergePrices(priceData) {
        var listingPrices = [];

        if (fn.isObject(priceData) && fn.isArray(priceData.skus)
            && fn.isObject(priceData.skus[0]) && fn.isArray(priceData.skus[0].listings)) {
          listingPrices = priceData.skus[0].listings;

          fn.loopArray(listingPrices, function loopListingPrices(i) {
            sellerModel.update({
              mSearchValue: listingPrices[i].id,
              sUpdateKey: 'prices',
              mUpdateValue: listingPrices[i]
            });
          });
        }

        deferred.resolve(args);
      }
    });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} params
   * @return {void}
   */
  SkuController.prototype._submitAnalytics = function (params) {
    var _this = this,
      _params = params,
      oWebAnalytics = new analytics.WebMetrics(),
      oProps = {},
      sEvents = 'prodView,event3',
      sListingIDs = '',
      sLowStockMessage = '',
      iOOCounter = 0,
      sellerData = _params.mParamData.mvc.sellers,
      skuData = _params.mParamData.mvc.sku;

    oProps.products = ';' + skuData.id + ';;;';

    if (sellerData && sellerData.length) {
      _this.forLoop(sellerData, function loopSellers(i) {
        sListingIDs += i === 0
            ? sellerData[i].id
            : ',' + sellerData[i].id;

        if (sellerData[i].stockMessaging.messageClass === 'low-stock' && sLowStockMessage === '') {
          sLowStockMessage = sellerData[i].stockMessaging.messageText
            .replace('<strong>', '')
            .replace('</strong>', '');

          oProps.eVar48 = sLowStockMessage;
        }

        if (sellerData[i].stockMessaging.messageClass === 'oo-stock') {
          iOOCounter += 1;

          if (sellerData[i].sellerId === '1000001') {
            sEvents += ',event22';
          }
        }
      });

      if (iOOCounter === sellerData.length) {
        sEvents += ',event18';
      }

      oProps.list1 = sListingIDs;
    }

    oProps.events = sEvents;
    oWebAnalytics.submit([oProps]);
  };


  return SkuController;
});
