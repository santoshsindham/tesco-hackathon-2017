define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    bundleTemplate = require('text!templates/views/relatedItemsViewWithTitle.html'),
    isCarouselFullWidth = null,
    createCarousel = null,
    recommenders = {},
    common = require('modules/common'),
    breadcrumbCache = require('modules/breadcrumb-cache/common');

  window.rrComplete = function () {
    var $rrBlocks = $('.rr-product').not('.rrDone');

    $(window).trigger('richRelevanceAnalyticsCallback');
    if ($rrBlocks.length) {
      require([
        'modules/tile-carousel/common',
        'modules/product-tile/common',
        'modules/product-description/common',
        'modules/breakpoint'
      ], function (tileCarousel, productTile, pdp, breakpoint) {
        var secHeight = 0,
          priHeight = 0;

        $.each($rrBlocks, function () {
          var $tempProductCarousel = $(this),
            oOptions = {};

          if (isCarouselFullWidth($tempProductCarousel)) {
            oOptions = {
              itemSelector: '.list-item',
              bIncludePagination: true,
              oPaginationOptions: {
                sHeaderSelector: '.cfw-header',
                sPaginationClass: 'cfw-navigation',
                sPageSelector: '.nav-dot',
                sPageClass: 'nav-dot',
                sSelectedPageClass: 'isSelected',
                sPageButtonClass: 'dot-action',
                breakpointsToAvoidMovingPastLastItem: {
                  mobile: {
                    paddingToRightOfCarousel: 10
                  },
                  vTablet: {
                    paddingToRightOfCarousel: 0
                  }
                }
              },
              elasticBounceOnEmptySwipe: true,
              wiggleStartupCeremony: true,
              bHideNextPreviousIfAllItemsVisible: true,
              bFitsItemWidthsAndPaddingForNumberOfItemsMinusOne: true
            };
            createCarousel($tempProductCarousel, oOptions);
            common.Ellipsis.init($('.cfw-products').find('.list-item h3'));
            recommenders.setRichRelevanceAnalyticsProductClickEvents($tempProductCarousel);
          } else if ($tempProductCarousel.hasClass('product-carousel')
              || $tempProductCarousel.hasClass('product-carousel-heroic')) {
            if (!$tempProductCarousel.find('.js-equalised').length) {
              if ($('#recommenderIframe').length) {
                $tempProductCarousel.addClass('streamline-basket-carousel');
              }

              if (window.isKiosk()) {
                if (!$('#listing .products-wrapper').length) {
                  oOptions = {
                    itemSelector: 'ul.products > li',
                    scrollLimit: 0,
                    enablePeep: false
                  };
                  createCarousel($tempProductCarousel, oOptions);
                  productTile.Ellipsis.init($tempProductCarousel);
                  recommenders.setRichRelevanceAnalyticsProductClickEvents($tempProductCarousel);
                }
              } else {
                oOptions = {
                  itemSelector: 'ul.products > li',
                  scrollLimit: $tempProductCarousel.hasClass('product-carousel-heroic')
                      ? tileCarousel.getScrollLimit() : 0,
                  enablePeep: false
                };
                createCarousel($tempProductCarousel, oOptions);
                productTile.Ellipsis.init($tempProductCarousel);
                recommenders.setRichRelevanceAnalyticsProductClickEvents($tempProductCarousel);
              }
            }
          } else {
            productTile.Ellipsis.init($(this));
          }
        });

        common.Ellipsis.init($('.product-carousel-heroic').find('.product h3'));
        $('.rr-product').addClass('rrDone');
        window.picturefill();

        if (common.isPage('PDP')) {
          pdp.changeColumnLayout();
        }

        if (common.isPage('basket')) {
          if (breakpoint.vTablet || breakpoint.hTablet) {
            priHeight = $('#basket-primary').height();
            secHeight = $('#basket-secondary').height();

            if (secHeight > priHeight) {
              $('#basket-primary').css('height', secHeight);
            }
          }
        }
        productTile.decorateClickEvent();
      });
    }
  };

  isCarouselFullWidth = function ($tempProductCarousel) {
    if ($tempProductCarousel.hasClass('carousel-fullwidth')) {
      return true;
    }
    return false;
  };

  createCarousel = function ($tempProductCarousel, oOptions) {
    $tempProductCarousel.carousel(oOptions);
  };

  recommenders = {
    asyncBlockCallbacks: function asyncBlockCallbacks() {
      var callbacks = {};

      callbacks.success = function (resp) {
        var _resp = resp,
          categoryID = null;

        if (typeof _resp === 'string') {
          _resp = $.parseJSON(_resp);
        }
        if (_resp.Recommendations.sessionID) {
          window.R3_COMMON.setSessionId(_resp.Recommendations.sessionID);
        }
        if (_resp.Recommendations.userID) {
          window.R3_COMMON.setUserId(_resp.Recommendations.userID);
        }

        if (common.isPage('PDP')) {
          categoryID = breadcrumbCache.getCategoryID(document.referrer);
          if (categoryID) {
            window.R3_COMMON.categoryHintIds = '';
            window.R3_COMMON.addCategoryHintId(categoryID);
          }
        }

        window.r3();
      };

      return callbacks;
    },


    /**
     *
     * @param {string} productId
     * @param {boolean} triggerR3Call
     * @param {Object} blockConfig
     * @return {void}
     */
    triggerRichRelevanceAndRegisterCallback: function (productId, triggerR3Call, blockConfig) {
      var promise = {},
        RR = window.RR;

      if (RR === undefined) {
        return null;
      }

      if (!fn.getValue(window, 'oAppController', 'oPageController')) {
        return null;
      }

      RR.placementsCallback = function () {
        var deferred = $.Deferred(),
          placements = [];

        if (RR.data.JSON.placements.length === 0) {
          deferred.reject();
          return deferred.promise();
        }

        placements = RR.data.JSON.placements;

        fn.loopArray(placements, function loopPlacements(i) {
          placements[i].config = recommenders.extendConfig(
            { productId: productId, view: 'carousel' }, placements[i].config
          );

          promise = recommenders.processItems(
            placements[i].items, placements[i].itemFormat, placements[i].config.view
          );

          if (promise) {
            promise.done(function handleProcessItemsSuccess(itemData) {
              placements[i].placementPosition = (i + 1);
              placements[i].formattedItemsArray = placements[i].items.map(function (obj) {
                return { id: obj.id };
              });

              recommenders[placements[i].config.view](
                recommenders.createViewConfig(itemData, placements[i], blockConfig)
              );

              deferred.resolve();
            });
          }
        });

        return deferred.promise();
      };

      if (triggerR3Call) {
        window.r3();
      }

      return undefined;
    },

    /**
     *
     * @param {Object} defaultConfig
     * @param {Object} placementConfig
     * @return {Object}
     */
    extendConfig: function extendConfig(defaultConfig, placementConfig) {
      if (fn.isObject(placementConfig, { notEmpty: true })) {
        $.extend(defaultConfig, placementConfig);
      }
      return defaultConfig;
    },

    /**
     *
     * @param {Array<Object>|Array<string>} items
     * @param {String} itemFormat
     * @param {String} viewName
     * @return {JQueryPromise}
     */
    processItems: function processItems(items, itemFormat, viewName) {
      var deferred = $.Deferred(),
        promise = {};

      if (!fn.isArray(items, { notEmpty: true })) {
        deferred.reject();
        return deferred.promise();
      }

      if (itemFormat === 'objects') {
        promise = recommenders.processObjects(items, viewName);
      } else if (itemFormat === 'ids') {
        promise = recommenders.processIDs(items);
      } else {
        deferred.reject();
        return deferred.promise();
      }

      if (promise) {
        promise
          .done(function handleProcessObjectsSuccess(productData) {
            deferred.resolve(productData);
          })
          .fail(function handleProcessObjectsFailure() {
            deferred.reject();
          });
      }

      return deferred.promise();
    },

    /**
     *
     * @param {Array<Object>} items
     * @param {string} viewName
     * @return {JQueryPromise}
     */
    processObjects: function processObjects(items, viewName) {
      var output = undefined,
        deferred = $.Deferred(),
        toFetch = viewName === 'bundle',
        mvcPage = window.oAppController.oPageController,
        productModel = mvcPage.getModule('model', 'products', '_default');

      output = productModel
        .setDataStores(items)
        .getDataStores({
          value: items.map(function (item) { return item.id; }),
          fetch: toFetch
        });

      if (!toFetch) {
        deferred.resolve(output);
      } else {
        output
          .done(function handleGetDataStoresSuccess(productData) {
            if (productData.length) {
              deferred.resolve(productData);
            } else {
              deferred.reject();
            }
          });
      }

      return deferred.promise();
    },

    /**
     *
     * @param {Array<string>} items
     * @return {JQueryPromise}
     */
    processIDs: function processIDs(items) {
      var deferred = $.Deferred(),
        mvcPage = window.oAppController.oPageController,
        productModel = mvcPage.getModule('model', 'products', '_default');

      productModel.getDataStores({
        value: items.map(function (item) { return item.id; }),
        fetch: true
      })
        .done(function handleGetDataStoresSuccess(productData) {
          if (productData.length) {
            deferred.resolve(productData);
          } else {
            deferred.reject();
          }
        });

      return deferred.promise();
    },


    /**
     *
     * @param {Array<Object>} items
     * @param {Object} placement
     * @param {Object} placement.config
     * @param {string} placement.message
     * @param {string} placement.placement_name
     * @param {Object} blockConfig
     * @return {Object}
     */
    createViewConfig: function createViewConfig(items, placement, blockConfig) {
      var config = {},
        match = placement.placement_name.match(/([^.]*)/);

      config.sNamespace = 'products';
      config.sTag = 'links';
      config.sViewName = 'RelatedProductView';
      config.sOutput = 'inner';
      config.elTarget = '#' + placement.placement_name.replace(/[.]/g, '_');
      config.mParamData = {
        id: placement.config.productId,
        items: items,
        flags: {
          richRelevance: true
        },
        relatedItemHeading: placement.message,
        placement: Array.isArray(match) ? match[1] : '',
        carousel: {},
        info: {
          rrPlacement: placement
        }
      };

      $.extend(true, config, blockConfig);
      return config;
    },


    /**
     *
     * @param {Object} config
     * @return {void}
     */
    bundle: function renderBundle(config) {
      var bundleConfig = config,
        mvcPage = window.oAppController.oPageController;

      bundleConfig.sTemplate = bundleTemplate;
      bundleConfig.mParamData.flags.bundle = true;
      bundleConfig.mParamData.subView = {
        name: 'BundleView',
        ctlr: true
      };

      mvcPage.render(bundleConfig);
    },


    /**
     *
     * @param {Object} config
     * @return {void}
     */
    carousel: function renderCarousel(config) {
      var carouselConfig = config,
        mvcPage = window.oAppController.oPageController;

      if (config.elTarget.match(/add_to_cart_page/)) {
        carouselConfig.mParamData.carousel.customNavigationClass = 'narrowerNavigationButtons';
      }

      carouselConfig.mParamData.flags.carousel = true;
      carouselConfig.mParamData.flags.showRatings = true;
      carouselConfig.mParamData.flags.showPriceSavings = true;
      carouselConfig.mParamData.subView = {
        name: 'CarouselItemsView',
        ctlr: true
      };

      mvcPage.render(carouselConfig);
    },


    /**
     *
     * @return {Object}
     */
    setRichRelevancePageLoadList3Prop: function setRichRelevancePageLoadList3Prop() {
      var list3 = null,
        placementArray = null;

      placementArray = recommenders.setRichRelevancePlacementData();
      list3 = this.setRichRelevanceList3PageLoadData(placementArray);

      return list3;
    },


    /**
     *
     * @return {Object}
     */
    setRichRelevancePlacementData: function setRichRelevancePlacementData() {
      var placementArray = null,
        RR = window.RR,
        placement = null,
        tmpPlacement = null;

      if (RR && RR.data && RR.data.JSON && RR.data.JSON.placements
        && RR.data.JSON.placements.length > 0) {
        placementArray = [];

        fn.loopArray(RR.data.JSON.placements, function loopPlacements(i) {
          tmpPlacement = RR.data.JSON.placements[i];
          placement = {};
          placement.items = tmpPlacement.items;
          placement.strategyID = tmpPlacement.strategy;
          placement.placementPosition
            = tmpPlacement.displayOrder !== undefined
            ? tmpPlacement.displayOrder
            : i;
          placementArray.push(placement);
        });
      }

      return placementArray;
    },


    /**
     *
     * @param {Object} placementArray
     * @return {Object}
     */
    setRichRelevanceList3PageLoadData: function
      setRichRelevanceList3PageLoadData(placementArray) {
      var list3 = null,
        delimiter = '|',
        currentProduct = '';

      if (placementArray) {
        list3 = '';
        fn.loopArray(placementArray, function loopPlacements(i) {
          fn.loopArray(placementArray[i].items, function loopPlacementItems(j) {
            if (placementArray[i].items[j]) {
              currentProduct = 'r:::'
                + placementArray[i].strategyID
                + ':'
                + (parseInt(placementArray[i].placementPosition, 10) + 1)
                + ':'
                + (j + 1)
                + ':'
                + placementArray[i].items[j].id
                + ':car::i'
                + delimiter;
              list3 += currentProduct;
            }
          });
          if (placementArray.length === 1 || (placementArray.length === (i + 1))) {
            list3 = list3.substring(0, list3.length - 1);
          }
        });
      }

      return list3;
    },


    /**
     * @param {Object} $carousel
     * @return {void}
     */
    setRichRelevanceAnalyticsProductClickEvents: function
      setRichRelevanceAnalyticsProductClickEvents($carousel) {
      if ($carousel) {
        $carousel.on('click', 'a', recommenders.triggerRichRelevanceClickEventAnalytics.bind(this));
      }
    },


    /**
      * @param {Object} evt
      * @param {Object} placementData
      * @return {void}
     */
    triggerRichRelevanceClickEventAnalytics: function
      triggerRichRelevanceClickEventAnalytics(evt, placementData) {
      var _s = fn.copyObject(window.s),
        _placementData = {};

      if (evt || placementData) {
        if (evt === null && placementData !== undefined) {
          _placementData = recommenders.setRichRelevanceMVCPlacementProps(placementData);
        } else
        if (evt.target) {
          _placementData = recommenders.setRichRelevanceLegacyPlacementProps(evt);
        }
        _s.linkTrackVars = 'events,eVar45,eVar49,prop39,list3';
        _s.linkTrackEvents = 'event45';
        _s.events = 'event45';
        _s.eVar45 = 'prop39';
        _s.eVar49 = 'prop39';
        _s.list3 = recommenders.setRichRelevanceList3ClickData(_placementData);
        _s.prop39 = 'rich relevance tile module';
        _placementData.list3Prop = _s.list3;
        recommenders.setRichRelevanceStoredData(_placementData);
        _s.tl(true, 'o', _placementData.placementStrategyID + ' - product click');
      }
    },


    /**
     *
     * @param {Object} evt
     * @return {Object}
     */
    setRichRelevanceLegacyPlacementProps: function
      setRichRelevanceLegacyPlacementProps(evt) {
      var _placementData = null,
        $product = null,
        $carousel = null;

      if (evt) {
        if (evt.target) {
          $product = $(evt.target).closest('a');
          $carousel = $product.closest('div.product-carousel').length
            ? $product.closest('div.product-carousel')
            : null;
          _placementData = {};
          _placementData.placementPosition
            = recommenders.getRichRelevancePlacementPosition($carousel) || null;
          _placementData.productID = $product.data('productid') || null;
          _placementData.productPosition = ($product.closest('li').data('index') + 1) || null;
          _placementData.placementStrategyID = $carousel.data('strategy') || null;
        }
      }

      return _placementData;
    },


    /**
     *
     * @param {Object} placementData
     * @return {Object}
     */
    setRichRelevanceMVCPlacementProps: function
      setRichRelevanceMVCPlacementProps(placementData) {
      var _placementData = null;

      if (placementData) {
        if (placementData.placement
          && placementData.placement.placementPosition
          && placementData.placement.strategy
          && placementData.productId
          && placementData.productPosition) {
          _placementData = {};
          _placementData.placementPosition = placementData.placement.placementPosition;
          _placementData.placementStrategyID = placementData.placement.strategy;
          _placementData.productID = placementData.productId;
          _placementData.productPosition = placementData.productPosition;
        }
      }

      return _placementData;
    },


    /**
     *
     * @param {Object} placementData
     * @return {Object}
     */
    setRichRelevanceList3ClickData: function
      setRichRelevanceList3ClickData(placementData) {
      var _placementData = placementData || null,
        list3Prop = null;

      if (_placementData !== null
        && _placementData.placementStrategyID
        && _placementData.placementPosition
        && _placementData.productPosition
        && _placementData.productID) {
        list3Prop = 'r:::' + _placementData.placementStrategyID
        + ':' + _placementData.placementPosition
        + ':' + _placementData.productPosition
        + ':' + _placementData.productID
        + ':car::c';
      }

      return list3Prop;
    },


    /**
     *
     * @param {Object} placement
     * @return {Integer}
     */
    getRichRelevancePlacementPosition: function
      getRichRelevancePlacementPosition(placement) {
      var rrCarouselSelector = '.product-carousel.rrDone',
        currentPlacementID = null,
        $placementCollection = null,
        placementPosition = 1;

      if (placement && typeof placement === 'object') {
        currentPlacementID = placement.parent()
          ? placement.parent()[0].id
          : null;
        $placementCollection = $(rrCarouselSelector)
          ? $(rrCarouselSelector)
          : null;

        if ($placementCollection.length > 1) {
          fn.loopArray($placementCollection, function loopRRCarousels(i) {
            if ($placementCollection.eq(i).parent()[0].id === currentPlacementID) {
              placementPosition = i + 1;
            }
          });
        }
      } else {
        return null;
      }

      return placementPosition;
    },


    /**
     *
     * @param {Object} placementData
     * @return {void}
     */
    setRichRelevanceStoredData: function
      setRichRelevanceStoredData(placementData) {
      var _placementData = placementData || null;

      if (_placementData !== null) {
        if (_placementData.list3Prop) {
          fn.setLocalStorageData('rrProductClickData_list3', _placementData.list3Prop);
        }
        if (_placementData.placementStrategyID) {
          fn.setLocalStorageData('rrProductClickData_strategyID', _placementData.placementStrategyID);
        }
        if (_placementData.placementPosition) {
          fn.setLocalStorageData('rrProductClickData_placementPosition', _placementData.placementPosition);
        }
      }
    },


    /**
     *
     * @return {Object}
     */
    richRelevanceOriginAnalyticsHandler: function
      richRelevanceOriginAnalyticsHandler() {
      var isCustomerOriginRichRelevance = null,
        rrList3Selector = 'rrProductClickData_list3',
        rrStoredData = fn.getLocalStorageData(rrList3Selector);

      if (rrStoredData !== null) {
        isCustomerOriginRichRelevance
        = rrStoredData;
      }

      return isCustomerOriginRichRelevance;
    },


    streamlineBasketRecommender: function streamlineBasketRecommender(oParams) {
      var R3_ADDTOCART = null;

      try {
        if (typeof R3_ITEM !== 'undefined') {
          R3_ITEM = undefined;
        }

        if (typeof R3_SEARCH !== 'undefined') {
          R3_SEARCH = undefined;
        }

        if (typeof R3_CATEGORY !== 'undefined') {
          R3_CATEGORY = undefined;
        }

        R3_COMMON.placementTypes = '';
        R3_COMMON.addedToCartItemIds = '';
        R3_COMMON.itemIds = '';
        R3_COMMON.addPlacementType('add_to_cart_page.rr1');
        R3_COMMON.addPlacementType('add_to_cart_page.rr2');
        R3_ADDTOCART = new r3_addtocart();
        R3_ADDTOCART.addItemIdToCart(oParams.productId, oParams.SkuId);
        window.rr_flush_onload();
        RR.jsonCallback = this.legacyHTMLRecommenderCallback.bind(this);
        window.writeImageUrl = this.populateProductImages;
        window.r3();
      } catch (error) {
        // continue regardless of error
      }
    },
    legacyHTMLRecommenderCallback: function legacyHTMLRecommenderCallback() {
      var i = 0,
        sHTML = '';

      if (window.rr_recs.placements.length) {
        for (; i < window.rr_recs.placements.length; i += 1) {
          sHTML = $.parseHTML(window.rr_recs.placements[i].html, null, true);
          $('#add_to_cart_page_rr' + (i + 1)).html(sHTML);
        }
        RR.jsonCallback = null;
        window.writeImageUrl = this.populateProductImages;
        window.rr_call_after_flush();
      }
    },
    populateProductImages: function populateProductImages(sIndex, imageUrl) {
      var sImageURL = imageUrl.replace('http:', ''),
        fileExtension = '',
        imageC = '',
        imageO = '',
        imageH = '',
        $streamlineContainer = $('#recommenderIframe');

      if (sImageURL.indexOf('scene7') !== -1) {
        $streamlineContainer.find('#hero_' + sIndex)
        .attr('data-src', imageUrl + '?wid=285&hei=285&$Hero$');
        $streamlineContainer.find('#offer_' + sIndex)
        .attr('data-src', sImageURL + '?wid=250&hei=250&$Details$');
        $streamlineContainer.find('#carousel_' + sIndex)
        .attr('data-src', sImageURL + '?wid=85&hei=85&$Carousel$');
        $streamlineContainer.find('#offerIe_' + sIndex)
        .attr('data-src', sImageURL + '?wid=250&hei=250&$Details$');
      } else {
        fileExtension = imageUrl.substring(imageUrl.length - 4, imageUrl.length);
        sImageURL = imageUrl.substring(0, imageUrl.length - 4);
        imageC = sImageURL + '_Carousel' + fileExtension;
        imageO = sImageURL + '_Detail' + fileExtension;
        imageH = sImageURL + '_Hero' + fileExtension;

        $streamlineContainer.find('#hero_' + sIndex)
        .attr('data-src', imageH);
        $streamlineContainer.find('#offer_' + sIndex)
        .attr('data-src', imageO);
        $streamlineContainer.find('#carousel_' + sIndex)
        .attr('data-src', imageC);
        $streamlineContainer.find('#offerIe_' + sIndex)
        .attr('data-src', imageO);
      }
    }
  };

  module.exports = recommenders;
});
