define('modules/pdp/views/SwatchVariantView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/custom-dropdown/oo-dropdown',
  'text!templates/views/swatchVariantView.html'
], function ($, fn, BaseView, customDropdown, template) {
  'use strict';

  /**
   * The view class that renders the color variants.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function SwatchVariantView(oConfig) {
    this.sViewName = 'SwatchVariantView';
    this.sNamespace = 'products';
    this.sTag = 'variants';
    this.sViewClass = 'swatch-variant-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(SwatchVariantView, BaseView);

  SwatchVariantView._name = 'SwatchVariantView';
  SwatchVariantView.sNamespace = 'products';
  SwatchVariantView.sTag = 'variants';

  SwatchVariantView.prototype._setProps = function (data) {
    var opts = data.vm;

    if (!this.isObject(opts, true)) {
      return null;
    }

    this.forLoop(opts.links, function loopLinks(i) {
      opts.links[i].value = opts.links[i].options[opts.type];
      opts.links[i].swatch = opts.links[i].options.swatch;
    });

    return {
      internalName: opts.internalName,
      links: opts.links,
      name: opts.name,
      productID: data.products.id,
      selectedValue: opts.selectedValue,
      type: opts.type
    };
  };

  SwatchVariantView.prototype._setStates = function (data) {
    var opts = data.vm;

    if (!this.isObject(opts, true)) {
      return null;
    }

    return {
      inDropdown: opts.inDropdown,
      toDisplayOption: opts.toDisplayOption
    };
  };

  SwatchVariantView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.$swatchInfo = $wrapper.find('.swatch-variant-information');
    this.oElms.$swatchLinksList = $wrapper.find('.swatch-variant');
    this.oElms.$mobileSwatch = $wrapper.find('.swatch-variant-mobile');
    this.oElms.$mobileSelect = $wrapper.find('select');
  };

  SwatchVariantView.prototype._initDependancies = function () {
    if (this.oElms.$mobileSelect.length > 0) {
      this._dropdown = customDropdown.init(this.oElms.$mobileSelect, {
        $container: $(this.oElms.$mobileSwatch),
        defaultNativeWidth: true,
        overrideDefaultTouch: true,
        overrideTimer: true,
        additionalText: 'View all colours'
      });
    }
  };

  SwatchVariantView.prototype.refresh = function (args) {
    var html = this.render({ mParamData: args.data }),
      node = $.parseHTML($.trim(html), document, true)[0],
      onUpdateInventory = this.isObject(args.data.mvc.flags, true)
          && args.data.mvc.flags.onUpdateInventory;

    if (!onUpdateInventory) {
      this.oElms.$swatchInfo[0].innerHTML = node.querySelectorAll(
        '.swatch-variant-information'
      )[0].innerHTML;

      this.oElms.$swatchLinksList[0].innerHTML = node.querySelectorAll(
        '.swatch-variant'
      )[0].innerHTML;
    }

    this.oElms.$select[0].innerHTML = node.getElementsByTagName('select')[0].innerHTML;

    this._cacheDomElms();

    if (this.isObject(this._dropdown, true)) {
      this._dropdown.update();
    }
  };

  return SwatchVariantView;
});
