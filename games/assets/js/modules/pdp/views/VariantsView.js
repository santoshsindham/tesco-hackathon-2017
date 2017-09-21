define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    BaseView = require('modules/pdp/views/BaseView'),
    SwatchVariantView = require('modules/pdp/views/SwatchVariantView'),
    DropdownVariantView = require('modules/pdp/views/DropdownVariantView'),
    template = require('text!templates/views/variantsView.html');

  /**
   * The view class that renders the variants.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function VariantsView(oConfig) {
    this.sNamespace = 'products';
    this.sTag = oConfig.sTag || 'variants';
    this.sViewName = 'VariantsView';
    this.sViewClass = oConfig.sViewClass || 'variants-view';
    this.sTemplate = template;
    this.sOutput = 'inner';
    this.views = {
      classes: {
        SwatchVariantView: SwatchVariantView,
        DropdownVariantView: DropdownVariantView
      }
    };
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(VariantsView, BaseView);

  VariantsView._name = 'VariantsView';
  VariantsView.sNamespace = 'products';
  VariantsView.sTag = 'variants';

  VariantsView.prototype._addSubViews = function () {
    var hidePrimary = this.oData.mvc.flags.hidePrimaryVariant,
      options = this.oData.mvc.vm;

    this.forInLoop(options, function loopOptions(prop) {
      if (this.isObject(options[prop], true)) {
        if ((prop === 'primary' && !hidePrimary) || prop === 'secondary') {
          if (options[prop].hasSwatches) {
            this.oData.aSubViews.push(
              this._compileSubView({
                _class: this.views.classes.SwatchVariantView,
                dataCallback: function filterOptionsData(mvcData) {
                  var _mvcData = mvcData;

                  _mvcData.vm = _mvcData.vm[prop];
                  return _mvcData;
                }
              })
            );
          } else {
            this.oData.aSubViews.push(
              this._compileSubView({
                _class: this.views.classes.DropdownVariantView,
                dataCallback: function filterOptionsData(mvcData) {
                  var _mvcData = mvcData;

                  _mvcData.vm = _mvcData.vm[prop];
                  return _mvcData;
                }
              })
            );
          }
        }
      }
    });
  };

  VariantsView.prototype.refresh = function (args) {
    var subviews = this.oData.aSubViews,
      variantOptions = args.data.mvc.vm;

    fn.loopArray(subviews, function loopViews(i) {
      var subview = subviews[i],
        subviewData = subview.oData;

      subviewData.mvc.vm = variantOptions[subviewData.mvc.vm.type];
      subview.refresh({ data: subviewData });
    });
  };

  module.exports = VariantsView;
});
