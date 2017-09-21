define('modules/pdp/controllers/DataController', [
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/BaseClass',
  'modules/pdp/classMap'
], function ($, fn, BaseClass, classMap) {
  'use strict';

  /**
   * Data controller takes raw data returned from a request to the server and makes sure all
   * models are updated if there is data that they need to add.
   * @return {void}
   */
  function DataController() {
    this._bindEvents();
  }

  fn.inherit(DataController, BaseClass);

  /**
   * Binds any events required when the data controller is initialised.
   * @return {void}
   */
  DataController.prototype._bindEvents = function () {
    $(window).on('dataFetched', this._onDataFetched.bind(this));
  };

  /**
   * Runs the update models method when it receives a data fetched event. These events are
   * triggered by every model's fetch method and can be triggered manually.
   * @param {Object} oEvent The event object that includes the fetched data object.
   * @return {void}
   */
  DataController.prototype._onDataFetched = function (oEvent) {
    this._updateModels(oEvent.oData.mfetchedData);
  };

  /**
   * Checks if data is an array or an object.
   * @param {Object} mData The fetched data from the server.
   * @return {void}
   */
  DataController.prototype._updateModels = function (mData) {
    if (this.isArray(mData, true)) {
      this.forLoop(mData, function (i) {
        if (this.isObject(mData[i], true)) {
          this._loopObj(mData[i]);
        }
      });
    } else if (this.isObject(mData, true)) {
      this._loopObj(mData);
    }
  };

  /**
   * Loops through each object's properties.
   * @param {Object} oData The fetched data from the server.
   * @return {void}
   */
  DataController.prototype._loopObj = function (oData) {
    var mPropData = null;

    this.forInLoop(oData, function (sProp) {
      mPropData = oData[sProp];
      /**
       * If the property name matches a namespace in the classMap's model object, then the data
       * is added to the addDataToModel event and fired off to the page controller.
       */
      if (classMap.hasNamespace('model', sProp)) {
        if (mPropData || this.isArray(mPropData, true)) {
          this.setEvent({
            sName: 'addData',
            sNamespace: sProp,
            mAddData: mPropData
          }, false, true);
        }
      }

      /**
       * Continue to loop through the data.
       */
      this._updateModels(mPropData);
    });
  };

  return DataController;
});
