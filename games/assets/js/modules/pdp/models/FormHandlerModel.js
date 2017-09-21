define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn'),
    FormHandler = require('modules/pdp/data-stores/FormHandler'),
    BaseModel = require('modules/pdp/models/BaseModel');

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function FormHandlerModel(config) {
    this.parent.constructor.call(this, config);
    this.DataStoreClass = FormHandler;
    this.sNamespace = 'formHandler';
    this._inputRegex = function (prop) {
      return new RegExp('^(?!_D:).*(' + prop + ')$');
    };
    this._setFormTemplates();
  }

  fn.inherit(FormHandlerModel, BaseModel);

  /**
   *
   * @param {Element} form
   * @return {Object}
   */
  FormHandlerModel.prototype._getAttrKeyValues = function (form) {
    var data = {};

    fn.loopArray(form.attributes, function (i) {
      data[form.attributes[i].name] = form.attributes[i].value;
    });

    return data;
  };

  /**
   *
   * @param {string} name
   * @param {string} publicLink
   * @return {Object}
   */
  FormHandlerModel.prototype._getFormTemplate = function (name, publicLink) {
    var clone = this.formTemplates[name];

    clone.action = this._replacePlaceholder(clone.action, 'publicLink', publicLink);
    return clone;
  };

  /**
   *
   * @param {string} key
   * @return {string|null}
   */
  FormHandlerModel.prototype.getInputKeySuffix = function (key) {
    var match = key.match(/^(?!_D:).*\.(.*)$/);

    if (!match) return null;
    return match[1];
  };

  /**
   *
   * @param {Element} $inputs
   * @return {Object}
   */
  FormHandlerModel.prototype._getInputKeyValues = function ($inputs) {
    var data = {};

    fn.loopArray($inputs, function (i) {
      data[$inputs[i].name] = $inputs[i].value;
    });

    return data;
  };

  /**
   *
   * @param {string} target
   * @param {string} placeholder
   * @param {string} value
   * @return {string}
   */
  FormHandlerModel.prototype._replacePlaceholder = function (target, placeholder, value) {
    var regex = new RegExp('{' + placeholder + '}');

    return target.replace(regex, value);
  };

  /**
   *
   * @return {void}
   */
  FormHandlerModel.prototype._setFormTemplates = function () {
    this.formTemplates = {
      addToBasket: {
        id: 'addToBasket',
        name: '',
        method: 'post',
        action: '{publicLink}?_DARGS=/blocks/catalog/productdetailv2/multipleAddToBasketForms.jsp',
        oData: {
          _dyncharset: 'UTF-8',
          '': '-421045239635327304',
          '/atg/commerce/order/purchase/CartModifierFormHandler.catalogRefIds': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.catalogRefIds': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.productId': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.productId': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.skuId': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.skuId': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.personalisedGUID': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.personalisedGUID': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.personalisedImageURL': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.personalisedImageURL': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrderSuccessURL': '/direct/blocks/catalog/productdetailv2/addToBasketResponse.jsp',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrderSuccessURL': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrderErrorURL': '/direct/blocks/catalog/productdetailv2/addToBasketResponse.jsp',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.addItemToOrderErrorURL': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.quantity': '1',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.quantity': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.schoolId': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.schoolId': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.schoolName': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.schoolName': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.schoolLogoRef': '',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.schoolLogoRef': ' ',
          '/atg/commerce/order/purchase/CartModifierFormHandler.addProductAndServices': 'submit',
          '_D:/atg/commerce/order/purchase/CartModifierFormHandler.addProductAndServices': ' ',
          _DARGS: '/blocks/catalog/productdetailv2/multipleAddToBasketForms.jsp'
        }
      }
    };
  };

  /**
   *
   * @param {Object} args
   * @return {string}
   */
  FormHandlerModel.prototype._updateRegexHook = function (args) {
    var property = '';

    fn.loopObject.call(this, args.oData, function loopData(prop) {
      if (prop.match(this._inputRegex(args.sProp))) {
        property = prop;
      }
    });

    return property;
  };

  /**
   *
   * @param {string} data
   * @return {Object}
   */
  FormHandlerModel.prototype.add = function (data) {
    var _data = data;

    if (typeof _data === 'string') {
      _data = this.serialize(_data);
    }

    return this.parent.add.call(this, _data);
  };

  /**
   *
   * @param {Object} args
   * @param {Object} options
   * @return {Object}
   */
  FormHandlerModel.prototype.clone = function (args, options) {
    var _args = args || {},
      _options = options || {},
      clone = null,
      component = _args.component,
      config = _args.config,
      inputs = {},
      name = _args.name,
      publicLink = _args.publicLink;

    if (typeof name !== 'string' && typeof component !== 'string'
        && typeof publicLink !== 'string') {
      return null;
    }

    clone = this._getFormTemplate(name, publicLink);

    if (!fn.isObject(clone, { notEmpty: true })) {
      return null;
    }

    inputs = clone.oData;

    fn.loopArray.call(this, config, function loopData(i) {
      if (fn.isObject(config[i]) && typeof config[i].key === 'string'
          && (config[i].value === undefined || typeof config[i].value === 'string')) {
        inputs = this.setInputValue(inputs, config[i].key, config[i].value, config[i].action);
      }
    }, { check: true });

    // Below swaps id and name values because they are returned the wrong way round in the
    // formhandler and swapped back when the form is added to the model. This is because of the
    // way ATG uses id for forms (generic per form type) and the way the frontend uses id (unique).
    // -- Dylan Aubrey (so24) 06/09/2016
    clone.name = component + '-' + this.createUniqueId();
    clone.oData = inputs;

    if (_options.add) {
      return this.add(clone);
    }

    return clone;
  };

  /**
   *
   * @param {Object} inputs
   * @param {string} suffix
   * @return {string}
   */
  FormHandlerModel.prototype.getInputValue = function (inputs, suffix) {
    var inputValue = '';

    fn.loopObject.call(this, inputs, function loopInputs(name) {
      if (name.match(this._inputRegex(suffix))) {
        inputValue = inputs[name];
      }
    });

    return inputValue;
  };

  /**
   *
   * @param {Element|string} value
   * @return {Object}
   */
  FormHandlerModel.prototype.serialize = function (value) {
    var data = null,
      form = typeof value === 'string' ? $(value)[0] : value,
      $inputs = $(form).find('input');

    data = this._getAttrKeyValues(form);
    data.oData = {};
    fn.mergeObjects(data.oData, this._getInputKeyValues($inputs), { extend: true });
    return data;
  };

  /**
   *
   * @param {Object} inputs
   * @param {string} suffix
   * @param {string} value
   * @param {string} action
   * @return {Object}
   */
  FormHandlerModel.prototype.setInputValue = function (inputs, suffix, value, action) {
    var _inputs = inputs;

    fn.loopObject.call(this, _inputs, function loopInputs(name) {
      if (name.match(this._inputRegex(suffix))) {
        if (action === 'append') {
          _inputs[name] += value;
        } else {
          _inputs[name] = value || '';
        }
      }
    });

    return _inputs;
  };

  module.exports = FormHandlerModel;
});
