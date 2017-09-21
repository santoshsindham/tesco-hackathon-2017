define('modules/pdp/BaseClass', [
  'domlib'
], function ($) {
  'use strict';

  // NOTE: The methods in this file are being deprecated in favour of a utils file that
  // a dev can require at the top of a module. The file is located at: modules/mvc/fn.js.
  // This file is a work in progress so if the method not been migrated, just use the method
  // in this file. - Dylan Aubrey (so24) - 27/09/16

  /**
   * The base class that the base model, view and controller inherit from.
   * @return {void}
   */
  function BaseClass() {}

  /**
   * A shorthand for checking if an variable is an array.
   * @param {[type]} mVar The variable to check.
   * @param {Boolean} hasLength Whether to check if the array has length
   * @return {Boolean} Whether the variable is an array.
   */
  BaseClass.prototype.isArray = function (mVar, hasLength) {
    if (mVar && Array.isArray(mVar)) {
      if (!hasLength) {
        return true;
      }

      if (hasLength && mVar.length > 0) {
        return true;
      }
    }

    return false;
  };

  /**
   * A shorthand for checking if a variable is an object.
   * @param {Mixed} mVar The variable to check.
   * @param {Boolean} hasProps Whether to check if the object has properties.
   * @return {Boolean} Whether the variable is an object.
   */
  BaseClass.prototype.isObject = function (mVar, hasProps) {
    if (mVar && typeof mVar === 'object' && !this.isArray(mVar)) {
      if (!hasProps) {
        return true;
      }

      if (hasProps && !$.isEmptyObject(mVar)) {
        return true;
      }
    }

    return false;
  };

  /**
   * A shorthand for creating a deep copy of an object or an array.
   * @param {Object|Array} mVar The variable to make a copy of.
   * @return {Object|Array} The copied object/array.
   */
  BaseClass.prototype.deepCopy = function (mVar) {
    var mCopy = null,
      iObjCount = 0;

    if (this.isArray(mVar, true)) {
      this.forLoop(mVar, function (i) {
        if (this.isObject(mVar[i], true)) {
          iObjCount += 1;
        }
      });

      if (iObjCount === 0) {
        mCopy = mVar.slice();
      } else if (iObjCount === mVar.length) {
        mCopy = $.map(mVar, function (obj) {
          return $.extend(true, {}, obj);
        });
      }
    } else if (this.isObject(mVar, true)) {
      mCopy = $.extend(true, {}, mVar);
    } else {
      mCopy = mVar;
    }

    return mCopy;
  };

  /**
   * A shorthand for merging to array and returning a new array of unique values.
   * @param {Array} arrayOne The first array to merge.
   * @param {Array} arrayTwo The second array to marge.
   * @return {Array} The merged array of unique index values.
   */
  BaseClass.prototype.mergeArraysUnique = function (arrayOne, arrayTwo) {
    var newArray = [],
      concatArray = [];

    if (!this.isArray(arrayOne) || !this.isArray(arrayTwo)) {
      return false;
    }

    concatArray = arrayOne.concat(arrayTwo);

    this.forLoop(concatArray, function (i) {
      if (newArray.indexOf(concatArray[i]) === -1) {
        newArray.push(concatArray[i]);
      }
    });

    return newArray;
  };

  /**
   * Merges two objects and returns the newly merged object based on the options passed in. The
   * properties of objTwo will overwrite those in objOne.
   * @param {Object} objOne The first object to merge.
   * @param {Object} objTwo The second object to merge.
   * @param {Object} options The configuration for the merge.
   * @return {Object} The newly merged object.
   */
  BaseClass.prototype.mergeObjects = function (objOne, objTwo, options) {
    var _this = this,
      _objOne = objOne,
      _options = options || {},
      newObj = {},
      isFalsy = undefined,
      loopObject = undefined,
      loopArray = undefined;

    isFalsy = function (value) {
      if (value === undefined
          || value === null
          || value === ''
          || (_this.isObject(value) && $.isEmptyObject(value))) {
        return true;
      }

      return false;
    };

    loopObject = function (object) {
      var newObject = {};

      _this.forInLoop(object, function (prop) {
        if (_this.isObject(object[prop])) {
          newObject[prop] = loopObject(object[prop]);
        } else if (_this.isArray(object[prop])) {
          newObject[prop] = loopArray(object[prop]);
        } else {
          newObject[prop] = object[prop];
        }
      });

      return newObject;
    };

    loopArray = function (array) {
      var newArray = [];

      _this.forLoop(array, function (i) {
        if (_this.isObject(array[i])) {
          newArray.push(loopObject(array[i]));
        } else if (_this.isArray(array[i])) {
          newArray.push(loopArray(array[i]));
        } else {
          newArray.push(array[i]);
        }
      });

      return newArray;
    };

    if (!_options.count) {
      _options.count = 1;
    } else {
      _options.count += 1;
    }

    newObj = _options.extend ? _objOne : {};

    if (this.isObject(_objOne) && this.isObject(objTwo)) {
      this.forInLoop(objTwo, function (propTwo) {
        if (!_objOne.hasOwnProperty(propTwo)) {
          if (_options.shallow) {
            newObj[propTwo] = objTwo[propTwo];
          } else if (this.isObject(objTwo[propTwo])) {
            newObj[propTwo] = loopObject(objTwo[propTwo]);
          } else if (this.isArray(objTwo[propTwo])) {
            newObj[propTwo] = loopArray(objTwo[propTwo]);
          } else {
            newObj[propTwo] = objTwo[propTwo];
          }
        }

        this.forInLoop(_objOne, function (propOne) {
          if (propOne === propTwo) {
            if (!isFalsy(objTwo[propTwo])) {
              if (_options.shallow) {
                newObj[propOne] = objTwo[propTwo];
              } else if (this.isObject(objTwo[propTwo])) {
                newObj[propOne] = loopObject(objTwo[propTwo]);
              } else if (this.isArray(objTwo[propTwo])) {
                newObj[propOne] = loopArray(objTwo[propTwo]);
              } else {
                newObj[propOne] = objTwo[propTwo];
              }
            }
          } else if (!objTwo.hasOwnProperty(propOne)) {
            if (_options.shallow) {
              newObj[propOne] = _objOne[propOne];
            } else if (this.isObject(_objOne[propOne])) {
              newObj[propOne] = loopObject(_objOne[propOne]);
            } else if (this.isArray(_objOne[propOne])) {
              newObj[propOne] = loopArray(_objOne[propOne]);
            } else {
              newObj[propOne] = _objOne[propOne];
            }
          }
        });
      });

      return newObj;
    }

    return undefined;
  };

  /**
   * A shorthand for doing a for loop on an array
   * @param {Array} array The array to loop.
   * @param {Function} callback The function to execute within the loop.
   * @param {Integer} index The optional starting array index.
   * @return {void}
   */
  BaseClass.prototype.forLoop = function (array, callback, index) {
    var i = index || 0,
      count = 0,
      output = null;

    if (!this.isArray(array, true)) {
      return undefined;
    }

    count = array.length;

    for (; i < count; i += 1) {
      output = callback.call(this, i);

      if (output !== undefined) {
        return output;
      }
    }

    return undefined;
  };

  /**
   * A shorthand for doing a for in loop on an object.
   * @param {Object} obj The object to loop.
   * @param {Function} callback The function to execute within the loop.
   * @return {void}
   */
  BaseClass.prototype.forInLoop = function (obj, callback) {
    var output = undefined,
      keys = Object.keys(obj);

    return this.forLoop(keys, function loopObjectKeys(i) {
      output = callback.call(this, keys[i]);

      if (output !== undefined) {
        return output;
      }
      return undefined;
    });
  };

  /**
   * A shorthand for creating, namespacing and firing an event.
   * @param {Object} oData The data to be added to the event on the oData property.
   * @param {Boolean} isNamespaced Whether to namespace the event.
   * @param {Boolean} isTriggered Whether to trigger the event within the method.
   * @return {Object} The event object.
   */
  BaseClass.prototype.setEvent = function (oData, isNamespaced, isTriggered) {
    var oEvent = $.Event(oData.sName);

    oEvent.oData = $.extend({}, oData);

    if (isNamespaced) {
      oEvent.namespace = oData.sNamespace;
    }

    if (isTriggered) {
      $(window).trigger(oEvent);
    }

    return oEvent;
  };

  /**
   * A shorthand for creating, namespacing and firing multiple events.
   * @param {Array} aData The data to be added to the events on the oData property.
   * @param {Boolean} isNamespaced Whether to namespace the event.
   * @param {Boolean} isTriggered Whether to trigger the event within the method.
   * @return {Object} The event object.
   */
  BaseClass.prototype.setEvents = function (aData, isNamespaced, isTriggered) {
    var aEvents = [],
      _isNamespaced = false,
      _isTriggered = false;

    if (this.isArray(aData, true)) {
      this.forLoop(aData, function (i) {
        _isNamespaced = isNamespaced || aData[i].isNamespaced || false;
        _isTriggered = isTriggered || aData[i].isTriggered || false;
        aEvents.push(this.setEvent(aData[i].oData, _isNamespaced, _isTriggered));
      });
    }

    return aEvents;
  };

  /**
   * A shorthand for generating a unique Id
   * @param {String} sPrefix An optional prefix to add to the id.
   * @param {Integer} iDigits The number of digets for the id to be.
   * @return {String|Integer} The unique id.
   */
  BaseClass.prototype.createUniqueId = function (sPrefix, iDigits) {
    var _sPrefix = sPrefix || '',
      iMultiplyBy = iDigits
          ? iDigits * 10
          : 1000000000;

    return _sPrefix + Math.floor(Math.random() * iMultiplyBy);
  };

  /**
   * Creates a hash code for a string that can be used to compare to strings.
   * @param {Mixed} value The value to be hashed
   * @return {Integer} The hash value.
   */
  BaseClass.prototype.hashCode = function (value) {
    var hash = 0,
      chr = null,
      str = '';

    if (Array.isArray(value) && value.length === 0) {
      return -1;
    }

    if (typeof value !== 'string') {
      if (value) {
        str = value.toString();
      }
    } else {
      str = value;
    }

    if (!str.length) {
      return hash;
    }

    this.forLoop(str, function (i) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    });

    return hash;
  };

  /**
   * Checks whether data being passed into view is correct.
   * @param {Object} data Data to be checked.
   * @return {Boolean} Whether the data is correct or not.
   */
  BaseClass.prototype.sanityCheckData = function (data) {
    var counters = {
        objects: 0,
        ids: 0
      },
      _data = data,
      flags = {
        objects: false,
        ids: false
      };

    if (typeof _data === 'string') {
      flags.ids = true;
    } else if (this.isObject(_data, true)
        && _data.hasOwnProperty('id')
        && typeof _data.id === 'string') {
      flags.objects = true;
      flags.ids = null;
    } else if (this.isArray(_data, true)) {
      this.forLoop(_data, function (i) {
        if (typeof _data[i] === 'string') {
          counters.ids += 1;
        } else if (this.isObject(_data[i], true)
            && _data[i].hasOwnProperty('id')
            && typeof _data[i].id === 'string') {
          counters.objects += 1;
        }
      });

      if (_data.length === counters.ids) {
        flags.ids = true;
      } else if (_data.length === counters.objects) {
        flags.objects = true;
        flags.ids = null;
      }
    }

    return flags;
  };

  /**
   * Triggers a callback to run on transitionend of a given element's transition. It includes
   * a fallback for browsers that do not support transitionend.
   * @param {Function} callback The function to run on transitionend.
   * @param {Object} options Configuration options such as the target and transition property.
   * @return {void}
   */
  BaseClass.prototype.triggerOnTransitionEnd = function (callback, options) {
    var _this = this,
      _options = options;

    if (!window.Modernizr.csstransitions) {
      callback.call(this);
      return;
    }

    if (typeof _options.target === 'string') {
      _options.target = $(_options.target)[0];
    }

    if (_options.target instanceof Element) {
      $(_options.target).on('transitionend', function ($event) {
        var sourceElement = $event.originalEvent.srcElement
            ? $event.originalEvent.srcElement
            : $event.originalEvent.target;

        if (sourceElement === _options.target
            && $event.originalEvent.propertyName === _options.propertyName) {
          callback.call(_this);
        }

        $(_options.target).off('transitionend');
      });
    }
  };

  /**
   * Gets target events from provided element and returns them.
   * @param {String|Object} target The target to get the events from.
   * @param {String} name The name of the event.
   * @param {String} namespace The namespace of the event.
   * @return {Array} The list of events.
   */
  BaseClass.prototype.getTargetEvents = function (target, name, namespace) {
    var targetElement = typeof target === 'string'
          ? $(target)[0]
          : target,
      _namespace = namespace || '',
      eventList = {},
      events = [];

    if (targetElement instanceof Element || targetElement.self === window) {
      eventList = $._data(targetElement, 'events');

      if (!this.isObject(eventList, true)) {
        return false;
      }

      if (!eventList.hasOwnProperty(name)) {
        return false;
      }

      this.forLoop(eventList[name], function loopEvents(i) {
        if (eventList[name][i].namespace === _namespace) {
          events.push(eventList[name][i]);
        }
      });

      if (events.length > 0) {
        return events;
      }
    }

    return false;
  };

  BaseClass.prototype.parseHtml = function (args) {
    var _args = args || {},
      tag = typeof _args.tag === 'string' ? _args.tag : 'div',
      html = '',
      elm = null;

    if (typeof _args.html !== 'string') {
      return null;
    }

    html = _args.trim ? _args.html.trim() : _args.html;
    elm = document.createElement(tag);
    elm.innerHTML = html;

    return elm.children;
  };

  return BaseClass;
});
