define('modules/pdp/controllers/SellerController', [
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/SellerSummariesView',
  'modules/pdp/views/EventMessageView'
], function (fn, BaseController, SellerSummariesView, EventMessageView) {
  'use strict';

  /**
   *
   * @param {Object} model
   * @return {void}
   */
  function SellerController(model) {
    this.sNamespace = 'sellers';
    this.sTag = '_default';
    this.views = {
      classes: {
        SellerSummariesView: SellerSummariesView,
        EventMessageView: EventMessageView
      }
    };
    this.parent.constructor.call(this, model);
  }

  fn.inherit(SellerController, BaseController);

  SellerController.prototype._collateDataConditional = function (args) {
    if (args.sViewName === 'SellerSummariesView') {
      return true;
    }

    if (args.sViewName === 'EventMessageView' && !args.mParamData.mvc.sellers.events) {
      return true;
    }

    return false;
  };

  SellerController.prototype._collateDataDependancies = function (args) {
    if (args.sViewName === 'SellerSummariesView') {
      return this._collateSellerSummariesDependancies(args);
    } else if (args.sViewName === 'EventMessageView') {
      return this._collateEventMessageDependancies(args);
    }

    return undefined;
  };

  SellerController.prototype._collateSellerSummariesDependancies = function (args) {
    var _this = this,
      _args = args,
      oView = undefined,
      deferred = _args.deferred,
      sellerIds = [],
      getView = undefined,
      checkDeliveryCodes = undefined,
      observeResolveDeliveryCodes = undefined,
      checkAddDeliveryOptions = undefined,
      observeResolveDeliveryOptions = undefined;

    getView = function (view) {
      if (view.sViewName === 'SellerSummariesView') {
        return true;
      }
      return false;
    };

    checkDeliveryCodes = function (sellers) {
      var ids = [];

      /**
       * Check if any of the sellers are missing delivery options.
       */
      if (_this.isArray(sellers)) {
        _this.forLoop(sellers, function (i) {
          if (!sellers[i].deliveryOptions
              || (Array.isArray(sellers[i].deliveryOptions)
                  && !sellers[i].deliveryOptions.length)) {
            ids.push(sellers[i].id);
          }
        });

        return ids;
      }

      return undefined;
    };

    observeResolveDeliveryCodes = function (params, ids) {
      var _params = params;

      _this.oModel.observe({
        searchKey: 'id',
        searchValue: ids,
        propKey: 'deliveryOptions',
        action: 'add',
        once: true,
        callback: function (resp) {
          var respSellerIds = checkDeliveryCodes(resp.data.observe);

          if (respSellerIds.length) {
            observeResolveDeliveryCodes(_params, respSellerIds);
          } else {
            _this.queryModel({
              sNamespace: 'deliveryOptions'
            }).done(function (doModel) {
              var optionIds = checkAddDeliveryOptions(_params, doModel);

              if (optionIds.length) {
                observeResolveDeliveryOptions(_params, doModel, optionIds);
              } else {
                _params.toRefresh = true;
                _params.getView = getView;
                deferred.resolve(_params);
              }
            });
          }
        }
      });
    };

    checkAddDeliveryOptions = function (params, model) {
      var _params = params,
        primaryOption = undefined,
        option = {},
        ids = [],
        uniqueIds = [];

      _this.forLoop(_params.mParamData.mvc.sellers, function (i) {
        primaryOption = _this.oModel.getPrimaryDeliveryOption(
          _params.mParamData.mvc.sellers[i].id
        );

        option = model.get({
          sSearchKey: 'id',
          mSearchValue: primaryOption,
          noFetch: true
        });

        if (!option || $.isEmptyObject(option)) {
          ids.push(primaryOption);
        }

        _params.mParamData.mvc.sellers[i].custom = { deliveryOptions: option };
      });

      _this.forLoop(ids, function (i) {
        if (ids.indexOf(ids[i]) === i) {
          uniqueIds.push(ids[i]);
        }
      });

      return uniqueIds;
    };

    observeResolveDeliveryOptions = function (params, model, ids) {
      var _params = params;

      model.observe({
        searchKey: 'id',
        searchValue: ids,
        action: 'add',
        once: true,
        callback: function () {
          var optionIds = checkAddDeliveryOptions(_params, model);

          if (optionIds.length) {
            observeResolveDeliveryOptions(_params, model, optionIds);
          } else {
            /**
             * NOTE: this is a hack to get view refreshing working, we need to look at
             * this going forward.
             */
            _params.toRefresh = true;
            _params.getView = getView;
            deferred.resolve(_params);
          }
        }
      });
    };

    sellerIds = checkDeliveryCodes(_args.mParamData.mvc.sellers);

    if (sellerIds.length) {
      observeResolveDeliveryCodes(_args, sellerIds);
    } else {
      _this.queryModel({
        sNamespace: 'deliveryOptions'
      }).done(function (doModel) {
        var optionIds = checkAddDeliveryOptions(_args, doModel);

        if (optionIds.length) {
          observeResolveDeliveryOptions(_args, doModel, optionIds);
        } else {
          _args.toRefresh = true;
          _args.getView = getView;
          deferred.resolve(_args);
        }
      });
    }

    oView = this.createView(_args);

    if (oView) {
      oView.render();
    }
  };

  SellerController.prototype._collateEventMessageDependancies = function (args) {
    var _args = args,
      deferred = _args.deferred;

    this.oModel.observe({
      searchKey: 'id',
      searchValue: _args.mParamData.mvc.sellers.id,
      propKey: 'events',
      action: 'add',
      once: true,
      callback: function (resp) {
        _args.mParamData.mvc.sellers = resp.data.observe;
        deferred.resolve(_args);
      }
    });
  };

  return SellerController;
});
