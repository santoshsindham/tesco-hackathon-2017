/* globals define,require,window,AsyncBlockController,r3,RR,console,s */
/* jslint plusplus: true, regexp: true, unparam: true */
define('modules/rich-sort/RichSort', function () {
  'use strict';

  var RichSort = null;

  RichSort = function (sProvider) {
    var getSKUsFromProvider = null,
      getSKUsForOffset = null,
      aSortedSKUs = [],
      getSKUsFromRichRelevance = null,
      getSKUsFromAttraqt = null,
      getSKUsFromSlickStitch = null,
      setDOMHrefsToRichRelevance = null,
      setRichRelevanceCallback = null,
      getRichRelevanceJSONValidity = null,
      bRichRelevanceHrefEventsBound = false,
      iRichRelevanceJSONValidIndex = 0,
      sRichRelevancePlacementName = 'category_page.sort_1',
      getCategoryTree = null,
      parseAttraqtData = null,
      getCurrentCategoryId = null,
      _sProvider = sProvider;

    if (!_sProvider) {
      _sProvider = window.richSortProvider || 'RichRelevance';
    }

    getRichRelevanceJSONValidity = function (oData) {
      var bResult = false,
        i = 0;

      for (i = 0; i < oData.length; i += 1) {
        if (oData[i] !== undefined) {
          if (oData[i].placement_name === sRichRelevancePlacementName) {
            bResult = true;
            iRichRelevanceJSONValidIndex = i;
            break;
          }
        }
      }
      return bResult;
    };

    setRichRelevanceCallback = function () {
      var aSKUList = [],
        oRRData = null,
        iSKUsLength = null,
        i = 0;

      RR.jsonCallback = function () {
        if (RR.data.JSON.placements.length > 0) {
          if (getRichRelevanceJSONValidity(RR.data.JSON.placements) === true) {
            oRRData = RR.data.JSON.placements;
            iSKUsLength = oRRData[iRichRelevanceJSONValidIndex].items.length;


            for (i = 0; i < iSKUsLength; i += 1) {
              aSKUList.push(oRRData[iRichRelevanceJSONValidIndex].items[i].id);
            }
            aSortedSKUs = aSKUList;
            if (bRichRelevanceHrefEventsBound === false) {
              setDOMHrefsToRichRelevance(oRRData);
            }
            RR.data.JSON.placements.length = 0;
            $(window).trigger('RichSortDataComplete');
          } else {
            $(window).trigger('RichSortDataComplete', ['oDestroyRichSort']);
          }
        } else {
          $(window).trigger('RichSortDataComplete', ['oDestroyRichSort']);
        }
      };
    };

    if (_sProvider === 'RichRelevance') {
      setRichRelevanceCallback();
    }

    getSKUsFromProvider = function (iOffset) {
      switch (_sProvider) {
        case 'RichRelevance':
          getSKUsFromRichRelevance(iOffset);
          break;
        case 'Attraqt':
          getSKUsFromAttraqt(iOffset);
          break;
        case 'SlickStitch':
          getSKUsFromSlickStitch(iOffset, 40);
          break;
        default:
          // No Default
      }
    };

    getSKUsForOffset = function (iOffset, iLength) {
      var aOffsetSKUs = [],
        sOffsetSKUs = '',
        iNoOfSKUs = iLength || 20;

      if (aSortedSKUs) {
        if (aSortedSKUs.length < iNoOfSKUs) {
          getSKUsFromProvider(iOffset);
        }
        aOffsetSKUs = aSortedSKUs.splice(0, iNoOfSKUs);
        sOffsetSKUs = aOffsetSKUs.join(',');
        return sOffsetSKUs;
      }
      return null;
    };

    getSKUsFromRichRelevance = function (iOffset) {
      window.R3_COMMON.RICHSORT.paginate(iOffset, 60);
      window.r3();
    };

    getSKUsFromAttraqt = function (iOffset) {
      var sUserId = window.s.eVar24 || '',
        sSessionId = $.cookie('JSESSIONID'),
        iPageNo = (iOffset + 20) / 20,
        sCategoryTree = getCategoryTree(),
        sCategoryId = getCurrentCategoryId(),
        sEndPoint = window.Data.PLP.Attraqt.endpoint,
        sSiteId = window.Data.PLP.Attraqt.siteId,
        sURL = sEndPoint + '?'
          + 'siteId=' + sSiteId + '&UID=' + sUserId
          + '&sid=' + sSessionId
          + '&zone0=category&currency=GBP&config_categorytree=' + sCategoryTree
          + '&config_category=' + sCategoryId
          + '&category_page=' + iPageNo;

      $.ajax({
        url: sURL,
        method: 'GET',
        beforeSend: function (jqXHR, settings) {
          var _settings = settings;

          _settings.url = sURL;
        }
      }).done(function (oResponse) {
        parseAttraqtData(oResponse);
        $(window).trigger('RichSortDataComplete');
      }).fail(function () {
        $(window).trigger('RichSortDestroy');
        $('#listing').removeClass('IBBookmark');
      });
    };

    getSKUsFromSlickStitch = function (offset, length) {
      var sDataAttr = $('.products-wrapper').data('schoolskulist'),
        offsetSkus = [],
        slickStitchSkus = [],
        numSkus = 20;

      if (length) {
        numSkus = length;
      }

      if (sDataAttr) {
        slickStitchSkus = sDataAttr.split(',');
        offsetSkus = slickStitchSkus.splice(offset, numSkus);
        aSortedSKUs = offsetSkus.slice();
      }
      $(window).trigger('RichSortDataComplete');
      return offsetSkus;
    };

    getCategoryTree = function () {
      var aCategoryIds = window.Data.PLP.aCategoryHierarchy,
        sCategoryIdsForAttraqt = '';

      if (aCategoryIds.length) {
        sCategoryIdsForAttraqt = aCategoryIds.join('/');
      }

            // sCategoryIdsForAttraqt = 'cat3376685/cat38470010/cat3376549/cat3375936/cat38420004/';
      sCategoryIdsForAttraqt += '/' + getCurrentCategoryId();
      return sCategoryIdsForAttraqt;
    };

    getCurrentCategoryId = function () {
      var sCurrentCategoryId = window.Data.PLP.currentCategoryId;

            // sCurrentCategoryId = 'cat38420006';
      return sCurrentCategoryId;
    };

    parseAttraqtData = function (oRawData) {
      var aResults = [],
        aSKUList = [],
        i = 0;

      if (oRawData) {
        if (oRawData.zones[0]) {
          if (oRawData.zones[0].data.results) {
            aResults = oRawData.zones[0].data.results;
            for (i = 0; i < aResults.length; i += 1) {
              aSKUList.push(aResults[i].fields.product_id.value[0]);
            }
          }
        }
      }
      aSortedSKUs = aSKUList;
    };

    setDOMHrefsToRichRelevance = function (oRRData) {
      var sProductContainerSelector = '#main-content',
        $productContainer = $(sProductContainerSelector),
        $currentTile = null,
        oSKUListWithHrefs = oRRData[iRichRelevanceJSONValidIndex].items,
        sSKUId = null,
        i = null;

      $productContainer.on('RichSortLinkTriggered', '.product', function (e) {
        $currentTile = $(e.target).find('a.thumbnail');
        sSKUId = $currentTile.closest('.product-tile').attr('id').slice(-8);
        for (i = 0; i < oSKUListWithHrefs.length; i += 1) {
          if (sSKUId === oSKUListWithHrefs[i].id) {
            $currentTile.attr('href', oSKUListWithHrefs[i].linkURL);
            break;
          }
        }
      });
      bRichRelevanceHrefEventsBound = true;
    };

    /**
     * [getSKUs get product sku's from third party providers, sort these skus into paginated arrays]
     * @param  {Integer} iOffset [offset from current products, page one would have 0 offset,
     *         further pages would increase the offset]
     * @param  {Integer} iLength [optional fixed maximum length of products]
     * @return {String} [comma separated string of product skus]
     */
    this.getSKUs = function getSKUs(iOffset, iLength) {
      return getSKUsForOffset(iOffset, iLength);
    };

    this.isAvailable = function isAvailable() {
      var bIsAvailableResult = null;

      if (aSortedSKUs.length >= 20) {
        bIsAvailableResult = true;
      } else {
        try {
          bIsAvailableResult = window.RR.data !== undefined
            && window.RR.data.JSON.placements.length > 0;
        } catch (ex) {
          bIsAvailableResult = false;
        }
      }
      return bIsAvailableResult;
    };

    //  Create a public interface for getting SKUs from SlickStitch

    this.getSKUsFromSlickStitchPub = function getSKUsFromSlickStitchPub(offset, length) {
      return getSKUsFromSlickStitch(offset, length);
    };
    this.getSKUsFromProviderPub = function getSKUsFromProviderPub(iOffset) {
      getSKUsFromProvider(iOffset);
    };
  };
  return RichSort;
});
