define('modules/pdp/media-viewer/overlay', [
  'modules/pdp/media-viewer/config',
  'modules/pdp/views/OverlayPanelGroupView',
  'modules/pdp/views/OverlayPanelView',
  'modules/breakpoint'
], function (
  config,
  OverlayPanelGroupView,
  OverlayPanelView,
  breakpoint
) {
  'use strict';

  var mediaViewerOverlay = {},
    oOverlayPanelGroup = {},
    oOverlayPanel = {};

  /**
   *
   * @return {void}
   */
  function fnShowOverlay() {
    config.oDomElements.$wrapper.detach();
    $(config.sDOM_SELECTORS.mvOverlayContent).append(config.oDomElements.$wrapper);
    $('#mv-overlay-content #s7container').hide();
    oOverlayPanel.open();
    oOverlayPanel.isOpen = true;
    config.oDomElements.$container.trigger('MediaViewer.showOverlay');
  }

  /**
   *
   * @return {void}
   */
  function fnCloseOverlay() {
    config.oDomElements.$wrapper.detach();
    config.oDomElements.$wrapper.insertAfter(config.sDOM_SELECTORS.mvStaticImage);
    oOverlayPanel.isOpen = false;
    config.oDomElements.$container.trigger('MediaViewer.closeOverlay');
  }

  /**
   *
   * @return {void}
   */
  function fnRenderOverlay() {
    var oParamData = {};

    if (!breakpoint.desktop && !breakpoint.largeDesktop) {
      return;
    }

    oParamData = {
      oStyles: {
        allDesktops: ['fullBleed', 'fullScreen'],
        allDevices: ['fullBleed', 'fullScreen']
      },
      oData: {
        sClassNames: config.oSettings.sOrientation === 'portrait'
            ? 'media-viewer--portrait' : 'media-viewer--landscape'
      },
      elTarget: $('body')[0]
    };

    oOverlayPanelGroup = new OverlayPanelGroupView({
      oStyles: oParamData.oStyles,
      sTag: null,
      sViewName: 'OverlayPanelGroupView',
      oData: {
        sClassNames: oParamData.oData.sClassNames
      },
      elTarget: oParamData.elTarget
    });

    oOverlayPanelGroup._panelGroupClosedHook = function (oEvent) {
      fnCloseOverlay();
      this.destroy(oEvent);
    };

    oOverlayPanel = oOverlayPanelGroup.createSubView({
      ViewClass: OverlayPanelView,
      mParamData: {
        sViewName: 'OverlayPanelView',
        oStyles: oParamData.oStyles,
        elTrigger: null,
        oData: {
          sClassNames: oParamData.oData.sClassNames,
          sTitle: null,
          aSubViews: [{ render: '<div id="mv-overlay-content"></div>' }]
        },
        iSubViewCount: 1
      }
    });

    oOverlayPanel.isOpen = false;
    oOverlayPanelGroup.render();

    fnShowOverlay();
  }

  mediaViewerOverlay = {
    render: fnRenderOverlay,
    show: fnShowOverlay,
    close: fnCloseOverlay
  };

  return mediaViewerOverlay;
});
