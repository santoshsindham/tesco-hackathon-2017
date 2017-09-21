define(function (require) {
  'use strict';

  var Adsense = require('modules/adsense/index');

  jasmine.getFixtures().fixturesPath = 'base/test-framework/fixtures/';

  /***************************************************************************
   ** render method **********************************************************
   ***************************************************************************/

  describe('render method', function () {
    var adsense = null,
      googleScope = null,
      kioskFlag = null,
      output = null;

    beforeAll(function () {
      if (typeof window.isKiosk === 'function') {
        kioskFlag = true;
      } else {
        window.isKiosk = function () {};
        kioskFlag = false;
      }

      if (window.google) {
        googleScope = true;
      } else {
        window.google = { ads: { search: { Ads: function Ads() {} } } };
        googleScope = false;
      }

      spyOn(window.google.ads.search, 'Ads');
    });

    afterAll(function () {
      if (!kioskFlag) {
        delete window.isKiosk;
      }

      if (!googleScope) {
        delete window.google;
      }
    });

    describe('when the application is kiosk', function () {
      beforeAll(function () {
        setFixtures('<div id="adsense-placeholder-1"></div>');
        spyOn(window, 'isKiosk').and.returnValue(true);
        adsense = new Adsense();
        spyOn(adsense, '_buildContainer');
        adsense.render();
      });

      it('should not append the wrapper to the dom or initialise the ad', function () {
        expect($('#adsense-placeholder-1')[0].innerHTML === '').toBe(true);
        expect(window.google.ads.search.Ads.calls.count()).toBe(0);
      });
    });

    describe('when the application is not kiosk', function () {
      beforeAll(function () {
        spyOn(window, 'isKiosk').and.returnValue(false);
      });

      describe('when there are errors in the errors array', function () {
        describe('when the errors were in the constructor', function () {
          beforeEach(function () {
            setFixtures('<div id="adsense-placeholder-1"></div>');
            adsense = new Adsense();
            output = adsense.render();
          });

          it('should return an errors object with the array of errors', function () {
            expect(output.errors.length).toBe(4);
          });

          it('should not append the wrapper to the dom or initialise the ad', function () {
            expect($('#adsense-placeholder-1')[0].innerHTML === '').toBe(true);
            expect(window.google.ads.search.Ads.calls.count()).toBe(0);
          });
        });

        describe('when the errors were in the buildWrapper method', function () {
          beforeEach(function () {
            setFixtures('<div id="adsense-placeholder-1"></div>');

            adsense = new Adsense({
              placeholder: 'adsense-placeholder-1',
              container: 'adsense-1',
              query: 'alfa bravo charlie delta',
              containerOptions: {
                tagName: 'div',
                attributes: [],
                id: 'adsense-1',
                localName: 'foxtrot'
              }
            });

            output = adsense.render();
          });

          it('should return an errors object with the array of errors', function () {
            expect(output.errors.length).toBe(2);
          });

          it('should not append the wrapper to the dom or initialise the ad', function () {
            expect($('#adsense-placeholder-1')[0].innerHTML === '').toBe(true);
            expect(window.google.ads.search.Ads.calls.count()).toBe(0);
          });
        });
      });

      describe('when there are no errors in the array', function () {
        describe('when executing the google method throws an exception', function () {
          beforeEach(function () {
            setFixtures('<div id="adsense-placeholder-1"></div>');
            window.google.ads.search.Ads.and.throwError('Cannot read property "ads" of undefined.');

            adsense = new Adsense({
              placeholder: 'adsense-placeholder-1',
              container: 'adsense-1',
              query: 'alfa bravo charlie delta'
            });

            output = adsense.render();
          });

          afterEach(function () {
            window.google.ads.search.Ads.and.returnValue();
            window.google.ads.search.Ads.calls.reset();
          });

          it('should return an errors object with the array of errors', function () {
            expect(output.errors.length).toBe(1);
          });

          it('should not append the wrapper to the dom', function () {
            expect($('#adsense-placeholder-1')[0].innerHTML === '').toBe(true);
          });
        });

        describe('when the google method executes successfully', function () {
          beforeAll(function () {
            setFixtures('<div id="adsense-placeholder-1"></div>');

            adsense = new Adsense({
              placeholder: 'adsense-placeholder-1',
              container: 'adsense-1',
              query: 'alfa bravo charlie delta'
            });

            adsense.render();
          });

          afterEach(function () {
            window.google.ads.search.Ads.calls.reset();
          });

          it('should append the wrapper to the dom and initialise the ad', function () {
            expect($('#adsense-placeholder-1').find('#adsense-1').length).toBe(1);
            expect(window.google.ads.search.Ads.calls.count()).toBe(1);
          });
        });
      });
    });
  });
});
