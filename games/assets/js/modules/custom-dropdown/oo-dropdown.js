define([
  'domlib',
  'modules/common',
  'mustache'
], function ($, common, mustache) {
  'use strict';

  var customDropdown = {};

  /**
   * The custom dropdown class.
   * @return {void}
   */
  function CustomDropdown() {
    var $template = $('#custom-dropdown-template');

    this.id = Math.floor(Math.random() * 1000000000);

    // store the event type (updated in init for touch devices)
    this.eventType = 'click';

    // used by the mouse enter/leave events to set a timer to close any
    // open menus if left inactive
    this.closeTimer = null;

    // defaults
    this.defaultSettings = {
      wrapperClass: 'select-wrapper',
      dropdownClass: 'dropdown-customised',
      controlClass: 'control',
      template: $template.length > 0 && $template[0].innerHTML,
      clearSelected: false,
      defaultNativeWidth: false,
      renderedCallback: null,
      overrideDefaultTouch: false,
      overrideTimer: false,
      hasSwatches: false
    };

    if ($template.length === 0) {
      return false;
    }
  }

  customDropdown.instances = [];
  customDropdown.openInstance = null;
  customDropdown.init = function ($select, opts) {
    var $selectCopy = $select,
      self = {},
      ua = '';

    if ($selectCopy.hasClass('been-customised')) {
      return false;
    }

    self = new CustomDropdown();

    if (!self) {
      return false;
    }

    self.isTouch = opts.overrideDefaultTouch ? false : common.isTouch();

    /**
     * update the event type (default is click -
     * click too slow on windows phone, tap not recognised)
     */
    if (self.isTouch) {
      self.eventType = (common.isWindowsPhone()) ? 'MSPointerDown' : 'click.customDropdown';

      /*
       * add fix for earlier version of Android (2.x)
       * issue - tap on the $dropdown.find('.control') element is returning the select element
       * this fix is only required for Android (2.x) - applying the fix to Android 4.x will
       * cause it to break (oh joy!)
       */
      if (common.isAndroid()) {
        ua = navigator.userAgent.toLowerCase();

        if (parseFloat(ua.slice(ua.indexOf('android') + 8)) < 4) {
          $selectCopy.css('z-index', 0);
        }
      }
    }

    if ($selectCopy.length > 0 && opts && typeof opts === 'object' && !Array.isArray(opts)) {
      self.settings = $.extend({}, self.defaultSettings, opts);
    }

    self.setup($selectCopy);

    customDropdown.instances.push(self);

    return self;
  };

  CustomDropdown.prototype = {
    constructor: CustomDropdown,
    setup: function ($select) {
      var $options = null,
        $selectedOpt = null;

      if (!$select[0] instanceof Element) {
        return;
      }

      $options = $select.find('option');
      $selectedOpt = $select.find('option:selected');

      if (this.settings.clearSelected) {
        $selectedOpt.removeAttr('selected');
      }

      if (this.isTouch && !window.isKiosk()) {
        $select.addClass('native-select-trigger');
      }

      this.createMenu({
        $select: $select,
        $options: $options,
        $selectedOpt: this.settings.clearSelected ? null : $selectedOpt
      });

      if (this.settings.renderedCallback) {
        this.settings.renderedCallback(this.elms.$dropdown, $selectedOpt);
      }
    },
    createMenu: function (args) {
      var data = this.collateOptionsData({
        $select: args.$select,
        $options: args.$options,
        $selectedOpt: args.$selectedOpt
      });

      this.renderDropdown({
        data: data,
        $select: args.$select
      });
      this.cacheDomElms();
      this.bindEvents();
    },
    collateOptionsData: function (elms, opts) {
      var _opts = opts || {},
        i = 0,
        data = {},
        selectedValue = '',
        $opt = null,
        opt = {};

      /**
       * Creates a string of data attributes and their values/
       * @param {Object} args The option node to iterate over.
       * @return {String} The string of data attributes.
       */
      function getDataAttr(args) {
        var dataAttr = args.$opt.data(),
          prop = '',
          attrStr = '';

        if ($.isEmptyObject(dataAttr)) {
          return null;
        }

        for (prop in dataAttr) {
          if (dataAttr.hasOwnProperty(prop)) {
            attrStr += ' data-' + prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
                + '="' + dataAttr[prop] + '"';
          }
        }

        return attrStr;
      }

      selectedValue = elms.$selectedOpt.val();
      data.label = elms.$select[0].id;
      data.selectedText = elms.$selectedOpt.text().trim();
      data.selectedSwatch = elms.$selectedOpt.data('swatch-url') || '';
      data.selectedAttr = getDataAttr({ $opt: elms.$selectedOpt });
      data.options = [];

      if (_opts.control) {
        return data;
      }

      for (i = 0; i < elms.$options.length; i += 1) {
        $opt = $(elms.$options[i]);
        opt = {};
        opt.value = elms.$options[i].value;
        opt.innerHTML = elms.$options[i].innerHTML;
        opt.currentClass = $opt.val() === selectedValue ? 'current' : '';
        opt.disabled = elms.$options[i].disabled ? 'disabled' : '';
        opt.swatch = $opt.data('swatch-url') || '';
        opt.dataAttr = getDataAttr({ $opt: $opt });

        data.options.push(opt);
      }

      return data;
    },
    renderDropdown: function (args) {
      var html = mustache.render(this.settings.template, $.extend(true, this.settings, args.data)),
        node = $.parseHTML($.trim(html), document, true)[0];

      $(node).insertAfter(args.$select);
      args.$select.addClass('been-customised');
    },
    cacheDomElms: function () {
      var $container = this.settings.$container;

      if ($container.length === 0) {
        return;
      }

      this.elms = {
        $wrapper: $container.find('.' + this.settings.wrapperClass),
        $dropdown: $container.find('.' + this.settings.dropdownClass),
        $control: $container.find('.' + this.settings.controlClass),
        $dropdownList: $container.find('ul'),
        $dropdownLinks: $container.find('a.option'),
        $currentDropdownLink: $container.find('a.option.current'),
        $innerText: $container.find('.innerText'),
        $additionalText: $container.find('.additionalText'),
        $select: $container.find('select'),
        $options: $container.find('option'),
        $selectedOpt: $container.find('option:selected')
      };
    },
    bindEvents: function () {
      if (!this.isTouch || window.isKiosk()) {
        this.elms.$dropdown.on(this.eventType, 'a.control', this.handleControlClick.bind(this));
        this.elms.$dropdown.on(this.eventType, 'a.option', this.handleDropdownLinkClick.bind(this));
      }

      this.elms.$select.on('change', this.changeControlText.bind(this));
    },
    handleBodyClick: function (event) {
      var $targetDropdown = null,
        $openDropdown = null;

      if (!customDropdown.openInstance) {
        return;
      }

      $openDropdown = customDropdown.openInstance.elms.$dropdown;

      if (event.target === $openDropdown[0]) {
        return;
      }

      $targetDropdown = $(event.target).closest('.' + this.settings.dropdownClass);

      if ($targetDropdown.length && $targetDropdown[0] === $openDropdown[0]) {
        return;
      }

      customDropdown.openInstance.close();
    },
    handleControlClick: function () {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },
    open: function () {
      var i = 0,
        dropdowns = [];

      this.isOpening = true;
      this.elms.$dropdown.addClass('open');
      this.elms.$control.addClass('active');
      this.elms.$wrapper.addClass('open');

      $('body').on('click.' + this.id, this.handleBodyClick.bind(this));

      if (!this.settings.overrideTimer) {
        this.elms.$dropdown.on(
          'mouseenter', this.closeTimerClear.bind(this)
        ).on(
          'mouseleave', this.closeTimerStart.bind(this)
        );
      }

      dropdowns = customDropdown.instances;

      for (i = 0; i < dropdowns.length; i += 1) {
        if (!dropdowns[i].isOpening) {
          if (dropdowns[i].isOpen) {
            dropdowns[i].close();
          }
        }
      }

      customDropdown.openInstance = this;

      this.isOpen = true;
      this.isOpening = false;
    },
    close: function () {
      $('body').off('click.' + this.id);

      if (!this.settings.overrideTimer) {
        this.elms.$dropdown.off('mouseenter').off('mouseleave');
      }

      this.elms.$wrapper.removeClass('open');
      this.elms.$dropdown.removeClass('open');
      this.elms.$control.removeClass('active');
      this.elms.$select.trigger('blur');
      this.isOpen = false;
    },
    handleDropdownLinkClick: function (event) {
      if ($(event.currentTarget).attr('data-disabled') === 'disabled') {
        return;
      }

      this.select(event);
    },
    select: function (event) {
      var value = '';

      if (event.currentTarget === this.elms.$currentDropdownLink[0]) {
        return;
      }

      this.elms.$currentDropdownLink.removeClass('current');
      this.elms.$currentDropdownLink = $(event.currentTarget);
      this.elms.$currentDropdownLink.addClass('current');
      value = this.elms.$currentDropdownLink.attr('data-value');

      this.elms.$selectedOpt.removeAttr('selected');
      this.elms.$selectedOpt = this.elms.$options.filter('[value="' + value + '"]');
      this.elms.$selectedOpt.attr('selected', 'selected');

      this.elms.$select[0].selectedIndex = this.elms.$options.index(this.elms.$selectedOpt);
      this.elms.$select.val(value).trigger('change');

      this.close();
    },
    changeControlText: function () {
      var snippet = '<a class="{{controlClass}} block-link" {{{selectedAttr}}}>'
          + '{{#selectedSwatch}}'
            + '<img src="{{selectedSwatch}}">'
          + '{{/selectedSwatch}}'
          + '<span class="innerText">{{selectedText}}</span>'
          + '<span class="additionalText">{{additionalText}}</span>'
        + '</a>',
        data = this.collateOptionsData({
          $select: this.elms.$select,
          $options: this.elms.$select.find('option'),
          $selectedOpt: this.elms.$select.find('option:selected')
        }, { control: true });

      this.elms.$control[0].outerHTML = mustache.render(
        snippet, $.extend(true, this.settings, data)
      );
      this.elms.$control = this.elms.$dropdown.find('.' + this.settings.controlClass);
      this.elms.$innerText = this.elms.$control.find('.innerText');
      this.elms.$additionalText = this.elms.$control.find('.additionalText');
    },
    closeTimerClear: function () {
      window.clearTimeout(this.closeTimer);
    },
    closeTimerStart: function () {
      var _this = this;

      this.closeTimer = window.setTimeout(function () {
        _this.close();
      }, 10000);
    },
    update: function () {
      this.updateDropdown({ data: this.collateOptionsData({
        $select: this.elms.$select,
        $options: this.elms.$select.find('option'),
        $selectedOpt: this.elms.$select.find('option:selected')
      }) });
    },
    updateDropdown: function (args) {
      var html = mustache.render(this.settings.template, $.extend(true, this.settings, args.data)),
        node = $.parseHTML($.trim(html), document, true)[0];

      this.elms.$dropdownList[0].innerHTML = $(node).find('ul')[0].innerHTML;
      this.elms.$dropdownLinks = this.elms.$dropdownList.find('a.option');
      this.elms.$currentDropdownLink = this.elms.$dropdownList.find('a.option.current');
      this.elms.$options = this.elms.$select.find('option');
      this.elms.$selectedOpt = this.elms.$select.find('option:selected');
    }
  };

  return customDropdown;
});
