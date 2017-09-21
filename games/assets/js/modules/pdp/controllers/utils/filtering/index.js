define(function (require, exports, module) {
  'use strict';

  var fn = require('modules/mvc/fn');

  /**
   *
   * @private
   * @type {Object}
   */
  var _models;

  /**
   *
   * @param {Array<Object>} data
   * @param {string} namespace
   * @return {Array<Object>}
   */
  var defaultFilter = function defaultFilter(data, namespace) {
    var filtered = [];

    fn.loopArray(data, function loopItems(i) {
      if (fn.isObject(_models[namespace].getPrices(data[i]), { notEmpty: true })) {
        filtered.push(data[i]);
      }
    }, { backward: true });

    return filtered;
  };

  /**
   *
   * @param {Array<Object>} data
   * @param {string} namespace
   * @param {Object} filters
   * @param {JQueryDeferred} deferred
   * @return {Promise}
   */
  var fetchInventory = function fetchInventory(data, namespace, filters, deferred) {
    var model = namespace === 'products' ? _models.inventoryProduct : _models.inventorySKU;

    if (!filters) {
      deferred.resolve(data);
      return null;
    }

    var ids = data.map(function (obj) {
      return obj.id;
    });

    return model.getDataStores({ value: ids, fetch: true });
  };

  /**
   *
   * @param {Array<Object>} data
   * @param {Array<Object>} inventory
   * @param {Object} filters
   * @return {void}
   */
  var filterInventory = function filterInventory(data, inventory, filters) {
    var _filters = filters || {};
    var matchFound = false;

    fn.loopArray(data, function (i) {
      matchFound = false;

      fn.loopArray(inventory, function (j) {
        if (fn.isObject(data[i], { notEmpty: true })) {
          if (data[i].id === inventory[j].id) {
            matchFound = true;

            if (_filters.available && !inventory[j].available) {
              data.splice(i, 1);
            } else if (_filters.subscribable && !inventory[j].subscribable) {
              data.splice(i, 1);
            }
          }
        }
      });

      if (!matchFound) {
        data.splice(i, 1);
      }
    }, { backward: true });
  };

  /**
   *
   * @param {Array<Object>} data
   * @param {string} namespace
   * @param {Object} filters
   * @return {Promise}
   */
  var fetchAndFilterInventory = function fetchAndFilterInventory(data, namespace, filters) {
    var deferred = $.Deferred();
    var promise = fetchInventory(data, namespace, filters, deferred);

    if (promise) {
      promise
        .done(function (inventory) {
          if (!fn.isArray(inventory, { notEmpty: true })) {
            deferred.reject();
            return;
          }

          filterInventory(data, inventory, filters);

          if (!data.length) {
            deferred.reject();
            return;
          }

          deferred.resolve(data);
        })
        .fail(function () {
          deferred.reject();
        });
    }

    return deferred.promise();
  };

  /**
   *
   * @param {Array<Object>} data
   * @param {string} namespace
   * @param {Object} filters
   * @param {Object} models
   * @return {Promise}
   */
  var filterItems = function filterItems(data, namespace, filters, models) {
    _models = models;
    var filteredData = defaultFilter(data, namespace);
    var deferred = $.Deferred();

    fetchAndFilterInventory(filteredData, namespace, filters.inventory)
      .done(function (inventoryFilteredData) {
        deferred.resolve(inventoryFilteredData);
      })
      .fail(function () {
        deferred.reject();
      });

    return deferred.promise();
  };


  module.exports = {
    filterItems: filterItems
  };
});
