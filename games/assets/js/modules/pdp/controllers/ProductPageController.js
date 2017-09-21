define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BasePageController = require('modules/pdp/controllers/BasePageController'),
    bazaarvoice = require('modules/pdp/reviews/bazaarvoice'),
    mediaViewer = require('modules/pdp/media-viewer/common'),
    tescoUtils = require('modules/tesco.utils'),
    googleEC = require('modules/google-analytics/pdpTracking');


  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function ProductPageController(config) {
    this.parent.constructor.call(this, config);
    /**
     * Initialise any models/controllers you need before page load.
     */
    this._create('model', 'products');
    this._create('model', 'sku');
    this._create('model', 'sellers');
    this._create('model', 'assets');
    this._create('model', 'wishlists');

    this._create('controller', 'products', '_default');
    this._create('controller', 'sku', '_default');
    this._create('controller', 'sellers', '_default');
    this._create('controller', 'panel', '_default');
    this._create('controller', 'inherit', 'itemActions');

    this._scrollActions = [];
    this._activeProduct = {};
    this._activeSku = {};
    this._selectedSku = {};

    // TODO: Remove properies from here to fix UES properly
    this.ues = {};
    this.ues.schoolId = '';
    this.ues.schoolName = '';
    this.ues.slogoRef = '';
  }


  fn.inherit(ProductPageController, BasePageController);


  /**
   *
   * @param {string|Object} product
   * @param {string|Object} sku
   * @param {Object} [extraData]
   * @param {JQueryDeferred} [_deferred] Used for unit tests
   * @return {void}
   */
  ProductPageController.prototype.init = function (product, sku, extraData, _deferred) {
    var _this = this,
      _extraData = extraData || {},
      dataReady = { data: {}, name: 'dataReady', propName: 'oData' },
      flags = this._setFlags(_extraData.flags);

    this._collateCatalogData(product, sku, _extraData)
      .done(function handleCatalogDataSuccess(productDataStore, skuDataStore) {
        _this._collateInventoryData(productDataStore, flags)
          .done(function handleInventoryDataSuccess() {
            _this._setActiveAndSelected(productDataStore, skuDataStore, flags);
            _this._setHistory(productDataStore, skuDataStore, flags);

            dataReady.data = { flags: flags, product: productDataStore, sku: skuDataStore };
            fn.createEvent(dataReady).fire();

            if (flags.isPageLoad) {
              _this.bindEventHandlers();
            }

            _this._initDependancies(productDataStore, skuDataStore, flags);

            if (_deferred) {
              _deferred.resolve();
            }
            googleEC.setAnalytics(skuDataStore, flags);
          });
      })
      .fail(function handleCatalogDataFailure() {
        if (_deferred) {
          _deferred.reject();
        }
      });
  };


  /**
   *
   * @param {Object|undefined} flags
   * @return {Object}
   */
  ProductPageController.prototype._setFlags = function (flags) {
    var _flags = flags || {},
      hasAkamaiCaching = _flags.hasAkamaiCaching;

    return {
      hasAkamaiCaching: typeof hasAkamaiCaching === 'boolean' ? hasAkamaiCaching : true,
      isPageLoad: !_flags.isVariantChange,
      isPopState: !!_flags.isPopState,
      isPrimaryVariantChange: !!_flags.isPrimaryVariantChange,
      isProductChange: !!_flags.isProductChange,
      productVariantSelected: !!_flags.productVariantSelected,
      isSecondaryVariantChange: !!_flags.isSecondaryVariantChange,
      isSkuChange: !!_flags.isSkuChange,
      isVariantChange: !!_flags.isVariantChange
    };
  };


  /**
   *
   * @param {string|Object} product
   * @param {string|Object} sku
   * @param {Object} extraData
   * @return {JQueryPromise}
   */
  ProductPageController.prototype._collateCatalogData = function (product, sku, extraData) {
    var deferred = $.Deferred(),
      hasExtraProductData = fn.isObject(extraData.products, { notEmpty: true }),
      hasExtraSkuData = fn.isObject(extraData.sku, { notEmpty: true }),
      hasProductData = false,
      hasSkuData = false,
      productDataStore = {},
      productID = '',
      productModel = this.getModule('model', 'products'),
      skuDataStore = {},
      skuID = '',
      skuModel = this.getModule('model', 'sku');

    if (fn.checkData(product, ['id', 'links'])) {
      if (hasExtraProductData) {
        fn.mergeObjects(product, extraData.products, { extend: true });
      }
      productModel.setDataStores(product);
      hasProductData = true;
    }

    if (fn.checkData(sku, ['id', 'links'])) {
      if (hasExtraSkuData) {
        fn.mergeObjects(sku, extraData.sku, { extend: true });
      }
      skuModel.setDataStores(sku);
      hasSkuData = true;
    }

    if (hasProductData && hasSkuData) {
      deferred.resolve(product, sku);
      return deferred.promise();
    }

    if (typeof product !== 'string' || !product.length) {
      deferred.reject();
      return deferred.promise();
    }

    productID = product;
    skuID = typeof sku === 'string' ? sku : '';

    productModel.getDataStores({ fetch: true, value: productID })
      .done(function handleGetProductResponse(productResp) {
        if (!fn.checkData(productResp, ['id', 'links'])) {
          deferred.reject();
          return;
        }

        productDataStore = productResp;

        if (hasExtraProductData) {
          fn.mergeObjects(productDataStore, extraData.products, { extend: true });
          productModel.setDataStores(productDataStore);
        }

        if (!skuID) {
          skuID = productModel.getDefaultSku(productDataStore).id;
        }

        skuModel.getDataStores({ fetch: true, value: skuID })
          .done(function handleGetSkuResponse(skuResp) {
            if (!fn.checkData(skuResp, ['id', 'links'])) {
              deferred.reject();
              return;
            }

            skuDataStore = skuResp;

            if (hasExtraSkuData) {
              fn.mergeObjects(skuDataStore, extraData.sku, { extend: true });
              skuModel.setDataStores(skuDataStore);
            }

            deferred.resolve(productDataStore, skuDataStore);
          });
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} product
   * @param {Object} flags
   * @return {JQueryPromise}
   */
  ProductPageController.prototype._collateInventoryData = function (product, flags) {
    var _this = this,
      deferred = $.Deferred(),
      inventoryProductModel = this.getModule('model', 'inventoryProduct');

    if (flags.isPageLoad && flags.hasAkamaiCaching) {
      deferred.resolve();
      return deferred.promise();
    }

    inventoryProductModel.getDataStores({ fetch: true, value: [product.id] })
      .done(function handleGetProductInventoryResponse(inventory) {
        if (fn.checkData(inventory, ['id', 'skus'])) {
          _this._addInventory(inventory);
        }

        deferred.resolve();
      });

    return deferred.promise();
  };


  /**
   *
   * @param {Object} product
   * @param {Object} sku
   * @param {Object} flags
   * @return {void}
   */
  ProductPageController.prototype._setActiveAndSelected = function (product, sku, flags) {
    var isFF = false,
      productModel = this.getModule('model', 'products'),
      singleChildSku = false,
      skuInURL = false;

    isFF = productModel.isFF(product);
    singleChildSku = productModel.getLinks({ data: product, value: 'childSku' }).length === 1;
    skuInURL = this._isSkuInURL();

    this._activeProduct = product;
    this._activeSku = sku;

    if (!isFF || (isFF && (singleChildSku || flags.isSkuChange
        || (flags.isPageLoad && skuInURL)))) {
      this._selectedSku = sku;
    } else {
      this._selectedSku = {};
    }
  };


  /**
   *
   * @return {boolean}
   */
  ProductPageController.prototype._isSkuInURL = function () {
    return !!tescoUtils.getQueryStringParam('skuId');
  };


  /**
   *
   * @param {Object} product
   * @param {Object} sku
   * @param {Object} flags
   * @return {void}
   */
  ProductPageController.prototype._setHistory = function (product, sku, flags) {
    var stateData = {},
      url = '';

    if (flags.isPopState || typeof window.history.pushState !== 'function') {
      return;
    }

    url = flags.isPageLoad ? window.location.href : this._buildPublicURL(product, sku, flags);

    stateData.productId = product.id;
    stateData.skuId = sku.id;
    stateData.flags = flags;

    if (flags.isPageLoad) {
      window.history.replaceState(stateData, '', url);
    } else {
      window.history.pushState(stateData, '', url);
    }
  };


  /**
   *
   * @param {Object} product
   * @param {Object} sku
   * @param {Object} flags
   * @return {void}
   */
  ProductPageController.prototype._buildPublicURL = function (product, sku, flags) {
    var ues = this.ues,
      url = flags.isProductChange ? product.publicLink : sku.publicLink;

    if (ues.schoolId) {
      url += flags.isSkuChange ? '&' : '?';
      url += 'school=' + ues.schoolId;
      url += ues.slogoRef ? '&slogoRef=' + ues.slogoRef : '';
    }

    return url;
  };


  /**
   *
   * @param {Object} product
   * @param {Object} sku
   * @return {void}
   */
  ProductPageController.prototype.bindEventHandlers = function () {
    this._bindScrollEvent();

    if (this.isKiosk) {
      $(window).on('scene7.init', function handleScene7init(e) {
        this._initMediaViewer(e.oData);
      }.bind(this));
    }
  };


  /**
   *
   * @return {void}
   */
  ProductPageController.prototype._bindScrollEvent = function () {
    var scrollActions = this._scrollActions;

    $(window).on('scroll.productPageController touchmove.productPageController', function (e) {
      fn.loopArray.call(this, scrollActions, function loopScrollActions(i) {
        this._scrollHandler(scrollActions[i], null, fn.getValue(e, 'mvc', '_deferred'));
      });
    }.bind(this));

    $(window).on('checkInViewport.productPageController', function (e) {
      fn.loopArray.call(this, scrollActions, function loopScrollActions(i) {
        if (scrollActions[i].scope !== e.mvc.scope) {
          return;
        }
        this._scrollHandler(scrollActions[i], e.mvc.viewID, e.mvc._deferred);
      });
    }.bind(this));
  };


  /**
   *
   * @param {Array<string>} [names]
   * @return {this}
   */
  ProductPageController.prototype.unbindEventHandlers = function (names) {
    if (!fn.typeofArrayValues('string', names)) {
      return this;
    }

    fn.loopArray(names, function loopNames(i) {
      $(window).off(names[i] + '.productPageController');
    });

    return this;
  };


  /**
   *
   * @param {Object} config
   * @param {boolean} [config.once]
   * @param {Object} config.scope
   * @param {string} [target]
   * @param {string} [_deferred] Used for unit tests
   * @return {void}
   */
  ProductPageController.prototype._scrollHandler = function (config, target, _deferred) {
    var actions = [],
      callbackArgs = {},
      element = {},
      scope = config.scope;

    actions = scope.getActionInViewport();

    if (typeof window.inVisibleViewport !== 'function') {
      if (_deferred) {
        _deferred.reject();
      }
      return;
    }

    fn.loopArray.call(this, actions, function loopActions(i) {
      callbackArgs = actions[i].callbackArgs;
      element = actions[i].element;

      if (!(element instanceof Element)) {
        if (_deferred) {
          _deferred.reject();
        }
        return;
      }

      if (typeof target === 'string' && target !== element.getAttribute('id')) {
        if (_deferred) {
          _deferred.reject();
        }
        return;
      }

      if (!window.inVisibleViewport(element)) {
        if (_deferred) {
          _deferred.reject();
        }
        return;
      }

      if (config.once) {
        actions.splice(i, 1);
      }

      this._executeScrollHandlerCallback({
        _deferred: _deferred,
        callback: config.callback,
        callbackArgs: callbackArgs,
        scope: scope
      });
    }, { backward: true, check: true });
  };


  /**
   *
   * @param {Object} args
   * @param {JQueryDeferred} [args._deferred] Used for unit tests
   * @param {Function} args.callback
   * @param {Object} args.callbackArgs
   * @param {Object} args.scope
   * @return {void}
   */
  ProductPageController.prototype._executeScrollHandlerCallback = function (args) {
    setTimeout(function () {
      try {
        if (args._deferred) {
          args._deferred.resolve();
        }

        args.callback.call(args.scope, args.callbackArgs);
      } catch (e) {
        // continue
      }
    }, 10);
  };


  /**
   *
   * @param {Object} product
   * @param {Object} sku
   * @param {Object} flags
   * @return {void}
   */
  ProductPageController.prototype._initDependancies = function (product, sku, flags) {
    if (this.isKiosk) {
      this._renderKiosk(product, sku, flags);
    } else {
      this._initMediaViewer(sku, flags);
    }

    this._setDocumentTitle(product);
    this._initBazaarVoice(sku);
  };


  /**
   *
   * @param {Object} product
   * @param {Object} sku
   * @param {Object} flags
   * @return {void}
   */
  ProductPageController.prototype._renderKiosk = function (product, sku, flags) {
    var skuCtlr = this.getModule('controller', 'sku', '_default');

    /**
     *
     * @return {void}
     */
    function render() {
      skuCtlr.renderView({
        sViewName: 'KioskProductPageView',
        elTarget: '.content-container',
        sOutput: 'outer',
        mParamData: { mvc: { flags: { isKiosk: true }, products: product, sku: sku, vm: {} } }
      });
    }

    if (flags.isVariantChange) {
      render();
    } else {
      $(document).ready(function () {
        render();
      });
    }
  };


  /**
   *
   * @param {Object} sku
   * @param {Object} flags
   * @return {void}
   */
  ProductPageController.prototype._initMediaViewer = function (sku, flags) {
    var skuModel = this.getModule('model', 'sku');

    /**
     *
     * @return {void}
     */
    function init() {
      mediaViewer.showScene7();
      mediaViewer.init(skuModel.getMediaAssets(sku));
    }

    if (this.isKiosk || fn.getValue(flags, 'isVariantChange')) {
      init();
    } else {
      $(document).ready(function () {
        init();
      });
    }
  };


  /**
   *
   * @param {Object} product
   * @return {void}
   */
  ProductPageController.prototype._setDocumentTitle = function (product) {
    document.title = product.displayName;
  };


  /**
   *
   * @param {Object} sku
   * @return {void}
   */
  ProductPageController.prototype._initBazaarVoice = function (sku) {
    bazaarvoice.initBV(sku.id);
  };


  /**
   *
   * @return {Object}
   */
  ProductPageController.prototype.asyncBlockInventoryCallback = function () {
    var _this = this,
      callback = {};

    /**
     *
     * @param {Object} resp
     * @return {void}
     */
    callback.success = function (resp) {
      var inventory = {};

      if (typeof resp !== 'string') {
        return;
      }

      inventory = _this._parseInventory(resp);

      if (!fn.isArray(inventory.products, { notEmpty: true })) {
        return;
      }

      _this._addInventory(inventory.products);
    };

    return callback;
  };


  /**
   *
   * @param {Object} resp
   * @param {Object} resp.inventory
   * @return {Ovject}
   */
  ProductPageController.prototype._parseInventory = function (resp) {
    var inventory = fn.getValue(JSON.parse(resp), 'inventory') || '';

    return JSON.parse(inventory.replace(/&amp;#034;/g, '"')) || {};
  };


  /**
   *
   * @param {Array<Object>} productInventory
   * @return {void}
   */
  ProductPageController.prototype._addInventory = function (productInventory) {
    var inventoryProductModel = this.getModule('model', 'inventoryProduct'),
      inventorySkuModel = this.getModule('model', 'inventorySKU');

    fn.loopArray(productInventory, function loopProductInventory(i) {
      var skuInventory = [];

      inventoryProductModel.setDataStores(productInventory[i]);

      if (!fn.isArray(productInventory[i].skus, { notEmpty: true })) {
        return;
      }

      skuInventory = productInventory[i].skus;

      fn.loopArray(skuInventory, function loopSkuInventory(j) {
        inventorySkuModel.setDataStores(skuInventory[j]);
      });
    });
  };


  /**
   *
   * @return {Array<Object>}
   */
  ProductPageController.prototype.getScrollActions = function () {
    return this._scrollActions;
  };


  /**
   *
   * @param {Object} config
   * @param {Object} config.scope
   * @param {Function} config.callback
   * @return {this}
   */
  ProductPageController.prototype.setScrollAction = function (config) {
    var _config = config || {};

    if (!fn.isObject(_config.scope, { notEmpty: true }) || typeof _config.callback !== 'function') {
      return this;
    }

    this._scrollActions.push(_config);
    return this;
  };


  /**
   *
   * @return {this}
   */
  ProductPageController.prototype.unsetScrollActions = function () {
    this._scrollActions = [];
    return this;
  };


  /**
   *
   * @return {Object}
   */
  ProductPageController.prototype.getActiveProduct = function () {
    return this._activeProduct;
  };


  /**
   *
   * @param {Object} product
   * @return {this}
   */
  ProductPageController.prototype.setActiveProduct = function (product) {
    this._activeProduct = fn.checkData(product, ['id', 'links']) ? product : {};
    return this;
  };


  /**
   *
   * @return {Object}
   */
  ProductPageController.prototype.getActiveSku = function () {
    return this._activeSku;
  };


  /**
   *
   * @param {Object} sku
   * @return {this}
   */
  ProductPageController.prototype.setActiveSku = function (sku) {
    this._activeSku = fn.checkData(sku, ['id', 'links']) ? sku : {};
    return this;
  };


  /**
   *
   * @return {Object}
   */
  ProductPageController.prototype.getSelectedSku = function () {
    return this._selectedSku;
  };


  /**
   *
   * @param {Object} sku
   * @return {this}
   */
  ProductPageController.prototype.setSelectedSku = function (sku) {
    this._selectedSku = fn.checkData(sku, ['id', 'links']) ? sku : {};
    return this;
  };


  module.exports = ProductPageController;
});
