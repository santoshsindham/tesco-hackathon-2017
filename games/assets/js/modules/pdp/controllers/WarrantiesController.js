define('modules/pdp/controllers/WarrantiesController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/WarrantiesView',
  'modules/pdp/data-stores/Warranty'
], function ($, fn, BaseController, WarrantiesView, Warranty) {
  'use strict';

  /**
   *
   * @param {Object} model The sellers model..
   * @return {void}
   */
  function WarrantiesController(model) {
    this.sNamespace = 'sellers';
    this.sTag = 'warranties';
    this.views = {
      classes: {
        WarrantiesView: WarrantiesView
      }
    };
    this.cachedConfig = null;
    this.parent.constructor.call(this, model);
    this._fetchConfig();
    this._pendingViews = [];
    this.isBlockedSku = null;
    this.eligibleCategory = undefined;
  }

  fn.inherit(WarrantiesController, BaseController);

  WarrantiesController.prototype._collateDataDependancies = function (params) {
    var _params = params,
      oPromise = params.promise;

    if (_params.mParamData.mvc.sellers.buyBoxMessage !== 'buy') {
      oPromise.reject();
      return;
    }

    if (!this.cachedConfig) {
      this._pendingViews.push(_params);
      return;
    }

    this._parseConfig(_params);
  };

  WarrantiesController.prototype._bindViewEvents = function (oData) {
    $(oData.oView.oElms.elCheckboxInput).on(
      'change',
      { oView: oData.oView },
      this._onCheckboxChange.bind(this)
    );
  };

  WarrantiesController.prototype._onCheckboxChange = function (oEvent) {
    var oView = oEvent.data.oView,
      sUpdatePropValue = oEvent.currentTarget.checked
          ? $(oEvent.currentTarget).data('mvc-value') + ',' + oView.oData.mvc.sellers.id
          : oView.oData.mvc.sellers.id;

    this.forLoop(oView.oElms.elCheckboxInput, function deselectOtherCheckboxes(i) {
      if (oView.oElms.elCheckboxInput[i] !== oEvent.currentTarget
          && oView.oElms.elCheckboxInput[i].checked) {
        oView.oElms.elCheckboxInput[i].checked = false;
      }
    });

    this.queryModel({
      sNamespace: 'formHandler',
      sCommand: 'update',
      oQueryParams: {
        mSearchValue: oView.oData.mvc.sellers.formHandler,
        sUpdateKey: 'oData',
        mUpdateValue: null,
        sUpdatePropKey: $(oEvent.currentTarget).data('mvc-key'),
        mUpdatePropValue: sUpdatePropValue
      }
    });
  };

  WarrantiesController.prototype._fetchConfig = function () {
    var _this = this,
      sBasePath = '/directuiassets/SiteAssets/NonSeasonal/en_GB/js/data/warranties/',
      sFileName = 'config-preprod.js',
      sUrl = '',
      regexProductionEnv = new RegExp([
        'secure.tesco.com|www.tesco.com',
        '|kiosk.direct.ukroi.tesco.org|preview.direct.ukroi.tesco.org'
      ].join(''), 'gi');

    if (/vdi.tscl.com/gi.test(window.location.href)) {
      sBasePath = '/assets/js/data/warranties/';
    }

    if (regexProductionEnv.test(window.location.href)) {
      sFileName = 'config.js';
    }

    sUrl = sBasePath + sFileName;

    $.ajax({
      url: sUrl,
      dataType: 'json',
      beforeSend: function (jqXHR, settings) {
        var oSettings = settings;

        oSettings.url = sUrl;
      }
    })
    .done(function (data) {
      _this.cachedConfig = data;
      _this._doneHandler();
    })
    .fail(function () {
      _this._failHandler();
    });
  };

  WarrantiesController.prototype._doneHandler = function () {
    var _this = this;

    if (_this._pendingViews.length) {
      _this.forLoop(_this._pendingViews, function loopPendingViews(i) {
        _this._parseConfig(_this._pendingViews[i]);
      });
    }
  };

  WarrantiesController.prototype._failHandler = function () {
    var _this = this;

    if (_this._pendingViews.length) {
      _this.forLoop(_this._pendingViews, function loopPendingViews(i) {
        _this._pendingViews[i].promise.reject();
      });
    }
  };

  WarrantiesController.prototype._parseConfig = function (params) {
    var _params = params,
      oPromise = params.promise,
      i = 0,
      price = this.oModel.getPrice(_params.mParamData.mvc.sellers.id),
      aPricing = [],
      oWarranty = {};

    if (this.isBlockedSku === null) {
      this.isBlockedSku = this._checkBlockedSku(_params.mParamData.mvc.sku.id);
    }

    if (this.isBlockedSku) {
      oPromise.reject();
      return;
    }

    if (this.eligibleCategory === undefined) {
      this.eligibleCategory = this._getEligibleCategory(this.cachedConfig.categoryMap);
    }

    if (this.eligibleCategory === undefined) {
      oPromise.reject();
      return;
    }

    aPricing = this._getPricing(this.eligibleCategory);

    if (!aPricing.length) {
      oPromise.reject();
      return;
    }

    _params.mParamData.mvc.vm = _params.mParamData.mvc.vm || {};
    _params.mParamData.mvc.vm.warranties = [];

    for (i = 0; i < aPricing.length; i += 1) {
      if (this._checkItemPriceEligible(aPricing[i], price)) {
        oWarranty = $.extend({}, aPricing[i]);
        oWarranty.description = this.cachedConfig.descriptionMap[oWarranty.descriptionID];
        oWarranty.displayPrice = oWarranty.price.toFixed(2);
        _params.mParamData.mvc.vm.warranties.push(new Warranty(oWarranty));
      }
    }

    if (_params.mParamData.mvc.vm.warranties.length) {
      oPromise.resolve(_params);
    } else {
      oPromise.reject();
    }
  };

  WarrantiesController.prototype._checkBlockedSku = function (sSkuId) {
    var aBlockedSkus = this.cachedConfig.blockedSkus,
      i = 0;

    if (aBlockedSkus.length) {
      for (i = 0; i < aBlockedSkus.length; i += 1) {
        if (aBlockedSkus.indexOf(sSkuId) > -1) {
          return true;
        }
      }
    }

    return false;
  };

  WarrantiesController.prototype._getEligibleCategory = function (oCategoryMap) {
    var aCategoryHierarchy = [],
      i = 0,
      aCategoryKeys = Object.keys(oCategoryMap);

    if (window.Data && window.Data.Breadcrumb) {
      if (window.Data.Breadcrumb.aCategoryHierarchy
          && window.Data.Breadcrumb.aCategoryHierarchy.length) {
        aCategoryHierarchy = window.Data.Breadcrumb.aCategoryHierarchy;

        for (i = aCategoryHierarchy.length - 1; i >= 0; i += 1) {
          if (aCategoryKeys.indexOf(aCategoryHierarchy[i]) > -1) {
            return oCategoryMap[aCategoryHierarchy[i]];
          }
        }
      }
    }

    return undefined;
  };

  WarrantiesController.prototype._checkItemPriceEligible = function (oWarranty, price) {
    return price >= oWarranty.minItemPrice && price <= oWarranty.maxItemPrice;
  };

  WarrantiesController.prototype._getPricing = function (sCategory) {
    return this.cachedConfig.pricing[sCategory] && this.cachedConfig.pricing[sCategory].New
        && this.cachedConfig.pricing[sCategory].New.length
            ? this.cachedConfig.pricing[sCategory].New : [];
  };

  return WarrantiesController;
});
