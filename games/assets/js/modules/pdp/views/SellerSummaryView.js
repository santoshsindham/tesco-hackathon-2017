define('modules/pdp/views/SellerSummaryView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/tesco.analytics'
], function ($, fn, BaseView, analytics) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function SellerSummaryView(config) {
    this.sNamespace = 'sellers';
    this.sTag = 'sellerSummaries';
    this.sViewName = 'SellerSummaryView';
    this.sViewClass = 'seller-summary-view';
    this.sTemplate = $('#seller-summary-view-template')[0].innerHTML;
    this.views = {
      classes: {
        SellerSummaryView: SellerSummaryView
      }
    };
    this.parent.constructor.call(this, config);
  }

  fn.inherit(SellerSummaryView, BaseView);
  SellerSummaryView._name = 'SellerSummaryView';
  SellerSummaryView.sNamespace = 'sellers';
  SellerSummaryView.sTag = 'sellerSummaries';

  SellerSummaryView.prototype._bindEvents = function () {
    $(this.oElms.elWrapper).on(
      'click.analyticsTracking',
      this._analyticsTracking.bind(this)
    );
  };

  SellerSummaryView.prototype._setStates = function (data) {
    return {
      hasAddOnItem: !!data.sellers.addOnMessage
    };
  };

  SellerSummaryView.prototype._analyticsTracking = function (oEvent) {
    var webAnalytics = {},
      data = [];

    if (!oEvent.currentTarget.className.match(/is-active/)) {
      webAnalytics = new analytics.WebMetrics();

      data.push({
        eVar45: 'sold by ' + this.oData.mvc.sellers.name,
        prop19: 'sold by ' + this.oData.mvc.sellers.name,
        eVar59: 'pdp - sidebar right - '
            + this.oData.mvc.sellers.name + ' - p' + this.oData.mvc.sellers.custom.position,
        prop42: 'pdp - sidebar right - '
            + this.oData.mvc.sellers.name + ' - p' + this.oData.mvc.sellers.custom.position,
        events: 'event45'
      });

      webAnalytics.submit(data);
    }
  };

  return SellerSummaryView;
});
