define([
  'modules/pdp/BaseClass'
], function (BaseClass) {
  'use strict';

  var objectArray = [],
    identityFunction = function (x) {
      return x;
    };

  describe('BaseClass', function () {
    describe('forLoop Test', function () {
      describe('Given a BaseClass object', function () {
        var baseClass = new BaseClass();

        // This test is ensure that the forLoop method is robust,
        //  as it might be called with a non-array like object.
        // See https://jira.global.tesco.org/browse/GFO-12762
        it('should handle non-array objects gracefully', function () {
          expect(baseClass.forLoop.bind(baseClass, objectArray, identityFunction)).not.toThrow();
          expect(baseClass.forLoop.bind(baseClass, null, identityFunction)).not.toThrow();
          expect(baseClass.forLoop.bind(baseClass, undefined, identityFunction)).not.toThrow();
        });
      });
    });
  });
});
