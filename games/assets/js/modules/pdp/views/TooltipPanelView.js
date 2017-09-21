define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BasePanelView = require('modules/pdp/views/BasePanelView'),
    breakpoint = require('modules/breakpoint'),
    template = require('text!templates/views/tooltipPanelView.html');


  /**
   *
   * @param {Object} oConfig
   * @return {void}
   */
  function TooltipPanelView(oConfig) {
    this.sTag = 'tooltip';
    this.sViewName = 'TooltipPanelView';
    this.sViewClass = 'info-panel-tooltip';
    this.sTooltipType = oConfig.sTooltipType || 'default';
    this.sTooltopMessage = oConfig.sTooltopMessage;
    this.parent.constructor.call(this, oConfig);

    // override default info panel template
    this.sTemplate = template;

    if ($(this.sSelector).length) {
      this.oElms.elTarget = $(this.sSelector)[0];
      this.sOutput = 'outer';
    } else {
      this.sOutput = 'append';
    }
  }

  fn.inherit(TooltipPanelView, BasePanelView);

  TooltipPanelView._name = 'TooltipPanelView';

  TooltipPanelView.prototype._cacheDomElms = function () {
    var POINTER = '.tooltip-pointer',
      CONTENT_WRAPPER = '.info-panel-content-wrapper';

    this.parent._cacheDomElms.call(this);
    this.oElms.elPointer = $(this.oElms.elWrapper).find(POINTER);
    this.oElms.elParentContentWrapper = $(this.oElms.elTrigger).closest(CONTENT_WRAPPER)[0];
  };

  /**
   * Binds the events required by the TooltipPanelView.
   * @return {void}
   */
  TooltipPanelView.prototype._bindEvents = function () {
    if (this.sTooltipType === 'default') {
      this.parent._bindEvents.call(this);
    }
  };

  /**
   * Unbinds the base events required by the TooltipPanelView.
   * @return {void}
   */
  TooltipPanelView.prototype._unbindEvents = function () {
    if (this.sTooltipType === 'default') {
      this.parent._unbindEvents.call(this);
    }
  };

  TooltipPanelView.prototype._openEndHook = function () {
    this._positionTooltip(breakpoint.currentViewport);
    this._onOpenBindEvents();
  };

  TooltipPanelView.prototype._closeEndHook = function (oEvent) {
    if (this.sTooltipType === 'error') {
      this.destroy(oEvent);
    }

    this._onCloseUnbindEvents();
  };

  TooltipPanelView.prototype._onOpenBindEvents = function () {
    $(window).on(
      'resize.positionTooltip-' + this.sKeyId,
      this._onResize.bind(this)
    );
    $('body').on(
      'click.closeTooltip-' + this.sKeyId,
      this._onBodyClick.bind(this)
    );
    if (this.oElms.elParentContentWrapper) {
      $(this.oElms.elParentContentWrapper).on(
        'scroll.closeTooltip-' + this.sKeyId,
        this._onPanelContentScroll.bind(this)
      );
    }
  };

  TooltipPanelView.prototype._onCloseUnbindEvents = function () {
    $(window).off('resize.positionTooltip-' + this.sKeyId);
    $('body').off('click.closeTooltip-' + this.sKeyId);
    $(this.oElms.elParentContentWrapper).off('scroll.closeTooltip-' + this.sKeyId);
  };

  TooltipPanelView.prototype._addAttributes = function () {
    var zIndex = undefined,
      INFO_PANEL = '.info-panel',
      $panelWrapper = $(this.oElms.elWrapper),
      $parentPanel = $(this.oElms.elTrigger).closest(INFO_PANEL);

    this.parent._addAttributes.call(this, {
      wrapper: $panelWrapper,
      parent: $parentPanel,
      zIndex: false
    });

    if ($parentPanel.length > 0) {
      if ($parentPanel.hasClass('fullScreen-' + breakpoint.currentViewport)) {
        zIndex = parseInt($parentPanel.css('z-index'), 10) + 1;
        $panelWrapper.css({ zIndex: zIndex });
      }
    }
  };

  TooltipPanelView.prototype._positionTooltip = function (sViewport) {
    var $Body = $('body'),
      $Trigger = $(this.oElms.elTrigger),
      $Wrapper = $(this.oElms.elWrapper),
      $Pointer = $(this.oElms.elPointer),
      iBodyTop = 0,
      iBodyHeight = $Body.height(),
      iBodyWidth = $Body.width(),
      isScrollDisabled = $Body.hasClass('disableScroll'),
      iTriggerOffsetTop = $Trigger.offset().top,
      iTriggerOffsetLeft = $Trigger.offset().left,
      iTriggerWidth = $Trigger.outerWidth(),
      iTriggerHeight = $Trigger.outerHeight(),
      iToolTipWidth = $Wrapper.outerWidth(),
      iTooltipOffsetLeft = 0,
      iTooltipOffsetTop = 0,
      iTooltipOffsetBottom = 0,
      iPointerOffestLeft = 0,
      iPointerOffestTop = 0,
      POINTER_WIDTH = 29,
      SPACE_FROM_TRIGGER = 20;

    if (isScrollDisabled) {
      iBodyTop = Math.abs(parseInt($Body.css('top'), 10));
    }

    if (this.oStyles[sViewport].indexOf('tooltip-top') !== -1) {
      // calculate tooltip's vertical position
      iTooltipOffsetBottom = (iBodyHeight - iTriggerOffsetTop) + SPACE_FROM_TRIGGER;

      // calculate tooltip's horizonal position
      iTooltipOffsetLeft = iTriggerOffsetLeft - Math.round((iToolTipWidth - iTriggerWidth) / 2);

      if (iTooltipOffsetLeft < 0) {
        iTooltipOffsetLeft = 10;
      } else if ((iTooltipOffsetLeft + iToolTipWidth) > iBodyWidth) {
        iTooltipOffsetLeft = iBodyWidth - iToolTipWidth - 10;
      }

      // calculate pointer's horizonal position
      iPointerOffestLeft = (iTriggerOffsetLeft - iTooltipOffsetLeft)
          + Math.round((iTriggerWidth - POINTER_WIDTH) / 2);

      $Wrapper.css({
        top: '',
        left: iTooltipOffsetLeft,
        bottom: iTooltipOffsetBottom
      });

      $Pointer.css({
        top: '',
        left: iPointerOffestLeft
      });
    } else if (this.oStyles[sViewport].indexOf('tooltip-right') !== -1) {
      // calculate tooltip's vertical position
      iTooltipOffsetTop = isScrollDisabled
          ? iTriggerOffsetTop + iBodyTop
          : iTriggerOffsetTop;

      // calculate tooltip's horizonal position
      iTooltipOffsetLeft = iTriggerOffsetLeft + iTriggerWidth + SPACE_FROM_TRIGGER;

      // calculate pointer's horizonal position
      iPointerOffestTop = (iTriggerOffsetTop - iTooltipOffsetTop) + POINTER_WIDTH
          + Math.round((iTriggerHeight - POINTER_WIDTH) / 2);

      $Wrapper.css({
        top: iTooltipOffsetTop,
        left: iTooltipOffsetLeft,
        bottom: ''
      });

      $Pointer.css({
        top: iPointerOffestTop,
        left: ''
      });
    } else if (this.oStyles[sViewport].indexOf('tooltip-bottom') !== -1) {
      // calculate tooltip's vertical position
      iTooltipOffsetTop = isScrollDisabled
          ? iTriggerOffsetTop + iTriggerHeight + SPACE_FROM_TRIGGER + iBodyTop
          : iTriggerOffsetTop + iTriggerHeight + SPACE_FROM_TRIGGER;

      // calculate tooltip's horizonal position
      iTooltipOffsetLeft = iTriggerOffsetLeft - Math.round((iToolTipWidth - iTriggerWidth) / 2);

      if (iTooltipOffsetLeft < 0) {
        iTooltipOffsetLeft = 10;
      } else if ((iTooltipOffsetLeft + iToolTipWidth) > iBodyWidth) {
        iTooltipOffsetLeft = iBodyWidth - iToolTipWidth - 10;
      }

      // calculate pointer's horizonal position
      iPointerOffestLeft = (iTriggerOffsetLeft - iTooltipOffsetLeft)
          + Math.round((iTriggerWidth - POINTER_WIDTH) / 2);

      $Wrapper.css({
        top: iTooltipOffsetTop,
        left: iTooltipOffsetLeft,
        bottom: ''
      });

      $Pointer.css({
        top: '',
        left: iPointerOffestLeft
      });
    } else if (this.oStyles[sViewport].indexOf('tooltip-left') !== -1) {
      // calculate tooltip's vertical position
      iTooltipOffsetTop = isScrollDisabled
          ? iTriggerOffsetTop + iBodyTop
          : iTriggerOffsetTop;

      // calculate tooltip's horizonal position
      iTooltipOffsetLeft = iTriggerOffsetLeft - iToolTipWidth - SPACE_FROM_TRIGGER;

      // calculate pointer's horizonal position
      iPointerOffestTop = (iTriggerOffsetTop - iTooltipOffsetTop)
          + Math.round((iTriggerHeight - POINTER_WIDTH) / 2);

      $Wrapper.css({
        top: iTooltipOffsetTop,
        left: iTooltipOffsetLeft,
        bottom: ''
      });

      $Pointer.css({
        top: iPointerOffestTop,
        left: ''
      });
    }
  };

  TooltipPanelView.prototype._onResize = function () {
    var _this = this,
      breakpointChangeTimer = null;

    window.clearTimeout(breakpointChangeTimer);
    breakpointChangeTimer = window.setTimeout(function () {
      _this._positionTooltip(breakpoint.currentViewport);
    }, 100);
  };

  TooltipPanelView.prototype._onBodyClick = function (oEvent) {
    if (oEvent.target === this.oElms.elTrigger) {
      oEvent.stopPropagation();
      return;
    }

    if ($(oEvent.target).closest(this.oElms.elWrapper).length > 0) {
      oEvent.stopPropagation();
      return;
    }

    this.close();
  };

  TooltipPanelView.prototype._onPanelContentScroll = function () {
    this.close();
  };


  module.exports = TooltipPanelView;
});
