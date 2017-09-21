define('modules/pdp/views/AuthorBiographyView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/show-more/ShowMore'
], function ($, fn, BaseView, ShowMore) {
  'use strict';

  /**
   * The view class that renders the author biography.
   * @param {Object} config The configuration for the view.
   * @return {void}
   */
  function AuthorBiographyView(config) {
    var template = config.sTemplate || '#author-biography-view-template',
      $tmplScript = $(template);

    this.sViewName = 'AuthorBiographyView';
    this.sNamespace = 'sku';
    this.sTag = 'authorBiography';
    this.sViewClass = 'author-biography-view';
    this.sTemplate = $tmplScript.length > 0 ? $tmplScript[0].innerHTML : '';
    this.parent.constructor.call(this, config);
  }

  fn.inherit(AuthorBiographyView, BaseView);

  AuthorBiographyView._name = 'AuthorBiographyView';
  AuthorBiographyView.sNamespace = 'sku';
  AuthorBiographyView.sTag = 'authorBiography';

  AuthorBiographyView.prototype._setProps = function (data) {
    var bookDetails = {};

    if (fn.isObject(data.sku) && fn.isObject(data.sku.bookDetails)) {
      bookDetails = data.sku.bookDetails;
    }

    return {
      authorBiography: bookDetails.authorBiography
    };
  };

  AuthorBiographyView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.biographyContent = $wrapper.find('div.block-content')[0];
  };

  AuthorBiographyView.prototype._initDependancies = function () {
    var _this = this;

    if (this.oData.mvc.flags.onProductPage) {
      setTimeout(function () {
        _this.showMore = new ShowMore({
          selector: _this.oElms.elWrapper,
          height: 400
        });

        _this.showMore.fnInit();
      }, 100);
    }
  };

  AuthorBiographyView.prototype.refresh = function (args) {
    var data = args.mParamData.mvc,
      $node = $(this.parseHtml(
        { html: this.render({ mParamData: { mvc: data } }), trim: true }
      ));

    fn.refreshElement(
      this.oElms.biographyContent,
      $node.find('div.block-content')[0]
    );

    if (this.showMore) {
      this.showMore.toggleInit();
    }
  };

  return AuthorBiographyView;
});
