define([
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/models/SkuModel',
  'test-framework/mocks/mocks'
], function ($, fn, SkuModel, mocks) {
  'use strict';

  var skuModel = {};


  /***************************************************************************
   ** getBookDetails method **************************************************
   ***************************************************************************/

  describe('getBookDetails method', function () {
    var fromID = {},
      fromObj = {};

    beforeEach(function () {
      skuModel = new SkuModel();
      skuModel.add([mocks.skus['24A-5X7U'].data, mocks.skus['231-0874'].data]);
    });

    afterEach(function () {
      fromID = {};
      fromObj = {};
      skuModel = {};
    });

    it('returns the bookDetails prop value of a given id/dataObject if it is '
        + 'an object with properties', function () {
      fromID = skuModel.getBookDetails('24A-5X7U');
      fromObj = skuModel.getBookDetails(mocks.skus['ZA3-TD6B'].data);

      expect(fromID.genre).toBe('Thriller  suspense');
      expect(fromID.authors).toBe('Peter James');
      expect(fromID.edition).toBe('Main Market Ed.');
      expect(fromID.ISBN).toBe('9781447256014');
      expect(fromID.publicationDate).toBe('31-12-2015');
      expect(fromID.totalPages).toBe('400');
      expect(fromID.formats).toBe('Paperback');
      expect(fromID.publisher).toBe('Pan Macmillan');

      expect(fromObj.genre).toBe('Autobiography: sport');
      expect(fromObj.authors).toBe('Guy Martin');
      expect(fromObj.illustrations).toBe('illustrations');
      expect(fromObj.ISBN).toBe('9780753555033');
      expect(fromObj.secondaryGenre).toBe('Motorcycle racing');
      expect(fromObj.publicationDate).toBe('21-05-2015');
      expect(fromObj.totalPages).toBe('320');
      expect(fromObj.formats).toBe('Paperback');
      expect(fromObj.publisher).toBe('Ebury Publishing');
    });

    it('returns an empty object if the bookDetails prop value of a given '
        + 'id/dataObject is falsy', function () {
      fromID = skuModel.getBookDetails('231-0874');
      fromObj = skuModel.getBookDetails(mocks.skus['231-0874'].data);

      expect($.isEmptyObject(fromID)).toBe(true);
      expect(fromID.genre).toBe(undefined);
      expect(fromID.authors).toBe(undefined);
      expect(fromID.edition).toBe(undefined);
      expect(fromID.ISBN).toBe(undefined);
      expect(fromID.publicationDate).toBe(undefined);
      expect(fromID.totalPages).toBe(undefined);
      expect(fromID.formats).toBe(undefined);
      expect(fromID.publisher).toBe(undefined);

      expect($.isEmptyObject(fromObj)).toBe(true);
      expect(fromObj.genre).toBe(undefined);
      expect(fromObj.authors).toBe(undefined);
      expect(fromObj.edition).toBe(undefined);
      expect(fromObj.ISBN).toBe(undefined);
      expect(fromObj.publicationDate).toBe(undefined);
      expect(fromObj.totalPages).toBe(undefined);
      expect(fromObj.formats).toBe(undefined);
      expect(fromObj.publisher).toBe(undefined);
    });
  });


  /***************************************************************************
   ** getSkuMedia method *****************************************************
   ***************************************************************************/

  describe('getSkuMedia', function () {
    var SKU_123_4567 = {},
      SKU_24A_5X7U = {},
      SKU_231_0874 = {};


    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;
      SKU_123_4567 = $.extend(true, {}, SKU_24A_5X7U);
      SKU_123_4567.id = '123-4567';
      SKU_123_4567.mediaAssets.skuMedia = null;

      skuModel.setDataStores([SKU_24A_5X7U, SKU_231_0874, SKU_123_4567]);
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when no skuMedia exists', function () {
      it('should return an empty array', function () {
        expect(skuModel.getSkuMedia('123-4567')).toEqual([]);
      });
    });


    describe('when no key/value is passed in', function () {
      it('should return the skuMedia array', function () {
        expect(skuModel.getSkuMedia(SKU_24A_5X7U)).toEqual(SKU_24A_5X7U.mediaAssets.skuMedia);
      });
    });


    describe('when a key/value pair is passed in', function () {
      describe('when no matches are found', function () {
        it('should return an empty array', function () {
          expect(skuModel.getSkuMedia(SKU_231_0874, 'mediaType', 'Inline')).toEqual([]);
        });
      });


      describe('when matches are found', function () {
        it('should return an array of matching skuMedia', function () {
          expect(skuModel.getSkuMedia('231-0874', 'mediaType', 'Large')).toEqual([{
            mediaType: 'Large',
            src: 'http://tesco.scene7.com/is/image/tesco/231-0874_PI_66786MN?$[preset]$',
            secureSrc: 'https://tesco.scene7.com/is/image/tesco/231-0874_PI_66786MN?$[preset]$',
            renderSource: 'Scene 7'
          }, {
            mediaType: 'Large',
            src: 'http://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL2?$[preset]$',
            secureSrc: 'https://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL2?$[preset]$',
            renderSource: 'Scene 7'
          }, {
            mediaType: 'Large',
            src: 'http://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL3?$[preset]$',
            secureSrc: 'https://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL3?$[preset]$',
            renderSource: 'Scene 7'
          }, {
            mediaType: 'Large',
            src: 'http://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL4?$[preset]$',
            secureSrc: 'https://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL4?$[preset]$',
            renderSource: 'Scene 7'
          }, {
            mediaType: 'Large',
            src: 'http://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL5?$[preset]$',
            secureSrc: 'https://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL5?$[preset]$',
            renderSource: 'Scene 7'
          }, {
            mediaType: 'Large',
            src: 'http://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL6?$[preset]$',
            secureSrc: 'https://tesco.scene7.com/is/image/tesco/231-0874_PI_66786AL6?$[preset]$',
            renderSource: 'Scene 7'
          }]);
        });
      });
    });
  });


  /***************************************************************************
   ** setSkuMedia method *****************************************************
   ***************************************************************************/

  describe('setSkuMedia', function () {
    var media = {},
      SKU_123_4567 = {},
      SKU_24A_5X7U = {},
      SKU_231_0874 = {};

    media.CMS_1 = {
      mediaType: 'Inline',
      src: '//media.flixcar.com/delivery/js/inpage/43/en/mpn/',
      renderSource: 'CMS'
    };

    media.EXT_1 = {
      mediaType: 'Inline',
      src: '//media.flixcar.com/delivery/js/inpage/43/en/mpn/',
      renderSource: 'External'
    };


    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;
      SKU_123_4567 = $.extend(true, {}, SKU_24A_5X7U);
      SKU_123_4567.id = '123-4567';
      SKU_123_4567.mediaAssets.skuMedia = null;

      skuModel.setDataStores([SKU_24A_5X7U, SKU_231_0874, SKU_123_4567]);
      spyOn(skuModel, 'setDataStores').and.callThrough();
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when the data object is invalid or a match cannot be found', function () {
      it('should return out of the function', function () {
        skuModel.setSkuMedia('456-7891', media.CMS_1);
        expect(skuModel.setDataStores).not.toHaveBeenCalled();
      });
    });


    describe('when the asset is not an object with properties', function () {
      it('should return out of the function', function () {
        expect(skuModel.getSkuMedia('24A-5X7U').length).toBe(1);
        skuModel.setSkuMedia(SKU_24A_5X7U, {});

        expect(skuModel.setDataStores).not.toHaveBeenCalled();
        expect(skuModel.getSkuMedia('24A-5X7U').length).toBe(1);
      });
    });


    describe('when the asset is an object with properties', function () {
      it('should add the asset to the skuMedia array', function () {
        expect(skuModel.getSkuMedia('231-0874').length).toBe(7);
        skuModel.setSkuMedia('231-0874', media.EXT_1);

        expect(skuModel.setDataStores).toHaveBeenCalled();
        expect(skuModel.getSkuMedia('231-0874').length).toBe(8);
        expect(skuModel.getSkuMedia('231-0874', 'mediaType', 'Inline')[0]).toEqual(media.EXT_1);
      });
    });
  });


  /***************************************************************************
   ** unsetSkuMedia method ***************************************************
   ***************************************************************************/

  describe('unsetSkuMedia', function () {
    var SKU_123_4567 = {},
      SKU_24A_5X7U = {},
      SKU_231_0874 = {};


    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;
      SKU_123_4567 = $.extend(true, {}, SKU_24A_5X7U);
      SKU_123_4567.id = '123-4567';
      SKU_123_4567.mediaAssets.skuMedia = null;

      skuModel.setDataStores([SKU_24A_5X7U, SKU_231_0874, SKU_123_4567]);
      spyOn(skuModel, 'setDataStores').and.callThrough();
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when skuMedia does not exist on the data object', function () {
      it('should return out of the function', function () {
        skuModel.unsetSkuMedia(SKU_123_4567, 'mediaType', 'Inline');
        expect(skuModel.setDataStores).not.toHaveBeenCalled();
        expect(skuModel.getSkuMedia('123-4567')).toEqual([]);
      });
    });


    describe('when no key/value pair is passed in', function () {
      it('should delete all assets from the skuMedia array', function () {
        expect(skuModel.getSkuMedia(SKU_231_0874).length).toBe(7);
        skuModel.unsetSkuMedia(SKU_231_0874);

        expect(skuModel.setDataStores).toHaveBeenCalled();
        expect(skuModel.getSkuMedia('231-0874').length).toBe(0);
      });
    });


    describe('when a key/value pair is passed in', function () {
      describe('when no matches are found', function () {
        it('should not delete any assets from the skuMedia array', function () {
          expect(skuModel.getSkuMedia('24A-5X7U').length).toBe(1);
          skuModel.unsetSkuMedia('24A-5X7U', 'mediaType', 'Inline');

          expect(skuModel.setDataStores).toHaveBeenCalled();
          expect(skuModel.getSkuMedia('24A-5X7U').length).toBe(1);
        });
      });


      describe('when matches are found', function () {
        it('should delete the matching assets from the skuMedia array', function () {
          expect(skuModel.getSkuMedia('24A-5X7U').length).toBe(1);
          skuModel.unsetSkuMedia('24A-5X7U', 'mediaType', 'Large');

          expect(skuModel.setDataStores).toHaveBeenCalled();
          expect(skuModel.getSkuMedia('24A-5X7U').length).toBe(0);
        });
      });
    });
  });


  /***************************************************************************
   ** getPings method ********************************************************
   ***************************************************************************/

  describe('getPings', function () {
    var SKU_24A_5X7U = {},
      SKU_231_0874 = {};


    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;

      skuModel.setDataStores([SKU_24A_5X7U, SKU_231_0874]);
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when no pings exists', function () {
      it('should return an empty array', function () {
        expect(skuModel.getPings('231-0874')).toEqual([]);
      });
    });


    describe('when no key/value is passed in', function () {
      it('should return the pings array', function () {
        expect(skuModel.getPings(SKU_24A_5X7U)).toEqual(SKU_24A_5X7U.mediaAssets.pings);
      });
    });


    describe('when a key/value pair is passed in', function () {
      describe('when no matches are found', function () {
        it('should return an empty array', function () {
          expect(skuModel.getPings(SKU_231_0874, 'mediaType', 'PromotionPings')).toEqual([]);
        });
      });


      describe('when matches are found', function () {
        it('should return an array of matching skuMedia', function () {
          expect(
            skuModel.getPings('24A-5X7U', 'mediaType', 'PromotionPings')
          ).toEqual(SKU_24A_5X7U.mediaAssets.pings);
        });
      });
    });
  });


  /***************************************************************************
   ** setPing method *********************************************************
   ***************************************************************************/

  describe('setPing', function () {
    var pingAsset = {},
      SKU_24A_5X7U = {},
      SKU_231_0874 = {};

    pingAsset = {
      mediaType: 'PromotionPings',
      src: '//www.tesco.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/offer_banners/pings/Ping_2For7_$[preset]$.png'
    };


    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;

      skuModel.setDataStores([SKU_24A_5X7U, SKU_231_0874]);
      spyOn(skuModel, 'setDataStores').and.callThrough();
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when the data object is invalid or a match cannot be found', function () {
      it('should return out of the function', function () {
        skuModel.setPing('456-7891', pingAsset);
        expect(skuModel.setDataStores).not.toHaveBeenCalled();
      });
    });


    describe('when the asset is not an object with properties', function () {
      it('should return out of the function', function () {
        expect(skuModel.getPings('24A-5X7U').length).toBe(1);
        skuModel.setPing(SKU_24A_5X7U, {});

        expect(skuModel.setDataStores).not.toHaveBeenCalled();
        expect(skuModel.getPings('24A-5X7U').length).toBe(1);
      });
    });


    describe('when the asset is an object with properties', function () {
      it('should add the asset to the pings array', function () {
        expect(skuModel.getPings('231-0874').length).toBe(0);
        skuModel.setPing('231-0874', pingAsset);

        expect(skuModel.setDataStores).toHaveBeenCalled();
        expect(skuModel.getPings('231-0874').length).toBe(1);
        expect(skuModel.getPings('231-0874', 'mediaType', 'PromotionPings')[0]).toEqual(pingAsset);
      });
    });
  });


  /***************************************************************************
   ** unsetPings method ******************************************************
   ***************************************************************************/

  describe('unsetPings', function () {
    var pingAsset = {},
      SKU_24A_5X7U = {},
      SKU_231_0874 = {};

    pingAsset = {
      mediaType: 'PromotionPings',
      src: '//www.tesco.com/directuiassets/Merchandising/NonSeasonal/en_GB/banners/offer_banners/pings/Ping_2For7_$[preset]$.png'
    };

    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;

      skuModel.setDataStores([SKU_24A_5X7U, SKU_231_0874]);
      spyOn(skuModel, 'setDataStores').and.callThrough();
    });


    afterEach(function () {
      skuModel = {};
    });


    describe('when pings does not exist on the data object', function () {
      it('should return out of the function', function () {
        skuModel.unsetPings(SKU_231_0874, 'mediaType', 'PromotionPings');
        expect(skuModel.setDataStores).not.toHaveBeenCalled();
        expect(skuModel.getPings(SKU_231_0874)).toEqual([]);
      });
    });


    describe('when no key/value pair is passed in', function () {
      afterEach(function () {
        skuModel.setPing('24A-5X7U', pingAsset);
      });


      it('should delete all assets from the pings array', function () {
        expect(skuModel.getPings('24A-5X7U').length).toBe(1);
        skuModel.unsetPings('24A-5X7U');

        expect(skuModel.setDataStores).toHaveBeenCalled();
        expect(skuModel.getPings('24A-5X7U').length).toBe(0);
      });
    });


    describe('when a key/value pair is passed in', function () {
      describe('when no matches are found', function () {
        it('should not delete any assets from the pings array', function () {
          expect(skuModel.getPings('24A-5X7U').length).toBe(1);
          skuModel.unsetPings('24A-5X7U', 'mediaType', 'clubcardPing');

          expect(skuModel.setDataStores).toHaveBeenCalled();
          expect(skuModel.getPings('24A-5X7U').length).toBe(1);
        });
      });


      describe('when matches are found', function () {
        it('should delete the matching assets from the pings array', function () {
          expect(skuModel.getPings('24A-5X7U').length).toBe(1);
          skuModel.unsetPings('24A-5X7U', 'mediaType', 'PromotionPings');

          expect(skuModel.setDataStores).toHaveBeenCalled();
          expect(skuModel.getPings('24A-5X7U').length).toBe(0);
        });
      });
    });
  });


  /***************************************************************************
   ** get method *************************************************************
   ***************************************************************************/

  describe('get method', function () {
    var skuData = {},
      SKU_24A_5X7U = {},
      SKU_231_0874 = {},
      SKU_ZA3_TD6B = {};

    beforeEach(function () {
      skuModel = new SkuModel();

      SKU_24A_5X7U = mocks.skus['24A-5X7U'].data;
      SKU_231_0874 = mocks.skus['231-0874'].data;
      SKU_ZA3_TD6B = mocks.skus['ZA3-TD6B'].data;

      skuModel.add([SKU_24A_5X7U, SKU_ZA3_TD6B, SKU_231_0874]);

      spyOn(skuModel, 'fetch');
    });

    afterEach(function () {
      skuModel = {};
      SKU_24A_5X7U = {};
      SKU_231_0874 = {};
    });

    it('returns the data object with the matching id if it exists in the store', function () {
      skuData = skuModel.get({ mSearchValue: SKU_24A_5X7U.id });
      expect(skuData.id).toBe(SKU_24A_5X7U.id);
    });

    it('returns the data objects with the matching ids if they exists in the store', function () {
      skuData = skuModel.get({ mSearchValue: [SKU_24A_5X7U.id, SKU_ZA3_TD6B.id] });
      expect(fn.isArray(skuData)).toBe(true);
      expect(skuData[0].id).toBe(SKU_24A_5X7U.id);
      expect(skuData[1].id).toBe(SKU_ZA3_TD6B.id);
    });
  });


  /***************************************************************************
   ** getRangedInStore method ************************************************
   ***************************************************************************/

  describe('getRangedInStore method', function () {
    var fromID = null,
      fromObj = null,
      fromArr = null;

    beforeAll(function () {
      skuModel = new SkuModel();
      skuModel.setDataStores([mocks.skus['24A-5X7U'].data, mocks.skus['231-0874'].data]);
    });

    afterAll(function () {
      skuModel = {};
    });

    beforeEach(function () {
      fromID = null;
      fromObj = null;
      fromArr = null;
    });

    describe('when sku is ranged in store', function () {
      it('should return true', function () {
        fromID = skuModel.getRangedInStore('24A-5X7U');
        fromObj = skuModel.getRangedInStore({ id: '24A-5X7U', rangedInStore: true });

        expect(fromID).toBe(true);
        expect(fromObj).toBe(true);
      });
    });

    describe('when sku is not ranged in store', function () {
      it('should return false', function () {
        fromID = skuModel.getRangedInStore('231-0874');
        fromObj = skuModel.getRangedInStore({ id: '231-0874', rangedInStore: false });

        expect(fromID).toBe(false);
        expect(fromObj).toBe(false);
      });
    });

    describe('when not resolved as an object with rangedInStore property', function () {
      it('should return null', function () {
        fromID = skuModel.getRangedInStore('ZA3-TD6B');
        fromObj = skuModel.getRangedInStore({});
        fromArr = skuModel.getRangedInStore([]);

        expect(fromID).toBeNull();
        expect(fromObj).toBeNull();
        expect(fromArr).toBeNull();
      });
    });
  });
});
