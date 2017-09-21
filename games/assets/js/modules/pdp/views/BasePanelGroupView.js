define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    template = require('text!templates/views/basePanelGroupView.html');


  /**
   * The base panel group view that all panel group views inherit from.
   * @param {Object} oConfig The configuration settings for a view.
   * @return {void}
   */
  function BasePanelGroupView(oConfig) {
    var _oConfig = oConfig;

    _oConfig.modelRequired = false;
    this.sNamespace = 'panel';
    this.sPanelType = 'group';
    this.sTemplate = template;
    this.parent.parent.constructor.call(this, _oConfig);

    // parent constructor property overrides
    this.hasData = true;
    this.sOutput = 'append';
  }

  fn.inherit(BasePanelGroupView, BaseView);

  /**
   * Caches the base panel group's mask element.
   * @return {void}
   */
  BasePanelGroupView.prototype._cacheDomElms = function () {
    this.parent.parent._cacheDomElms.call(this);
    this.oElms.elMask = $(this.sSelector).find('.info-panel-mask')[0];
  };

  /**
   * Binds the base events required by all panel groups.
   * @return {void}
   */
  BasePanelGroupView.prototype._bindEvents = function () {
    $(this.oElms.elMask).on(
      'click',
      this._onMaskClick.bind(this)
    );

    $(window).on(
      'panelGroupOpen.' + this.sKeyId,
      this._onPanelGroupOpen.bind(this)
    ).on(
      'panelGroupClosed.' + this.sKeyId,
      this._onPanelGroupClosed.bind(this)
    );
  };

  /**
   * Unbinds the base events required by all panel groups.
   * @return {void}
   */
  BasePanelGroupView.prototype._unbindEvents = function () {
    $(this.oElms.elMask).off('click');
    $(window)
      .off('panelGroupOpen.' + this.sKeyId)
      .off('panelGroupClosed.' + this.sKeyId);
  };


  /**
   * Fires an event to the panels controller to close all open panels with the provided tag.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelGroupView.prototype._onMaskClick = function (oEvent) {
    var _this = this;

    _this.setEvent({
      sName: 'closeOpenPanels',
      sTag: _this.sTag,
      oView: _this,
      oClickEvent: oEvent
    }, false, true);
  };

  /**
   * When a panel group opens, if the tag matches the panel group's tag, then add the active class
   * to panel group's wrapper.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelGroupView.prototype._onPanelGroupOpen = function (oEvent) {
    var IS_ACTIVE = 'is-active';

    if (oEvent.oData.sTag === this.sTag) {
      $(this.oElms.elWrapper).addClass(IS_ACTIVE);
      $(this.oElms.elMask).addClass(IS_ACTIVE);

      if (this._panelGroupOpenHook !== undefined) {
        this._panelGroupOpenHook(oEvent);
      }
    }
  };

  /**
   * When a panel group closes, if the tag matches the panel group's tag, then remove the active
   * class to panel group's wrapper.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BasePanelGroupView.prototype._onPanelGroupClosed = function (oEvent) {
    var IS_ACTIVE = 'is-active';

    if (oEvent.oData.sTag === this.sTag) {
      $(this.oElms.elWrapper).removeClass(IS_ACTIVE);
      $(this.oElms.elMask).removeClass(IS_ACTIVE);

      if (this._panelGroupClosedHook !== undefined) {
        this._panelGroupClosedHook(oEvent);
      }
    }
  };

  /**
   * Method removes a view from the DOM and detroys any references to it, i.e. events.
   * @param {Object} oEvent The event object.
   * @return {Object} The view.
   */
  BasePanelGroupView.prototype.destroy = function (oEvent) {
    this.forLoop(this.oData.aSubViews, function (i) {
      this.oData.aSubViews[i].destroy(oEvent);
    });

    this._unbindEvents();
    $('#' + this.sViewId).remove();

    this.setEvent({
      sName: 'destroyPanelGroup',
      tag: this.sTag
    }, false, true);

    return this;
  };


  module.exports = BasePanelGroupView;
});

