define('modules/pdp/controllers/PanelController', [
  'domlib',
  'modules/mvc/fn',
  'modules/breakpoint',
  'modules/pdp/controllers/BaseController'
], function ($, fn, breakpoint, BaseController) {
  'use strict';

  /**
   *
   * @return {void}
   */
  function PanelController() {
    this.sNamespace = 'panel';
    this.sTag = '_default';
    this.isPanelOpen = false;
    this.isPanelOpening = false;
    this.panelGroups = {};
    this.oOpenPanels = {};
    this.parent.constructor.call(this);
  }

  fn.inherit(PanelController, BaseController);

  /**
   * Method binds all events related to panels opening and closing.
   * @return {void}
   */
  PanelController.prototype._bindEvents = function () {
    $(window)
      .on('panelOpen', this._onPanelOpen.bind(this))
      .on('panelClosed', this._onPanelClosed.bind(this))
      .on('closeOpenPanels', this._onCloseOpenPanels.bind(this))
      .on('getPanelGroup', this._onGetPanelGroup.bind(this))
      .on('destroyPanelGroup', this._onDestroyPanelGroup.bind(this))
      .on('breakpointChange.panelController', this._onBreakpointChange.bind(this)
    );
  };

  /**
   * Stores a reference to the open panel, fires an event if it's the first panel in the group
   * to open, and runs some post open methods.
   * @param {Object} oEvent The event object that includes the panel that has opened.
   * @return {void}
   */
  PanelController.prototype._onPanelOpen = function (oEvent) {
    var openPanel = this.oOpenPanels[oEvent.oData.sTag],
      openingPanel = oEvent.oData.oView,
      findChildPanel = function (childPanels, panel) {
        return this.forLoop(childPanels, function (i) {
          if (childPanels[i].id === panel.id) {
            return true;
          }
          return undefined;
        }) || false;
      };

    this.isPanelOpening = true;

    /**
     * Checks if a panel from the same group is already open, and if it is, and it does not have
     * the same id as the panel that is opening, closes the open panel.
     */
    if (openPanel) {
      if (openPanel.id !== openingPanel.id) {
        if (!openPanel.childPanels.length
            || (openPanel.childPanels.length
                && !findChildPanel.call(this, openPanel.childPanels, openingPanel))) {
          openPanel.close();
        }
      }
    } else {
      // Fires event to say a panel group is open.
      this.setEvent({
        sName: 'panelGroupOpen',
        sTag: oEvent.oData.sTag,
        oView: openingPanel,
        oClickEvent: oEvent.oData.oClickEvent
      }, false, true);

      this.panelsOpenHook(oEvent);
    }

    this.isPanelOpen = true;

    // Adds the open panel to the openPanels object.
    this.oOpenPanels[oEvent.oData.sTag] = openingPanel;

    this.isPanelOpening = false;
  };

  /**
   * Stores a reference to the closed panel, fires an event if it's the last panel in the group
   * to close, and runs some post close methods.
   * @param {Object} oEvent The event object that includes the panel that has opened.
   * @return {void}
   */
  PanelController.prototype._onPanelClosed = function (oEvent) {
    var isOpen = false;

    if (!this.isPanelOpening) {
      if (this.oOpenPanels[oEvent.oData.sTag].parentPanel) {
        this.oOpenPanels[oEvent.oData.sTag] = this.oOpenPanels[oEvent.oData.sTag].parentPanel;
      } else {
        this.oOpenPanels[oEvent.oData.sTag] = null;
      }

      /**
       * Check to see if any other panel groups are open as this will impact the behaviour of
       * some elements on the page such as the masthead and body scroll.
       */
      this.forInLoop(this.oOpenPanels, function (sProp) {
        if (this.oOpenPanels[sProp] !== null) {
          isOpen = true;
        }
      });

      this.isPanelOpen = isOpen;

      if (!this.oOpenPanels[oEvent.oData.sTag]) {
        // Fires event to say a panel group is closed.
        this.setEvent({
          sName: 'panelGroupClosed',
          sTag: oEvent.oData.sTag,
          oView: oEvent.oData.oView,
          oClickEvent: oEvent.oData.oClickEvent
        }, false, true);

        this.panelsClosedHook(oEvent);
      }
    }
  };

  /**
   * Runs some post panel open methods.
   * @param {Object} oEvent The event object that includes the panel that has opened.
   * @return {void}
   */
  PanelController.prototype.panelsOpenHook = function (oEvent) {
    var oView = oEvent.oData.oView;

    /**
     * On desktop and largeDesktop, we need to disable the document scroll if the class of
     * fullScreen is found.
     */
    if (breakpoint.desktop || breakpoint.largeDesktop) {
      if (this.isArray(oView.oStyles[breakpoint.currentViewport], true)
          && oView.oStyles[breakpoint.currentViewport].indexOf('fullScreen') !== -1
          && !this._isOpenPanelStyle('fullScreen', breakpoint.currentViewport)) {
        $(window).trigger('documentScrollDisable');
      }
      /**
       * On lower viewports, when we usually use a sliding panel, we also need to slide the
       * masthead up out of view.
       */
    } else if (this.isArray(oView.oStyles[breakpoint.currentViewport], true)
        && oView.oStyles[breakpoint.currentViewport].indexOf('fullScreen') !== -1
        && !this._isOpenPanelStyle('fullScreen', breakpoint.currentViewport)) {
      $(window)
        .trigger('mastheadSlideUp')
        .trigger('documentScrollDisable');
    }
  };

  /**
   * Runs some post panel close methods.
   * @param {Object} oEvent The event object that includes the panel that has closed.
   * @return {void}
   */
  PanelController.prototype.panelsClosedHook = function (oEvent) {
    var oView = oEvent.oData.oView;

    /**
     * On desktop and largeDesktop, we need to enable the document scroll if the class of
     * fullScreen is found.
     */
    if (breakpoint.desktop || breakpoint.largeDesktop) {
      if (this.isArray(oView.oStyles[breakpoint.currentViewport], true)
          && oView.oStyles[breakpoint.currentViewport].indexOf('fullScreen') !== -1) {
        if (!this._isOpenPanelStyle('fullScreen', breakpoint.currentViewport)) {
          $(window).trigger('documentScrollEnable');
        }
      }
      /**
       * On lower viewports, when we usually use a sliding panel, we also need to slide the
       * masthead down into view.
       */
    } else if (this.isArray(oView.oStyles[breakpoint.currentViewport], true)
        && oView.oStyles[breakpoint.currentViewport].indexOf('fullScreen') !== -1) {
      if (!this._isOpenPanelStyle('fullScreen', breakpoint.currentViewport)) {
        $(window)
          .trigger('documentScrollEnable')
          .trigger('mastheadSlideDown');
      }
    }
  };

  /**
   * Method runs when a module triggers the closeOpenPanels event with the tag of a panel.
   * @param {Object} oEvent The event object that includes the tag of the panel to close.
   * @return {void}
   */
  PanelController.prototype._onCloseOpenPanels = function (oEvent) {
    if (this.oOpenPanels[oEvent.oData.sTag]) {
      if (oEvent.oData.parentClose && this.oOpenPanels[oEvent.oData.sTag].parentPanel !== null) {
        this.oOpenPanels[oEvent.oData.sTag].parentPanel.close();
      } else {
        this.oOpenPanels[oEvent.oData.sTag].close();
      }
    }
  };

  /**
   * On breakpointChange there are methods that may need to run based on the classes on an open
   * panel.
   * @param {Object} oEvent The breakpointChange event object.
   * @return {Object} The event object.
   */
  PanelController.prototype._onBreakpointChange = function (oEvent) {
    // If moving between two desktop viewports no changes required.
    if ((oEvent.newViewport === 'largedesktop' || oEvent.newViewport === 'desktop')
        && (oEvent.oldViewport === 'largedesktop' || oEvent.oldViewport === 'desktop')) {
      return false;
    }

    // If moving between two device viewports no changes required.
    if ((oEvent.newViewport === 'mobile' || oEvent.newViewport === 'vtablet'
        || oEvent.newViewport === 'htablet') && (oEvent.oldViewport === 'mobile'
        || oEvent.oldViewport === 'vtablet' || oEvent.oldViewport === 'htablet')) {
      return false;
    }

    /**
     * If new viewport is desktop (old device) and a panel is open and has fullScreen as a class
     * in the old viewport, then slide down masthead, but only enable document scroll if the new
     * viewport does not have fullScreen has a class.
     */
    if (oEvent.newViewport === 'largedesktop' || oEvent.newViewport === 'desktop') {
      if (this.isPanelOpen && this._isOpenPanelStyle('fullScreen', oEvent.oldViewport)) {
        if (this._isOpenPanelStyle('fullScreen', oEvent.newViewport)) {
          $(window).trigger('mastheadSlideDown');
        } else {
          $(window).trigger('mastheadSlideDown')
            .trigger('documentScrollEnable');
        }
      } else if (this._isOpenPanelStyle('fullScreen', oEvent.newViewport)) {
        $(window).trigger('documentScrollDisable');
      }
      /**
       * If the new viewport is device (old desktop) and a panel is open and has fullScreen as a
       * class in the old viewport, then slide up the masthead if the new viewport has
       * fullScreen as a class, and only enable document scroll is the new viewport does not have
       * fullscreen as a class.
       */
    } else if (oEvent.newViewport === 'mobile' || oEvent.newViewport === 'vtablet'
        || oEvent.newViewport === 'htablet') {
      if (this.isPanelOpen && this._isOpenPanelStyle('fullScreen', oEvent.oldViewport)) {
        if (this._isOpenPanelStyle('fullScreen', oEvent.newViewport)) {
          $(window).trigger('mastheadSlideUp');
        } else {
          $(window).trigger('documentScrollEnable');
        }
      } else if (this._isOpenPanelStyle('fullScreen', oEvent.newViewport)) {
        $(window)
          .trigger('mastheadSlideUp')
          .trigger('documentScrollDisable');
      }
    }

    return oEvent;
  };

  /**
   * Iterates through every open panel and checks each for a class name on a specified viewport.
   * @param {String} sSearchValue The class name to search for.
   * @param {String} sViewport The viewport to search within.
   * @return {Boolean} Whether search value is present.
   */
  PanelController.prototype._isOpenPanelStyle = function (sSearchValue, sViewport) {
    var bOutput = false;

    this.forInLoop(this.oOpenPanels, function (sProp) {
      if (this.isObject(this.oOpenPanels[sProp])) {
        if (this.oOpenPanels[sProp]._hasStyle(sSearchValue, sViewport)) {
          bOutput = true;
        }
      }
    });

    return bOutput;
  };

  PanelController.prototype.postRenderHook = function (oData) {
    this.parent.postRenderHook.call(this, oData);
    if (oData.oView.sPanelType === 'group') {
      this._storePanelGroup(oData.oView);
    }
  };

  /**
   * Stores a reference to every panel group for future use.
   * @param {Object} oView The panel group object.
   * @return {void}
   */
  PanelController.prototype._storePanelGroup = function (oView) {
    this.panelGroups[oView.sTag] = oView;
  };

  /**
   * Gets a panel group from the panelGroups property based on the group's tag property.
   * If the event object includes a callback property, then the method will execute the
   * callback and pass the panel group into it.
   * @param {Object} oEvent The jQuery event object.
   * @return {Object} The requested panel group.
   */
  PanelController.prototype._onGetPanelGroup = function (oEvent) {
    var panelGroup = this.panelGroups[oEvent.oData.tag];

    if (oEvent.oData.callback) {
      oEvent.oData.callback(panelGroup);
    }

    return panelGroup;
  };

  /**
   * Destroys any reference to the panel group when the destroyPanelGroup event fires.
   * @param {Object} oEvent The jQuery event object.
   * @return {void}
   */
  PanelController.prototype._onDestroyPanelGroup = function (oEvent) {
    if (this.panelGroups[oEvent.oData.tag]) {
      this.panelGroups[oEvent.oData.tag] = null;
    }
  };

  return PanelController;
});
