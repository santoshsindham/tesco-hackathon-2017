define('modules/pdp/views/InlineContentView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/show-more/ShowMore',
  'text!templates/views/inlineContentView.html'
], function ($, fn, BaseView, ShowMore, template) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function InlineContentView(config) {
    this.sViewName = 'InlineContentView';
    this.sNamespace = 'sku';
    this.sTag = 'inlineContent';
    this.sViewClass = 'inline-content-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, config);
  }


  fn.inherit(InlineContentView, BaseView);
  InlineContentView._name = 'InlineContentView';
  InlineContentView.sNamespace = 'sku';
  InlineContentView.sTag = 'inlineContent';


  /**
   *
   * @param {Object} data
   * @param {Object} data.viewModel
   * @return {Object}
   */
  InlineContentView.prototype._setProps = function (data) {
    var viewModel = data.viewModel,
      externalScript = viewModel.externalScript;

    if (!fn.isObject(viewModel, { notEmpty: true })) {
      return {};
    }

    return {
      cmsContent: viewModel.cmsContent,
      externalScript: externalScript && '<script type="text/javascript" src="'
          + externalScript + '"></script>',
      title: viewModel.title
    };
  };


  /**
   *
   * @param {Object} data
   * @param {Object} data.viewModel
   * @return {Object}
   */
  InlineContentView.prototype._setStates = function (data) {
    var viewModel = data.viewModel;

    if (!fn.isObject(viewModel, { notEmpty: true })) {
      return {};
    }

    return {
      hasCmsContent: !!viewModel.cmsContent,
      hasExternalScript: viewModel.hasExternalScript
    };
  };


  /**
   *
   * @return {void}
   */
  InlineContentView.prototype._initDependancies = function () {
    var mvcData = this.oData.mvc,
      renderSource = mvcData.viewModel.renderSource,
      skuID = mvcData.sku.id,
      showMore = {},
      _this = this;

    if (renderSource === 'webcollage'
        && typeof fn.getValue(window.Webcollage, 'loadContent') === 'function') {
      window.Webcollage.loadContent('tescodirect-uk', skuID);
    }

    setTimeout(function () {
      showMore = new ShowMore({
        height: 700,
        selector: _this.oElms.elWrapper,
        subtreeListener: true
      });

      window.picturefill();
      showMore.fnInit();
    }, 100);
  };


  return InlineContentView;
});
