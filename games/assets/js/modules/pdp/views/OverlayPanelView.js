define('modules/pdp/views/OverlayPanelView', [
  'modules/mvc/fn',
  'modules/pdp/views/BasePanelView'
], function (fn, BasePanelView) {
  'use strict';

  /**
   * Use for all generic overlays.
   * @param {Object} oConfig The configuration for the view.
   * @return {void}
   */
  function OverlayPanelView(oConfig) {
    this.sTag = oConfig.sTag || null;
    this.sViewClass = 'info-panel-overlay';
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(OverlayPanelView, BasePanelView);

  return OverlayPanelView;
});
