define('modules/pdp/views/PriceCheckView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/show-more/ShowMore'
], function ($, fn, BaseView, ShowMore) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function PriceCheckView(config) {
    this.sViewName = 'PriceCheckView';
    this.sNamespace = 'sku';
    this.sTag = 'competitors';
    this.sViewClass = 'price-check-view';
    this.sTemplate = $('#price-check-view-template')[0].innerHTML;
    this.parent.constructor.call(this, config);
  }

  fn.inherit(PriceCheckView, BaseView);

  PriceCheckView._name = 'PriceCheckView';
  PriceCheckView.sNamespace = 'sku';
  PriceCheckView.sTag = 'competitors';

  PriceCheckView.prototype._setProps = function (data) {
    return {
      competitors: data.sku.competitors
    };
  };

  PriceCheckView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.competitors = $wrapper.find('div.price-check-competitors')[0];
  };

  PriceCheckView.prototype._initDependancies = function () {
    var _this = this;

    setTimeout(function () {
      _this.showMore = new ShowMore({
        selector: _this.oElms.elWrapper,
        height: 400
      });

      _this.showMore.fnInit();
    }, 100);
  };

  PriceCheckView.prototype.refresh = function (args) {
    var _args = args,
      data = args.mParamData.mvc,
      $node = null;

    if ($(this.sViewId).length === 0 && this.isObject(_args.render, true)) {
      $.extend(_args, _args.render);
      delete _args.render;

      _args.newEvent = true;
      this.render(args);
      return;
    }

    $node = $(this.parseHtml(
      { html: this.render({ mParamData: { mvc: data }, sOutput: 'none' }), trim: true }
    ));

    fn.refreshElement(
      this.oElms.competitors,
      $node.find('div.price-check-competitors')[0]
    );

    this._cacheDomElms();

    if (this.showMore) {
      this.showMore.toggleInit();
    }
  };

  return PriceCheckView;
});
