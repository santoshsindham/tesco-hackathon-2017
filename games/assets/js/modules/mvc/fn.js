define(function (require, exports, module) {
  'use strict';


  var fn = {};


  // TODO: write unit tests
  fn.inherit = function (child, parent) {
    var _child = child;

    _child.prototype = Object.create(parent.prototype);
    _child.prototype.constructor = _child;
    _child.prototype.parent = parent.prototype;
  };


  /**
   *
   * @param {any} value
   * @param {Object} opts optional
   * @param {Boolean} opts.notEmpty
   * @param {Boolean} opts.empty
   * @return {Boolean}
   */
  fn.isArray = function (value, opts) {
    var _opts = opts || {},
      isArray = Array.isArray(value);

    if (isArray && !_opts.notEmpty && !_opts.empty) {
      return true;
    }

    if (isArray && _opts.empty && value.length === 0) {
      return true;
    }

    if (isArray && _opts.notEmpty && value.length > 0) {
      return true;
    }

    return false;
  };


  /**
   *
   * @param {any} value
   * @param {Object} opts optional
   * @param {Boolean} opts.notEmpty
   * @param {Boolean} opts.empty
   * @return {Boolean}
   */
  fn.isObject = function (value, opts) {
    var _opts = opts || {},
      isObj = typeof value === 'object' && value !== null && !Array.isArray(value);

    if (isObj && !_opts.notEmpty && !_opts.empty) {
      return true;
    }

    if (isObj && _opts.empty && Object.keys(value).length === 0) {
      return true;
    }

    if (isObj && _opts.notEmpty && Object.keys(value).length > 0) {
      return true;
    }

    return false;
  };


  /**
   *
   * @param {Array<any>} arr
   * @param {Function} callback
   * @param {Object} opts optional
   * @param {Number} opts.start
   * @param {Number} opts.stop
   * @param {Boolean} opts.check
   * @param {Boolean} opts.backward
   * @return {any}
   */
  fn.loopArray = function (arr, callback, opts) {
    var _opts = opts || {},
      i = typeof _opts.start === 'number' ? _opts.start : 0,
      l = 0,
      output = undefined;

    if (typeof callback !== 'function') {
      return false;
    }

    if (_opts.check && !fn.isArray(arr, { notEmpty: true })) {
      return false;
    }

    l = typeof _opts.stop === 'number' ? _opts.stop : arr.length;

    if (_opts.backward) {
      i = arr.length - 1;

      for (; i >= 0; i -= 1) {
        output = callback.call(this, i);

        if (output !== undefined) {
          return output;
        }
      }
    } else {
      for (; i < l; i += 1) {
        output = callback.call(this, i);

        if (output !== undefined) {
          return output;
        }
      }
    }

    return output;
  };


  /**
   *
   * @param {Object} obj
   * @param {Function} callback
   * @param {Object} opts optional
   * @param {Boolean} opts.check
   * @return {any}
   */
  fn.loopObject = function (obj, callback, opts) {
    var _opts = opts || {},
      keys = [],
      output = undefined;

    if (typeof callback !== 'function') {
      return false;
    }

    if (_opts.check && !fn.isObject(obj, { notEmpty: true })) {
      return false;
    }

    keys = Object.keys(obj);

    return fn.loopArray.call(this, keys, function loopKeys(i) {
      output = callback.call(this, keys[i]);

      if (output !== undefined) {
        return output;
      }

      return undefined;
    });
  };


  /**
   *
   * @param {Array<any>|Object} value
   * @param {Object} [opts]
   * @param {boolean} [opts.deep]
   * @return {Array<any>|Object}
   */
  fn.copy = function (value, opts) {
    var copy = value;

    if (fn.isObject(value)) {
      copy = fn.copyObject(value, opts);
    } else if (fn.isArray(value)) {
      copy = fn.copyArray(value, opts);
    }

    return copy;
  };


  /**
   *
   * @param {Array<any>} value
   * @param {Object} [opts]
   * @param {boolean} [opts.deep]
   * @return {Array<any>}
   */
  fn.copyArray = function (value, opts) {
    var _opts = opts || {},
      copy = [];

    fn.loopArray(value, function loopValue(i) {
      if (_opts.deep && fn.isObject(value[i])) {
        copy[i] = fn.copyObject(value[i], _opts);
      } else if (_opts.deep && fn.isArray(value[i])) {
        copy[i] = fn.copyArray(value[i], _opts);
      } else {
        copy[i] = value[i];
      }
    });

    return copy;
  };


  /**
   *
   * @param {Object} value
   * @param {Object} [opts]
   * @param {boolean} [opts.deep]
   * @return {Object}
   */
  fn.copyObject = function (value, opts) {
    var _opts = opts || {},
      copy = {};

    fn.loopObject(value, function loopValue(prop) {
      if (_opts.deep && fn.isObject(value[prop])) {
        copy[prop] = fn.copyObject(value[prop], _opts);
      } else if (_opts.deep && fn.isArray(value[prop])) {
        copy[prop] = fn.copyArray(value[prop], _opts);
      } else {
        copy[prop] = value[prop];
      }
    }, { check: true });

    return copy;
  };


  /**
   *
   * @param {Object} objectOne
   * @param {Object} objectTwo
   * @param {Object} opts optional
   * @param {Boolean} opts.deep
   * @param {Boolean} opts.extend
   * @return {Object}
   */
  fn.mergeObjects = function (objectOne, objectTwo, opts) {
    var _opts = opts || {},
      mergedObject = {};

    if (_opts.extend) {
      mergedObject = objectOne;
    } else {
      mergedObject = fn.copyObject(objectOne, { deep: _opts.deep });
    }

    fn.loopObject(objectTwo, function loopObjectTwo(secondKey) {
      if (!objectOne.hasOwnProperty(secondKey)) {
        mergedObject[secondKey] = objectTwo[secondKey];
        return;
      }

      if (!fn.isFalsy(objectTwo[secondKey])) {
        if (_opts.deep && fn.isObject(objectOne[secondKey]) && fn.isObject(objectTwo[secondKey])) {
          mergedObject[secondKey] = fn.mergeObjects(
            objectOne[secondKey], objectTwo[secondKey], _opts
          );
        } else {
          mergedObject[secondKey] = objectTwo[secondKey];
        }
      }
    });

    return mergedObject;
  };


  /**
   *
   * @param {String} type
   * @param {Array<any>} arr
   * @return {Boolean}
   */
  fn.typeofArrayValues = function (type, arr) {
    var counter = 0;

    if (typeof type !== 'string' || !fn.isArray(arr, { notEmpty: true })) {
      return false;
    }

    fn.loopArray(arr, function loopArray(i) {
      if (type === 'array') {
        if (fn.isArray(arr[i])) {
          counter += 1;
        }
      } else if (type === 'object') {
        if (fn.isObject(arr[i])) {
          counter += 1;
        }
      } else if (type === 'null') {
        if (arr[i] === null) {
          counter += 1;
        }
      } else if (typeof arr[i] === type) {
        counter += 1;
      }
    });

    return counter === arr.length;
  };


  /**
   *
   * @param {any} value
   * @return {Boolean}
   */
  fn.isFalsy = function (value) {
    var falsy = false;

    if (value === null || value === undefined) {
      falsy = true;
    } else if (typeof value === 'string' && value.length === 0) {
      falsy = true;
    } else if (fn.isObject(value, { empty: true })) {
      falsy = true;
    }

    return falsy;
  };


  /**
   *
   * @param {Array<Object>|Object} data
   * @param {Array<string>|string} [propNames]
   * @param {Function} [callback]
   * @return {boolean}
   */
  fn.checkData = function (data, propNames, callback) {
    var _data = fn.isArray(data) ? data : [data],
      _propNames = fn.isArray(propNames) ? propNames : [propNames || 'id'],
      dataObjCount = _data.length,
      propCount = _propNames.length,
      validObjCount = 0,
      validPropCount = 0;

    if (!fn.typeofArrayValues('object', _data) || !fn.typeofArrayValues('string', _propNames)) {
      return false;
    }

    fn.loopArray(_data, function loopData(i) {
      validPropCount = 0;

      fn.loopArray(_propNames, function loopPropNames(j) {
        if (fn.isObject(_data[i]) && _data[i].hasOwnProperty(_propNames[j])
            && !fn.isFalsy(_data[i][_propNames[j]])) {
          validPropCount += 1;
        }
      });

      if (propCount === validPropCount) {
        validObjCount += 1;
      } else if (typeof callback === 'function') {
        callback(_data[i]);
      }
    });

    return dataObjCount === validObjCount;
  };


  /**
   *
   * @return {Any}
   */
  fn.getValue = function () {
    // eslint-disable-next-line id-blacklist
    var args = arguments,
      i = 0,
      l = args.length,
      output = undefined;

    if (l < 2) {
      return null;
    }

    if (!fn.isObject(args[0]) && typeof args[0] !== 'function') {
      return null;
    }

    output = args[0];

    for (i = 1; i < l; i += 1) {
      if (typeof args[i] === 'number') {
        if (fn.isArray(output, { notEmpty: true }) && args[i] < output.length) {
          output = output[args[i]];
        } else {
          return null;
        }
      } else if (typeof args[i] === 'string') {
        if (fn.isObject(output, { notEmpty: true }) || typeof output === 'function') {
          if (output.hasOwnProperty(args[i])) {
            output = output[args[i]];
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    return output;
  };


  /**
   *
   * @param {String} name optional
   * @return {String}
   */
  fn.resolveName = function (name) {
    var _name = name.toLowerCase();

    if (_name.match(/.*s$/)) {
      _name = _name.substring(0, _name.length - 1);
    }
    return _name;
  };


  /**
   *
   * @param {Object} config
   * @param {string} config.name
   * @param {string} [config.namespace]
   * @param {Object} [config.data]
   * @param {string} [config.propName]
   * @param {string|Element} [config.target]
   * @param {Object} [opts]
   * @param {boolean} [opts.suppressDefault]
   * @return {Object}
   */
  fn.createEvent = function (config, opts) {
    var _config = config,
      _opts = opts || {},
      event = null,
      namespacedEvent = null,
      propName = 'mvc',
      target = window;

    if (!fn.isObject(_config, { notEmpty: true }) || typeof _config.name !== 'string') {
      return null;
    }

    event = $.Event(_config.name);

    if (typeof _config.namespace === 'string') {
      namespacedEvent = $.Event(_config.name);
      namespacedEvent.namespace = _config.namespace;
    }

    if (fn.isObject(_config.data, { notEmpty: true })) {
      if (typeof _config.propName === 'string') {
        propName = _config.propName;
      }

      event[propName] = _config.data;

      if (namespacedEvent) {
        namespacedEvent[propName] = _config.data;
      }
    }

    if (typeof _config.target === 'string' || _config.target instanceof Element) {
      target = _config.target;
    }

    return {
      get: function getEvent() {
        return namespacedEvent || event;
      },
      fire: function triggerEvent() {
        if (namespacedEvent) {
          $(target).trigger(namespacedEvent);
        }

        if (!namespacedEvent || !_opts.suppressDefault) {
          $(target).trigger(event);
        }
      }
    };
  };


  /**
   *
   * @param {Object} args optional
   * @param {String} args.prefix
   * @return {String}
   */
  fn.createId = function (args) {
    var _args = args || {},
      prefix = _args.prefix ? _args.prefix + '-' : '';

    return prefix + Math.floor(Math.random() * 10000000);
  };


  /**
   *
   * @param {Any} value
   * @return {Number}
   */
  fn.hashValue = function (value) {
    var hash = 0,
      chr = '',
      str = '';

    if (value === undefined) {
      str = 'undefined';
    } else if (typeof value !== 'string') {
      str = JSON.stringify(value);
    } else {
      str = value;
    }

    if (!str.length) {
      return hash;
    }

    fn.loopArray(str, function (i) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    });

    return hash;
  };


  /**
   *
   * @param {String} html
   * @param {Object} opts optional
   * @param {Boolean} opts.trim
   * @return {Element|Null}
   */
  fn.parseHtml = function (html, opts) {
    var _opts = opts || {},
      elm = null;

    if (typeof html !== 'string') {
      return null;
    }

    elm = document.createElement('DIV');
    elm.innerHTML = _opts.trim ? html.trim() : html;

    return elm.children[0] instanceof Element ? elm.children[0] : null;
  };


  /**
   *
   * @param {Element} target
   * @param {Element} source
   * @param {Object} opts optional
   * @param {Boolean} opts.suppressAttributeRefresh
   * @param {Boolean} opts.suppressContentRefresh
   * @return {void}
   */
  fn.refreshElement = function (target, source, opts) {
    var _opts = opts || {};

    if (!_opts.suppressAttributeRefresh) {
      fn.refreshAttributes(target, source);
    }

    if (!_opts.suppressContentRefresh) {
      fn.refreshContent(target, source);
    }
  };


  /**
   *
   * @param {Element} target
   * @param {Element} source
   * @return {void}
   */
  fn.refreshAttributes = function (target, source) {
    var attrMatch = false;

    if (target instanceof Element && source instanceof Element) {
      fn.loopObject(source.attributes, function loopSourcAttributes(i) {
        attrMatch = false;

        fn.loopObject(target.attributes, function loopTargetAttributes(j) {
          if (!source.hasAttribute(target.attributes[j].name)) {
            target.removeAttribute(target.attributes[j].name);
          } else if (source.attributes[i].name === target.attributes[j].name) {
            attrMatch = true;

            if (source.attributes[i].value !== target.attributes[j].value) {
              target.setAttribute(target.attributes[j].name, source.attributes[i].value);
            }
          }
        });

        if (!attrMatch) {
          target.setAttribute(source.attributes[i].name, source.attributes[i].value);
        }
      });
    }
  };


  /**
   *
   * @param {Element} target
   * @param {Element} source
   * @return {void}
   */
  fn.refreshContent = function (target, source) {
    var _target = target;

    if (target instanceof Element && source instanceof Element) {
      if (target.innerHTML !== source.innerHTML) {
        _target.innerHTML = source.innerHTML;
      }
    }
  };


  /**
   *
   * @param {String} key
   * @param {any} value
   * @return {void}
   */
  fn.setSessionData = function (key, value) {
    if (!window.sessionStorage || typeof key !== 'string' || value === undefined) {
      return;
    }

    window.sessionStorage.setItem(key, JSON.stringify(value));
  };


  /**
   *
   * @param {String} [key]
   * @return {Object|null}
   */
  fn.getSessionData = function (key) {
    if (!window.sessionStorage) {
      return null;
    }

    if (key === undefined) {
      return window.sessionStorage;
    }

    if (typeof key !== 'string') {
      return null;
    }

    return JSON.parse(window.sessionStorage.getItem(key));
  };


  /**
   *
   * @param {String} key
   * @return {void}
   */
  fn.clearSessionData = function (key) {
    if (!window.sessionStorage) {
      return;
    }

    if (key === undefined) {
      window.sessionStorage.clear();
    }

    if (typeof key !== 'string') {
      return;
    }

    window.sessionStorage.removeItem(key);
  };


  /**
   *
   * @param {String} key
   * @param {any} value
   * @return {void}
   */
  fn.setLocalStorageData = function (key, value) {
    if (!window.localStorage || typeof key !== 'string' || value === undefined) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  };


  /**
   *
   * @param {String} [key]
   * @return {Object|null}
   */
  fn.getLocalStorageData = function (key) {
    if (!window.localStorage) {
      return null;
    }

    if (key === undefined) {
      return window.localStorage;
    }

    if (typeof key !== 'string') {
      return null;
    }

    return JSON.parse(window.localStorage.getItem(key));
  };


  /**
   *
   * @param {String} key
   * @return {void}
   */
  fn.clearLocalStorageData = function (key) {
    if (!window.localStorage) {
      return;
    }

    if (key === undefined) {
      window.localStorage.clear();
    }

    if (typeof key !== 'string') {
      return;
    }

    window.localStorage.removeItem(key);
  };


  /**
   *
   * @returns {boolean}
   */
  fn.isGeolocationAvailable = function () {
    return 'geolocation' in window.navigator;
  };


  /**
   *
   * @param {function} successHandler
   * @param {function} errorHandler
   * @param {Object} [options]
   * @returns {boolean}
   */
  fn.getCurrentPosition = function (successHandler, errorHandler, options) {
    var _options = fn.copyObject({ enableHighAccuracy: false, timeout: Infinity, maximumAge: 0 });

    if (!fn.isGeolocationAvailable() || typeof successHandler !== 'function'
      || typeof errorHandler !== 'function') {
      return false;
    }

    if (fn.isObject(options, { notEmpty: true })) {
      fn.mergeObjects(_options, options, { extend: true, deep: true });
    }

    window.navigator.geolocation.getCurrentPosition(successHandler, errorHandler, _options);

    return true;
  };

  /**
   *
   * @param {String} queryParam
   * @param {String} url
   * @returns {String}
   */
  fn.getURLQueryString = function (queryParam, url) {
    var href = url || window.location.href,
      regex = new RegExp('[?&]' + queryParam + '=([^&#]*)', 'i'),
      queryParamResult = regex.exec(href);

    return queryParamResult ? queryParamResult[1] : null;
  };

  module.exports = fn;
});
