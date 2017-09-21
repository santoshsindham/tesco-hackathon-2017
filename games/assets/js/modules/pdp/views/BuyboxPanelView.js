define('modules/pdp/views/BuyboxPanelView', [
  'modules/mvc/fn',
  'modules/pdp/views/BasePanelView'
], function (fn, BasePanelView) {
  'use strict';

  /**
   * Initalises a buybox panel view.
   * @param {Object} oConfig Configuration settings for the view.
   * @return {void}
   */
  function BuyboxPanelView(oConfig) {
    this.oStyles = {
      allDesktops: ['slideIn-left'],
      allDevices: ['slideIn-left', 'fullScreen']
    };
    this.sTag = 'buybox';
    this.sViewName = 'BuyboxPanelView';
    this.sViewClass = 'info-panel-buybox';
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(BuyboxPanelView, BasePanelView);

  BuyboxPanelView._name = 'BuyboxPanelView';

  BuyboxPanelView.prototype._addAttributes = function () {
    var oddEventClass = '',
      ODD = 'info-panel-odd',
      EVEN = 'info-panel-even',
      CHILD = 'info-panel-child',
      INFO_PANEL = '.info-panel',
      $panelWrapper = $(this.oElms.elWrapper),
      $parentPanel = $(this.oElms.elTrigger).closest(INFO_PANEL);

    this.parent._addAttributes.call(this, {
      wrapper: $panelWrapper,
      parent: $parentPanel,
      zIndex: false
    });

    if ($parentPanel.length > 0) {
      $panelWrapper.addClass(CHILD);
    }

    oddEventClass = this.panelNo % 2 === 0 ? EVEN : ODD;
    $panelWrapper.addClass(oddEventClass)
      .attr('data-panel-no', this.panelNo);
  };

  BuyboxPanelView.prototype._openEndHook = function () {
    var SHOW_EVENT = 'showBuyboxMask',
      DO_WRAPPER = 'delivery-snippet-wrapper',
      CHILD_OPEN_CLASS = 'child-panel-open',
      options = {
        mask: undefined
      };

    if (this.parentPanel) {
      $(this.parentPanel.oElms.elWrapper).addClass(CHILD_OPEN_CLASS);
      return;
    }

    if ($(this.oElms.elTrigger).hasClass(DO_WRAPPER)) {
      options.mask = 'mediaPlayer';
    } else {
      options.mask = 'both';
    }

    this.setEvent({
      sName: SHOW_EVENT,
      options: options
    }, false, true);
  };

  BuyboxPanelView.prototype._closeEndHook = function () {
    var HIDE_EVENT = 'hideBuyboxMask',
      DO_WRAPPER = 'delivery-snippet-wrapper',
      CHILD_OPEN_CLASS = 'child-panel-open',
      options = {
        unmask: undefined
      };

    if (this.parentPanel) {
      $(this.parentPanel.oElms.elWrapper).removeClass(CHILD_OPEN_CLASS);
      return;
    }

    if ($(this.oElms.elTrigger).hasClass(DO_WRAPPER)) {
      options.unmask = 'mediaPlayer';
    } else {
      options.unmask = 'both';
    }

    this.setEvent({
      sName: HIDE_EVENT,
      options: options
    }, false, true);
  };

  return BuyboxPanelView;
});
