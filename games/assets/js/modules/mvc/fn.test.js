define([
  'modules/mvc/fn',
  'json!test-framework/mocks/tesco/content/catalog/product/313-0760.json',
  'json!test-framework/mocks/tesco/content/catalog/product/420-1034.json',
  'test-framework/mocks/mocks'
], function (fn, dressProduct, jacketProduct, mocks) {
  'use strict';

  /***************************************************************************
   ** isArray method *********************************************************
   ***************************************************************************/

  describe('isArray method', function () {
    var obj = {},
      str = 'I am a string',
      emptyArr = [],
      arr = ['I', 'am', 'an', 'array'];

    it('should return true if the input is an array', function () {
      expect(fn.isArray(obj)).toEqual(false);
      expect(fn.isArray(str)).toEqual(false);
      expect(fn.isArray(emptyArr)).toEqual(true);
      expect(fn.isArray(arr)).toEqual(true);
    });

    it('should return true if the input is an empty array, and empty option is true', function () {
      expect(fn.isArray(emptyArr, { empty: true })).toEqual(true);
      expect(fn.isArray(arr, { empty: true })).toEqual(false);
    });

    it('should return true if the input is an array with values, '
        + 'and notEmpty option is true', function () {
      expect(fn.isArray(emptyArr, { notEmpty: true })).toEqual(false);
      expect(fn.isArray(arr, { notEmpty: true })).toEqual(true);
    });
  });


  /***************************************************************************
   ** isObject method ********************************************************
   ***************************************************************************/

  describe('isObject method', function () {
    var nullVal = null,
      str = 'I am a string',
      arr = [],
      _class = function funcObj() {
        this.type = 'funcObj';
      },
      fnObj = new _class(),
      emptyObj = {},
      obj = { name: 'obj' };

    it('should return true if the value is an object, but not an array or null', function () {
      expect(fn.isObject(nullVal)).toEqual(false);
      expect(fn.isObject(str)).toEqual(false);
      expect(fn.isObject(arr)).toEqual(false);
      expect(fn.isObject(fnObj)).toEqual(true);
      expect(fn.isObject(emptyObj)).toEqual(true);
      expect(fn.isObject(obj)).toEqual(true);
    });

    it('should return true if the value is an empty object, and empty option is true', function () {
      expect(fn.isObject(fnObj, { empty: true })).toEqual(false);
      expect(fn.isObject(emptyObj, { empty: true })).toEqual(true);
      expect(fn.isObject(obj, { empty: true })).toEqual(false);
    });

    it('should return true if the value is an object with properties, '
        + 'and notEmpty option is true', function () {
      expect(fn.isObject(fnObj, { notEmpty: true })).toEqual(true);
      expect(fn.isObject(emptyObj, { notEmpty: true })).toEqual(false);
      expect(fn.isObject(obj, { notEmpty: true })).toEqual(true);
    });
  });


  /***************************************************************************
   ** loopArray method *******************************************************
   ***************************************************************************/

  describe('loopArray method', function () {
    var obj = {},
      emptyArr = [],
      arr = ['I', 'am', 'an', 'array'];

    it('should loop the values in the array and execute the callback on each value', function () {
      var output = [];

      fn.loopArray(arr, function (i) { output.push(arr[i]); });
      expect(output.length).toEqual(4);
    });

    it('should return false if the callback is not a function', function () {
      expect(fn.loopArray(arr, obj)).toEqual(false);
    });

    it('should return false if check option is true and first arg is not array '
        + 'with a length greater than 0', function () {
      var output = [];

      expect(fn.loopArray(emptyArr, function (i) {
        output.push(arr[i]);
      }, { check: true })).toEqual(false);
    });

    it('should return out of the loop if a value other than undefined '
        + 'is returned from one of the callbacks', function () {
      expect(fn.loopArray(arr, function (i) {
        return arr[i] === 'an' ? arr[i] : undefined;
      })).toEqual('an');
    });

    it('should start the loop at the index given in the start option', function () {
      var output = [];

      fn.loopArray(arr, function (i) { output.push(arr[i]); }, { start: 1 });
      expect(output.length).toEqual(3);
    });

    it('should stop the loop at the index given in the stop option', function () {
      var output = [];

      fn.loopArray(arr, function (i) { output.push(arr[i]); }, { stop: 2 });
      expect(output.length).toEqual(2);
    });

    it('should loop backward if the backward option is true', function () {
      var output = [];

      fn.loopArray(arr, function (i) { output.push(arr[i]); }, { backward: true });
      expect(output[0]).toEqual('array');
      expect(output[3]).toEqual('I');
    });
  });


  /***************************************************************************
   ** loopObject method ******************************************************
   ***************************************************************************/

  describe('loopObject method', function () {
    var arr = [],
      emptyObj = {},
      obj = { propOne: 'I', propTwo: 'am', propThree: 'an', propFour: 'object' };

    it('should loop the values in the object and execute the callback '
        + 'on each property', function () {
      var output = { obj: {}, count: 0 };

      fn.loopObject(obj, function (prop) { output.obj[prop] = obj[prop]; });
      fn.loopObject(output.obj, function () { output.count += 1; });
      expect(output.count).toEqual(4);
    });

    it('should return false if the callback is not a function', function () {
      expect(fn.loopObject(arr, obj)).toEqual(false);
    });

    it('should return false if check option is true and first arg is not an object '
        + 'with properties', function () {
      var output = [];

      expect(fn.loopObject(emptyObj, function (prop) {
        output.obj[prop] = emptyObj[prop];
      }, { check: true })).toEqual(false);
    });

    it('should return out of the loop if a value other than undefined '
        + 'is returned from one of the callbacks', function () {
      expect(fn.loopObject(obj, function (prop) {
        return obj[prop] === 'an' ? obj[prop] : undefined;
      })).toEqual('an');
    });
  });


  /***************************************************************************
   ** copyArray method *******************************************************
   ***************************************************************************/

  describe('copyArray method', function () {
    var copy = {},
      reference = {};

    beforeEach(function () {
      copy = {};
      reference = {};
    });

    it('returns a shallow copy of an array', function () {
      reference = dressProduct.links;
      expect(reference === dressProduct.links).toBe(true);

      copy = fn.copyArray(dressProduct.links);
      expect(copy === dressProduct.links).toBe(false);
      expect(copy).toEqual(dressProduct.links);
      expect(copy[0] === dressProduct.links[0]).toBe(true);
    });

    it('returns a deep copy of an array if the deep option is passed in', function () {
      reference = dressProduct.links;
      expect(reference === dressProduct.links).toBe(true);

      copy = fn.copyArray(dressProduct.links, { deep: true });
      expect(copy === dressProduct.links).toBe(false);
      expect(copy).toEqual(dressProduct.links);
      expect(copy[0] === dressProduct.links[0]).toBe(false);
      expect(copy[0]).toEqual(dressProduct.links[0]);
    });
  });


  /***************************************************************************
   ** copyObject method ******************************************************
   ***************************************************************************/

  describe('copyObject method', function () {
    var copy = {},
      reference = {};

    beforeEach(function () {
      copy = {};
      reference = {};
    });

    it('returns a shallow copy of an object', function () {
      reference = dressProduct;
      expect(reference === dressProduct).toBe(true);

      copy = fn.copyObject(dressProduct);
      expect(copy === dressProduct).toBe(false);
      expect(copy).toEqual(dressProduct);

      expect(copy.id === dressProduct.id).toBe(true);
      expect(copy.mediaAssets === dressProduct.mediaAssets).toBe(true);
      expect(copy.prices.price === dressProduct.prices.price).toBe(true);
      expect(copy.optionsInfo === dressProduct.optionsInfo).toBe(true);
      expect(copy.userActionable === dressProduct.userActionable).toBe(true);
    });

    it('returns a deep copy of an object if the deep option is passed in', function () {
      reference = dressProduct;
      expect(reference === dressProduct).toBe(true);

      copy = fn.copyObject(dressProduct, { deep: true });
      expect(copy === dressProduct).toBe(false);
      expect(copy).toEqual(dressProduct);

      expect(copy.id === dressProduct.id).toBe(true);

      expect(copy.mediaAssets === dressProduct.mediaAssets).toBe(false);
      expect(copy.mediaAssets).toEqual(dressProduct.mediaAssets);
      expect(copy.mediaAssets.defaultSku).toEqual(dressProduct.mediaAssets.defaultSku);

      expect(copy.prices === dressProduct.prices).toBe(false);
      expect(copy.prices).toEqual(dressProduct.prices);
      expect(copy.prices.price === dressProduct.prices.price).toBe(true);

      expect(copy.optionsInfo === dressProduct.optionsInfo).toBe(false);
      expect(copy.optionsInfo).toEqual(dressProduct.optionsInfo);
      expect(copy.optionsInfo[0].name === dressProduct.optionsInfo[0].name).toBe(true);

      expect(copy.userActionable === dressProduct.userActionable).toBe(true);
    });
  });


  /***************************************************************************
   ** mergeObjects method ****************************************************
   ***************************************************************************/

  describe('mergeObjects method', function () {
    var firstObject = {},
      mergedObject = {},
      secondObject = {};

    beforeEach(function () {
      firstObject = {
        ageSuitability: 'Adult',
        gender: 'Mens',
        id: '123-4567',
        styleRef: 'et525043',
        supplier: 'FF',
        foo: { bar: { baz: 'qux' } }
      };
      secondObject = {
        id: 'ABC-DEFG',
        internalName: 'p_size',
        name: 'Size',
        sorted: true,
        type: 'secondary',
        foo: { qux: { quux: 'quuz' } }
      };
    });

    it('returns an object with the properties and values of the first and '
        + 'second object', function () {
      mergedObject = fn.mergeObjects(firstObject, secondObject);
      expect(mergedObject.ageSuitability).toBe('Adult');
      expect(mergedObject.gender).toBe('Mens');
      expect(mergedObject.id).toBe('ABC-DEFG');
      expect(mergedObject.styleRef).toBe('et525043');
      expect(mergedObject.supplier).toBe('FF');
      expect(mergedObject.internalName).toBe('p_size');
      expect(mergedObject.name).toBe('Size');
      expect(mergedObject.sorted).toBe(true);
      expect(mergedObject.type).toBe('secondary');
      expect(mergedObject.foo).toBe(secondObject.foo);
      expect(firstObject.ageSuitability).toBe('Adult');
      expect(firstObject.gender).toBe('Mens');
      expect(firstObject.id).toBe('123-4567');
      expect(firstObject.styleRef).toBe('et525043');
      expect(firstObject.supplier).toBe('FF');
      expect(firstObject.internalName).toBe(undefined);
      expect(firstObject.name).toBe(undefined);
      expect(firstObject.sorted).toBe(undefined);
      expect(firstObject.type).toBe(undefined);
      expect(firstObject.foo).toEqual({ bar: { baz: 'qux' } });
      expect(secondObject.ageSuitability).toBe(undefined);
      expect(secondObject.gender).toBe(undefined);
      expect(secondObject.styleRef).toBe(undefined);
      expect(secondObject.supplier).toBe(undefined);
      expect(secondObject.id).toBe('ABC-DEFG');
      expect(secondObject.internalName).toBe('p_size');
      expect(secondObject.name).toBe('Size');
      expect(secondObject.sorted).toBe(true);
      expect(secondObject.type).toBe('secondary');
      expect(secondObject.foo).toEqual({ qux: { quux: 'quuz' } });
    });

    it('Adds the properties and values of the second object onto the first object '
        + 'if the extend option is passed in', function () {
      fn.mergeObjects(firstObject, secondObject, { extend: true });
      expect(firstObject.ageSuitability).toBe('Adult');
      expect(firstObject.gender).toBe('Mens');
      expect(firstObject.styleRef).toBe('et525043');
      expect(firstObject.supplier).toBe('FF');
      expect(firstObject.id).toBe('ABC-DEFG');
      expect(firstObject.internalName).toBe('p_size');
      expect(firstObject.name).toBe('Size');
      expect(firstObject.sorted).toBe(true);
      expect(firstObject.type).toBe('secondary');
      expect(firstObject.foo).toBe(secondObject.foo);
      expect(secondObject.id).toBe('ABC-DEFG');
      expect(secondObject.internalName).toBe('p_size');
      expect(secondObject.name).toBe('Size');
      expect(secondObject.sorted).toBe(true);
      expect(secondObject.type).toBe('secondary');
      expect(secondObject.ageSuitability).toBe(undefined);
      expect(secondObject.gender).toBe(undefined);
      expect(secondObject.styleRef).toBe(undefined);
      expect(secondObject.supplier).toBe(undefined);
      expect(secondObject.foo).toEqual({ qux: { quux: 'quuz' } });
    });

    it('returns an object with the properties and values of the first and '
        + 'second object recursively if the deep option is passed in', function () {
      mergedObject = fn.mergeObjects(firstObject, secondObject, { deep: true });
      expect(mergedObject.foo).toEqual({ bar: { baz: 'qux' }, qux: { quux: 'quuz' } });
    });

    it('Adds the properties and values of the second object onto the first recursively '
        + 'if the deep and extend options is passed in', function () {
      fn.mergeObjects(firstObject, secondObject, { deep: true, extend: true });
      expect(firstObject.foo).toEqual({ bar: { baz: 'qux' }, qux: { quux: 'quuz' } });
    });
  });


  /***************************************************************************
   ** typeofArrayValues method ***********************************************
   ***************************************************************************/

  describe('typeofArrayValues method', function () {
    var objects = [{}, {}, {}, {}],
      arrays = [[], [], [], []],
      strings = ['', '', '', ''],
      numbers = [0, 0, 0, 0],
      nulls = [null, null, null],
      mixed = [{}, [], ''];


    describe('when type is not a string', function () {
      it('should return false', function () {
        expect(fn.typeofArrayValues(null, objects)).toBe(false);
      });
    });


    describe('when arr is not an array with values', function () {
      it('should return false', function () {
        expect(fn.typeofArrayValues('object', [])).toBe(false);
      });
    });


    describe('when an array of mixed types are passed in', function () {
      it('should return false', function () {
        expect(fn.typeofArrayValues('object', mixed)).toBe(false);
      });
    });


    describe('when an array of objects are passed in', function () {
      it('should return true', function () {
        expect(fn.typeofArrayValues('object', objects)).toBe(true);
      });
    });


    describe('when an array of arrays are passed in', function () {
      it('should return true', function () {
        expect(fn.typeofArrayValues('array', arrays)).toBe(true);
      });
    });


    describe('when an array of strings are passed in', function () {
      it('should return true', function () {
        expect(fn.typeofArrayValues('string', strings)).toBe(true);
      });
    });


    describe('when an array of numbers are passed in', function () {
      it('should return true', function () {
        expect(fn.typeofArrayValues('number', numbers)).toBe(true);
      });
    });


    describe('when an array of nulls are passed in', function () {
      it('should return true', function () {
        expect(fn.typeofArrayValues('null', nulls)).toBe(true);
      });
    });
  });


  /***************************************************************************
   ** isFalsy method *********************************************************
   ***************************************************************************/

  describe('isFalsy method', function () {
    it('returns true if a value is "falsy", which is defined as '
        + 'null, undefined, empty string or an empty object', function () {
      expect(fn.isFalsy('')).toBe(true);
      expect(fn.isFalsy('this is a string')).toBe(false);
      expect(fn.isFalsy(undefined)).toBe(true);
      expect(fn.isFalsy(null)).toBe(true);
      expect(fn.isFalsy({ name: 'Bob' })).toBe(false);
      expect(fn.isFalsy({})).toBe(true);
      expect(fn.isFalsy([])).toBe(false);
      expect(fn.isFalsy([1, 3, 4, 5, 6, 3])).toBe(false);
      expect(fn.isFalsy(false)).toBe(false);
      expect(fn.isFalsy(true)).toBe(false);
    });
  });


  /***************************************************************************
   ** checkData method *******************************************************
   ***************************************************************************/

  describe('checkData method', function () {
    var PRD_313_0760 = {},
      PRD_420_1034 = {},
      products = [],
      testData = undefined;


    beforeEach(function () {
      PRD_313_0760 = fn.copyObject(mocks.products['313-0760'].data, { deep: true });
      PRD_420_1034 = fn.copyObject(mocks.products['420-1034'].data, { deep: true });

      PRD_313_0760.alfa = {};
      PRD_313_0760.bravo = null;
      PRD_313_0760.charlie = undefined;
      PRD_313_0760.delta = {};

      PRD_420_1034.alfa = { bravo: 'charlie' };
      PRD_420_1034.bravo = [];
      PRD_420_1034.charlie = undefined;
      PRD_420_1034.delta = {};

      products = [PRD_313_0760, PRD_420_1034];
    });


    describe('when data is not an object or an array of objects', function () {
      it('should return false', function () {
        expect(fn.checkData('alfa')).toBe(false);
        expect(fn.checkData(['alfa', { bravo: 'charlie' }])).toBe(false);
      });
    });


    describe('when propNames is passed in and is not a string or array of strings', function () {
      it('should return false', function () {
        expect(fn.checkData(PRD_313_0760, true)).toBe(false);
        expect(fn.checkData(PRD_313_0760, ['id', 33])).toBe(false);
      });
    });


    describe('when one object is passed in', function () {
      describe('when no propNames is passed in', function () {
        describe('when the object has an "id" property that is not falsy', function () {
          it('should return true', function () {
            expect(fn.checkData(PRD_313_0760)).toBe(true);
          });
        });


        describe('when the object has an "id" property that is falsy', function () {
          var id = '';


          beforeEach(function () {
            id = PRD_313_0760.id;
            PRD_313_0760.id = '';
          });


          afterEach(function () {
            PRD_313_0760.id = id;
          });


          it('should return false', function () {
            expect(fn.checkData(PRD_313_0760)).toBe(false);
          });
        });
      });


      describe('when propNames are passed in', function () {
        describe('when the object properties are not falsy', function () {
          it('should return true', function () {
            expect(fn.checkData(PRD_313_0760, ['links', 'mediaAssets'])).toBe(true);
          });
        });


        describe('when some of the object properties are falsy', function () {
          it('should return false', function () {
            expect(fn.checkData(PRD_313_0760, ['links', 'alfa'])).toBe(false);
          });
        });


        describe('when the object properties are falsy', function () {
          it('should return false', function () {
            expect(fn.checkData(PRD_313_0760, ['alfa', 'bravo'])).toBe(false);
          });
        });
      });
    });


    describe('when multiple objects are passed in', function () {
      describe('when all object properties are not falsy', function () {
        it('should return true', function () {
          expect(fn.checkData(products, ['id', 'links', 'mediaAssets'])).toBe(true);
        });
      });


      describe('when some objects have properties that are falsy', function () {
        var invalidObj = {};


        beforeEach(function () {
          testData = fn.checkData(products, ['id', 'links', 'alfa'], function (obj) {
            invalidObj = obj;
          });
        });


        it('should return false', function () {
          expect(testData).toBe(false);
          expect(invalidObj.id).toBe(PRD_313_0760.id);
        });
      });


      describe('when all object properties are falsy', function () {
        var invalidObjs = [];


        beforeEach(function () {
          testData = fn.checkData(products, ['charlie', 'delta'], function (obj) {
            invalidObjs.push(obj);
          });
        });


        it('should return false', function () {
          expect(testData).toBe(false);
          expect(invalidObjs[0].id).toBe(PRD_313_0760.id);
          expect(invalidObjs[1].id).toBe(PRD_420_1034.id);
        });
      });
    });
  });


  /***************************************************************************
   ** getValue method ********************************************************
   ***************************************************************************/

  describe('getValue method', function () {
    var funcObject = function () {};

    beforeEach(function () {
      funcObject = function () {};

      funcObject.dynamicAttributes = { supplier: 'FF' };
      funcObject.giftMessagingEnabled = false;
      funcObject.optionsInfo = [{ type: 'primary' }];
    });

    it('returns a value by using each argument to build up an '
        + 'object/array lookup chain on an object or function', function () {
      expect(fn.getValue(dressProduct, 'dynamicAttributes', 'supplier')).toBe('FF');
      expect(fn.getValue(dressProduct, 'giftMessagingEnabled')).toBe(false);
      expect(fn.getValue(dressProduct, 'optionsInfo', 0, 'type')).toBe('primary');
      expect(fn.getValue(funcObject, 'dynamicAttributes', 'supplier')).toBe('FF');
      expect(fn.getValue(funcObject, 'giftMessagingEnabled')).toBe(false);
      expect(fn.getValue(funcObject, 'optionsInfo', 0, 'type')).toBe('primary');
    });

    it('returns null if the first argument is not an object or an array', function () {
      expect(fn.getValue('string')).toBe(null);
      expect(fn.getValue(42432)).toBe(null);
      expect(fn.getValue(['string'])).toBe(null);
    });

    it('returns null if less than two arguments are passed into the method', function () {
      expect(fn.getValue(dressProduct)).toBe(null);
      expect(fn.getValue(funcObject)).toBe(null);
    });

    it('returns null if an argument does not match the next property/index', function () {
      expect(fn.getValue(dressProduct, 'attributes', 'supplier')).toBe(null);
      expect(fn.getValue(dressProduct, 'specifications')).toBe(null);
      expect(fn.getValue(dressProduct, 'optionsInfo', 5, 'type')).toBe(null);
      expect(fn.getValue(funcObject, 'attributes', 'supplier')).toBe(null);
      expect(fn.getValue(funcObject, 'specifications')).toBe(null);
      expect(fn.getValue(funcObject, 'optionsInfo', 5, 'type')).toBe(null);
    });
  });


  /***************************************************************************
   ** resolveName method *****************************************************
   ***************************************************************************/

  describe('resolveName method', function () {
    var productName = 'Products',
      skuName = 'skus',
      listingName = 'listing';

    it('return a lowercase singlular version of the name', function () {
      expect(fn.resolveName(productName)).toBe('product');
      expect(fn.resolveName(skuName)).toBe('sku');
      expect(fn.resolveName(listingName)).toBe('listing');
    });
  });


  /***************************************************************************
   ** createEvent method *****************************************************
   ***************************************************************************/

  describe('createEvent method', function () {
    var PRD_313_0760 = {},
      customEvent = {},
      eventObj = {},
      eventResp = undefined,
      namespacedEventResp = undefined;


    beforeEach(function () {
      PRD_313_0760 = fn.copyObject(mocks.products['313-0760'].data, { deep: true });
    });


    describe('when config is not an object with properties or name is not a string', function () {
      it('should return null', function () {
        expect(fn.createEvent()).toBe(null);
        expect(fn.createEvent({ alfa: 'bravo' })).toBe(null);
      });
    });


    describe('when config is an object and name is passed in', function () {
      beforeEach(function (done) {
        $(window).on('alfa', function (e) {
          eventResp = e;
          done();
        });

        customEvent = fn.createEvent({ name: 'alfa' });
        eventObj = customEvent.get();
        customEvent.fire();
      });


      afterEach(function () {
        $(window).off();
        eventResp = undefined;
      });


      it('should return an object with two methods, fire and get', function () {
        expect(typeof customEvent.fire).toBe('function');
        expect(typeof customEvent.get).toBe('function');
      });


      it('should create an event with the name passed in', function () {
        expect(eventObj.type).toBe('alfa');
        expect(eventResp.type).toBe('alfa');
      });
    });


    describe('when namespace is passed in', function () {
      describe('when the suppressDefault option is not passed in', function () {
        beforeEach(function (done) {
          $(window).on('alfa', function (e) {
            eventResp = e;
            done();
          });

          $(window).on('alfa.bravo', function (e) {
            if (e.namespace) {
              namespacedEventResp = e;
            }
          });

          customEvent = fn.createEvent({ name: 'alfa', namespace: 'bravo' });
          eventObj = customEvent.get();
          customEvent.fire();
        });


        afterEach(function () {
          $(window).off();
          eventResp = undefined;
          namespacedEventResp = undefined;
        });


        it('should return an object with two methods, fire and get', function () {
          expect(typeof customEvent.fire).toBe('function');
          expect(typeof customEvent.get).toBe('function');
        });


        it('should create two events, one with the namespace and one without', function () {
          expect(eventObj.type).toBe('alfa');
          expect(eventObj.namespace).toBe('bravo');

          expect(namespacedEventResp.type).toBe('alfa');
          expect(namespacedEventResp.namespace).toBe('bravo');

          expect(eventResp.type).toBe('alfa');
          expect(eventResp.namespace).toBe('');
        });
      });


      describe('when the suppressDefault option is true', function () {
        beforeEach(function (done) {
          $(window).on('alfa', function (e) {
            eventResp = e;
          });

          $(window).on('alfa.bravo', function (e) {
            if (e.namespace) {
              namespacedEventResp = e;
            }
            done();
          });

          customEvent = fn.createEvent(
            { name: 'alfa', namespace: 'bravo' }, { suppressDefault: true }
          );
          eventObj = customEvent.get();
          customEvent.fire();
        });


        afterEach(function () {
          $(window).off();
          eventResp = undefined;
          namespacedEventResp = undefined;
        });


        it('should return an object with two methods, fire and get', function () {
          expect(typeof customEvent.fire).toBe('function');
          expect(typeof customEvent.get).toBe('function');
        });


        it('should create two events, one with the namespace and one without', function () {
          expect(eventObj.type).toBe('alfa');
          expect(eventObj.namespace).toBe('bravo');

          expect(namespacedEventResp.type).toBe('alfa');
          expect(namespacedEventResp.namespace).toBe('bravo');

          expect(eventResp).toBe(undefined);
        });
      });
    });


    describe('when data is passed in', function () {
      beforeEach(function (done) {
        $(window).on('alfa', function (e) {
          eventResp = e;
          done();
        });

        customEvent = fn.createEvent({ name: 'alfa', data: PRD_313_0760 });
        eventObj = customEvent.get();
        customEvent.fire();
      });


      afterEach(function () {
        $(window).off();
        eventResp = undefined;
      });


      it('should return an object with two methods, fire and get', function () {
        expect(typeof customEvent.fire).toBe('function');
        expect(typeof customEvent.get).toBe('function');
      });


      it('should create an event with the data on a property of "mvc"', function () {
        expect(eventObj.type).toBe('alfa');
        expect(eventObj.mvc).toBe(PRD_313_0760);

        expect(eventResp.type).toBe('alfa');
        expect(eventResp.mvc).toBe(PRD_313_0760);
      });
    });


    describe('when propName is passed in', function () {
      beforeEach(function (done) {
        $(window).on('alfa', function (e) {
          eventResp = e;
          done();
        });

        customEvent = fn.createEvent({ name: 'alfa', data: PRD_313_0760, propName: 'charlie' });
        eventObj = customEvent.get();
        customEvent.fire();
      });


      afterEach(function () {
        $(window).off();
        eventResp = undefined;
      });


      it('should return an object with two methods, fire and get', function () {
        expect(typeof customEvent.fire).toBe('function');
        expect(typeof customEvent.get).toBe('function');
      });


      it('should create an event with the data on propName', function () {
        expect(eventObj.type).toBe('alfa');
        expect(eventObj.charlie).toBe(PRD_313_0760);

        expect(eventResp.type).toBe('alfa');
        expect(eventResp.charlie).toBe(PRD_313_0760);
      });
    });


    describe('when target is passed in', function () {
      beforeEach(function (done) {
        setFixtures('<div id="bravo"></div>');

        $('#bravo').on('alfa', function (e) {
          eventResp = e;
          done();
        });

        customEvent = fn.createEvent({ name: 'alfa', target: '#bravo' });
        eventObj = customEvent.get();
        customEvent.fire();
      });


      afterEach(function () {
        $('#bravo').off();
        eventResp = undefined;
      });


      it('should return an object with two methods, fire and get', function () {
        expect(typeof customEvent.fire).toBe('function');
        expect(typeof customEvent.get).toBe('function');
      });


      it('should create an event bound to the target', function () {
        expect(eventObj.type).toBe('alfa');
        expect(eventResp.type).toBe('alfa');
      });
    });
  });


  /***************************************************************************
   ** createId method ********************************************************
   ***************************************************************************/

  describe('createId method', function () {
    it('should return a randomised number string with seven digits', function () {
      var id = fn.createId();

      expect(typeof id).toEqual('string');
    });

    it('should return a string with a prefix if a prefix is passed into the method', function () {
      var id = fn.createId({ prefix: 'test' });

      expect(id).toMatch(/^test.*/);
    });
  });


  /***************************************************************************
   ** hashValue method *******************************************************
   ***************************************************************************/

  describe('hashValue method', function () {
    var emptyObj = {},
      obj = { these: 'these', are: 'are', test: 'test', keys: 'keys', values: 'values' },
      emptyArr = [],
      arr = ['these', 'are', 'test', 'values'],
      num = 123456789,
      str = 'This is a test string';

    it('should return a numerical respresentation of the value passed in', function () {
      expect(typeof fn.hashValue(obj)).toEqual('number');
    });

    it('should return a consistent respresentation of the value passed in', function () {
      expect(fn.hashValue(emptyObj)).toEqual(fn.hashValue(emptyObj));
      expect(fn.hashValue(obj)).toEqual(fn.hashValue(obj));
      expect(fn.hashValue(emptyArr)).toEqual(fn.hashValue(emptyArr));
      expect(fn.hashValue(arr)).toEqual(fn.hashValue(arr));
      expect(fn.hashValue(num)).toEqual(fn.hashValue(num));
      expect(fn.hashValue(str)).toEqual(fn.hashValue(str));
    });
  });


  /***************************************************************************
   ** parseHtml method *******************************************************
   ***************************************************************************/

  describe('parseHtml method', function () {
    it('should return a dom node representing the html string passed into the method', function () {
      var html = '<div id="test-node"><span>I am some text</span></div>',
        node = fn.parseHtml(html);

      expect(node instanceof Element).toEqual(true);
      expect(node.nodeName).toEqual('DIV');
      expect(node.getAttribute('id')).toEqual('test-node');
      expect(node.children[0].nodeName).toEqual('SPAN');
      expect(node.children[0].textContent).toEqual('I am some text');
    });
  });


  /***************************************************************************
   ** refreshElement method **************************************************
   ***************************************************************************/

  describe('refreshElement method', function () {
    var targetElement = document.createElement('div'),
      sourceElement = document.createElement('div');

    beforeEach(function () {
      spyOn(fn, 'refreshAttributes');
      spyOn(fn, 'refreshContent');
    });

    it('calls fn.refreshAttributes and fn.refreshContent if both target '
        + 'and source are instances of Element and no options are passed', function () {
      fn.refreshElement(targetElement, sourceElement);
      expect(fn.refreshAttributes).toHaveBeenCalled();
      expect(fn.refreshContent).toHaveBeenCalled();
    });

    it('does not call fn.refreshAttributes if its suppress option is passed', function () {
      fn.refreshElement(targetElement, sourceElement, { suppressAttributeRefresh: true });
      expect(fn.refreshAttributes).not.toHaveBeenCalled();
      expect(fn.refreshContent).toHaveBeenCalled();
    });

    it('does not call fn.refreshContent if its suppress option is passed', function () {
      fn.refreshElement(targetElement, sourceElement, { suppressContentRefresh: true });
      expect(fn.refreshAttributes).toHaveBeenCalled();
      expect(fn.refreshContent).not.toHaveBeenCalled();
    });
  });


  /***************************************************************************
   ** refreshAttributes method ***********************************************
   ***************************************************************************/

  describe('refreshAttributes method', function () {
    var nonElement = window,
      targetElement = {},
      sourceElement = {};

    beforeEach(function () {
      targetElement = document.createElement('div');
      targetElement.setAttribute('id', 'target-element');
      targetElement.setAttribute('class', 'element');
      sourceElement = document.createElement('div');
      sourceElement.setAttribute('id', 'source-element');
      sourceElement.setAttribute('class', 'element');
    });

    it('updates attributes on the target element that are shared with the source '
        + 'element with the values of the latter', function () {
      targetElement.setAttribute('data-update', 'existing value');
      sourceElement.setAttribute('data-update', 'value to update');
      fn.refreshAttributes(targetElement, sourceElement);
      expect(targetElement.getAttribute('data-update')).toBe('value to update');
    });

    it('adds attributes on the target element that are on the source '
        + 'element with the values of the latter', function () {
      sourceElement.setAttribute('data-add', 'value to add');
      fn.refreshAttributes(targetElement, sourceElement);
      expect(targetElement.getAttribute('data-add')).toBe('value to add');
    });

    it('removes attributes on the target element that are not on the source element', function () {
      targetElement.setAttribute('data-remove', 'value to remove');
      fn.refreshAttributes(targetElement, sourceElement);
      expect(targetElement.hasAttribute('data-remove')).toBe(false);
    });

    it('does not update the target element if either is not an instance of Element', function () {
      targetElement.setAttribute('data-update', 'existing value');
      fn.refreshAttributes(targetElement, nonElement);
      expect(targetElement.getAttribute('data-update')).toBe('existing value');
    });
  });


  /***************************************************************************
   ** refreshContent method **************************************************
   ***************************************************************************/

  describe('refreshContent method', function () {
    var buttonContent = '<button>Add to basket</button>',
      linkContent = '<a>Why do we have different sellers?</a>',
      nonElement = window,
      targetElement = {},
      sourceElement = {};

    beforeEach(function () {
      targetElement = document.createElement('div');
      targetElement.innerHTML = buttonContent;
      sourceElement = document.createElement('div');
      sourceElement.innerHTML = linkContent;
    });

    it('updates the target element innerHTML with the source innerHTML if both source and target'
        + 'are instance of Element and their innerHTML is different', function () {
      fn.refreshContent(targetElement, sourceElement);
      expect(targetElement.innerHTML).toBe(linkContent);
    });

    it('does not update the target element innerHTML with the source innerHTML if either '
        + 'is not an instance of Element', function () {
      fn.refreshContent(targetElement, nonElement);
      expect(targetElement.innerHTML).toBe(buttonContent);
    });
  });


  /***************************************************************************
   ** setSessionData method *******************************************************
   ***************************************************************************/

  describe('setSessionData method', function () {
    beforeEach(function () {
      spyOn(window.sessionStorage, 'setItem').and.callThrough();
    });


    describe('when the key is not a string', function () {
      beforeEach(function () {
        fn.setSessionData(true, 'alfa');
      });


      it('should not set the session data', function () {
        expect(window.sessionStorage.setItem.calls.count()).toBe(0);
      });
    });


    describe('when the value is undefined', function () {
      beforeEach(function () {
        fn.setSessionData('alfa', undefined);
      });


      it('should not set the session data', function () {
        expect(window.sessionStorage.setItem.calls.count()).toBe(0);
      });
    });


    describe('when correct parameters are passed', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setSessionData(key, values[key]);
        });
      });


      afterEach(function () {
        fn.clearSessionData();
      });


      it('should set the data in the session storage', function () {
        expect(window.sessionStorage.setItem.calls.count()).toBe(5);
        expect(fn.getSessionData('str')).toBe(values.str);
        expect(fn.getSessionData('obj')).toEqual(values.obj);
        expect(fn.getSessionData('bool')).toBe(values.bool);
        expect(fn.getSessionData('arr')).toEqual(values.arr);
        expect(fn.getSessionData('num')).toEqual(values.num);
      });
    });
  });


  /***************************************************************************
   ** getSessionData method **************************************************
   ***************************************************************************/

  describe('getSessionData method', function () {
    var testData = undefined;


    beforeEach(function () {
      spyOn(window.sessionStorage, 'getItem').and.callThrough();
    });


    describe('when the key is not a string', function () {
      beforeEach(function () {
        fn.setSessionData('alfa', 'bravo');
        testData = fn.getSessionData(true);
      });


      afterEach(function () {
        fn.clearSessionData();
      });


      it('should not get the session data', function () {
        expect(window.sessionStorage.getItem.calls.count()).toBe(0);
        expect(testData).toBe(null);
      });
    });


    describe('when the key is undefined', function () {
      beforeEach(function () {
        testData = fn.getSessionData();
      });


      it('should return the sessionStorage object', function () {
        expect(window.sessionStorage.getItem.calls.count()).toBe(0);
        expect(testData).toBe(window.sessionStorage);
      });
    });


    describe('when the key is a string', function () {
      beforeEach(function () {
        fn.setSessionData('alfa', 'bravo');
        testData = fn.getSessionData('alfa');
      });


      afterEach(function () {
        fn.clearSessionData();
      });


      it('should not get the session data', function () {
        expect(window.sessionStorage.getItem.calls.count()).toBe(1);
        expect(testData).toBe('bravo');
      });
    });
  });


  /***************************************************************************
   ** clearSessionData method ************************************************
   ***************************************************************************/

  describe('clearSessionData method', function () {
    beforeEach(function () {
      spyOn(window.sessionStorage, 'clear').and.callThrough();
      spyOn(window.sessionStorage, 'removeItem').and.callThrough();
    });


    describe('when the key is undefined', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setSessionData(key, values[key]);
        });
        fn.clearSessionData();
      });


      it('should clear all sessionData', function () {
        expect(window.sessionStorage.clear.calls.count()).toBe(1);
        expect(fn.getSessionData('str')).toBe(null);
        expect(fn.getSessionData('obj')).toBe(null);
        expect(fn.getSessionData('bool')).toBe(null);
        expect(fn.getSessionData('arr')).toBe(null);
        expect(fn.getSessionData('num')).toBe(null);
      });
    });


    describe('when the key is not a string', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setSessionData(key, values[key]);
        });
        fn.clearSessionData(true);
      });


      afterEach(function () {
        fn.clearSessionData();
      });


      it('should not clear or remove sessionData', function () {
        expect(window.sessionStorage.clear.calls.count()).toBe(0);
        expect(fn.getSessionData('str')).toBe(values.str);
        expect(fn.getSessionData('obj')).toEqual(values.obj);
        expect(fn.getSessionData('bool')).toBe(values.bool);
        expect(fn.getSessionData('arr')).toEqual(values.arr);
        expect(fn.getSessionData('num')).toEqual(values.num);
      });
    });


    describe('when the key is a string', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setSessionData(key, values[key]);
        });
        fn.clearSessionData('arr');
      });


      it('should remove the requested sessionStorage', function () {
        expect(window.sessionStorage.removeItem.calls.count()).toBe(1);
        expect(fn.getSessionData('str')).toBe(values.str);
        expect(fn.getSessionData('obj')).toEqual(values.obj);
        expect(fn.getSessionData('bool')).toBe(values.bool);
        expect(fn.getSessionData('arr')).toEqual(null);
        expect(fn.getSessionData('num')).toEqual(values.num);
      });
    });
  });


  /***************************************************************************
   ** setLocalStorageData method *********************************************
   ***************************************************************************/

  describe('setLocalStorageData method', function () {
    beforeEach(function () {
      spyOn(window.localStorage, 'setItem').and.callThrough();
    });


    describe('when the key is not a string', function () {
      beforeEach(function () {
        fn.setLocalStorageData(true, 'alfa');
      });


      it('should not set the session data', function () {
        expect(window.localStorage.setItem.calls.count()).toBe(0);
      });
    });


    describe('when the value is undefined', function () {
      beforeEach(function () {
        fn.setLocalStorageData('alfa', undefined);
      });


      it('should not set the local storage data', function () {
        expect(window.localStorage.setItem.calls.count()).toBe(0);
      });
    });


    describe('when correct parameters are passed', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setLocalStorageData(key, values[key]);
        });
      });


      afterEach(function () {
        fn.clearLocalStorageData();
      });


      it('should set the data in the local storage', function () {
        expect(window.localStorage.setItem.calls.count()).toBe(5);
        expect(fn.getLocalStorageData('str')).toBe(values.str);
        expect(fn.getLocalStorageData('obj')).toEqual(values.obj);
        expect(fn.getLocalStorageData('bool')).toBe(values.bool);
        expect(fn.getLocalStorageData('arr')).toEqual(values.arr);
        expect(fn.getLocalStorageData('num')).toEqual(values.num);
      });
    });
  });


  /***************************************************************************
   ** getLocalStorageData method **************************************************
   ***************************************************************************/

  describe('getLocalStorageData method', function () {
    var testData = undefined;


    beforeEach(function () {
      spyOn(window.localStorage, 'getItem').and.callThrough();
    });


    describe('when the key is not a string', function () {
      beforeEach(function () {
        fn.setLocalStorageData('alfa', 'bravo');
        testData = fn.getLocalStorageData(true);
      });


      afterEach(function () {
        fn.clearLocalStorageData();
      });


      it('should not get the local storage data', function () {
        expect(window.localStorage.getItem.calls.count()).toBe(0);
        expect(testData).toBe(null);
      });
    });


    describe('when the key is undefined', function () {
      beforeEach(function () {
        testData = fn.getLocalStorageData();
      });


      it('should return the local storage object', function () {
        expect(window.localStorage.getItem.calls.count()).toBe(0);
        expect(testData).toBe(window.localStorage);
      });
    });


    describe('when the key is a string', function () {
      beforeEach(function () {
        fn.setLocalStorageData('alfa', 'bravo');
        testData = fn.getLocalStorageData('alfa');
      });


      afterEach(function () {
        fn.clearLocalStorageData();
      });


      it('should not get the session data', function () {
        expect(window.localStorage.getItem.calls.count()).toBe(1);
        expect(testData).toBe('bravo');
      });
    });
  });


  /***************************************************************************
   ** clearLocalStorageData method ************************************************
   ***************************************************************************/

  describe('clearLocalStorageData method', function () {
    beforeEach(function () {
      spyOn(window.localStorage, 'clear').and.callThrough();
      spyOn(window.localStorage, 'removeItem').and.callThrough();
    });


    describe('when the key is undefined', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setLocalStorageData(key, values[key]);
        });
        fn.clearLocalStorageData();
      });


      it('should clear all local storage data', function () {
        expect(window.localStorage.clear.calls.count()).toBe(1);
        expect(fn.getLocalStorageData('str')).toBe(null);
        expect(fn.getLocalStorageData('obj')).toBe(null);
        expect(fn.getLocalStorageData('bool')).toBe(null);
        expect(fn.getLocalStorageData('arr')).toBe(null);
        expect(fn.getLocalStorageData('num')).toBe(null);
      });
    });


    describe('when the key is not a string', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setLocalStorageData(key, values[key]);
        });
        fn.clearLocalStorageData(true);
      });


      afterEach(function () {
        fn.clearLocalStorageData();
      });


      it('should not clear or remove local storage data', function () {
        expect(window.localStorage.clear.calls.count()).toBe(0);
        expect(fn.getLocalStorageData('str')).toBe(values.str);
        expect(fn.getLocalStorageData('obj')).toEqual(values.obj);
        expect(fn.getLocalStorageData('bool')).toBe(values.bool);
        expect(fn.getLocalStorageData('arr')).toEqual(values.arr);
        expect(fn.getLocalStorageData('num')).toEqual(values.num);
      });
    });


    describe('when the key is a string', function () {
      var values = {
        str: 'alfa',
        obj: { bravo: 'charlie' },
        bool: true,
        arr: ['alfa', 'bravo', 'charlie'],
        num: 6
      };


      beforeEach(function () {
        fn.loopObject(values, function (key) {
          fn.setLocalStorageData(key, values[key]);
        });
        fn.clearLocalStorageData('arr');
      });


      it('should remove the requested local storage', function () {
        expect(window.localStorage.removeItem.calls.count()).toBe(1);
        expect(fn.getLocalStorageData('str')).toBe(values.str);
        expect(fn.getLocalStorageData('obj')).toEqual(values.obj);
        expect(fn.getLocalStorageData('bool')).toBe(values.bool);
        expect(fn.getLocalStorageData('arr')).toEqual(null);
        expect(fn.getLocalStorageData('num')).toEqual(values.num);
      });
    });
  });


  /***************************************************************************
   ** isGeolocationAvailable method ******************************************
   ***************************************************************************/

  describe('isGeolocationAvailable method', function () {
    var result = null;

    beforeAll(function () {
      window.navigator = {};
    });

    afterEach(function () {
      window.navigator = {};
      result = null;
    });

    describe('when geolocation is available', function () {
      it('should return true', function () {
        window.navigator.geolocation = {
          getCurrentPosition: function () {}
        };
        result = fn.isGeolocationAvailable();

        expect(result).toBe(true);
      });
    });

    describe('when geolocation is not available', function () {
      it('should return false', function () {
        result = fn.isGeolocationAvailable();

        expect(result).toBe(false);
      });
    });
  });


  /***************************************************************************
   ** getCurrentPosition method **********************************************
   ***************************************************************************/

  describe('getCurrentPosition method', function () {
    var result = null,
      successHandler = function (position) {
        result = position;
      },
      errorHandler = function (error) {
        result = error;
      },
      options = null,
      output = null;

    beforeEach(function () {
      window.navigator = {};
      window.navigator.geolocation = {
        getCurrentPosition: function () {}
      };
      spyOn(window.navigator.geolocation, 'getCurrentPosition').and.callFake(function () {
        return result;
      });
    });

    afterEach(function () {
      result = null;
      options = null;
      output = null;
    });

    describe('when geolocation is not available', function () {
      beforeEach(function () {
        spyOn(fn, 'isGeolocationAvailable').and.returnValue(false);
      });

      it('should return false', function () {
        output = fn.getCurrentPosition(successHandler, errorHandler);

        expect(output).toBe(false);
      });

      it('should not call getCurrentPosition', function () {
        fn.getCurrentPosition(successHandler, errorHandler);

        expect(window.navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
      });
    });

    describe('when successHandler is not a function', function () {
      it('should return false', function () {
        output = fn.getCurrentPosition(null, errorHandler);

        expect(output).toBe(false);
      });

      it('should not call getCurrentPosition', function () {
        fn.getCurrentPosition(null, errorHandler);

        expect(window.navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
      });
    });

    describe('when errorHandler is not a function', function () {
      it('should return false', function () {
        output = fn.getCurrentPosition(successHandler, undefined);

        expect(output).toBe(false);
      });

      it('should not call getCurrentPosition', function () {
        fn.getCurrentPosition(successHandler, undefined);

        expect(window.navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
      });
    });

    describe('when called with success and error handlers', function () {
      it('should call getCurrentPosition', function () {
        fn.getCurrentPosition(successHandler, errorHandler);

        expect(window.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
      });

      it('should return true', function () {
        output = fn.getCurrentPosition(successHandler, errorHandler);

        expect(output).toBe(true);
      });

      it('should call getCurrentPosition with default options', function () {
        fn.getCurrentPosition(successHandler, errorHandler);

        expect(window.navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
          successHandler,
          errorHandler,
          { enableHighAccuracy: false, timeout: Infinity, maximumAge: 0 }
        );
      });

      describe('when called with options passed in', function () {
        it('should merge options with default options', function () {
          options = { enableHighAccuracy: true, timeout: 2000 };
          fn.getCurrentPosition(successHandler, errorHandler, options);

          expect(window.navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
            successHandler,
            errorHandler,
            { enableHighAccuracy: true, timeout: 2000, maximumAge: 0 }
          );
        });
      });
    });
  });
});
