define('modules/pdp/views/BuyboxPanelGroupView', [
  'modules/mvc/fn',
  'modules/pdp/views/BasePanelGroupView'
], function (fn, BasePanelGroupView) {
  var BuyboxPanelGroupView = function (oConfig) {
    this.hasNoId = true;
    this.oStyles = {
      allDesktops: ['slideIn-left'],
      allDevices: ['slideIn-left', 'fullScreen']
    };
    this.sTag = 'buybox';
    this.sViewName = 'BuyboxPanelGroupView';
    this.sViewClass = 'info-panel-group-buybox';
    this.parent.constructor.call(this, oConfig);
  };

  fn.inherit(BuyboxPanelGroupView, BasePanelGroupView);

  BuyboxPanelGroupView._name = 'BuyboxPanelGroupView';

  return BuyboxPanelGroupView;
});
