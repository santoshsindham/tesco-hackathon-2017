define('modules/pdp/views/SellerSummariesView', [
  'domlib',
  'mustache',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/pdp/views/SellerSummaryView',
  'modules/pdp/views/BuyboxContentView',
  'modules/pdp/views/BuyboxPanelGroupView',
  'modules/pdp/views/BuyboxPanelView'
], function (
  $,
  mustache,
  fn,
  BaseView,
  SellerSummaryView,
  BuyboxContentView,
  BuyboxPanelGroupView,
  BuyboxPanelView
) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function SellerSummariesView(config) {
    this.sNamespace = 'sellers';
    this.sTag = 'buybox';
    this.sViewName = 'SellerSummariesView';
    this.sViewClass = 'seller-summaries-view';
    this.sTemplate = $('#seller-summaries-view-template')[0].innerHTML;
    this.views = {
      classes: {
        SellerSummaryView: SellerSummaryView
      }
    };
    this.parent.constructor.call(this, config);
  }

  fn.inherit(SellerSummariesView, BaseView);
  SellerSummariesView._name = 'SellerSummariesView';
  SellerSummariesView.sNamespace = 'sellers';
  SellerSummariesView.sTag = 'buybox';

  SellerSummariesView.prototype._addSubViews = function () {
    var setPosition = function (i) {
      if (!this.oData.mvc.sellers[i].custom) {
        this.oData.mvc.sellers[i].custom = {};
      }
      this.oData.mvc.sellers[i].custom.position = i + 1;
    };

    this.forLoop(this.oData.mvc.sellers, function (i) {
      setPosition.call(this, i);

      this.oData.aSubViews.push(
        this._compileSubView({ _class: SellerSummaryView, range: i })
      );
      this.iSubViewCount += 1;
    });
  };

  SellerSummariesView.prototype.refresh = function (params) {
    var _params = params,
      setPosition = function (i) {
        if (!this.oData.mvc.sellers[i].custom) {
          this.oData.mvc.sellers[i].custom = {};
        }
        this.oData.mvc.sellers[i].custom.position = i + 1;
      };

    this.oData.mvc = _params.mParamData.mvc;

    this.forLoop(this.oData.aSubViews, function (i) {
      setPosition.call(this, i);

      this.oData.aSubViews[i].render({
        sourceOutput: 'inner',
        sOutput: 'inner',
        elTarget: 'self',
        mParamData: this._compileSubView({
          _class: SellerSummaryView,
          range: i,
          returnData: true
        })
      });
    });
  };

  SellerSummariesView.prototype._initDependancies = function () {
    if (this.isArray(this.oData.aSubViews, true)) {
      this._getBuyboxPanelGroup();
    }
  };

  SellerSummariesView.prototype._getBuyboxPanelGroup = function () {
    var _this = this;

    this.setEvent({
      sName: 'getPanelGroup',
      tag: 'buybox',
      callback: function (panelGroup) {
        if (!panelGroup) {
          _this._createBuyboxPanels();
        } else {
          _this._addBuyboxPanels(panelGroup, {
            output: 'prepend',
            target: panelGroup.oElms.elWrapper,
            render: true
          });
        }
      }
    }, false, true);
  };

  SellerSummariesView.prototype._createBuyboxPanels = function () {
    var panelGroup = new BuyboxPanelGroupView({
      sTag: 'buybox',
      elTarget: '.buybox-wrapper'
    });

    this._addBuyboxPanels(panelGroup);
    panelGroup.render();
  };

  SellerSummariesView.prototype._addBuyboxPanels = function (panelGroup, options) {
    var _options = options || {},
      buyboxContentView = {},
      panel = {};

    this.forLoop(this.oData.aSubViews, function (i) {
      buyboxContentView = this._compileSubView({
        _class: BuyboxContentView,
        index: this.oData.aSubViews[i].oData.mvc.sellers
      });

      panel = panelGroup.createSubView({
        ViewClass: BuyboxPanelView,
        mParamData: {
          sOutput: _options.output,
          elTarget: _options.target,
          elTrigger: this.oData.aSubViews[i].sSelector,
          oData: {
            sClassNames: 'info-panel-secondary-buybox',
            sTitle: mustache.render(
              'Buy from <strong>{{name}}</strong>',
              buyboxContentView.oData.mvc.sellers
            ),
            aSubViews: [
              buyboxContentView
            ]
          },
          iSubViewCount: 1
        }
      });

      if (_options.render) {
        panel.render();
      }
    });
  };

  return SellerSummariesView;
});
