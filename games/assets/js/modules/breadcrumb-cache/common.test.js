define(function (require) {
  'use strict';

  var breadcrumbCache = require('modules/breadcrumb-cache/common');

  describe('Breadcrumb Cache', function () {
    describe('Given a breadcrumb instance', function () {
      var url = 'https://www.tesco.com/direct/garden/metal-sheds/cat31370015.cat?pageViewType=grid&sortBy=1&currentPageType=Category&catId=4294715945+40690&lastFilter=Price|%25A3140+to++%C2%A3160',
        pdpBreadcrumbId = 'breadcrumb-v2',
        plpBreadcrumbId = 'breadcrumb';

      describe('When a breadcrumb structure is cached on a PLP', function () {
        var plpBreadcrumbNodes = null,
          plpBreadcrumbWrapper = null,
          breadcrumbNode = null,
          cachedBreadcrumbs = null,
          cache = null,
          key = null;

        beforeEach(function (done) {
          jasmine.getFixtures().fixturesPath = 'base/test-framework/fixtures/';
          jasmine.getFixtures().load('breadcrumb.html');
          breadcrumbCache.init({
            plpBreadcrumbId: plpBreadcrumbId
          });
          breadcrumbCache.cacheBreadcrumb(url);

          plpBreadcrumbWrapper = document.getElementById(plpBreadcrumbId);
          plpBreadcrumbNodes = plpBreadcrumbWrapper.getElementsByTagName('li');
          cache = breadcrumbCache.getCache();
          key = breadcrumbCache.normaliseKey(url);
          cachedBreadcrumbs = cache[key];
          done();
        });

        it('it should be cached correctly', function () {
          var i = 0;

          expect(cache).not.toEqual({});
          expect(cachedBreadcrumbs.length).toEqual(plpBreadcrumbNodes.length);

          for (; i < plpBreadcrumbNodes.length - 1; i += 1) {
            breadcrumbNode = plpBreadcrumbNodes[i];
            expect(breadcrumbNode.getAttribute('data-bc-href')).toEqual(cachedBreadcrumbs[i].url);
            expect(breadcrumbNode.getAttribute('data-bc-text')).toEqual(cachedBreadcrumbs[i].text);
            expect(breadcrumbNode.getAttribute('itemscope')).toEqual(cachedBreadcrumbs[i].itemscope);
            expect(breadcrumbNode.getAttribute('itemtype')).toEqual(cachedBreadcrumbs[i].itemtype);
            expect(breadcrumbNode.getAttribute('data-bc-category-id')).toEqual(cachedBreadcrumbs[i].categoryID);
            expect(breadcrumbNode.getAttribute('class')).toEqual(cachedBreadcrumbs[i].className);
          }
        });
      });

      describe('When a cached breadcrumb is re-rendered on a PDP', function () {
        var pdpBreadcrumbNodes = null,
          pdpBreadcrumbWrapper = null,
          breadcrumbNode = null,
          cachedBreadcrumbs = null,
          cache = null,
          key = null;

        beforeEach(function (done) {
          jasmine.getFixtures().fixturesPath = 'base/test-framework/fixtures/';
          jasmine.getFixtures().load('breadcrumb.html');
          breadcrumbCache.init({
            pdpBreadcrumbId: pdpBreadcrumbId
          });

          breadcrumbCache.renderBreadcrumb(url);

          pdpBreadcrumbWrapper = document.getElementById(pdpBreadcrumbId);
          pdpBreadcrumbNodes = pdpBreadcrumbWrapper.getElementsByTagName('li');
          cache = breadcrumbCache.getCache();
          key = breadcrumbCache.normaliseKey(url);
          cachedBreadcrumbs = cache[key];
          done();
        });

        it('should be re-rendered correctly', function () {
          var i = 0;

          expect(cache).not.toEqual({});
          expect(cachedBreadcrumbs.length).toEqual(pdpBreadcrumbNodes.length);
          for (; i < pdpBreadcrumbNodes.length; i += 1) {
            breadcrumbNode = pdpBreadcrumbNodes[i];
            expect(breadcrumbNode.querySelector('a').getAttribute('href')).toEqual(cachedBreadcrumbs[i].url);
            expect(breadcrumbNode.querySelector('a span').textContent).toEqual(cachedBreadcrumbs[i].text);
            expect(breadcrumbNode.getAttribute('itemscope')).toEqual(cachedBreadcrumbs[i].itemscope);
            expect(breadcrumbNode.getAttribute('itemtype')).toEqual(cachedBreadcrumbs[i].itemtype);
            expect(breadcrumbNode.querySelector('a').getAttribute('data-category-id')).toEqual(cachedBreadcrumbs[i].categoryID);
            expect(breadcrumbNode.getAttribute('class')).toEqual(cachedBreadcrumbs[i].className);
          }
        });

        it('the buttons used for toggling on mobile should exist', function () {
          expect(pdpBreadcrumbWrapper.querySelectorAll('input#breadcrumbCategoryOnly').length).toEqual(1);
        });

        it('the input element used for analytics must exist', function () {
          expect(pdpBreadcrumbWrapper.querySelectorAll('div.toggle.dropdown-icon').length).toEqual(1);
        });
      });

      describe('Normalisation should retain only catID and searchquery params in url', function () {
        var promoURL = 'https://www.tesco.com/direct/special-offer/save-25-percent-on-pyrex-onyx-pans-and-pan-sets/promo47080079.promo?catId=4294711683&sortBy=1&icid=offers_TOC_Save25PCPyrexOnyxPans',
          promoKey = 'https://www.tesco.com/direct/special-offer/save-25-percent-on-pyrex-onyx-pans-and-pan-sets/promo47080079.promo?catId=4294711683',
          searchURL = 'https://www.tesco.com/direct/search-results/results.page?catId=4294967294&searchquery=bluetooth+speaker&SrchId=4294967294',
          searchKey = 'https://www.tesco.com/direct/search-results/results.page?catId=4294967294&searchquery=bluetooth+speaker';

        it('should be normalised so that only catID and searchquery params are retained in url', function () {
          expect(breadcrumbCache.normaliseKey(promoURL)).toEqual(promoKey);
          expect(breadcrumbCache.normaliseKey(searchURL)).toEqual(searchKey);
        });
      });
    });
  });
});
