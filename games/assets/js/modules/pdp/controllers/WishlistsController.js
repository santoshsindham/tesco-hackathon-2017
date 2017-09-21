define('modules/pdp/controllers/WishlistsController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/WishlistsView',
  'modules/common'
], function ($, fn, BaseController, WishlistsView, common) {
  'use strict';

  /**
   *
   * @param {Object} model
   * @return {void}
   */
  function WishlistsController(model) {
    this.sNamespace = 'wishlists';
    this.sTag = '_default';
    this.views = {
      classes: {
        WishlistsView: WishlistsView
      }
    };
    this.sBuyBoxWrapperSelector = '.buybox-wrapper';
    this.sWishlistWrapperSelector = '.wishlists-wrapper';
    this.sWishlistOptionSelector = this.sWishlistWrapperSelector + ' ul li a.option';
    this.sDisableWishlistsClass = 'disable-wishlists';
    this.sWishlistDefaultSelector = this.sWishlistWrapperSelector
        + ' .dropdown-customised a.control';
    this.sWishlistTouchDefaultSelector = this.sWishlistWrapperSelector + ' .dropdown-customised';
    this.sWishlistCustomDropdownSelector = 'dropdown-customised';
    this.bMultipleWishlists = false;
    this.parent.constructor.call(this, model);
  }

  fn.inherit(WishlistsController, BaseController);

  WishlistsController.prototype._collateDataDependancies = function (params) {
    var oParamData = params;

    if (oParamData.mParamData.mvc.sku && oParamData.mParamData.mvc.products) {
      if (oParamData.mParamData.mvc.sku.id && oParamData.mParamData.mvc.products.id) {
        oParamData.mParamData.mvc.wishlists = this.oModel._getWishlists(
          oParamData.mParamData.mvc.products.id, oParamData.mParamData.mvc.sku.id
        );

        if (oParamData.mParamData.mvc.wishlists.length > 0) {
          oParamData.mParamData.mvc.wishlists.defaultWishlistText = this.oModel._getDefaultName();
          oParamData.mParamData.mvc.wishlists.defaultHref = this.oModel._getDefaultHref();
          this.bMultipleWishlists = this.oModel._setMultipleWishlists();
          oParamData.mParamData.mvc.wishlists.bMultipleWishlists = this.bMultipleWishlists;
          oParamData.mParamData.mvc.wishlists.bHideWishlists = false;
        } else {
          oParamData.deferred.reject(oParamData);
        }

        if (oParamData.mParamData.mvc.flags.isFF) {
          if (oParamData.mParamData.mvc.flags.isSkuSelected !== true) {
            oParamData.mParamData.mvc.wishlists.bHideWishlists = true;
          }
        }
        oParamData.deferred.resolve(oParamData);
      } else {
        oParamData.deferred.reject(oParamData);
      }
    } else {
      oParamData.deferred.reject(oParamData);
    }
  };

  WishlistsController.prototype._goToURL = function (sDestinationURL) {
    if (sDestinationURL !== undefined) {
      window.location.href = sDestinationURL;
    }
  };

  WishlistsController.prototype._handleAddItemToWishlist = function (oEvent) {
    var $selectedEl = null,
      sDestinationURL = null,
      $target = null;

    if (oEvent === undefined) {
      return;
    }

    $target = $(oEvent.target);

    if ($target.hasClass(this.sWishlistCustomDropdownSelector)) {
      $selectedEl = $target.find('.control');
    } else if ($target.hasClass('been-customised')) {
      $selectedEl = $target.find('option:selected');
    } else {
      $selectedEl = $target.closest('a');
    }

    sDestinationURL = $selectedEl.data('url');

    if (sDestinationURL !== undefined && sDestinationURL !== null) {
      this._goToURL(sDestinationURL);
    }
  };

  WishlistsController.prototype._bindViewEvents = function () {
    if (common.isTouch()) {
      this._bindTouchEvents();
    } else {
      this._bindNonTouchEvents();
    }
  };

  WishlistsController.prototype._bindTouchEvents = function () {
    if (this.bMultipleWishlists) {
      $(this.sWishlistWrapperSelector).on(
        'change',
        'select',
        this._handleAddItemToWishlist.bind(this)
      );
    } else {
      $(this.sBuyBoxWrapperSelector).on(
        'click',
        this.sWishlistTouchDefaultSelector,
        this._handleAddItemToWishlist.bind(this)
      );
    }
  };

  WishlistsController.prototype._bindNonTouchEvents = function () {
    if (this.bMultipleWishlists) {
      $(this.sBuyBoxWrapperSelector).on(
          'click',
          this.sWishlistOptionSelector,
          this._handleAddItemToWishlist.bind(this)
        );
    } else {
      $(this.sBuyBoxWrapperSelector).on(
        'click',
        this.sWishlistDefaultSelector,
        this._handleAddItemToWishlist.bind(this)
      );
    }
  };

  return WishlistsController;
});
