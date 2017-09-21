define('modules/pdp/views/ProductPageTabPanelGroupView', [
  'modules/mvc/fn',
  'modules/pdp/views/BasePanelGroupView'
], function (fn, BasePanelGroupView) {
  var ProductPageTabPanelGroupView = function (oConfig) {
    this.hasNoId = true;
    this.oStyles = {
      kiosk: ['slideOut-up']
    };
    this.sTag = 'tabs';
    this.sViewName = 'ProductPageTabPanelGroupView';
    this.sViewClass = 'info-panel-group-tabs';
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(ProductPageTabPanelGroupView, BasePanelGroupView);

  ProductPageTabPanelGroupView._name = 'ProductPageTabPanelGroupView';

  return ProductPageTabPanelGroupView;
});
