define('modules/pdp/controllers/RelatedItemsController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/controllers/CarouselController',
  'modules/pdp/models/RelatedItemsModel'
], function (fn, BaseController, CarouselController, RelatedItemsModel) {
  var RelatedItemsController = null,
    addRelationshipToModel = null,
    proxyRenderView = null;

  addRelationshipToModel = function (sID, oResponse) {
    var oEvent = new $.Event('addData'),
      oUpdatedResponse = oResponse;

    oUpdatedResponse.id = sID;
    oEvent.namespace = 'products';

    oEvent.oData = {
      mAddData: oUpdatedResponse
    };
    $(window).trigger(oEvent);
  };

  proxyRenderView = function (args) {
    var _this = this,
      view = {};

    if (!fn.isArray(args.mParamData.items, { notEmpty: true })) {
      return;
    }

    view = this.createView(args);

    if (!view) {
      return;
    }

    setTimeout(function proxyRenderViewInt() {
      view.render();

      if (fn.getValue(args.mParamData, 'carousel', 'show')) {
        _this.initCarousel(view);
      }
    }, 4);
  };

  RelatedItemsController = function (oModel, oView) {
    this.parent.parent.constructor.call(this, oModel, oView);
    this.oRelatedItemsModel = new RelatedItemsModel();
    this.relationshipType = '';
  };

  fn.inherit(RelatedItemsController, BaseController);

  RelatedItemsController.prototype.renderView = function (oParams) {
    var aRequestedDataItems = [],
      bRelationshipLookup = true;

    if (oParams.mParamData.relationshipLookup !== undefined) {
      bRelationshipLookup = oParams.mParamData.relationshipLookup;
    }

    if (oParams.mParamData.items) {
      proxyRenderView.call(this, oParams);
    } else if (oParams.mParamData.lookupIDs) {
      aRequestedDataItems = this.processIDs(oParams.mParamData.lookupIDs);
      this.initFromIDs(aRequestedDataItems, oParams);
    } else if (oParams.mParamData.id && oParams.mParamData.relationshipType) {
      aRequestedDataItems = this.oModel.getLinks(
        oParams.mParamData.relationshipType,
        oParams.mParamData.id
      );
      aRequestedDataItems = this.processIDs(aRequestedDataItems);
      if (aRequestedDataItems.length > 0) {
        this.initFromIDs(aRequestedDataItems, oParams);
      } else if (bRelationshipLookup) {
        this.initFromRelationshipLookup(oParams);
      }
    }

    return true;
  };

  RelatedItemsController.prototype.processIDs = function processIDs(oData) {
    var i = 0,
      aDataItems = [];

    if (oData.links) {
      for (i = 0; i < oData.links.length; i += 1) {
        aDataItems.push(oData.links[i].id);
      }
    } else if (Array.isArray(oData)) {
      for (i = 0; i < oData.length; i += 1) {
        if (oData[i].id !== undefined) {
          aDataItems.push(oData[i].id);
        } else {
          aDataItems.push(oData[i]);
        }
      }
    }
    return aDataItems;
  };

  RelatedItemsController.prototype.initFromIDs = function initFromIDs(aDataItems, oParams) {
    var oData = {},
      _this = this,
      oUpdateParams = oParams,
      listLength = 0,
      carouselArray = [],
      i = 0;

    oData.sNamespace = oParams.sNamespace;
    oData.oGetParams = {
      sSearchKey: 'id',
      mSearchValue: aDataItems
    };
    this._getDataFromModel(oData, function renderMyView(oReturnedParams) {
      if (oParams.mParamData.relationshipType !== undefined) {
        listLength = oReturnedParams.mPromiseData.length;
        if (oParams.mParamData.relationshipType.toLowerCase() === 'completethelook'
            || oParams.mParamData.relationshipType.toLowerCase() === 'outfit') {
          for (i = 0; i < listLength; i += 1) {
            if (oReturnedParams.mPromiseData[i].userActionable) {
              carouselArray.push(oReturnedParams.mPromiseData[i]);
            }
          }
        } else {
          carouselArray = oReturnedParams.mPromiseData;
        }
      } else {
        carouselArray = oReturnedParams.mPromiseData;
      }
      oUpdateParams.mParamData.items = carouselArray;
      proxyRenderView.call(_this, oUpdateParams);
    });
  };

  RelatedItemsController.prototype.initFromDataItems = function (aDataItems) {
    var i = 0;

    if (aDataItems) {
      for (i = 0; i < aDataItems.length; i += 1) {
        if (aDataItems[i] instanceof this.Model) {
          this._aDataItems.push(aDataItems[i]);
        }
      }
      this.renderDataItems();
    }
  };

  RelatedItemsController.prototype.initFromRelationshipType = function (id, rel) {
    this.initFromLinksObject(this.Model.getLinks(rel, id));
  };

  RelatedItemsController.prototype.initFromRelationshipLookup = function (oParams) {
    var _this = this,
      oDataParams = {},
      oRelatedItemsPromise = {},
      bRelatedItemAddedToModel = false;

    this.oRelatedItemsModel.sNamespace = oParams.sNamespace;

    oDataParams = {
      sSearchKey: 'id',
      mSearchValue: oParams.mParamData.id,
      sModelMethod: 'relationships',
      hrefData: { relationship: oParams.mParamData.relationshipType },
      processHyperMedia: oParams.mParamData.processHyperMedia,
      processHyperMediaType: oParams.mParamData.processHyperMediaType,
      doneCallback: function (oResponse) {
        var aDataItems = [];

        aDataItems = _this.processIDs(oResponse);
        _this.initFromIDs(aDataItems, oParams);
      },
      progressCallback: function (sLookupID, oData) {
        if (!bRelatedItemAddedToModel) {
          addRelationshipToModel(sLookupID, oData);
          bRelatedItemAddedToModel = true;
        }
      }
    };

    oRelatedItemsPromise = this.oRelatedItemsModel.promise(oDataParams);

    $.when.call($, oRelatedItemsPromise)
      .fail(function (sError) {
        throw new Error(sError);
      });
  };

  RelatedItemsController.prototype.requestDataFromModelAndProcess = function () {
    var oRequestEvent = {},
      _this = this,
      sEPOC = new Date().getTime().toString(),
      sEventNamespace = this.relationshipType + this.ModelType + sEPOC;

    oRequestEvent = new $.Event('dataRequest');
    oRequestEvent.namespace = this.ModelType;
    oRequestEvent.sRespNamespace = sEventNamespace;
    oRequestEvent.oData = {
      oGetParams: {
        sSearchKey: 'id',
        mSearchValue: this._aRequestedDataItems
      }
    };

    $(window).one('dataResponse.' + sEventNamespace, function handleDataResponse(oEvent) {
      _this._aDataItems = _this._aDataItems.concat(oEvent.oData.mRespData);
      if (_this.hasSuccessfullyReturnedRequestedSkuList()) {
        _this.renderDataItems();
      }
    });

    $(window).trigger(oRequestEvent);
  };

  RelatedItemsController.prototype.initCarousel = function (oView) {
    var $container = $(oView.sSelector);

    $container.removeClass('displayNone');
    this.carouselController = new CarouselController($container);
  };

  return RelatedItemsController;
});
