define('modules/pdp/controllers/InlineContentController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController',
  'modules/pdp/views/InlineContentView'
], function ($, fn, BaseController, InlineContentView) {
  'use strict';

  /**
   *
   * @param {Array<Object>} models
   * @return {void}
   */
  function InlineContentController(models) {
    this.sNamespace = 'sku';
    this.sTag = 'inlineContent';
    this.views = { classes: { InlineContentView: InlineContentView } };
    this.parent.constructor.call(this, models);
  }


  fn.inherit(InlineContentController, BaseController);
  InlineContentController.modelNames = ['sku'];


  /**
   *
   * @param {Object} args
   * @param {JQueryDeferred} args.deferred
   * @param {Object} args.mParamData
   * @param {Object} args.mParamData.mvc
   * @return {void}
   */
  InlineContentController.prototype._collateDataDependancies = function (args) {
    var _args = args,
      inlineMedia = {},
      masterDeferred = _args.deferred,
      mvcData = fn.getValue(_args, 'mParamData', 'mvc'),
      renderSource = '',
      skuData = null,
      skuModel = this.models.sku,
      viewModel = null;

    /**
     *
     * @param {Object} vm
     * @return {void}
     */
    function setDataAndResolve(vm) {
      _args.mParamData.mvc.viewModel = vm;
      masterDeferred.resolve(_args);
    }

    if (!fn.isObject(mvcData, { notEmpty: true })) {
      masterDeferred.reject();
      return;
    }

    skuData = mvcData.sku;
    viewModel = mvcData.viewModel;

    if (!fn.checkData(skuData) || !fn.isObject(viewModel, { notEmpty: true })) {
      masterDeferred.reject();
      return;
    }

    inlineMedia = skuModel.getSkuMedia(skuData, 'mediaType', 'Inline')[0] || {};

    if (!inlineMedia.src || !inlineMedia.renderSource) {
      masterDeferred.reject();
      return;
    }

    renderSource = inlineMedia.src.indexOf('webcollage') !== -1
        ? 'webcollage' : inlineMedia.renderSource;
    viewModel.renderSource = renderSource;

    if (renderSource === 'CMS' || renderSource === 'webcollage') {
      this._fetchContent(inlineMedia.src, renderSource === 'CMS' ? 'html' : 'script')
        .done(function handleFetchSuccess(content) {
          if (renderSource === 'CMS') {
            if (!content) {
              masterDeferred.reject();
            }
            viewModel.cmsContent = content;
          } else {
            viewModel.hasExternalScript = true;
          }

          setDataAndResolve(viewModel);
        })
        .fail(function handleFetchFailure() {
          masterDeferred.reject();
        });
    } else {
      viewModel.hasExternalScript = !!inlineMedia.src;
      viewModel.externalScript = inlineMedia.src;
      setDataAndResolve(viewModel);
    }
  };


  /**
   *
   * @param {String} url
   * @param {String} dataType
   * @return {JQueryPromise}
   */
  InlineContentController.prototype._fetchContent = function (url, dataType) {
    var deferred = $.Deferred();

    /**
     *
     * @param {Object} jqXHR
     * @param {Object} settings
     * @param {string} settings.url
     * @return {void}
     */
    function addURL(jqXHR, settings) {
      var _settings = settings;

      _settings.url = url;
    }

    $.ajax({ beforeSend: addURL, crossDomain: true, dataType: dataType })
      .done(function contentFetchSuccess(content) {
        deferred.resolve(content);
      })
      .fail(function cmsContentFetchFailure(errorResp) {
        deferred.reject(errorResp);
      });

    return deferred.promise();
  };


  return InlineContentController;
});
