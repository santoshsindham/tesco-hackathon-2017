define('modules/pdp/controllers/FormHandlerController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/BaseController'
], function ($, fn, BaseController) {
  'use strict';

  /**
   *
   * @param {Array<Object>|Object} models
   * @param {Object} options
   * @return {void}
   */
  function FormHandlerController(models, options) {
    this.sNamespace = 'formHandler';
    this.parent.parent.constructor.call(this, models, options);
  }

  fn.inherit(FormHandlerController, BaseController);
  return FormHandlerController;
});
