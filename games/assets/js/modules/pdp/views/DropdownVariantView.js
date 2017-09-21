define('modules/pdp/views/DropdownVariantView', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/views/BaseView',
  'modules/custom-dropdown/oo-dropdown',
  'modules/tesco.analytics',
  'text!templates/views/dropdownVariantView.html'
], function ($, fn, BaseView, customDropdown, analytics, template) {
  'use strict';

  /**
   * The view class that renders the secondary variants.
   * @param {oConfig} oConfig The configuration for the view.
   * @return {void}
   */
  function DropdownVariantView(oConfig) {
    this.sViewName = 'DropdownVariantView';
    this.sNamespace = 'products';
    this.sTag = 'variants';
    this.sViewClass = 'dropdown-variant-view';
    this.sTemplate = template;
    this.parent.constructor.call(this, oConfig);
  }

  fn.inherit(DropdownVariantView, BaseView);

  DropdownVariantView._name = 'DropdownVariantView';
  DropdownVariantView.sNamespace = 'products';
  DropdownVariantView.sTag = 'variants';

  DropdownVariantView.prototype._setProps = function (data) {
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

  DropdownVariantView.prototype._setStates = function (data) {
    var opts = data.vm;

    if (!this.isObject(opts, true)) {
      return null;
    }

    return {
      inDropdown: opts.inDropdown,
      toDisplayOption: opts.toDisplayOption
    };
  };

  DropdownVariantView.prototype._cacheDomElms = function () {
    var $wrapper = null;

    this.parent._cacheDomElms.call(this);
    $wrapper = $(this.oElms.elWrapper);
    this.oElms.$select = $wrapper.find('select');
    this.oElms.$firstOption = this.oElms.$select.find('option:first');
  };

  DropdownVariantView.prototype._initDependancies = function () {
    var variantOpts = this.oData.mvc.vm;

    if (this.oElms.$select.length > 0) {
      if (this.oElms.$firstOption.text().toLowerCase().indexOf('select ') > 0) {
        this.oElms.$firstOption.text(this.oElms.$firstOption.text().toUpperCase());
      }

      this._dropdown = customDropdown.init(this.oElms.$select, {
        $container: $(this.oElms.elWrapper),
        defaultNativeWidth: true,
        hasSwatches: !!variantOpts.hasSwatches
      });
    }
  };

  DropdownVariantView.prototype.refresh = function (args) {
    var html = this.render({ mParamData: args.data }),
      node = $.parseHTML($.trim(html), document, true)[0],
      optionsHtml = node.getElementsByTagName('select')[0].innerHTML;

    this.oElms.$select.html(optionsHtml);
    this._cacheDomElms();

    if (this.isObject(this._dropdown, true)) {
      this._dropdown.update();
    }
  };

  DropdownVariantView.prototype._bindEvents = function () {
    var view = this.oData.mvc,
      flags = view.flags || {},
      $wrapper = null;

    $wrapper = $(this.oElms.elWrapper);

    if (flags.outfitBuilder) {
      $wrapper.on(
        'click', '.option', { view: view },
        this._analyticsTracking.bind(this)
      );
    }
  };

  DropdownVariantView.prototype._analyticsTracking = function (event) {
    var mvcData = event.data.view,
      flags = mvcData.flags,
      relationship = '',
      webMetrics = {},
      data = [];

    if (flags.outfitBuilder) {
      relationship = 'Outfit block';
    }

    if (relationship) {
      webMetrics = new analytics.WebMetrics();
      data = [{
        linkTrackEvents: 'event32, event45',
        linkTrackVars: 'prop19, eVar45, prop42, eVar59, events',
        products: ';' + mvcData.products.id + ';;',
        prop19: 'select size',
        eVar45: 'select size',
        prop42: 'pdp - ' + relationship + ' - select size',
        eVar59: 'pdp - ' + relationship + ' - select size',
        events: 'event32, event45'
      }];

      webMetrics.submit(data);
    }
  };

  return DropdownVariantView;
});
