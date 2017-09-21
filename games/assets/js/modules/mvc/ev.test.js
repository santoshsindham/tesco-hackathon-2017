define(function (require) {
  'use strict';


  var ev = require('modules/mvc/ev'),
    fn = require('modules/mvc/fn');


  /***************************************************************************
   ** renderView method ******************************************************
   ***************************************************************************/

  describe('renderView method', function () {
    var testData = {};


    beforeEach(function () {
      spyOn(fn, 'createEvent').and.callThrough();
    });


    describe('when all the required data is passed in', function () {
      var args = { alfa: 'bravo' };


      beforeEach(function (done) {
        $(window).on('render', function (e) {
          testData = e;
          done();
        });

        ev.renderView(args);
      });


      it('should fire the event and return the data passed in on the event object', function () {
        expect(fn.createEvent.calls.count()).toBe(1);
        expect(testData.oData.alfa).toBe('bravo');
      });
    });
  });
});
