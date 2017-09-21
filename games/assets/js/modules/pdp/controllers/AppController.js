define('modules/pdp/controllers/AppController', [
  'modules/mvc/fn',
  'modules/tesco.utils',
  'modules/pdp/BaseClass',
  'modules/pdp/pageControllerMap',
  'modules/pdp/controllers/DataController'
], function (fn, tescoUtils, BaseClass, pageControllerMap, DataController) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function AppController(config) {
    var PageControllerClass = null;

    if (window.oAppController instanceof AppController) {
      return window.oAppController;
    }

    // Get the class for the page controller
    PageControllerClass = pageControllerMap.get(config.pageGroup);

    if (PageControllerClass === null) {
      return false;
    }

    /**
     * temporary store for events that need to be triggered when markup is injected into the DOM.
     * @type {Object}
     */
    this.oEventStore = {};
    /**
     * Initialises core controllers
     */
    this.oDataController = new DataController();

    this.oPageController = new PageControllerClass(
      fn.mergeObjects(config, { isKiosk: window.isKiosk() })
    );

    this.baseURL = config.baseURL;
  }

  fn.inherit(AppController, BaseClass);
  return AppController;
});
