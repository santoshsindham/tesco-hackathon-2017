define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BaseController = require('modules/pdp/controllers/BaseController'),
    VariantsView = require('modules/pdp/views/VariantsView'),
    DropdownVariantView = require('modules/pdp/views/DropdownVariantView'),
    ProductPageTitleView = require('modules/pdp/views/ProductPageTitleView'),
    ProductDetailsView = require('modules/pdp/views/ProductDetailsView'),
    ProductSpecView = require('modules/pdp/views/ProductSpecView'),
    common = require('modules/common'),
    googleEC = require('modules/google-analytics/pdpTracking');

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function VariantsController(models) {
    var pageController = fn.getValue(window, 'oAppController', 'oPageController');

    this.sNamespace = 'products';
    this.sTag = 'variants';
    this.postRender = false;
    this.oTooltipStyles = {
      kiosk: ['tooltip-left'],
      allDesktops: ['tooltip-left'],
      allDevices: ['tooltip-bottom']
    };
    this.views = {
      classes: {
        VariantsView: VariantsView,
        DropdownVariantView: DropdownVariantView
      }
    };
    this.historyEventBound = false;
    this.initModelReferences();
    this._dataCache = {};
    this.parent.constructor.call(this, models);

    if (common.isTouch()) {
      if (fn.isObject(pageController) && typeof pageController.setScrollAction === 'function') {
        pageController.setScrollAction({
          callback: this._onUpdateInventory,
          once: true,
          scope: this
        });
      }
    }
  }


  fn.inherit(VariantsController, BaseController);
  VariantsController.modelNames = ['inventoryProduct', 'inventorySKU', 'products', 'sku'];


  VariantsController.prototype._bindEvents = function () {
    if (window.history.pushState) {
      if (!this.historyEventBound) {
        $(window).on('popstate', this._popStateHandler.bind(this));
        this.historyEventBound = true;
      }
    }
  };


  VariantsController.prototype._popStateHandler = function (e) {
    var flags = {},
      stateData = null;

    if (e.originalEvent && e.originalEvent.state) {
      stateData = e.originalEvent.state;
      flags = stateData.flags;
      e.data = stateData;

      if (flags.isProductChange) {
        this._handleProductVariantChange(e, flags);
      } else {
        this._handleSkuVariantChange(e, flags);
      }
    }
  };


  /**
   *
   * @param {Object} args
   * @param {Object} args.oView
   * @param {JQueryDeferred} _deferred Used for unit tests
   * @return {void}
   */
  VariantsController.prototype._bindViewEvents = function (args, _deferred) {
    var _this = this,
      view = args.oView,
      viewName = view.sViewName,
      $wrapper = null;

    if (viewName !== 'SwatchVariantView' && viewName !== 'DropdownVariantView'
        && viewName !== 'VariantsView') {
      return;
    }

    $wrapper = $(view.oElms.elWrapper);

    if (viewName === 'SwatchVariantView') {
      $wrapper.on(
        'click', '.swatch-variant a', { view: view },
        this._onSwatchChange.bind(this)
      ).on(
        'change', 'select', { view: view },
        this._onDropdownChange.bind(this)
      );
    } else if (viewName === 'DropdownVariantView') {
      $wrapper.on(
        'change', 'select', { view: view },
        this._onDropdownChange.bind(this)
      );
    } else if (viewName === 'VariantsView') {
      if (!common.isTouch() || window.isKiosk()) {
        $wrapper.on(
          'mouseover.updateInventory', '.control', { view: view },
          function (e) {
            _this._onUpdateInventory(e);
            $wrapper.off('mouseover.updateInventory');
          }
        );
      } else {
        this._actionInViewport.push({
          element: view.oElms.elWrapper,
          callbackArgs: { data: { view: view } }
        });
        this._checkInViewport(view.sViewId, _deferred);
      }
    }
  };


  VariantsController.prototype._onSwatchChange = function (e) {
    var $currentTarget = $(e.currentTarget),
      flags = {},
      isPrimaryVariantChange = $currentTarget.data('variant-group-type') === 'primary',
      isProductChange = $currentTarget.data('variant-type') === 'product',
      productVariantSelected = !!$currentTarget.data('product-variant');

    e.preventDefault();

    this._activeView = e.data.view;

    if ($currentTarget.hasClass('swatch-variant-selected')
        || $currentTarget.parent().hasClass('swatch-variant-selected')) {
      return;
    }

    flags.isPrimaryVariantChange = isPrimaryVariantChange;
    flags.isProductChange = isProductChange;
    flags.productVariantSelected = productVariantSelected;
    flags.isSecondaryVariantChange = !isPrimaryVariantChange;
    flags.isSkuChange = !isProductChange;
    flags.isVariantChange = true;

    if (flags.isProductChange) {
      this._handleProductVariantChange(e, flags);
    } else {
      this._handleSkuVariantChange(e, flags);
    }
  };


  VariantsController.prototype._onDropdownChange = function (e) {
    var $target = $(e.target),
      $currentTarget = $(e.currentTarget),
      flags = {},
      isSelect = $target.is('select'),
      isPrimaryVariantChange = isSelect
          ? $target.find(':selected').data('variant-group-type') === 'primary'
          : $currentTarget.data('variant-group-type') === 'primary',
      isProductChange = isSelect
          ? $target.find(':selected').data('variant-type') === 'product'
          : $currentTarget.data('variant-type') === 'product',
      productVariantSelected = isSelect
          ? !!$target.find(':selected').data('product-variant')
          : !!$currentTarget.data('product-variant');

    this._activeView = e.data.view;

    flags.isPrimaryVariantChange = isPrimaryVariantChange;
    flags.isProductChange = isProductChange;
    flags.productVariantSelected = productVariantSelected;
    flags.isSecondaryVariantChange = !isPrimaryVariantChange;
    flags.isSelect = isSelect;
    flags.isSkuChange = !isProductChange;
    flags.isVariantChange = true;

    if (flags.isProductChange && this._handleDropdownError(e)) {
      this._handleProductVariantChange(e, flags);
    } else if (this._handleDropdownError(e)) {
      this._handleSkuVariantChange(e, flags);
    }
  };


  VariantsController.prototype._handleProductVariantChange = function (e, flags) {
    var _this = this,
      mvcPage = window.oAppController.oPageController,
      viewData = this._activeView.oData.mvc,
      inRecommender = viewData.flags.isRecommenderVariant,
      productId = '',
      skuId = '';

    if (!inRecommender) {
      this.setEvent({
        sName: 'showBuyboxMask',
        options: { mask: 'buybox', loader: true }
      }, false, true);
    }

    if (e.type === 'popstate') {
      productId = e.data.productId;
      skuId = e.data.skuId;
    } else {
      productId = $(e.currentTarget).data('variant-id') || $(e.target).val();
    }

    $(window).one('dataReady', function (nestedEvent) {
      _this.triggerVariantRender(e, nestedEvent, flags);
    });

    flags.isPopState = e.type === 'popstate';
    mvcPage.init(productId, skuId, { flags: flags });
  };


  VariantsController.prototype._handleSkuVariantChange = function (e, flags) {
    var _this = this,
      mvcPage = window.oAppController.oPageController,
      viewData = this._activeView.oData.mvc,
      inRecommender = viewData.flags.isRecommenderVariant,
      productId = '',
      skuId = '',
      $target = $(e.target),
      $currentTarget = $(e.currentTarget),
      $selectWrapper = $target.closest('.select-wrapper'),
      $control = $selectWrapper.find('.control'),
      refreshPoints = [],
      variantValue = '';

    if (flags.isSelect) {
      variantValue = $target.find(':selected').data('variant-value');
    } else {
      variantValue = $currentTarget.data('variant-value');
    }

    if (!inRecommender) {
      this.setEvent({
        sName: 'showBuyboxMask',
        options: { mask: 'buybox', loader: true }
      }, false, true);
    }

    if (e.type === 'popstate') {
      productId = e.data.productId;
      skuId = e.data.skuId;
    } else {
      productId = viewData.products.id;
      skuId = this._getSelectedSkuID(productId, variantValue)
          || $(e.currentTarget).data('variant-id')
          || $target.val();
    }

    if (!inRecommender) {
      $(window).one('dataReady', function (nestedEvent) {
        _this.triggerVariantRender(e, nestedEvent, flags);
      });

      flags.isPopState = e.type === 'popstate';
      mvcPage.init(productId, skuId, { flags: flags });
    } else {
      if (!fn.isArray(viewData.refreshPoints, { notEmpty: true })) {
        return;
      }

      refreshPoints = viewData.refreshPoints;
      this._onRecommenderVariantChange({
        productId: productId,
        skuId: skuId,
        refreshPoint: refreshPoints[refreshPoints.length - 1],
        errorCallback: function errorCallback() {
          _this.createTooltip({
            elTrigger: $selectWrapper,
            sType: 'error'
          });
          $control.addClass('invalid');
        }
      });
    }
  };


  VariantsController.prototype._handleDropdownError = function (event) {
    var ERROR_MESSAGE = 'Please select a valid option',
      $target = $(event.target),
      $selectWrapper = $target.closest('.select-wrapper'),
      $control = $selectWrapper.find('.control'),
      hasError = $control.hasClass('invalid'),
      hasSellerData = this.sanityCheckData(this._activeView.oData.mvc.sellers).objects;

    if (!$target.val()) {
      this.createTooltip({
        sTooltopMessage: ERROR_MESSAGE,
        elTrigger: $selectWrapper,
        sType: 'error'
      });

      $control.addClass('invalid');

      if (hasSellerData) {
        this.setEvent({
          sName: 'disableItemActions',
          listingId: this._activeView.oData.mvc.sellers.id
        }, false, true);
      }

      return false;
    }

    if (hasError && hasSellerData) {
      this.setEvent({
        sName: 'enableItemActions',
        listingId: this._activeView.oData.mvc.sellers.id
      }, false, true);
    }

    if (this._activePanel.tooltip) {
      this._activePanel.tooltip.destroy();
    }

    if (hasError) {
      $control.removeClass('invalid');
    }

    return true;
  };


  /**
   *
   * @param {string} productID
   * @param {string} variantValue
   * @return {string}
   */
  VariantsController.prototype._getSelectedSkuID = function (productID, variantValue) {
    var childSkus = [],
      inventorySkuModel = this.models.inventorySKU,
      productModel = this.models.products,
      skuID = '';

    childSkus = productModel.getLinks({ value: 'childSku', data: productID });

    if (!fn.isArray(childSkus, { notEmpty: true })) {
      return '';
    }

    fn.loopArray(childSkus, function loopChildSkus(i) {
      var childSku = childSkus[i];

      if (childSku.options.primary === variantValue
          && inventorySkuModel.getDataStores({ value: childSku.id }).available) {
        skuID = childSku.id;
        return true;
      }

      return undefined;
    });

    return skuID;
  };


  VariantsController.prototype._onRecommenderVariantChange = function (params) {
    var _this = this,
      _params = params;

    this.oSKUModel.promise({
      sSearchKey: 'id',
      mSearchValue: _params.skuId
    }).done(function (oSkuData) {
      if (!_this.sanityCheckData(oSkuData).objects) {
        _params.errorCallback();
        return;
      }

      _this.triggerBuyBoxCall({
        productID: _params.productId,
        SKUID: _params.skuId,
        doneCallback: function (aSellerData) {
          if (!_this.sanityCheckData(aSellerData.sellers).objects) {
            _params.errorCallback();
            return;
          }

          _this.setEvent({
            sName: 'refresh',
            sNamespace: _params.refreshPoint.namespace,
            sTag: _params.refreshPoint.tag,
            sViewName: _params.refreshPoint.viewName,
            inherit: { namespace: 'sku', model: _this.oSKUModel },
            noCollate: true,
            getView: function getView(view) {
              if (view.sViewId === _params.refreshPoint.viewId) {
                return true;
              }
              return false;
            },
            mParamData: {
              mvc: {
                products: _this.oProductModel.get({
                  mSearchValue: _params.productId,
                  noFetch: true
                }),
                sku: oSkuData,
                sellers: _this.oSellerModel.get({
                  mSearchValue: aSellerData.sellers[0].id,
                  noFetch: true
                })
              }
            }
          }, false, true);
          googleEC.setAnalytics(oSkuData, 'matchingItemsLoad');
        }
      });
    });
  };

  VariantsController.prototype.triggerProductPageRender = function (data) {
    var oViewData = { mvc: { products: data.product, sku: data.sku, vm: {} } },
      aSubViews = [],
      i = 0;

    aSubViews.push(new ProductPageTitleView({
      elTarget: '.product-title-wrapper',
      mParamData: oViewData
    }));

    aSubViews.push(new ProductDetailsView({
      elTarget: '.product-description-block',
      mParamData: oViewData
    }));

    if (!this.oProductModel.isFF(data.product)) {
      aSubViews.push(new ProductSpecView({
        elTarget: '.product-spec-block',
        mParamData: oViewData,
        ctlr: true
      }));
    }

    for (i = 0; i < aSubViews.length; i += 1) {
      aSubViews[i].render();
    }
  };

  VariantsController.prototype.triggerBuyBoxCall = function (oParams) {
    var _this = this;

    this.oSKUModel.fetch({
      sSearchKey: 'id',
      mSearchValue: [
        oParams.productID,
        oParams.SKUID
      ],
      sModelMethod: 'buybox',
      doneCallback: oParams.doneCallback || function (mSellerData) {
        _this.oSKUModel.sellerInformationCallback({
          skuID: oParams.SKUID,
          sellers: mSellerData,
          targetSelector: oParams.targetSelector
        });
      }
    });
  };

  VariantsController.prototype.triggerVariantRender = function (oEvent, nestedEvent) {
    var _this = this,
      flags = nestedEvent.oData.flags,
      product = nestedEvent.oData.product,
      sku = nestedEvent.oData.sku,
      oEventData = { mRespData: { oSKU: sku, oProduct: product } };

    this.triggerProductPageRender(nestedEvent.oData);

    this.setEvent({
      sName: 'getPanelGroup',
      tag: 'buybox',
      callback: function (panelGroup) {
        if (panelGroup) {
          panelGroup.destroy();
        }
      }
    }, false, true);

    this.setEvent({
      sName: 'getPanelGroup',
      tag: 'tabs',
      callback: function (panelGroup) {
        if (panelGroup) {
          panelGroup.destroy();
        }
      }
    }, false, true);

    this.setEvent({
      sName: 'fetchData',
      sNamespace: 'sku',
      queryParams: {
        searchValue: sku.id,
        modelMethod: 'ndo'
      }
    }, false, true);

    this.setEvent({
      sName: 'refresh',
      sNamespace: 'sku',
      sTag: 'competitors',
      sViewName: 'PriceCheckView',
      getView: function getView(view) {
        if (view.sTag === 'competitors') {
          return true;
        }
        return false;
      },
      render: {
        elTarget: '#price-check-view-placeholder',
        sOutput: 'inner'
      },
      mParamData: {
        mvc: {
          sku: sku.id
        }
      }
    }, false, true);

    this.setEvent({
      sName: 'fetchData',
      sNamespace: 'sku',
      queryParams: {
        searchValue: [product.id, sku.id],
        modelMethod: 'buybox',
        doneCallback: function (data) {
          var skuData = this.oModel.get({
            mSearchValue: sku.id,
            noFetch: true
          });

          this.queryModel({
            sNamespace: 'sku',
            sCommand: 'update',
            oQueryParams: {
              mSearchValue: sku.id,
              sUpdateKey: 'sellers',
              mUpdateValue: data.sellers
            }
          });

          if (!window.isKiosk()) {
            this.renderView({
              sViewName: 'BuyboxView',
              elTarget: '.buybox-view',
              mParamData: {
                mvc: {
                  sku: skuData,
                  hooklogic: data.HookLogicBlock.param,
                  flags: flags
                }
              }
            });

            this.setEvent({
              sName: 'refresh',
              sNamespace: 'promotions',
              sTag: 'productPage',
              sViewName: 'PromotionsView',
              getView: function getView(view) {
                if (view.sTag === 'productPage') {
                  return true;
                }
                return false;
              },
              mParamData: { mvc: { sku: skuData } }
            }, false, true);

            if (_this.oSKUModel.getBookDetails(skuData).authorBiography) {
              this.setEvent({
                sName: 'refresh',
                sNamespace: 'sku',
                sTag: 'authorBiography',
                sViewName: 'AuthorBiographyView',
                getView: function getView(view) {
                  if (view.sTag === 'authorBiography') {
                    return true;
                  }
                  return false;
                },
                mParamData: {
                  mvc: {
                    sku: skuData
                  }
                }
              }, false, true);
            }
          }
        }
      }
    }, false, true);

    if (!flags.isSkuChange) {
      this.triggerProductChangeEvent(oEventData);
    }

    this.triggerSkuChangeEvent(oEventData);
  };


  VariantsController.prototype.initModelReferences = function () {
    var _this = this;

    this.queryModel({
      sNamespace: 'products'
    }).done(function (mOutput) {
      _this.oProductModel = mOutput;
    });

    this.queryModel({
      sNamespace: 'sellers'
    }).done(function (mOutput) {
      _this.oSellerModel = mOutput;
    });

    this.queryModel({
      sNamespace: 'sku'
    }).done(function (mOutput) {
      _this.oSKUModel = mOutput;
    });
  };

  VariantsController.prototype.triggerProductChangeEvent = function (oData) {
    var eProductChange = new $.Event('variant');

    eProductChange.oData = oData;
    eProductChange.namespace = 'productChange';
    $(window).trigger(eProductChange);
  };

  VariantsController.prototype.triggerSkuChangeEvent = function (oData) {
    var eSkuChange = new $.Event('variant');

    eSkuChange.oData = oData;
    eSkuChange.namespace = 'skuChange';
    $(window).trigger(eSkuChange);
  };


  VariantsController.prototype._collateDataDependancies = function (args) {
    var _this = this,
      _args = args,
      cachedOptions = {},
      cacheKey = '',
      childSkus = [],
      hasMixedPrimaryOption = false,
      inventoryProductModel = this.models.inventoryProduct,
      inventorySkuModel = this.models.inventorySKU,
      isFF = false,
      isProductVariant = false,
      masterDeferred = _args.deferred,
      mvcData = _args.mParamData.mvc,
      flags = mvcData.flags || {},
      inRecommender = !!flags.isRecommenderVariant,
      mvcPage = fn.getValue(window.oAppController, 'oPageController'),
      primaryChildSkus = [],
      primaryOption = {},
      product = mvcData.products,
      productModel = this.models.products,
      productVariantSelected = false,
      secondaryOption = {},
      selectedSku = !inRecommender ? mvcPage.getSelectedSku() : {};

    cacheKey = this._buildCacheKey(product, selectedSku, inRecommender);

    if (this._dataCache[cacheKey] === null) {
      masterDeferred.reject();
      return;
    } else if (this._dataCache[cacheKey] !== undefined) {
      cachedOptions = this._dataCache[cacheKey];

      if (cachedOptions.secondary.displayCount && !cachedOptions.secondary.selectedValue
        && fn.isObject(mvcData.sellers)) {
        _this._disableItemActions(cachedOptions.secondary, mvcData.sellers.id);
      }

      _args.mParamData.mvc.vm = this._dataCache[cacheKey];
      masterDeferred.resolve(_args);
      return;
    }

    if (!fn.isArray(product.optionsInfo, { notEmpty: true }) || !product.optionsInfo[0].type) {
      this._dataCache[cacheKey] = null;
      masterDeferred.reject();
      return;
    }

    childSkus = productModel.getLinks({ value: 'childSku', data: product })
      .filter(function (childSku) {
        var options = childSku.options || {};

        return !!options.primary;
      });
    isFF = productModel.isFF(product);

    if (!isFF && childSkus.length <= 1) {
      this._dataCache[cacheKey] = null;
      masterDeferred.reject();
      return;
    }

    isProductVariant = productModel.isProductVariant(product);
    primaryChildSkus = this._compilePrimaryChildSkus(
      product, selectedSku, childSkus, inRecommender
    );
    hasMixedPrimaryOption = this._hasMixedPrimaryOption(primaryChildSkus, product);

    if (isProductVariant) {
      productVariantSelected = this._isProductVariantSelected(product, selectedSku);
    }

    primaryOption = this._compilePrimaryOption(
      primaryChildSkus, product, selectedSku, productVariantSelected, inRecommender
    );

    secondaryOption = this._compileSecondaryOption(primaryOption, childSkus, product, selectedSku);

    if (inRecommender) {
      this._setDisplayStates([primaryOption, secondaryOption], isFF, inRecommender);
      _args.mParamData.mvc.vm = { primary: primaryOption, secondary: secondaryOption };
      masterDeferred.resolve(_args);
      return;
    }

    inventoryProductModel.getDataStores({
      fetch: true,
      value: this._getProductIDs(primaryOption.links)
    })
      .done(function handleInventorySuccess(productInventory) {
        fn.loopArray(productInventory, function loopProductInventory(i) {
          if (fn.isArray(productInventory[i].skus, { notEmpty: true })) {
            inventorySkuModel.setDataStores(productInventory[i].skus);
          }
        });

        _this._compileInventory([primaryOption, secondaryOption]);

        if (!isProductVariant || hasMixedPrimaryOption) {
          _this._rollUpInventory(primaryOption, childSkus);
        }

        _this._setSelectedStates([primaryOption, secondaryOption]);
        _this._filterOptions([primaryOption, secondaryOption], isFF, flags.isBuybox);
        _this._hasSwatches([primaryOption, secondaryOption]);
        _this._sortOptions([primaryOption, secondaryOption]);
        _this._setDisplayStates([primaryOption, secondaryOption], isFF, inRecommender);

        if (secondaryOption.displayCount && !secondaryOption.selectedValue
          && fn.isObject(mvcData.sellers)) {
          _this._disableItemActions(secondaryOption, mvcData.sellers.id);
        }

        _this._dataCache[cacheKey] = { primary: primaryOption, secondary: secondaryOption };
        _args.mParamData.mvc.vm = _this._dataCache[cacheKey];
        masterDeferred.resolve(_args);
      })
      .fail(function handleInventoryFailure() {
        masterDeferred.reject();
      });
  };


  /**
   *
   * @param {Object} product
   * @param {Object} selectedSku
   * @param {boolean} inRecommender
   * @return {string}
   */
  VariantsController.prototype._buildCacheKey = function (product, selectedSku, inRecommender) {
    var key = product.id;

    if (selectedSku.id) {
      key += '_' + selectedSku.id;
    }

    key += '_' + (inRecommender ? 'outfit' : 'buybox');

    return key;
  };


  /**
   *
   * @param {Object} secondaryOption
   * @param {string} listingID
   * @return {void}
   */
  VariantsController.prototype._disableItemActions = function (secondaryOption, listingID) {
    var disableItemActions = {
      data: { listingId: listingID },
      name: 'disableItemActions',
      propName: 'oData'
    };

    fn.createEvent(disableItemActions).fire();
  };


  /**
   *
   * @param {Object} product
   * @param {Object} selectedSku
   * @param {Array<Object>} childSkus
   * @param {boolean} inRecommender
   * @return {Array<Object>}
   */
  VariantsController.prototype._compilePrimaryChildSkus = function (
    product, selectedSku, childSkus, inRecommender
  ) {
    var productModel = this.models.products,
      skuModel = this.models.sku,
      primaryChildSkus = [];

    if (inRecommender) {
      primaryChildSkus = [productModel.getDefaultSku(product)];
    } else if (fn.isObject(selectedSku, { notEmpty: true })) {
      primaryChildSkus = [skuModel.getSelfLink(selectedSku)];
    }

    fn.loopArray(childSkus, function loopChildSkus(i) {
      var match = false;

      fn.loopArray(primaryChildSkus, function loopPrimaryChildSkus(j) {
        if (childSkus[i].options.primary === primaryChildSkus[j].options.primary) {
          match = true;
        }
      });

      if (!match) {
        primaryChildSkus.push(childSkus[i]);
      }
    });

    return primaryChildSkus;
  };


  /**
   *
   * @param {Array<Object>} primaryChildSkus
   * @param {Object} product
   * @return {boolean}
   */
  VariantsController.prototype._hasMixedPrimaryOption = function (primaryChildSkus, product) {
    var colourAssociations = [],
      isProductVariant = false,
      productModel = this.models.products;

    colourAssociations = productModel.getLinks({ value: 'colourAssociation', data: product });
    isProductVariant = productModel.isProductVariant(product);

    return isProductVariant && colourAssociations.length && primaryChildSkus.length > 1;
  };


  /**
   *
   * @param {Object} product
   * @param {Object} selectedSku
   * @return {boolean}
   */
  VariantsController.prototype._isProductVariantSelected = function (product, selectedSku) {
    var productModel = this.models.products,
      skuModel = this.models.sku,
      productSelfLink = {},
      selectedSkuSelfLink = {};

    if (!fn.isObject(selectedSku, { notEmpty: true })) {
      return true;
    }

    productSelfLink = productModel.getSelfLink(product);
    selectedSkuSelfLink = skuModel.getSelfLink(selectedSku);

    if (productSelfLink.options.primary === selectedSkuSelfLink.options.primary) {
      return true;
    }

    return false;
  };


  /**
   *
   * @param {Array<Object>} primaryChildSkus
   * @param {Object} product
   * @param {Object} selectedSku
   * @param {boolean} productVariantSelected
   * @param {boolean} inRecommender
   * @return {Object}
   */
  VariantsController.prototype._compilePrimaryOption = function (
    primaryChildSkus, product, selectedSku, productVariantSelected, inRecommender
  ) {
    var productModel = this.models.products,
      colourAssociations = productModel.getLinks({ value: 'colourAssociation', data: product }),
      isProductVariant = productModel.isProductVariant(product),
      primaryOption = { hasSwatches: false, links: [], selectedID: '', selectedValue: '' },
      productSelfLink = productModel.getSelfLink(product),
      productSelfLinkOptions = {},
      skuModel = this.models.sku,
      skuLink = {},
      skuLinkOptions = {};

    if (inRecommender) {
      skuLink = productModel.getDefaultSku(product);
    } else if (fn.isObject(selectedSku, { notEmpty: true })) {
      skuLink = skuModel.getSelfLink(selectedSku);
    }

    skuLinkOptions = skuLink.options || {};

    fn.mergeObjects(
      primaryOption,
      productModel.getOptionsInfo(product, 'primary'),
      { extend: true }
    );

    if (!isProductVariant) {
      primaryOption.links = primaryChildSkus;
      primaryOption.selectedValue = skuLinkOptions.primary;
      primaryOption.selectedID = skuLink.id;
      primaryOption.productVariantSelected = false;
    } else {
      primaryOption.links = [productSelfLink];
      productSelfLinkOptions = productSelfLink.options || {};

      if (colourAssociations.length) {
        primaryOption.links = primaryOption.links.concat(colourAssociations);
      }

      fn.loopArray(primaryChildSkus, function loopPrimaryChildSkus(i) {
        if (primaryChildSkus[i].options.primary === productSelfLinkOptions.primary) {
          primaryChildSkus.splice(i, 1);
        }
      }, { backward: true });

      if (primaryChildSkus.length) {
        primaryOption.links = primaryOption.links.concat(primaryChildSkus);
      }

      primaryOption.selectedValue = productVariantSelected
          ? productSelfLinkOptions.primary : skuLinkOptions.primary || '';
      primaryOption.selectedID = productVariantSelected
          ? productSelfLink.id : skuLink.id || '';
      primaryOption.productVariantSelected = productVariantSelected;
    }

    fn.loopArray(primaryOption.links, function loopOptionLinks(j) {
      var link = primaryOption.links[j];

      link.isProductVariant = link.type === 'product';
    });

    return primaryOption;
  };


  /**
   *
   * @param {Object} primaryOption
   * @param {Array<Object>} childSkus
   * @param {Object} product
   * @param {Object} selectedSku
   * @return {Object}
   */
  VariantsController.prototype._compileSecondaryOption = function (
    primaryOption, childSkus, product, selectedSku
  ) {
    var productModel = this.models.products,
      secondaryOption = { hasSwatches: false, links: [], selectedID: '', selectedValue: '' },
      skuModel = this.models.sku;

    fn.mergeObjects(
      secondaryOption,
      productModel.getOptionsInfo(product, 'secondary'),
      { extend: true }
    );

    if (fn.isObject(selectedSku, { notEmpty: true })) {
      secondaryOption.selectedValue = skuModel.getSelfLink(selectedSku).options.secondary;
      secondaryOption.selectedID = selectedSku.id;
    }

    fn.loopArray(childSkus, function loopChildSkus(i) {
      if (childSkus[i].options.primary === primaryOption.selectedValue
        && !!childSkus[i].options.secondary) {
        childSkus[i].isProductVariant = primaryOption.productVariantSelected;
        secondaryOption.links.push(childSkus[i]);
      }
    });

    return secondaryOption;
  };


  /**
   *
   * @param {Array<Object>} links
   * @return {Array<string>}
   */
  VariantsController.prototype._getProductIDs = function (links) {
    var ids = [];

    fn.loopArray(links, function loopPrimaryOptionLinks(i) {
      var link = links[i];

      if (link.type === 'product') {
        ids.push(link.id);
      }
    });

    return ids;
  };


  /**
   *
   * @param {Array<Object>} options
   * @return {void}
   */
  VariantsController.prototype._compileInventory = function (options) {
    var inventoryProductModel = this.models.inventoryProduct,
      inventorySkuModel = this.models.inventorySKU;

    fn.loopArray(options, function loopOptions(i) {
      var links = options[i].links;

      options[i].hasInventory = true;

      fn.loopArray(links, function loopLinks(j) {
        var inventory = {},
          inventoryModel = {},
          link = links[j];

        inventoryModel = link.type === 'product' ? inventoryProductModel : inventorySkuModel;
        inventory = inventoryModel.getDataStores({ value: link.id });
        link.inventoryMerged = fn.isObject(inventory, { notEmpty: true });

        if (link.inventoryMerged) {
          fn.mergeObjects(link, inventory, { extend: true });
        }
      });
    });
  };


  /**
   *
   * @param {Object} primaryOption
   * @param {Array<Object>} childSkus
   * @return {void}
   */
  VariantsController.prototype._rollUpInventory = function (primaryOption, childSkus) {
    var inventorySkuModel = this.models.inventorySKU,
      links = primaryOption.links;

    fn.loopArray(links, function loopLinks(i) {
      var count = { available: 0, links: 0, outOfStock: 0, subscribable: 0 },
        link = links[i];

      if (link.type === 'product') {
        return;
      }

      fn.loopArray(childSkus, function loopChildSkus(j) {
        var childSku = childSkus[j],
          inventory = {};

        if (link.options.primary !== childSku.options.primary) {
          return;
        }

        inventory = inventorySkuModel.getDataStores({ value: childSku.id });

        if (inventory.available) {
          count.available += 1;
        } else {
          count.outOfStock += 1;
        }

        if (inventory.subscribable) {
          count.subscribable += 1;
        }

        count.links += 1;
      });

      link.inventoryMerged = true;
      link.available = count.available > 0;
      link.subscribable = count.subscribable > 0;
      link.outOfStock = count.outOfStock === count.links;
      link.availability = link.outOfStock ? 'OutOfStock' : 'InStock';
    });
  };


  /**
   *
   * @param {Array<Object>} options
   * @return {void}
   */
  VariantsController.prototype._setSelectedStates = function (options) {
    fn.loopArray(options, function loopOptions(i) {
      var links = options[i].links,
        selectedID = options[i].selectedID;

      fn.loopArray(links, function loopLinks(j) {
        var link = links[j];

        if (link.id === selectedID) {
          link.selected = true;
        }
      });
    });
  };


  /**
   *
   * @param {Array<Object>} options
   * @param {boolean} isFF
   * @param {boolean} isBuybox
   * @return {void}
   */
  VariantsController.prototype._filterOptions = function (options, isFF, isBuybox) {
    var mvcPage = fn.getValue(window.oAppController, 'oPageController'),
      rootView = isBuybox ? 'buybox' : 'outfit',
      secondaryOption = {},
      secondaryOptionLink = {},
      supplier = isFF ? 'FF' : 'GMO';

    fn.loopArray(options, function loopOptions(i) {
      var links = options[i].links,
        hideOutOfStock = fn.getValue(
          window, '__MVT__', supplier, rootView, 'variants', options[i].type, 'hideOutOfStock'
        );

      fn.loopArray(links, function loopLinks(j) {
        var link = links[j];

        if (!link.selected) {
          if ((hideOutOfStock && !link.available) || (isFF && options[i].internalName === 'colour'
              && !link.available && !link.subscribable)) {
            links.splice(j, 1);
          }
        }
      }, { backward: true });

      options[i].displayCount = links.length;
    });

    secondaryOption = options[1];
    if (secondaryOption.links.length === 1 && !secondaryOption.selectedValue) {
      secondaryOptionLink = secondaryOption.links[0];
      secondaryOption.selectedID = secondaryOptionLink.id;
      secondaryOption.selectedValue = secondaryOptionLink.options.secondary;
      mvcPage.setSelectedSku(mvcPage.getActiveSku());
    }
  };

  /**
   *
   * @param {Array<Object>} options
   * @return {boolean}
   */
  VariantsController.prototype._hasSwatches = function (options) {
    /**
     *
     * @param {string} name
     * @return {Boolean}
     */
    function swatchable(name) {
      var bool = false;

      switch (name) {
        case 'colour':
          bool = true;
          break;
        // no default
      }

      return bool;
    }

    fn.loopArray(options, function loopOptions(i) {
      var count = 0,
        internalName = options[i].internalName,
        links = options[i].links;

      fn.loopArray(links, function loopLinks(j) {
        if (links[j].options.swatch) {
          count += 1;
        }
      });

      options[i].hasSwatches = swatchable(internalName) && count === links.length;
    });
  };


  /**
   *
   * @param {Array<Object>} options
   * @param {boolean} isFF
   * @param {boolean} inRecommender
   * @return {boolean}
   */
  VariantsController.prototype._setDisplayStates = function (options, isFF, inRecommender) {
    fn.loopArray(options, function loopOptions(i) {
      var option = options[i];

      option.inDropdown = inRecommender || option.displayCount > 1;
      option.toDisplayOption = inRecommender || isFF || (!isFF && option.displayCount > 1);
    });
  };


  /**
   *
   * @param {Array<Object>} options
   * @return {boolean}
   */
  VariantsController.prototype._sortOptions = function (options) {
    fn.loopArray.call(this, options, function loopOptions(i) {
      if (options[i].hasSwatches) {
        options[i].links.sort(this._sort(options[i].type));
      }
    });
  };


  /**
   *
   * @param {string} type
   * @return {Function}
   */
  VariantsController.prototype._sort = function (type) {
    return function (a, b) {
      var i = 0;

      if (a.available > b.available) {
        i = -1;
      } else if (a.available < b.available) {
        i = 1;
      } else if (a.options[type] > b.options[type]) {
        i = 1;
      } else if (a.options[type] < b.options[type]) {
        i = -1;
      } else if (a.id > b.id) {
        i = 1;
      } else if (a.id < b.id) {
        i = -1;
      } else {
        i = 0;
      }

      return i;
    };
  };


  /**
   *
   * @param {JQueryEvent} e
   * @return {void}
   */
  VariantsController.prototype._onUpdateInventory = function (e) {
    var _this = this,
      childSkus = [],
      inventoryModel = {},
      inventoryProductModel = this.models.inventoryProduct,
      inventorySkuModel = this.models.inventorySKU,
      isFF = false,
      isProductVariant = false,
      hasMixedPrimaryOption = false,
      productModel = this.models.products,
      view = e.data.view,
      mvcData = view.oData.mvc,
      flags = mvcData.flags,
      inRecommender = flags.isRecommenderVariant,
      product = mvcData.products,
      variantOpts = mvcData.vm,
      primaryOption = variantOpts.primary,
      secondaryOption = variantOpts.secondary;

    if (primaryOption.hasInventory && secondaryOption.hasInventory) {
      return;
    }

    isFF = productModel.isFF(product);
    isProductVariant = productModel.isProductVariant(product);
    inventoryModel = isProductVariant ? inventoryProductModel : inventorySkuModel;

    inventoryModel.getDataStores({
      fetch: true,
      value: isProductVariant
          ? this._getProductIDs(primaryOption.links)
          : this._getSkuIDs(primaryOption.links.concat(secondaryOption.links))
    })
      .done(function handleInventorySuccess(inventory) {
        if (isProductVariant) {
          fn.loopArray(inventory, function loopProductInventory(i) {
            if (fn.isArray(inventory[i].skus, { notEmpty: true })) {
              inventorySkuModel.setDataStores(inventory[i].skus);
            }
          });
        }

        _this._compileInventory([primaryOption, secondaryOption]);

        childSkus = productModel.getLinks({ value: 'childSku', data: product })
          .filter(function (childSku) {
            var options = childSku.options || {};

            return !!options.primary && !!options.secondary;
          });

        hasMixedPrimaryOption = _this._hasMixedPrimaryOption(
          _this._compilePrimaryChildSkus(product, {}, childSkus, inRecommender), product
        );

        if (!isProductVariant || hasMixedPrimaryOption) {
          _this._rollUpInventory(primaryOption, childSkus);
        }

        _this._setSelectedStates([primaryOption, secondaryOption]);
        _this._hasSwatches([primaryOption, secondaryOption]);
        _this._sortOptions([primaryOption, secondaryOption]);
        _this._setDisplayStates([primaryOption, secondaryOption], isFF, inRecommender);

        if (secondaryOption.displayCount && !secondaryOption.selectedValue
          && fn.isObject(mvcData.sellers)) {
          _this._disableItemActions(secondaryOption, mvcData.sellers.id);
        }

        _this._dataCache[_this._buildCacheKey(product, {}, inRecommender)] = variantOpts;
        flags.onUpdateInventory = true;
        view.refresh({ data: view.oData });
      });
  };


  /**
   *
   * @param {Array<Object>} links
   * @return {Array<string>}
   */
  VariantsController.prototype._getSkuIDs = function (links) {
    var ids = [];

    fn.loopArray(links, function loopLinks(i) {
      var link = links[i];

      if (ids.indexOf(link.id) === -1) {
        ids.push(link.id);
      }
    });

    return ids;
  };


  module.exports = VariantsController;
});
