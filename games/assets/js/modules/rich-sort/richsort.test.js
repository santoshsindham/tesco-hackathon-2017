define('modules/rich-sort/richsort.test', ['modules/rich-sort/RichSort'], function (RichSort) {
  'use strict';

  describe('RichSort with SlickStitch', function () {
    var SKUList = ['500-9839', '100-3493', '938-9762', '472-2782', '332-9282', '924-8374'],
      SKUString = '500-9839,100-3493,938-9762,472-2782,332-9282,924-8374';

    describe('when skus are fetched from Slickstitch at zero offset', function () {
      var richSort = new RichSort('SlickStitch'),
        offset = 0,
        length = 5,
        offsetSkus = null;

      setFixtures('<div class="products-wrapper" data-schoolskulist="' + SKUString + '"></div>');

      offsetSkus = richSort.getSKUsFromSlickStitchPub(offset, length);

      it('getSKUs should return expected results', function () {
        expect(offsetSkus).toEqual(SKUList.slice().splice(offset, length));
      });
    });

    describe('when skus are fetched from Slickstitch at non-zero offset', function () {
      var richSort = new RichSort('SlickStitch'),
        offset = 0,
        length = 2,
        delta = 2,
        offsetSkus = null;

      setFixtures('<div class="products-wrapper" data-schoolskulist="' + SKUString + '"></div>');
      offsetSkus = richSort.getSKUsFromSlickStitchPub(offset + delta, length);

      it('getSKUs should return expected results', function () {
        expect(offsetSkus).toEqual(SKUList.slice().splice(offset + delta, length));
      });
    });

    describe('when skus are fetched from Slickstitch but sku list is empty', function () {
      var richSort = new RichSort('SlickStitch'),
        offset = 0,
        length = 5,
        offsetSkus = null;

      setFixtures('<div class="products-wrapper" data-schoolskulist=""></div>');
      offsetSkus = richSort.getSKUsFromSlickStitchPub(offset);

      it('does not throw an error', function () {
        expect(richSort.getSKUsFromSlickStitchPub.bind(richSort, offset, length)).not.toThrow();
      });

      it('calling getSKUs should return an empty array', function () {
        expect(offsetSkus).toEqual([]);
      });
    });

    describe('when skus are fetched from Slickstitch but sku list is missing', function () {
      var richSort = new RichSort('SlickStitch'),
        offset = 0,
        length = 5;

      setFixtures('<div class="products-wrapper"></div>');

      it('should not throw an error', function () {
        expect(richSort.getSKUsFromSlickStitchPub.bind(richSort, offset, length)).not.toThrow();
      });
    });

    describe('when skus are fetched from Slickstitch and no matching element exists', function () {
      var richSort = new RichSort('SlickStitch'),
        offset = 0,
        length = 5;

      setFixtures('<div class="non-products-wrapper"></div>');

      it('should not throw an error', function () {
        expect(richSort.getSKUsFromSlickStitchPub.bind(richSort, offset, length)).not.toThrow();
      });
    });
  });
});
