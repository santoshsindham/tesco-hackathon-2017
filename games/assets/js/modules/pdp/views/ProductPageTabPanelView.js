define('modules/pdp/views/ProductPageTabPanelView', [
  'modules/mvc/fn',
  'modules/pdp/views/BasePanelView'
], function (fn, BasePanelView) {
  var ProductPageTabPanelView = function (oConfig) {
    this.oStyles = {
      kiosk: ['slideOut-up']
    };
    this.sTag = 'tabs';
    this.sViewName = 'ProductPageTabPanelView';
    this.sViewClass = 'info-panel-tabs';
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(ProductPageTabPanelView, BasePanelView);

  ProductPageTabPanelView._name = 'ProductPageTabPanelView';

  ProductPageTabPanelView.prototype._openStartHook = function () {
    $(this.oElms.elWrapper).css('z-index', '1');
  };

  ProductPageTabPanelView.prototype._closeEndHook = function () {
    var IS_ACTIVE = 'is-active';

    if ($(this.oElms.elPanelGroup).hasClass(IS_ACTIVE)) {
      $(this.oElms.elWrapper).css('z-index', '');
    } else {
      this.triggerOnTransitionEnd(function () {
        $(this.oElms.elWrapper).css('z-index', '');
      }, { target: this.oElms.elWrapper, propertyName: 'top' });
    }
  };

  return ProductPageTabPanelView;
});
