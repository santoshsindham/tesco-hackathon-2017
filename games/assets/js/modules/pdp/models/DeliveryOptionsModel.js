define('modules/pdp/models/DeliveryOptionsModel', [
  'modules/mvc/fn',
  'modules/pdp/data-stores/DeliveryOption',
  'modules/pdp/models/BaseModel'
], function (fn, DeliveryOption, BaseModel) {
  'use strict';

  /**
   *
   * @param {Object} config
   * @return {void}
   */
  function DeliveryOptionsModel(config) {
    this.DataStoreClass = DeliveryOption;
    this.sNamespace = 'deliveryOptions';
    this.sParentNamespace = 'sellers';
    this.parent.constructor.call(this, config);
  }


  fn.inherit(DeliveryOptionsModel, BaseModel);


  DeliveryOptionsModel.prototype.get = function (args) {
    var output = this.parent.get.call(this, args);

    if (this.sanityCheckData(output).objects) {
      output = this._enrichData(output);
    }
    return output;
  };


  DeliveryOptionsModel.prototype._enrichData = function (data) {
    var _data = data,
      isArray = true;

    if (!fn.isArray(data)) {
      _data = [data];
      isArray = false;
    }

    fn.loopArray(_data, function loopData(i) {
      _data[i].flags = {};

      if (_data[i].charge === 'FREE' && (_data[i].type !== 'storeCollect'
          || !_data[i].chargeableClickAndCollect)) {
        _data[i].free = _data[i].charge;
      }
    });

    return isArray ? _data : _data[0];
  };


  DeliveryOptionsModel.prototype.hasNextDayDelivery = function (data) {
    var deliveryData = this.resolveDataArg(data),
      hasNextDay = false;

    if (fn.isArray(deliveryData, { notEmpty: true })) {
      fn.loopArray(deliveryData, function loopDeliveryData(i) {
        if (deliveryData[i].leadTime === 'next day*') {
          hasNextDay = true;
        }
      });
    } else if (fn.isObject(deliveryData, { notEmpty: true })) {
      hasNextDay = deliveryData.leadTime === 'next day*';
    }

    return hasNextDay;
  };


  return DeliveryOptionsModel;
});
