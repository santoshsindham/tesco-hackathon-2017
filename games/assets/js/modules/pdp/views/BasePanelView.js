define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    breakpoint = require('modules/breakpoint'),
    template = require('text!templates/views/basePanelView.html');


  /**
   * The base panel view that all panel views inherit from.
   * @param {Object} oConfig The configuration settings for a view.
   * @return {void}
   */
  function BasePanelView(oConfig) {
    var _oConfig = oConfig;

    _oConfig.modelRequired = false;
    this.sNamespace = 'panel';
    this.isOpen = false;
    this.panelNo = 1;
    this.childPanels = [];
    this.parentPanel = null;
    this.sTemplate = template;
    this.parent.parent.constructor.call(this, _oConfig);

    // parent constructor property overrides
    this.hasData = true;
    this.contentHash = this.hashCode(_oConfig.sOverlayContent);
  }

  fn.inherit(BasePanelView, BaseView);

  /**
   * Caches the base panel's close elements.
   * @return {void}
   */
  BasePanelView.prototype._cacheDomElms = function () {
    var $wrapper = undefined,
      CLOSE_ICONS = '.info-panel-close-icon, .info-panel-close-link, .info-panel-back-icon';

    this.parent.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.elHeader = $wrapper.find('.info-panel-header')[0];
    this.oElms.elTitle = $wrapper.find('h4.info-panel-title')[0];
    this.oElms.elContentTitle = $wrapper.find('h3.info-panel-content-title')[0];
    this.oElms.elContentWrapper = $wrapper.find('.info-panel-content-wrapper')[0];
    this.oElms.elContent = $wrapper.find('.info-panel-content')[0];
    this.oElms.$Close = $wrapper.find(CLOSE_ICONS);

    if ($wrapper.parent().hasClass('info-panel-group')) {
      this.oElms.elPanelGroup = $wrapper.parent();
    }
  };

  /**
   * Binds the base events required by all panels.
   * @return {void}
   */
  BasePanelView.prototype._bindEvents = function () {
    var INPUT_WITHIN_WRAPPER = 'input:not([type="checkbox"])';

    if (this.oElms.elTrigger) {
      $(this.oElms.elTrigger).on(
        'click',
        this._onTriggerClick.bind(this)
      );
    }

    $(this.oElms.elWrapper).on(
      'focus.movePanelContent-' + this.sKeyId, INPUT_WITHIN_WRAPPER,
      this._onInputFocus.bind(this)
    ).on(
      'blur.movePanelContent-' + this.sKeyId, INPUT_WITHIN_WRAPPER,
      this._onInputBlur.bind(this)
    );

    $(this.oElms.elWrapper).on(
      'click.closeIcons',
      '.info-panel-close-icon, .info-panel-close-link, .info-panel-back-icon',
      this.close.bind(this)
    );

    $(this.oElms.elContentWrapper).on('scroll', window.picturefill);
  };

  /**
   * Unbinds the base events required by all panels.
   * @return {void}
   */
  BasePanelView.prototype._unbindEvents = function () {
    if (this.oElms.elTrigger) {
      $(this.oElms.elTrigger).off('click');
    }

    $(this.oElms.elWrapper)
      .off('focus.movePanelContent-' + this.sKeyId)
      .off('blur.movePanelContent-' + this.sKeyId);

    $(this.oElms.elContentWrapper).off('touchmove scroll');
    $(this.oElms.elWrapper).off('click.closeIcons');
  };

  /**
   * Adds odd and even classes to the panels based on their 'parent' panel. Also adds zIndex
   * one higher than their parent panel.
   * @param {Object} options The optional parametres that change method behaviour.
   * @return {void}
   */
  BasePanelView.prototype._addAttributes = function (options) {
    var _options = options || {},
      panelObj = undefined,
      zIndex = undefined,
      INFO_PANEL = '.info-panel',
      $panelWrapper = _options.wrapper || $(this.oElms.elWrapper),
      $parentPanel = _options.parent || $(this.oElms.elTrigger).closest(INFO_PANEL);

    if ($parentPanel.length > 0) {
      if ($parentPanel.data('mvc-tag') === this.sTag) {
        if ($parentPanel.data('mvc-self')) {
          panelObj = $parentPanel.data('mvc-self');
        } else if (window.oAppController.oPageController.views[$parentPanel.attr('id')]) {
          panelObj = window.oAppController.oPageController.views[$parentPanel.attr('id')];
          $parentPanel.data('mvc-self', panelObj);
          window.oAppController.oPageController.views[$parentPanel.attr('id')] = null;
        }

        this.panelNo = panelObj.panelNo + 1;
        panelObj.childPanels.push(this);
        this.parentPanel = panelObj;
      }

      if (_options.zIndex !== false) {
        zIndex = parseInt($parentPanel.css('z-index'), 10) + 1;
        $panelWrapper.css({ zIndex: zIndex });
      }
    }
  };

  /**
   * Method fired when a user clicks on a trigger element.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelView.prototype._onTriggerClick = function (oEvent) {
    this.toggle(oEvent);
  };

  /**
   * Method decides whether to open or close the panel when a user clicks on the trigger.
   * @param {Object} oEvent The event object.
   * @return {Object} The panel view whose toggle method is being invoked.
   */
  BasePanelView.prototype.toggle = function (oEvent) {
    if (this.isOpen) {
      this.close(oEvent);
    } else {
      this.open(oEvent);
    }
    return this;
  };

  /**
   * Method opens the panel, adds an active class to the trigger and fires a panel open event.
   * @param {Object} oEvent The event object.
   * @return {Object} The panel view whose open method is being invoked.
   */
  BasePanelView.prototype.open = function (oEvent) {
    var IS_ACTIVE = 'is-active',
      IS_OPEN = 'is-open';

    if (oEvent && oEvent.currentTarget && $(oEvent.currentTarget).hasClass('disabled')) {
      return this;
    }

    if (this._openStartHook) {
      this._openStartHook(oEvent);
    }

    $(this.oElms.elWrapper).addClass(IS_OPEN);

    if (this.oElms.elTrigger) {
      $(this.oElms.elTrigger).addClass(IS_ACTIVE);
    }

    this.isOpen = true;

    this.setEvent({
      sName: 'panelOpen',
      sTag: this.sTag,
      oView: this,
      oClickEvent: oEvent
    }, false, true);

    if (this._openEndHook) {
      this._openEndHook(oEvent);
    }

    return this;
  };

  /**
   * Method closes the panel, removes an active class to the trigger and fires a panel close event.
   * @param {Object} oEvent The event object.
   * @return {Object} The panel view whose close method is being invoked.
   */
  BasePanelView.prototype.close = function (oEvent) {
    var _this = this,
      openChildPanel = (function () {
        var openPanels = [];

        _this.forLoop(_this.childPanels, function (i) {
          if (_this.childPanels[i].isOpen) {
            openPanels.push(_this.childPanels[i]);
          }
        });

        return openPanels;
      }()),
      IS_ACTIVE = 'is-active',
      IS_OPEN = 'is-open';

    if (oEvent && oEvent.currentTarget && $(oEvent.currentTarget).hasClass('disabled')) {
      return this;
    }

    if (this._closeStartHook) {
      this._closeStartHook(oEvent);
    }

    if (openChildPanel.length) {
      this.forLoop(openChildPanel, function (i) {
        openChildPanel[i].close(event);
      });
    }

    $(this.oElms.elWrapper).removeClass(IS_OPEN);

    if (this.oElms.elTrigger) {
      $(this.oElms.elTrigger).removeClass(IS_ACTIVE);
    }

    this.isOpen = false;

    this.setEvent({
      sName: 'panelClosed',
      sTag: this.sTag,
      oView: this,
      oClickEvent: oEvent
    }, false, true);

    if (this._closeEndHook) {
      this._closeEndHook(oEvent);
    }

    return this;
  };

  /**
   * Method removes a view from the DOM and detroys any references to it, i.e. events.
   * @param {Object} oEvent The event object.
   * @param {Object} opts Options for the method.
   * @return {void}
   */
  BasePanelView.prototype.destroy = function (oEvent, opts) {
    var _opts = opts || {};

    if (_opts.destroyGroup) {
      this.setEvent({
        sName: 'getPanelGroup',
        tag: this.sTag,
        callback: function (panelGroup) {
          if (panelGroup) {
            panelGroup.destroy();
          }
        }
      }, false, true);

      return this;
    }

    this._unbindEvents();
    $('#' + this.sViewId).remove();

    this.setEvent({
      sName: 'destroyPanel',
      oView: this,
      oClickEvent: oEvent
    }, false, true);

    return this;
  };

  /**
   * Method updates the content of a panel with a string of html/text.
   * @param {String} sContent html/text to add into panel.
   * @return {Object} The view object.
   */
  BasePanelView.prototype.updateContent = function (sContent) {
    $(this.oElms.elContent).html(sContent);
    return this;
  };

  /**
   * Method removes the content of a panel with a string of html/text.
   * @return {Object} The view object.
   */
  BasePanelView.prototype.removeContent = function () {
    this.oElms.elContent.innerHTML = '';
    return this;
  };

  /**
   * Method checks if the viewport is mobile and if scroll is disabled on the body and if an input
   * is not in focus, and if these come back as true then it runs the _moveInputIntoView method.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelView.prototype._onInputFocus = function (oEvent) {
    if (this.isInputInFocus) {
      return;
    }

    if ($('body').hasClass('disableScroll')) {
      if (breakpoint.mobile || breakpoint.hTablet || breakpoint.vTablet) {
        this._toggleHeaderVisibility();
        this._moveInputIntoView(oEvent);
      }
    }

    this.isInputInFocus = true;
  };

  /**
   * Method moves the header and content wrapper up and scrolls the input into view. This is
   * required on devices because when the overlay is open in fullScreen mode, the body scroll is
   * disabled and so the native behaviour does not scroll the input into view.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelView.prototype._moveInputIntoView = function (oEvent) {
    var iScroll = $(oEvent.currentTarget).offset().top - $(this.oElms.elContent).offset().top;

    $(this.oElms.elContentWrapper).animate({
      scrollTop: iScroll
    }, 200);
  };

  /**
   * Method checks if the viewport is mobile and if scroll is disabled on the body and if an input
   * is in focus, come back as true then it runs the _slideDownHeader method.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelView.prototype._onInputBlur = function () {
    if ($('body').hasClass('disableScroll')) {
      if (breakpoint.mobile || breakpoint.hTablet || breakpoint.vTablet) {
        this._toggleHeaderVisibility();
      }
    }

    this.isInputInFocus = false;
  };

  /**
   * Method moves the header and content wrapper up for down. This is required on mobile When
   * in landscape because the screen with keyboard open is not deep enough if the header is not
   * hidden from view.
   * @return {void}
   */
  BasePanelView.prototype._toggleHeaderVisibility = function () {
    if (!this.isInputInFocus) {
      $(this.oElms.elHeader).addClass('panel-header-hidden');
      $(this.oElms.elContentWrapper).addClass('panel-header-hidden');
    } else {
      $(this.oElms.elHeader).removeClass('panel-header-hidden');
      $(this.oElms.elContentWrapper).removeClass('panel-header-hidden');
    }
  };


  module.exports = BasePanelView;
});
