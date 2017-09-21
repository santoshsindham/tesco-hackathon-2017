define('modules/pdp/BaseViewController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/BaseClass'
], function ($, fn, BaseClass) {
  'use strict';

  /**
   * The base class that the base view and controller inherit from.
   * @return {void}
   */
  function BaseViewController() {}

  fn.inherit(BaseViewController, BaseClass);

  BaseViewController.prototype._bindDestroyPanelRefs = function () {
    $(window).on(
      'destroyPanel.' + this.id,
      this._onDestroyPanel.bind(this)
    );
  };

  BaseViewController.prototype._unbindDestroyPanelRefs = function () {
    $(window).off('destroyPanel.' + this.id);
  };

  /**
   * When a panel is destroyed, we need to remove references to it held by other controllers.
   * @param {Object} oEvent The event object.
   * @return {void}
   */
  BaseViewController.prototype._onDestroyPanel = function (oEvent) {
    var oPanel = oEvent.oData.oView;

    if (this._activePanel[oPanel.sTag]
        && this._activePanel[oPanel.sTag].id === oEvent.oData.oView.id) {
      this._activePanel[oPanel.sTag] = null;
      this._unbindDestroyPanelRefs();
    }
  };

  /**
   * Renders a error lightbox with a generic message that can be overwriten in the args.
   * @param {Object} args The configurations for the lightbox.
   * @return {void}
   */
  BaseViewController.prototype.renderNotification = function (args) {
    var _args = args || {},
      classList = '',
      ERROR_MESSAGE = 'Oops! Something went wrong. Please try again.';

    if (typeof _args.classList === 'string') {
      classList += _args.classList;
    }

    this.renderOverlay({
      sTag: 'notification',
      sClassNames: classList,
      oStyles: {
        allDesktops: ['notification', 'fullScreen'],
        allDevices: ['notification', 'fullScreen']
      },
      sOverlayContent: _args.message || ERROR_MESSAGE,
      toDestroyOnClose: true,
      callback: _args.callback
    });
  };

  /**
   * Creates a tooltip and optionally renders and triggers it. This should be used on controllers
   *   and views, but not models (obviously).
   * @param {Object} oParamData The data and config to be passed to tooltip.
   * @return {Object} The tooltip view object.
   */
  BaseViewController.prototype.createTooltip = function (oParamData) {
    var _this = this;

    if (this._activePanel.tooltip
        && this._activePanel.tooltip.oElms.elTrigger === oParamData.elTrigger) {
      if (this._activePanel.tooltip.sTooltopMessage !== oParamData.sTooltopMessage) {
        this._activePanel.tooltip.updateContent(oParamData.sTooltopMessage);
      }

      return false;
    }

    /**
     * TooltipPanelView requires the BaseView, which requires the BaseClass so this needs to be
     * wrapped in a require otherwise requirejs gets into an infinite loop of requiring.
     */
    return require(['modules/pdp/views/TooltipPanelView'], function (TooltipPanelView) {
      var ERROR_MESSAGE = 'Oops! Something went wrong. Please try again.',
        sClassNames = '',
        toRender = oParamData.toRender || true,
        toOpen = oParamData.toOpen || true,
        oTooltip = {},
        tooltipMessage = oParamData.sTooltopMessage
            || (oParamData.sType === 'error' && ERROR_MESSAGE);

      if (oParamData.sType === 'error') {
        sClassNames = 'info-panel-tooltip-error';
      } else if (oParamData.sType === 'hover') {
        sClassNames = 'info-panel-tooltip-hover';
      }

      oTooltip = new TooltipPanelView({
        oStyles: _this.oTooltipStyles || {
          kiosk: ['tooltip-bottom'],
          allDesktops: ['tooltip-bottom'],
          allDevices: ['tooltip-bottom']
        },
        sTooltipType: oParamData.sType,
        sTooltopMessage: tooltipMessage,
        elTarget: oParamData.elTarget || $('body')[0],
        elTrigger: oParamData.elTrigger,
        oData: {
          sClassNames: sClassNames,
          aSubViews: [
            { render: tooltipMessage }
          ]
        },
        iSubViewCount: 1
      });

      if (toRender) {
        oTooltip.render();

        if (toOpen) {
          oTooltip.open();
          _this._activePanel.tooltip = oTooltip;

          if (oParamData.sType === 'error') {
            _this._bindDestroyPanelRefs();
          }
        }
      }

      return oTooltip;
    });
  };

  /**
   * Gets the data required to add to the overlay and calls the createOverlay method.
   * @param {Object} params The data required to get the overlay data and configure the overlay.
   * @param {Object} eventData The jQuery event object that triggered the overlay method.
   * @return {void}
   */
  BaseViewController.prototype.compileAndRenderOverlay = function (params, eventData) {
    var _this = this,
      _params = params,
      modelName = _params.modelName || $(eventData.currentTarget).data('mvc-model'),
      searchKey = _params.searchKey || $(eventData.currentTarget).data('mvc-key'),
      searchValue = _params.searchValue || $(eventData.currentTarget).data('mvc-value'),
      dataObject = null;

    if (!modelName) {
      if (this.oModel) {
        dataObject = this.oModel.get({
          sSearchKey: searchKey || 'id',
          mSearchValue: searchValue
        });

        if (this.isObject(dataObject, true)
            && dataObject.hasOwnProperty(_params.sProp)
            && dataObject[_params.sProp]) {
          _params.elTrigger = eventData.currentTarget;
          _params.sOverlayContent = _params.editContent
              ? _params.editContent(dataObject[_params.sProp])
              : dataObject[_params.sProp];
          this.renderOverlay(_params);
        }
      }
    } else {
      this.queryModel({
        sNamespace: modelName,
        sCommand: 'get',
        oQueryParams: {
          sSearchKey: searchKey || 'id',
          mSearchValue: searchValue
        }
      }).done(function (queryData) {
        if (_this.isObject(queryData, true)
            && queryData.hasOwnProperty(_params.sProp)
            && queryData[_params.sProp]) {
          _params.elTrigger = eventData.currentTarget;
          _params.sOverlayContent = _params.editContent
              ? _params.editContent(queryData[_params.sProp])
              : queryData[_params.sProp];
          _this.renderOverlay(_params);
        }
      });
    }
  };

  /**
   * Creates a overlay and optionally renders and triggers it. This should be used on controllers
   *   and views, but not models (obviously).
   * @param {Object} params The data and config to be passed to overlay.
   * @return {Object} The overlay group view object.
   */
  BaseViewController.prototype.renderOverlay = function (params) {
    var _this = this,
      activePanel = this._activePanel[params.sTag];

    if (activePanel) {
      if (activePanel.oElms.elTrigger === params.elTrigger || params.forceUpdateActive) {
        if (params.forceUpdateActive || (params.updateActive
            && activePanel.contentHash !== this.hashCode(params.sOverlayContent))) {
          activePanel.updateContent(params.sOverlayContent);

          if (params.sTitle) {
            activePanel.oElms.elTitle.innerHTML = params.sTitle;
            activePanel.oElms.elContentTitle.innerHTML = params.sTitle;
          }

          if (params.callback) {
            params.callback(activePanel.sSelector);
          }
        }

        return false;
      }
    }

    /**
     * Views require the BaseView, which requires the BaseClass so this needs to be
     * wrapped in a require otherwise requirejs gets into an infinite loop of requiring.
     */
    return require([
      'modules/pdp/views/OverlayPanelGroupView',
      'modules/pdp/views/OverlayPanelView'
    ], function (OverlayPanelGroupView, OverlayPanelView) {
      var toRender = params.toRender || true,
        toOpen = params.toOpen || true,
        toDestroyOnClose = params.toDestroyOnClose || false,
        _getPanelGroup = null,
        _createPanelGroup = null,
        _addPanel = null;

      _getPanelGroup = function (_params) {
        _this.setEvent({
          sName: 'getPanelGroup',
          tag: _params.sTag,
          callback: function (panelGroup) {
            if (!panelGroup) {
              _createPanelGroup(_params);
            } else {
              _addPanel(panelGroup, _params, {
                output: 'prepend',
                target: panelGroup.oElms.elWrapper,
                render: true
              });
            }
          }
        }, false, true);
      };

      _createPanelGroup = function (_params) {
        var panel = null,
          panelGroup = new OverlayPanelGroupView({
            oStyles: _params.oStyles || {
              kiosk: ['lightbox', 'fullScreen'],
              allDesktops: ['lightbox', 'fullScreen'],
              allDevices: ['lightbox', 'fullScreen']
            },
            sTag: _params.sTag || null,
            sViewName: _params.sTag
                ? 'OverlayPanelGroupView-' + _params.sTag
                : 'OverlayPanelGroupView',
            oData: {
              sClassNames: _params.sClassNames
            },
            elTarget: _params.elTarget || $('body')[0]
          });

        if (toDestroyOnClose) {
          panelGroup._panelGroupClosedHook = function (eventData) {
            this.destroy(eventData);
          };
          _this._bindDestroyPanelRefs();
        }

        panel = _addPanel(panelGroup, _params);

        if (toRender) {
          panelGroup.render();

          if (_params.callback) {
            _params.callback(panel.sSelector);
          }

          if (toOpen) {
            panel.open();
            _this._activePanel[_params.sTag] = panel;
          }
        }
      };

      _addPanel = function (panelGroup, _params, options) {
        var _options = options || {},
          panel = {};

        panel = panelGroup.createSubView({
          ViewClass: OverlayPanelView,
          mParamData: {
            sTag: _params.sTag || null,
            sViewName: _params.sTag
                ? 'OverlayPanelView-' + _params.sTag
                : 'OverlayPanelView',
            oStyles: _params.oStyles || {
              kiosk: ['lightbox', 'fullScreen'],
              allDesktops: ['lightbox', 'fullScreen'],
              allDevices: ['lightbox', 'fullScreen']
            },
            sOutput: _options.output,
            elTarget: _options.target,
            elTrigger: _params.elTrigger || null,
            sOverlayContent: _params.sOverlayContent || '',
            oData: {
              sTitle: _params.sTitle || null,
              sContentClasses: _params.sContentClasses,
              aSubViews: [
                { render: _params.sOverlayContent }
              ]
            },
            iSubViewCount: 1
          }
        });

        if (_options.render) {
          panel.render();

          if (_params.callback) {
            _params.callback(panel.sSelector);
          }

          if (toOpen) {
            panel.open();
            _this._activePanel[_params.sTag] = panel;
          }
        }

        return panel;
      };

      _getPanelGroup(params);
    });
  };

  /**
   * Method allows a view/controller to query a model without having scope of the model and
   * get the model to run a method and return the result back to the view/controller.
   * @param {Object} oParams The parameters to pass to the event and onto the model.
   * @return {Object} The deferred promise.
   */
  BaseViewController.prototype.queryModel = function (oParams) {
    var oDeferred = new $.Deferred();

    this.setEvent({
      sName: 'queryModel',
      sCommand: oParams.sCommand || null,
      sNamespace: oParams.sNamespace || null,
      oQueryParams: oParams.oQueryParams,
      oDeferred: oDeferred
    }, false, true);

    return oDeferred.promise();
  };

  return BaseViewController;
});
