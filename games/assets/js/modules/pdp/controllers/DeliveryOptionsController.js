define('modules/pdp/controllers/DeliveryOptionsController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/DeliverySnippetView',
  'modules/pdp/views/DeliveryDetailsView'
], function (fn, BaseController, DeliverySnippetView, DeliveryDetailsView) {
  'use strict';


  var LEAD_TIME_ADVISORY = 'pdp-show-delivery-times-and-cost-text',
    SELLER_LEAD_TIME_ADVISORY = 'pdp-seller-show-delivery-times-and-cost-text',
    DBT_LEAD_TIME_ADVISORY = 'pdp-dbt-show-delivery-times-and-cost-text',
    NEXT_DAY_TERMS = 'pdp-click-and-collect-text',
    SELLER_NEXT_DAY_TERMS = 'pdp-seller-click-and-collect-text',
    RETURNS_POLICY = 'pdp-return-policy-text',
    DBT_RETURNS_POLICY = 'pdp-dbt-return-policy-text',
    DELIVERY_INFO_INTRO = 'deliveryinformation_introtext',
    DELIVERY_INFO_CONTENT = 'deliveryinformation_responsive',
    RETURNS_INTRO = 'returnspolicy_introtext_html',
    RETURNS_CONTENT = 'returnspolicy_responsive_html',
    DIGITAL_TEXT = 'pdp-digital-delivery-info-text',
    DIGITAL_CANCEL_TEXT = 'pdp-cancellation-policy-text-digital-delivery';

  /**
   *
   * @param {Array<Objects>} models
   * @return {void}
   */
  function DeliveryOptionsController(models) {
    this.sNamespace = 'deliveryOptions';
    this.sTag = '_default';
    this.views = {
      classes: {
        DeliverySnippetView: DeliverySnippetView,
        DeliveryDetailsView: DeliveryDetailsView
      }
    };
    this.cachedAssetData = null;
    this.parent.constructor.call(this, models);
  }


  fn.inherit(DeliveryOptionsController, BaseController);
  DeliveryOptionsController.modelNames = ['assets', 'sellers', 'deliveryOptions'];


  DeliveryOptionsController.prototype._bindViewEvents = function (data) {
    if (data.oView.sViewName === 'DeliveryDetailsView') {
      if (data.oView.oElms.deliveryInfoLink) {
        $(data.oView.oElms.deliveryInfoLink).on(
          'click',
          { view: data.oView },
          this._handleLinkClick.bind(this)
        );
      }

      if (data.oView.oElms.returnsLink) {
        $(data.oView.oElms.returnsLink).on(
          'click',
          { view: data.oView },
          this._handleLinkClick.bind(this)
        );
      }
    }
  };


  DeliveryOptionsController.prototype._handleLinkClick = function (event) {
    if (event.data.view.oData.mvc.flags.isKiosk) {
      event.preventDefault();
    }
    // This has been commented out because we are not going to use this feature at the moment.
    // However, if we ever want to display the information in an overlay rather than
    // redirecting to a different page, all that needs to be done is uncomment the method
    // below. - Dylan Aubrey (so24) 16/6/2016
    // this._compileOverlayContent(event);
  };


  DeliveryOptionsController.prototype._compileOverlayContent = function (event) {
    var assetData = {},
      cachedAssetData = {},
      isDelivery = event.currentTarget === event.data.view.oElms.deliveryInfoLink;

    /**
     *
     * @param {Object} data
     * @return {Object}
     */
    function structureData(data) {
      var delivery = { intro: '', content: '' },
        returns = { intro: '', content: '' };

      fn.loopArray(data, function loopData(i) {
        switch (data[i].lookupName) {
          case DELIVERY_INFO_INTRO:
            delivery.intro = data[i].text;
            break;
          case DELIVERY_INFO_CONTENT:
            delivery.content = data[i].text;
            break;
          case RETURNS_INTRO:
            returns.intro = data[i].text;
            break;
          case RETURNS_CONTENT:
            returns.content = data[i].text;
            break;
          // no default
        }
      });

      return {
        delivery: delivery.intro + delivery.content,
        returns: returns.intro + returns.content
      };
    }

    if (!cachedAssetData) {
      assetData = this.models.assets.get({
        noFetch: true,
        sSearchKey: 'lookupName',
        mSearchValue: [
          DELIVERY_INFO_INTRO,
          DELIVERY_INFO_CONTENT,
          RETURNS_INTRO,
          RETURNS_CONTENT
        ]
      });

      if (this.sanityCheckData(assetData).objects) {
        cachedAssetData = structureData(assetData);
      }
    }

    if (cachedAssetData) {
      this.renderOverlay({
        sTag: isDelivery ? 'deliveryInfo' : 'returnsPolicy',
        sClassNames: isDelivery ? 'delivery-info with-header' : 'returns-policy with-header',
        sTitle: isDelivery ? 'Delivery information' : 'Returns and refunds policy',
        sOverlayContent: isDelivery ? cachedAssetData.delivery : cachedAssetData.returns,
        toDestroyOnClose: true
      });
    }
  };


  DeliveryOptionsController.prototype._collateDataDependancies = function (params) {
    var deferred = params.deferred,
      deliveryOptions = params.mParamData.mvc.deliveryOptions,
      dataFlags = this.sanityCheckData(deliveryOptions);

    if (dataFlags.objects) {
      this._queryAssetModel(params, deferred);
      return;
    }

    if (dataFlags.ids) {
      this._queryDeliveryOptionsModel(params, deferred);
      return;
    }

    this._querySellerModel(params, deferred);
  };


  DeliveryOptionsController.prototype._querySellerModel = function (params, deferred) {
    var _this = this,
      _params = params,
      checkAndAdd = null,
      mvcData = _params.mParamData.mvc,
      observeAndNotify = null,
      sellerModel = this.models.sellers;

    checkAndAdd = function checkAddSellerData(data) {
      if (!_this.sanityCheckData(data).ids) {
        observeAndNotify();
      } else {
        _params.mParamData.mvc.deliveryOptions = data;
        _this._queryDeliveryOptionsModel(_params, deferred);
      }
    };

    observeAndNotify = function observeNotifySellerData() {
      sellerModel.observe({
        action: 'add',
        callback: function observeAndNotifyCallback(resp) {
          checkAndAdd(resp.data.observe.deliveryOptions);
        },
        once: true,
        propKey: 'deliveryOptions',
        searchValue: mvcData.sellers.id
      });
    };

    checkAndAdd(sellerModel.get({
      noFetch: true,
      mSearchValue: mvcData.sellers.id,
      sPropKey: 'deliveryOptions'
    }));
  };


  DeliveryOptionsController.prototype._queryDeliveryOptionsModel = function (params, deferred) {
    var _this = this,
      _params = params,
      checkAndAdd = null,
      doModel = this.models.deliveryOptions,
      mvcData = _params.mParamData.mvc,
      observeAndNotify = null;

    checkAndAdd = function checkAddDeliveryOptionsData(data) {
      if (!_this.sanityCheckData(data).objects) {
        observeAndNotify();
      } else {
        _params.mParamData.mvc.deliveryOptions = data;
        _this._queryAssetModel(_params, deferred);
      }
    };

    observeAndNotify = function observeNotifyDeliveryOptionsData() {
      doModel.observe({
        action: 'add',
        callback: function observeAndNotifyCallback(resp) {
          checkAndAdd(resp.data.observe);
        },
        once: true,
        searchValue: mvcData.deliveryOptions
      });
    };

    checkAndAdd(doModel.get({ mSearchValue: mvcData.deliveryOptions, noFetch: true }));
  };


  DeliveryOptionsController.prototype._queryAssetModel = function (params, deferred) {
    var _params = params,
      assetData = {},
      assetModel = this.models.assets,
      mvcData = _params.mParamData.mvc;

    if (!mvcData.assets) {
      mvcData.assets = {};
    }

    if (!this.cachedAssetData) {
      assetData = assetModel.get({
        noFetch: true,
        sSearchKey: 'lookupName',
        mSearchValue: [
          LEAD_TIME_ADVISORY,
          SELLER_LEAD_TIME_ADVISORY,
          DBT_LEAD_TIME_ADVISORY,
          NEXT_DAY_TERMS,
          SELLER_NEXT_DAY_TERMS,
          RETURNS_POLICY,
          DBT_RETURNS_POLICY,
          DIGITAL_TEXT,
          DIGITAL_CANCEL_TEXT
        ]
      });

      if (this.sanityCheckData(assetData).objects) {
        this.cachedAssetData = this._structureAssetData(assetData);
      }
    }

    if (this.cachedAssetData) {
      mvcData.assets.deliveryOptions = this._filterAssetData(_params);
      _params.mParamData.mvc = mvcData;
      deferred.resolve(_params);
    }
  };


  DeliveryOptionsController.prototype._structureAssetData = function (assetData) {
    var structuredAssetData = {
      leadTime: {
        tesco: undefined,
        sellers: undefined,
        dbt: undefined,
        digital: undefined
      },
      nextDayTerms: {
        tesco: undefined,
        sellers: undefined
      },
      returns: {
        tesco: undefined,
        dbt: undefined,
        digital: undefined
      }
    };

    fn.loopArray(assetData, function (i) {
      switch (assetData[i].lookupName) {
        case LEAD_TIME_ADVISORY:
          structuredAssetData.leadTime.tesco = assetData[i].text;
          break;
        case SELLER_LEAD_TIME_ADVISORY:
          structuredAssetData.leadTime.sellers = assetData[i].text;
          break;
        case DBT_LEAD_TIME_ADVISORY:
          structuredAssetData.leadTime.dbt = assetData[i].text;
          break;
        case NEXT_DAY_TERMS:
          structuredAssetData.nextDayTerms.tesco = assetData[i].text;
          break;
        case SELLER_NEXT_DAY_TERMS:
          structuredAssetData.nextDayTerms.sellers = assetData[i].text;
          break;
        case RETURNS_POLICY:
          structuredAssetData.returns.tesco = assetData[i].text;
          break;
        case DBT_RETURNS_POLICY:
          structuredAssetData.returns.dbt = assetData[i].text;
          break;
        case DIGITAL_TEXT:
          structuredAssetData.leadTime.digital = assetData[i].text;
          break;
        case DIGITAL_CANCEL_TEXT:
          structuredAssetData.returns.digital = assetData[i].text;
          break;
        // no default
      }
    });

    return structuredAssetData;
  };


  DeliveryOptionsController.prototype._filterAssetData = function (params) {
    var filteredAssetData = { leadTime: undefined, nextDayTerms: undefined, returns: undefined },
      mvcData = params.mParamData.mvc,
      deliveryData = mvcData.deliveryOptions,
      hasNextDay = this.models.deliveryOptions.hasNextDayDelivery(deliveryData),
      sellerData = mvcData.sellers,
      isDigitalSku = fn.getValue(mvcData, 'sku', 'isDigitalSku');

    if (sellerData.sellerId === '1000001') {
      if (isDigitalSku) {
        filteredAssetData.leadTime = this.cachedAssetData.leadTime.digital;
        filteredAssetData.returns = this.cachedAssetData.returns.digital;
      } else {
        filteredAssetData.leadTime = this.cachedAssetData.leadTime.tesco;
        filteredAssetData.returns = this.cachedAssetData.returns.tesco;
      }

      if (hasNextDay && !isDigitalSku) {
        filteredAssetData.nextDayTerms = this.cachedAssetData.nextDayTerms.tesco;
      }
    } else {
      filteredAssetData.leadTime = this.cachedAssetData.leadTime.sellers;

      if (hasNextDay) {
        filteredAssetData.nextDayTerms = this.cachedAssetData.nextDayTerms.sellers;
      }
    }

    return filteredAssetData;
  };


  return DeliveryOptionsController;
});
