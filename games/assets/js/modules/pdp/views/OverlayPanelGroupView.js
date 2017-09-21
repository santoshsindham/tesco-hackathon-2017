define('modules/pdp/views/OverlayPanelGroupView', [
  'modules/mvc/fn',
  'modules/pdp/views/BasePanelGroupView'
], function (fn, BasePanelGroupView) {
  'use strict';

  /**
   * Use for all generic overlays.
   * @param {Object} oConfig The configuration for the view.
   * @return {void}
   */
  function OverlayPanelGroupView(oConfig) {
    this.sTag = oConfig.sTag || null;
    this.sPanelType = 'group';
    this.sViewClass = 'info-panel-group-overlay';
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(OverlayPanelGroupView, BasePanelGroupView);

  return OverlayPanelGroupView;
});
