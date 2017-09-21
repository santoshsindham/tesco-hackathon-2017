define([
  'domlib',
  'modules/mvc/fn',
  'modules/pdp/controllers/InlineContentController',
  'modules/pdp/models/SkuModel',
  'test-framework/mocks/mocks'
], function (
  $,
  fn,
  InlineContentController,
  SkuModel,
  mocks
) {
  'use strict';

  var args = {},
    media = {},
    CMS_1 = {},
    EXT_2 = {};

  args = {
    deferred: {},
    elTarget: '#inline-content-placeholder',
    mParamData: {
      mvc: {
        sku: {},
        viewModel: { title: 'Additional content' }
      }
    },
    sNamespace: 'sku',
    sOutput: 'inner',
    sTag: 'inlineContent',
    sViewName: 'InlineContentView'
  };

  media = {
    CMS_1: {
      mediaType: 'Inline',
      src: '//www.tesco.com/directuiassets/ProductAssets/433/433-8033/inline/',
      renderSource: 'CMS'
    },
    EXT_1: {
      mediaType: 'Inline',
      src: '//media.flixcar.com/delivery/js/inpage/43/en/mpn/',
      renderSource: 'External'
    },
    EXT_2: {
      mediaType: 'Inline',
      src: '//scontent.webcollage.net/api/v2/product-content',
      renderSource: 'webcollage'
    },
    EXT_INVALID: {
      mediaType: 'Inline',
      src: '',
      renderSource: 'External'
    }
  };

  CMS_1 = {
    resp: {
      success: { status: 200, responseText: '<div>This is CMS content.</div>' },
      internalError: { status: 500, responseText: 'Internal server error' }
    },
    url: '//www.tesco.com/directuiassets/ProductAssets/433/433-8033/inline/'
  };

  EXT_2 = {
    resp: {
      success: { status: 200, responseText: 'function () {}' },
      internalError: { status: 500, responseText: 'Internal server error' }
    },
    url: '//scontent.webcollage.net/api/v2/product-content'
  };


  /***************************************************************************
   ** constructor ************************************************************
   ***************************************************************************/

  describe('constructor', function () {
    describe('when a new instance is created', function () {
      var ctlr = {},
        modelInstances = [],
        skuModel = {};


      beforeEach(function () {
        skuModel = new SkuModel();
        modelInstances = [skuModel];
        ctlr = new InlineContentController(modelInstances);
      });


      it('should inherit all the properties from its parent constructor', function () {
        expect(ctlr.type).toBe('controller');
        expect(ctlr.sNamespace).toBe('sku');
        expect(ctlr.sTag).toBe('inlineContent');
        expect(typeof ctlr.views.classes.InlineContentView).toBe('function');
        expect(ctlr.models.sku instanceof SkuModel).toBe(true);
      });
    });
  });


  /***************************************************************************
   ** _collateDataDependancies method ****************************************
   ***************************************************************************/

  describe('_collateDataDependancies method', function () {
    var _args = {},
      ctlr = {},
      deferred = {},
      modelInstances = [],
      skuModel = {},
      testData = {};

    beforeEach(function () {
      jasmine.Ajax.install();

      skuModel = new SkuModel();
      skuModel.setDataStores(mocks.skus['ZA3-TD6B'].data);

      modelInstances = [skuModel];
      ctlr = new InlineContentController(modelInstances);

      spyOn(skuModel, 'getSkuMedia').and.callThrough();
      spyOn(ctlr, '_fetchContent').and.callThrough();
    });


    afterEach(function () {
      jasmine.Ajax.uninstall();
    });


    describe('when the mvc data object passed in is not an object with properties', function () {
      beforeEach(function (done) {
        deferred = $.Deferred();
        spyOn(deferred, 'reject').and.callThrough();
        spyOn(deferred, 'resolve').and.callThrough();

        _args = $.extend(true, {}, args);
        _args.deferred = deferred;
        _args.mParamData.mvc = {};

        ctlr._collateDataDependancies(_args);

        deferred.fail(function () {
          done();
        });
      });


      it('should reject the deferred object and return', function () {
        expect(deferred.reject.calls.count()).toBe(1);
        expect(skuModel.getSkuMedia).not.toHaveBeenCalled();
      });
    });


    describe('when the sku data passed in is not valid', function () {
      beforeEach(function (done) {
        deferred = $.Deferred();
        spyOn(deferred, 'reject').and.callThrough();
        spyOn(deferred, 'resolve').and.callThrough();

        _args = $.extend(true, {}, args);
        _args.deferred = deferred;
        _args.mParamData.mvc.sku = {};

        ctlr._collateDataDependancies(_args);

        deferred.fail(function () {
          done();
        });
      });


      it('should reject the deferred object and return', function () {
        expect(deferred.reject.calls.count()).toBe(1);
        expect(skuModel.getSkuMedia).not.toHaveBeenCalled();
      });
    });


    describe('when the viewModel data is not valid', function () {
      beforeEach(function (done) {
        deferred = $.Deferred();
        spyOn(deferred, 'reject').and.callThrough();
        spyOn(deferred, 'resolve').and.callThrough();

        _args = $.extend(true, {}, args);
        _args.deferred = deferred;
        _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });
        _args.mParamData.mvc.viewModel = {};

        ctlr._collateDataDependancies(_args);

        deferred.fail(function () {
          done();
        });
      });


      it('should reject the deferred object and return', function () {
        expect(deferred.reject.calls.count()).toBe(1);
        expect(skuModel.getSkuMedia).not.toHaveBeenCalled();
      });
    });


    describe('when the sku data does not have inline media', function () {
      beforeEach(function (done) {
        deferred = $.Deferred();
        spyOn(deferred, 'reject').and.callThrough();
        spyOn(deferred, 'resolve').and.callThrough();

        _args = $.extend(true, {}, args);
        _args.deferred = deferred;
        _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });

        ctlr._collateDataDependancies(_args);

        deferred.fail(function () {
          done();
        });
      });


      it('should reject the deferred object and return', function () {
        expect(skuModel.getSkuMedia.calls.count()).toBe(1);
        expect(deferred.reject.calls.count()).toBe(1);
      });
    });


    describe('when the inline media is not valid', function () {
      beforeEach(function (done) {
        skuModel.setSkuMedia('ZA3-TD6B', media.EXT_INVALID);
        skuModel.getSkuMedia.calls.reset();

        deferred = $.Deferred();
        spyOn(deferred, 'reject').and.callThrough();
        spyOn(deferred, 'resolve').and.callThrough();

        _args = $.extend(true, {}, args);
        _args.deferred = deferred;
        _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });

        ctlr._collateDataDependancies(_args);

        deferred.fail(function () {
          done();
        });
      });


      afterEach(function () {
        skuModel.unsetSkuMedia('231-0874', 'mediaType', 'Inline');
      });


      it('should reject the deferred object and return', function () {
        expect(skuModel.getSkuMedia.calls.count()).toBe(1);
        expect(deferred.reject.calls.count()).toBe(1);
      });
    });


    describe('when the inline media is valid', function () {
      describe('when the source is external', function () {
        beforeEach(function (done) {
          skuModel.setSkuMedia('ZA3-TD6B', media.EXT_1);
          skuModel.getSkuMedia.calls.reset();

          deferred = $.Deferred();
          spyOn(deferred, 'reject').and.callThrough();
          spyOn(deferred, 'resolve').and.callThrough();

          _args = $.extend(true, {}, args);
          _args.deferred = deferred;
          _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });

          ctlr._collateDataDependancies(_args);

          deferred.done(function (updatedArgs) {
            testData = updatedArgs.mParamData.mvc.viewModel;
            done();
          });
        });


        afterEach(function () {
          skuModel.unsetSkuMedia('ZA3-TD6B', 'mediaType', 'Inline');
        });


        it('should resolve the deferred object and return the updated args object', function () {
          expect(testData.title).toBe('Additional content');
          expect(testData.externalScript).toBe(media.EXT_1.src);
          expect(testData.hasExternalScript).toBe(true);
          expect(testData.renderSource).toBe(media.EXT_1.renderSource);
          expect(skuModel.getSkuMedia.calls.count()).toBe(1);
          expect(deferred.resolve.calls.count()).toBe(1);
        });
      });


      describe('when the source is webcollage', function () {
        describe('when the content request is successfull', function () {
          beforeEach(function (done) {
            skuModel.setSkuMedia('ZA3-TD6B', media.EXT_2);
            skuModel.getSkuMedia.calls.reset();

            jasmine.Ajax
              .stubRequest(EXT_2.url)
              .andReturn(EXT_2.resp.success);

            deferred = $.Deferred();
            spyOn(deferred, 'reject').and.callThrough();
            spyOn(deferred, 'resolve').and.callThrough();

            _args = $.extend(true, {}, args);
            _args.deferred = deferred;
            _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });

            ctlr._collateDataDependancies(_args);

            deferred.done(function (updatedArgs) {
              testData = updatedArgs.mParamData.mvc.viewModel;
              done();
            });
          });


          afterEach(function () {
            skuModel.unsetSkuMedia('ZA3-TD6B', 'mediaType', 'Inline');
          });


          it('should resolve the deferred object and return the updated args object', function () {
            expect(testData.title).toBe('Additional content');
            expect(testData.hasExternalScript).toBe(true);
            expect(testData.renderSource).toBe(media.EXT_2.renderSource);
            expect(skuModel.getSkuMedia.calls.count()).toBe(1);
            expect(ctlr._fetchContent.calls.count()).toBe(1);
            expect(deferred.resolve.calls.count()).toBe(1);
          });
        });
      });


      describe('when the source is CMS', function () {
        describe('when the CMS content request is successfull', function () {
          beforeEach(function (done) {
            skuModel.setSkuMedia('ZA3-TD6B', media.CMS_1);
            skuModel.getSkuMedia.calls.reset();

            jasmine.Ajax
              .stubRequest(CMS_1.url)
              .andReturn(CMS_1.resp.success);

            deferred = $.Deferred();
            spyOn(deferred, 'reject').and.callThrough();
            spyOn(deferred, 'resolve').and.callThrough();

            _args = $.extend(true, {}, args);
            _args.deferred = deferred;
            _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });

            ctlr._collateDataDependancies(_args);

            deferred.done(function (updatedArgs) {
              testData = updatedArgs.mParamData.mvc.viewModel;
              done();
            });
          });


          afterEach(function () {
            skuModel.unsetSkuMedia('ZA3-TD6B', 'mediaType', 'Inline');
          });


          it('should resolve the deferred object and return the updated args object', function () {
            expect(testData.title).toBe('Additional content');
            expect(testData.cmsContent).toBe(CMS_1.resp.success.responseText);
            expect(testData.renderSource).toBe(media.CMS_1.renderSource);
            expect(skuModel.getSkuMedia.calls.count()).toBe(1);
            expect(ctlr._fetchContent.calls.count()).toBe(1);
            expect(deferred.resolve.calls.count()).toBe(1);
          });
        });


        describe('when the CMS content request fails', function () {
          beforeEach(function (done) {
            skuModel.setSkuMedia('ZA3-TD6B', media.CMS_1);
            skuModel.getSkuMedia.calls.reset();

            jasmine.Ajax
              .stubRequest(CMS_1.url)
              .andReturn(CMS_1.resp.internalError);

            deferred = $.Deferred();
            spyOn(deferred, 'reject').and.callThrough();
            spyOn(deferred, 'resolve').and.callThrough();

            _args = $.extend(true, {}, args);
            _args.deferred = deferred;
            _args.mParamData.mvc.sku = skuModel.getDataStores({ value: 'ZA3-TD6B' });

            ctlr._collateDataDependancies(_args);

            deferred.fail(function () {
              done();
            });
          });


          afterEach(function () {
            skuModel.unsetSkuMedia('ZA3-TD6B', 'mediaType', 'Inline');
          });


          it('should reject the deferred object and return', function () {
            expect(skuModel.getSkuMedia.calls.count()).toBe(1);
            expect(ctlr._fetchContent.calls.count()).toBe(1);
            expect(deferred.reject.calls.count()).toBe(1);
          });
        });
      });
    });
  });
});
