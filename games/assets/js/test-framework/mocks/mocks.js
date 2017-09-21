define(function (require, exports, module) {
  'use strict';


  var fn = require('modules/mvc/fn'),
    mocks = {},
    ACC_345_3729 = require('json!test-framework/mocks/tesco/content/relationships/accessories/345-3729.json'),
    BUC_GRP_bktgrp4810001 = require('json!test-framework/mocks/tesco/content/catalog/bucketGroup/bktgrp4810001.json'),
    BUC_GRP_bktgrp4810002 = require('json!test-framework/mocks/tesco/content/catalog/bucketGroup/bktgrp4810002.json'),
    BUC_GRP_bktgrp4810003 = require('json!test-framework/mocks/tesco/content/catalog/bucketGroup/bktgrp4810003.json'),
    INV_PRD_148_7656 = require('json!test-framework/mocks/tesco/inventory/product/148-7656.json'),
    INV_PRD_154_1779 = require('json!test-framework/mocks/tesco/inventory/product/154-1779.json'),
    INV_PRD_154_6351 = require('json!test-framework/mocks/tesco/inventory/product/154-6351.json'),
    INV_PRD_204_7271 = require('json!test-framework/mocks/tesco/inventory/product/204-7271.json'),
    INV_PRD_313_0760 = require('json!test-framework/mocks/tesco/inventory/product/313-0760.json'),
    INV_PRD_657_7177 = require('json!test-framework/mocks/tesco/inventory/product/657-7177.json'),
    INV_PRD_670_4017 = require('json!test-framework/mocks/tesco/inventory/product/670-4017.json'),
    INV_SKU_119_3321 = require('json!test-framework/mocks/tesco/inventory/sku/119-3321.json'),
    INV_SKU_361_2760 = require('json!test-framework/mocks/tesco/inventory/sku/361-2760.json'),
    INV_SKU_515_7104 = require('json!test-framework/mocks/tesco/inventory/sku/515-7104.json'),
    LNKSAV_PROMO_promo48670056 = require('json!test-framework/mocks/tesco/content/catalog/linkSavePromotion/promo48670056.json'),
    MRK_SKU_210_7442 = require('json!test-framework/mocks/tesco/content/catalog/marketingSku/210-7442.json'),
    MRK_SKU_500_1097 = require('json!test-framework/mocks/tesco/content/catalog/marketingSku/500-1097.json'),
    PRC_SKU_24A_5X7U = require('json!test-framework/mocks/tesco/price/sku/24A-5X7U.json'),
    PRC_SKU_101_6583 = require('json!test-framework/mocks/tesco/price/sku/101-6583.json'),
    PRC_SKU_129_8921 = require('json!test-framework/mocks/tesco/price/sku/129-8921.json'),
    PRC_SKU_154_6351 = require('json!test-framework/mocks/tesco/price/sku/154-6351.json'),
    PRC_SKU_196_2352 = require('json!test-framework/mocks/tesco/price/sku/196-2352.json'),
    PRC_SKU_199_1072 = require('json!test-framework/mocks/tesco/price/sku/199-1072.json'),
    PRC_SKU_227_5139 = require('json!test-framework/mocks/tesco/price/sku/227-5139.json'),
    PRC_SKU_231_0874 = require('json!test-framework/mocks/tesco/price/sku/231-0874.json'),
    PRC_SKU_385_2384 = require('json!test-framework/mocks/tesco/price/sku/385-2384.json'),
    PRC_SKU_530_3001 = require('json!test-framework/mocks/tesco/price/sku/530-3001.json'),
    PRC_SKU_572_0859 = require('json!test-framework/mocks/tesco/price/sku/572-0859.json'),
    PRC_SKU_661_8688 = require('json!test-framework/mocks/tesco/price/sku/661-8688.json'),
    PRC_SKU_724_1190 = require('json!test-framework/mocks/tesco/price/sku/724-1190.json'),
    PRC_SKU_725_7977 = require('json!test-framework/mocks/tesco/price/sku/725-7977.json'),
    PRC_SKU_742_8388 = require('json!test-framework/mocks/tesco/price/sku/742-8388.json'),
    PRC_SKU_767_7465 = require('json!test-framework/mocks/tesco/price/sku/767-7465.json'),
    PRC_SKU_ZA3_TD6B = require('json!test-framework/mocks/tesco/price/sku/ZA3-TD6B.json'),
    PRD_101_6583 = require('json!test-framework/mocks/tesco/content/catalog/product/101-6583.json'),
    PRD_129_8921 = require('json!test-framework/mocks/tesco/content/catalog/product/129-8921.json'),
    PRD_130_0023 = require('json!test-framework/mocks/tesco/content/catalog/product/130-0023.json'),
    PRD_134_0387 = require('json!test-framework/mocks/tesco/content/catalog/product/134-0387.json'),
    PRD_148_7656 = require('json!test-framework/mocks/tesco/content/catalog/product/148-7656.json'),
    PRD_152_7712 = require('json!test-framework/mocks/tesco/content/catalog/product/152-7712.json'),
    PRD_154_6351 = require('json!test-framework/mocks/tesco/content/catalog/product/154-6351.json'),
    PRD_154_1779 = require('json!test-framework/mocks/tesco/content/catalog/product/154-1779.json'),
    PRD_179_7462 = require('json!test-framework/mocks/tesco/content/catalog/product/179-7462.json'),
    PRD_182_7550 = require('json!test-framework/mocks/tesco/content/catalog/product/182-7550.json'),
    PRD_199_1072 = require('json!test-framework/mocks/tesco/content/catalog/product/199-1072.json'),
    PRD_204_7271 = require('json!test-framework/mocks/tesco/content/catalog/product/204-7271.json'),
    PRD_216_7890 = require('json!test-framework/mocks/tesco/content/catalog/product/216-7890.json'),
    PRD_284_4665 = require('json!test-framework/mocks/tesco/content/catalog/product/284-4665.json'),
    PRD_311_6596 = require('json!test-framework/mocks/tesco/content/catalog/product/311-6596.json'),
    PRD_313_0760 = require('json!test-framework/mocks/tesco/content/catalog/product/313-0760.json'),
    PRD_345_3729 = require('json!test-framework/mocks/tesco/content/catalog/product/345-3729.json'),
    PRD_385_2384 = require('json!test-framework/mocks/tesco/content/catalog/product/385-2384.json'),
    PRD_395_9520 = require('json!test-framework/mocks/tesco/content/catalog/product/395-9520.json'),
    PRD_397_7360 = require('json!test-framework/mocks/tesco/content/catalog/product/397-7360.json'),
    PRD_404_3212 = require('json!test-framework/mocks/tesco/content/catalog/product/404-3212.json'),
    PRD_420_1034 = require('json!test-framework/mocks/tesco/content/catalog/product/420-1034.json'),
    PRD_434_0420 = require('json!test-framework/mocks/tesco/content/catalog/product/434-0420.json'),
    PRD_530_3001 = require('json!test-framework/mocks/tesco/content/catalog/product/530-3001.json'),
    PRD_556_3837 = require('json!test-framework/mocks/tesco/content/catalog/product/556-3837.json'),
    PRD_572_0859 = require('json!test-framework/mocks/tesco/content/catalog/product/572-0859.json'),
    PRD_581_8614 = require('json!test-framework/mocks/tesco/content/catalog/product/581-8614.json'),
    PRD_621_1670 = require('json!test-framework/mocks/tesco/content/catalog/product/621-1670.json'),
    PRD_627_6262 = require('json!test-framework/mocks/tesco/content/catalog/product/627-6262.json'),
    PRD_657_7177 = require('json!test-framework/mocks/tesco/content/catalog/product/657-7177.json'),
    PRD_661_8688 = require('json!test-framework/mocks/tesco/content/catalog/product/661-8688.json'),
    PRD_670_4017 = require('json!test-framework/mocks/tesco/content/catalog/product/670-4017.json'),
    PRD_724_1190 = require('json!test-framework/mocks/tesco/content/catalog/product/724-1190.json'),
    PRD_742_8388 = require('json!test-framework/mocks/tesco/content/catalog/product/742-8388.json'),
    PRD_745_8366 = require('json!test-framework/mocks/tesco/content/catalog/product/745-8366.json'),
    PRD_767_7465 = require('json!test-framework/mocks/tesco/content/catalog/product/767-7465.json'),
    SKU_24A_5X7U = require('json!test-framework/mocks/tesco/content/catalog/sku/24A-5X7U.json'),
    SKU_119_3321 = require('json!test-framework/mocks/tesco/content/catalog/sku/119-3321.json'),
    SKU_101_6583 = require('json!test-framework/mocks/tesco/content/catalog/sku/101-6583.json'),
    SKU_103_6643 = require('json!test-framework/mocks/tesco/content/catalog/sku/103-6643.json'),
    SKU_129_8921 = require('json!test-framework/mocks/tesco/content/catalog/sku/129-8921.json'),
    SKU_154_6351 = require('json!test-framework/mocks/tesco/content/catalog/sku/154-6351.json'),
    SKU_167_1286 = require('json!test-framework/mocks/tesco/content/catalog/sku/167-1286.json'),
    SKU_196_2352 = require('json!test-framework/mocks/tesco/content/catalog/sku/196-2352.json'),
    SKU_199_1072 = require('json!test-framework/mocks/tesco/content/catalog/sku/199-1072.json'),
    SKU_201_2207 = require('json!test-framework/mocks/tesco/content/catalog/sku/201-2207.json'),
    SKU_227_5139 = require('json!test-framework/mocks/tesco/content/catalog/sku/227-5139.json'),
    SKU_231_0874 = require('json!test-framework/mocks/tesco/content/catalog/sku/231-0874.json'),
    SKU_252_1076 = require('json!test-framework/mocks/tesco/content/catalog/sku/252-1076.json'),
    SKU_279_2020 = require('json!test-framework/mocks/tesco/content/catalog/sku/279-2020.json'),
    SKU_305_8509 = require('json!test-framework/mocks/tesco/content/catalog/sku/305-8509.json'),
    SKU_345_3729 = require('json!test-framework/mocks/tesco/content/catalog/sku/345-3729.json'),
    SKU_360_9922 = require('json!test-framework/mocks/tesco/content/catalog/sku/360-9922.json'),
    SKU_385_2384 = require('json!test-framework/mocks/tesco/content/catalog/sku/385-2384.json'),
    SKU_530_3001 = require('json!test-framework/mocks/tesco/content/catalog/sku/530-3001.json'),
    SKU_572_0859 = require('json!test-framework/mocks/tesco/content/catalog/sku/572-0859.json'),
    SKU_661_8688 = require('json!test-framework/mocks/tesco/content/catalog/sku/661-8688.json'),
    SKU_724_1190 = require('json!test-framework/mocks/tesco/content/catalog/sku/724-1190.json'),
    SKU_725_7977 = require('json!test-framework/mocks/tesco/content/catalog/sku/725-7977.json'),
    SKU_742_8388 = require('json!test-framework/mocks/tesco/content/catalog/sku/742-8388.json'),
    SKU_767_7465 = require('json!test-framework/mocks/tesco/content/catalog/sku/767-7465.json'),
    SKU_ZA3_TD6B = require('json!test-framework/mocks/tesco/content/catalog/sku/ZA3-TD6B.json'),
    O0001ffd7a = require('json!test-framework/mocks/tesco/content/listings/listing/O0001ffd7a.json'),
    O00015f776 = require('json!test-framework/mocks/tesco/content/listings/listing/O00015f776.json'),
    O000227fbc = require('json!test-framework/mocks/tesco/content/listings/listing/O000227fbc.json'),
    O0002220b2 = require('json!test-framework/mocks/tesco/content/listings/listing/O0002220b2.json'),
    T00020c7db = require('json!test-framework/mocks/tesco/content/listings/listing/T00020c7db.json'),
    RR_CWVAV_OBJS = require('json!test-framework/mocks/rich-relevance/placements/CWVAV/objects.json'),
    RR_PP_IDS = require('json!test-framework/mocks/rich-relevance/placements/PopularProducts/ids.json'),
    STORE_03362 = require('json!test-framework/mocks/tesco/content/stores/store/03362.json'),
    STORE_03142 = require('json!test-framework/mocks/tesco/content/stores/store/03142.json'),
    STORE_02425 = require('json!test-framework/mocks/tesco/content/stores/store/02425.json'),
    STORE_03050 = require('json!test-framework/mocks/tesco/content/stores/store/03050.json'),
    STORE_02547 = require('json!test-framework/mocks/tesco/content/stores/store/02547.json'),
    STORE_02101 = require('json!test-framework/mocks/tesco/content/stores/store/02101.json'),
    STORE_02639 = require('json!test-framework/mocks/tesco/content/stores/store/02639.json'),
    STORE_02634 = require('json!test-framework/mocks/tesco/content/stores/store/02634.json'),
    STORE_03356 = require('json!test-framework/mocks/tesco/content/stores/store/03356.json'),
    STORE_02467 = require('json!test-framework/mocks/tesco/content/stores/store/02467.json'),
    AVAILABILITY_03362 = require('json!test-framework/mocks/tesco/availability/03362.json'),
    AVAILABILITY_03142 = require('json!test-framework/mocks/tesco/availability/03142.json'),
    AVAILABILITY_02425 = require('json!test-framework/mocks/tesco/availability/02425.json'),
    AVAILABILITY_03050 = require('json!test-framework/mocks/tesco/availability/03050.json'),
    AVAILABILITY_02547 = require('json!test-framework/mocks/tesco/availability/02547.json'),
    AVAILABILITY_02101 = require('json!test-framework/mocks/tesco/availability/02101.json'),
    AVAILABILITY_02639 = require('json!test-framework/mocks/tesco/availability/02639.json'),
    AVAILABILITY_02634 = require('json!test-framework/mocks/tesco/availability/02634.json'),
    AVAILABILITY_03356 = require('json!test-framework/mocks/tesco/availability/03356.json'),
    AVAILABILITY_02467 = require('json!test-framework/mocks/tesco/availability/02467.json'),
    STORE_STOCK_305_8509 = require('json!test-framework/mocks/tesco/storeStock/305-8509.json'),
    STORE_SEARCH_03362 = require('json!test-framework/mocks/tesco/storeSearch/03362.json'),
    ASYNC_670_4017_201_2207 = require('json!test-framework/mocks/tesco/asyncCustomerBlocks/PRD-670-4017/SKU-201-2207.json');


  mocks.accessories = {
    '345-3729': {
      data: ACC_345_3729,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(ACC_345_3729) }
      },
      url: '/direct/rest/content/relationships/accessories/345-3729'
    }
  };

  mocks.bucketGroup = {
    'bktgrp4810001': {
      data: BUC_GRP_bktgrp4810001,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(BUC_GRP_bktgrp4810001) }
      },
      url: '/direct/rest/content/catalog/bucketGroup/bktgrp4810001'
    },
    'bktgrp4810002': {
      data: BUC_GRP_bktgrp4810002,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(BUC_GRP_bktgrp4810002) }
      },
      url: '/direct/rest/content/catalog/bucketGroup/bktgrp4810002'
    },
    'bktgrp4810003': {
      data: BUC_GRP_bktgrp4810003,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(BUC_GRP_bktgrp4810003) }
      },
      url: '/direct/rest/content/catalog/bucketGroup/bktgrp4810003'
    }
  };

  mocks.linkSavePromotion = {
    'promo48670056': {
      data: LNKSAV_PROMO_promo48670056,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(LNKSAV_PROMO_promo48670056) }
      },
      url: '/direct/rest/content/catalog/promotion/promo48670056'
    }
  };

  mocks.marketingSku = {
    '210-7442': {
      data: MRK_SKU_210_7442,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(MRK_SKU_210_7442) }
      },
      url: '/direct/rest/marketing/sku/210-7442'
    },
    '500-1097': {
      data: MRK_SKU_500_1097,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(MRK_SKU_500_1097) }
      },
      url: '/direct/rest/marketing/sku/500-1097'
    }
  };

  mocks.products = {
    '101-6583': {
      data: PRD_101_6583,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_101_6583) }
      },
      url: '/direct/rest/content/catalog/product/101-6583'
    },
    '129-8921': {
      data: PRD_129_8921,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_129_8921) }
      },
      url: '/direct/rest/content/catalog/product/129-8921'
    },
    '130-0023': {
      data: PRD_130_0023,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_130_0023) }
      },
      url: '/direct/rest/content/catalog/product/130-0023'
    },
    '134-0387': {
      data: PRD_134_0387,
      env: 'DBT',
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_134_0387) }
      },
      url: '/direct/rest/content/catalog/product/134-0387'
    },
    '148-7656': {
      data: PRD_148_7656,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_148_7656) }
      },
      url: '/direct/rest/content/catalog/product/148-7656'
    },
    '152-7712': {
      data: PRD_152_7712,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_152_7712) }
      },
      url: '/direct/rest/content/catalog/product/152-7712'
    },
    '154-1779': {
      data: PRD_154_1779,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_154_1779) }
      },
      url: '/direct/rest/content/catalog/product/154-1779'
    },
    '154-6351': {
      data: PRD_154_6351,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_154_6351) }
      },
      url: '/direct/rest/content/catalog/product/154-6351'
    },
    '179-7462': {
      data: PRD_179_7462,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_179_7462) }
      },
      url: '/direct/rest/content/catalog/product/179-7462'
    },
    '182-7550': {
      data: PRD_182_7550,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_182_7550) }
      },
      url: '/direct/rest/content/catalog/product/182-7550'
    },
    '199-1072': {
      data: PRD_199_1072,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_199_1072) }
      },
      url: '/direct/rest/content/catalog/product/199-1072'
    },
    '204-7271': {
      data: PRD_204_7271,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_204_7271) }
      },
      url: '/direct/rest/content/catalog/product/204-7271'
    },
    '216-7890': {
      data: PRD_216_7890,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_216_7890) }
      },
      url: '/direct/rest/content/catalog/product/216-7890'
    },
    '284-4665': {
      data: PRD_284_4665,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_284_4665) }
      },
      url: '/direct/rest/content/catalog/product/284-4665'
    },
    '311-6596': {
      data: PRD_311_6596,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_311_6596) }
      },
      url: '/direct/rest/content/catalog/product/311-6596'
    },
    '313-0760': {
      data: PRD_313_0760,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_313_0760) }
      },
      url: '/direct/rest/content/catalog/product/313-0760'
    },
    '345-3729': {
      data: PRD_345_3729,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_345_3729) }
      },
      url: '/direct/rest/content/catalog/product/345-3729'
    },
    '385-2384': {
      data: PRD_385_2384,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_385_2384) }
      },
      url: '/direct/rest/content/catalog/product/385-2384'
    },
    '395-9520': {
      data: PRD_395_9520,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_395_9520) }
      },
      url: '/direct/rest/content/catalog/product/395-9520'
    },
    '397-7360': {
      data: PRD_397_7360,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_397_7360) }
      },
      url: '/direct/rest/content/catalog/product/397-7360'
    },
    '404-3212': {
      data: PRD_404_3212,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_404_3212) }
      },
      url: '/direct/rest/content/catalog/product/404-3212'
    },
    '420-1034': {
      data: PRD_420_1034,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_420_1034) }
      },
      url: '/direct/rest/content/catalog/product/420-1034'
    },
    '434-0420': {
      data: PRD_434_0420,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_434_0420) }
      },
      url: '/direct/rest/content/catalog/product/434-0420'
    },
    '530-3001': {
      data: PRD_530_3001,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_530_3001) }
      },
      url: '/direct/rest/content/catalog/product/530-3001'
    },
    '556-3837': {
      data: PRD_556_3837,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_556_3837) }
      },
      url: '/direct/rest/content/catalog/product/556-3837'
    },
    '572-0859': {
      data: PRD_572_0859,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_572_0859) }
      },
      url: '/direct/rest/content/catalog/product/572-0859'
    },
    '581-8614': {
      data: PRD_581_8614,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_581_8614) }
      },
      url: '/direct/rest/content/catalog/product/581-8614'
    },
    '621-1670': {
      data: PRD_621_1670,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_621_1670) }
      },
      url: '/direct/rest/content/catalog/product/621-1670'
    },
    '627-6262': {
      data: PRD_627_6262,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_627_6262) }
      },
      url: '/direct/rest/content/catalog/product/627-6262'
    },
    '657-7177': {
      data: PRD_657_7177,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_657_7177) }
      },
      url: '/direct/rest/content/catalog/product/657-7177'
    },
    '661-8688': {
      data: PRD_661_8688,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_661_8688) }
      },
      url: '/direct/rest/content/catalog/product/661-8688'
    },
    '670-4017': {
      data: PRD_670_4017,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_670_4017) }
      },
      url: '/direct/rest/content/catalog/product/670-4017'
    },
    '724-1190': {
      data: PRD_724_1190,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_724_1190) }
      },
      url: '/direct/rest/content/catalog/product/724-1190'
    },
    '742-8388': {
      data: PRD_742_8388,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_742_8388) }
      },
      url: '/direct/rest/content/catalog/product/742-8388'
    },
    '745-8366': {
      data: PRD_745_8366,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_745_8366) }
      },
      url: '/direct/rest/content/catalog/product/745-8366'
    },
    '767-7465': {
      data: PRD_767_7465,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(PRD_767_7465) }
      },
      url: '/direct/rest/content/catalog/product/767-7465'
    }
  };

  mocks.skus = {
    '119-3321' : {
      data: SKU_119_3321,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_119_3321) }
      },
      url: '/direct/rest/content/catalog/sku/119-3321'
    },
    '24A-5X7U': {
      data: SKU_24A_5X7U,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_24A_5X7U) }
      },
      url: '/direct/rest/content/catalog/sku/24A-5X7U'
    },
    '101-6583': {
      data: SKU_101_6583,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_101_6583) }
      },
      url: '/direct/rest/content/catalog/sku/101-6583'
    },
    '103-6643': {
      data: SKU_103_6643,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_103_6643) }
      },
      url: '/direct/rest/content/catalog/sku/103-6643'
    },
    '129-8921': {
      data: SKU_129_8921,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_129_8921) }
      },
      url: '/direct/rest/content/catalog/sku/129-8921'
    },
    '154-6351': {
      data: SKU_154_6351,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_154_6351) }
      },
      url: '/direct/rest/content/catalog/sku/154-6351'
    },
    '167-1286': {
      data: SKU_167_1286,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_167_1286) }
      },
      url: '/direct/rest/content/catalog/sku/167-1286'
    },
    '196-2352': {
      data: SKU_196_2352,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_196_2352) }
      },
      url: '/direct/rest/content/catalog/sku/196-2352'
    },
    '199-1072': {
      data: SKU_199_1072,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_199_1072) }
      },
      url: '/direct/rest/content/catalog/sku/199-1072'
    },
    '201-2207': {
      data: SKU_201_2207,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_201_2207) }
      },
      url: '/direct/rest/content/catalog/sku/201-2207'
    },
    '227-5139': {
      data: SKU_227_5139,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_227_5139) }
      },
      url: '/direct/rest/content/catalog/sku/227-5139'
    },
    '231-0874': {
      data: SKU_231_0874,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_231_0874) }
      },
      url: '/direct/rest/content/catalog/sku/231-0874'
    },
    '252-1076': {
      data: SKU_252_1076,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_252_1076) }
      },
      url: '/direct/rest/content/catalog/sku/252-1076'
    },
    '279-2020': {
      data: SKU_279_2020,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_279_2020) }
      },
      url: '/direct/rest/content/catalog/sku/279-2020'
    },
    '305-8509' : {
      data: SKU_305_8509,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_305_8509) }
      },
      url: '/direct/rest/content/catalog/sku/305-8509'
    },
    '345-3729': {
      data: SKU_345_3729,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_345_3729) }
      },
      url: '/direct/rest/content/catalog/product/345-3729'
    },
    '360-9922': {
      data: SKU_360_9922,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_360_9922) }
      },
      url: '/direct/rest/content/catalog/sku/360-9922'
    },
    '385-2384': {
      data: SKU_385_2384,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_385_2384) }
      },
      url: '/direct/rest/content/catalog/sku/385-2384'
    },
    '530-3001': {
      data: SKU_530_3001,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_530_3001) }
      },
      url: '/direct/rest/content/catalog/sku/530-3001'
    },
    '572-0859': {
      data: SKU_572_0859,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_572_0859) }
      },
      url: '/direct/rest/content/catalog/sku/572-0859'
    },
    '661-8688': {
      data: SKU_661_8688,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_661_8688) }
      },
      url: '/direct/rest/content/catalog/sku/661-8688'
    },
    '724-1190': {
      data: SKU_724_1190,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_724_1190) }
      },
      url: '/direct/rest/content/catalog/sku/724-1190'
    },
    '725-7977': {
      data: SKU_725_7977,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_725_7977) }
      },
      url: '/direct/rest/content/catalog/sku/725-7977'
    },
    '742-8388': {
      data: SKU_742_8388,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_742_8388) }
      },
      url: '/direct/rest/content/catalog/sku/742-8388'
    },
    '767-7465': {
      data: SKU_767_7465,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_767_7465) }
      },
      url: '/direct/rest/content/catalog/sku/767-7465'
    },
    'ZA3-TD6B': {
      data: SKU_ZA3_TD6B,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(SKU_ZA3_TD6B) }
      },
      url: '/direct/rest/content/catalog/sku/ZA3-TD6B'
    }
  };

  mocks.listings = {
    O0001ffd7a: {
      data: O0001ffd7a,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(O0001ffd7a) }
      },
      url: '/direct/rest/content/listings/listed/O0001ffd7a'
    },
    O00015f776: {
      data: O00015f776,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(O00015f776) }
      },
      url: '/direct/rest/content/listings/listed/O00015f776'
    },
    O000227fbc: {
      data: O000227fbc,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(O000227fbc) }
      },
      url: '/direct/rest/content/listings/listed/O000227fbc'
    },
    O0002220b2: {
      data: O0002220b2,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(O0002220b2) }
      },
      url: '/direct/rest/content/listings/listed/O0002220b2'
    },
    T00020c7db: {
      data: T00020c7db,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(T00020c7db) }
      },
      url: '/direct/rest/content/listings/listed/T00020c7db'
    }
  };

  mocks.inventory = {};

  mocks.inventory.products = {
    '148-7656': {
      data: INV_PRD_148_7656,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_148_7656] }) }
      },
      url: '/direct/rest/inventory/product/148-7656?format=standard'
    },
    '154-1779': {
      data: INV_PRD_154_1779,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_154_1779] }) }
      },
      url: '/direct/rest/inventory/product/154-1779?format=standard'
    },
    '154-6351': {
      data: INV_PRD_154_6351,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_154_6351] }) }
      },
      url: '/direct/rest/inventory/product/154-6351?format=standard'
    },
    '204-7271': {
      data: INV_PRD_204_7271,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_204_7271] }) }
      },
      url: '/direct/rest/inventory/product/204-7271?format=standard'
    },
    '313-0760': {
      data: INV_PRD_313_0760,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_313_0760] }) }
      },
      url: '/direct/rest/inventory/product/313-0760?format=standard'
    },
    '657-7177': {
      data: INV_PRD_657_7177,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_657_7177] }) }
      },
      url: '/direct/rest/inventory/product/657-7177?format=standard'
    },
    '670-4017': {
      data: INV_PRD_670_4017,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_PRD_670_4017] }) }
      },
      url: '/direct/rest/inventory/product/670-4017?format=standard'
    }
  };

  mocks.inventory.skus = {
    '119-3321': {
      data: INV_SKU_119_3321,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus : [INV_SKU_119_3321] }) }
      },
      url: '/direct/rest/inventory/sku/119-3321?format=standard'
    },
    '361-2760': {
      data: INV_SKU_361_2760,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_SKU_361_2760] }) }
      },
      url: '/direct/rest/inventory/product/361-2760?format=standard'
    },
    '515-7104': {
      data: INV_SKU_515_7104,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ products: [INV_SKU_515_7104] }) }
      },
      url: '/direct/rest/inventory/product/515-7104?format=standard'
    }
  };

  mocks.price = {};

  mocks.price.skus = {
    '24A-5X7U': {
      data: PRC_SKU_24A_5X7U,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_24A_5X7U] }) }
      },
      url: '/direct/rest/price/sku/24A-5X7U?format=standard'
    },
    '101-6583': {
      data: PRC_SKU_101_6583,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_101_6583] }) }
      },
      url: '/direct/rest/price/sku/101-6583?format=standard'
    },
    '129-8921': {
      data: PRC_SKU_129_8921,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_129_8921] }) }
      },
      url: '/direct/rest/price/sku/129-8921?format=standard'
    },
    '154-6351': {
      data: PRC_SKU_154_6351,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_154_6351] }) }
      },
      url: '/direct/rest/price/sku/154-6351?format=standard'
    },
    '196-2352': {
      data: PRC_SKU_196_2352,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_196_2352] }) }
      },
      url: '/direct/rest/price/sku/196-2352?format=standard'
    },
    '199-1072': {
      data: PRC_SKU_199_1072,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_199_1072] }) }
      },
      url: '/direct/rest/price/sku/199-1072?format=standard'
    },
    '227-5139': {
      data: PRC_SKU_227_5139,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_227_5139] }) }
      },
      url: '/direct/rest/price/sku/227-5139?format=standard'
    },
    '231-0874': {
      data: PRC_SKU_231_0874,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_231_0874] }) }
      },
      url: '/direct/rest/price/sku/231-0874?format=standard'
    },
    '385-2384': {
      data: PRC_SKU_385_2384,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_385_2384] }) }
      },
      url: '/direct/rest/price/sku/385-2384?format=standard'
    },
    '530-3001': {
      data: PRC_SKU_530_3001,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_530_3001] }) }
      },
      url: '/direct/rest/price/sku/530-3001?format=standard'
    },
    '572-0859': {
      data: PRC_SKU_572_0859,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_572_0859] }) }
      },
      url: '/direct/rest/price/sku/572-0859?format=standard'
    },
    '661-8688': {
      data: PRC_SKU_661_8688,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_661_8688] }) }
      },
      url: '/direct/rest/price/sku/661-8688?format=standard'
    },
    '724-1190': {
      data: PRC_SKU_724_1190,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_724_1190] }) }
      },
      url: '/direct/rest/price/sku/724-1190?format=standard'
    },
    '725-7977': {
      data: PRC_SKU_725_7977,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_725_7977] }) }
      },
      url: '/direct/rest/price/sku/725-7977?format=standard'
    },
    '742-8388': {
      data: PRC_SKU_742_8388,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_742_8388] }) }
      },
      url: '/direct/rest/price/sku/742-8388?format=standard'
    },
    '767-7465': {
      data: PRC_SKU_767_7465,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_767_7465] }) }
      },
      url: '/direct/rest/price/sku/767-7465?format=standard'
    },
    'ZA3-TD6B': {
      data: PRC_SKU_ZA3_TD6B,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify({ skus: [PRC_SKU_ZA3_TD6B] }) }
      },
      url: '/direct/rest/price/sku/ZA3-TD6B?format=standard'
    }
  };

  mocks.rr = {
    cwvav: {
      data: RR_CWVAV_OBJS,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(RR_CWVAV_OBJS) }
      }
    },
    pp: {
      data: RR_PP_IDS,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(RR_PP_IDS) }
      }
    }
  };

  mocks.stores = {
    '03362': {
      data: STORE_03362,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_03362) }
      },
      url: '/direct/rest/content/catalog/stores/store/03362'
    },
    '03142': {
      data: STORE_03142,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_03142) }
      },
      url: '/direct/rest/content/catalog/stores/store/03142'
    },
    '02425': {
      data: STORE_02425,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_02425) }
      },
      url: '/direct/rest/content/catalog/stores/store/02425'
    },
    '03050': {
      data: STORE_03050,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_03050) }
      },
      url: '/direct/rest/content/catalog/stores/store/03050'
    },
    '02547': {
      data: STORE_02547,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_02547) }
      },
      url: '/direct/rest/content/catalog/stores/store/02547'
    },
    '02101': {
      data: STORE_02101,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_02101) }
      },
      url: '/direct/rest/content/catalog/stores/store/02101'
    },
    '02639': {
      data: STORE_02639,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_02639) }
      },
      url: '/direct/rest/content/catalog/stores/store/02639'
    },
    '02634': {
      data: STORE_02634,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_02634) }
      },
      url: '/direct/rest/content/catalog/stores/store/02634'
    },
    '03356': {
      data: STORE_03356,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_03356) }
      },
      url: '/direct/rest/content/catalog/stores/store/03356'
    },
    '02467': {
      data: STORE_02467,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_02467) }
      },
      url: '/direct/rest/content/catalog/stores/store/02467'
    }
  };

  mocks.availabilities = {
    '03362': {
      data: AVAILABILITY_03362,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_03362) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=03362'
    },
    '03142': {
      data: AVAILABILITY_03142,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_03142) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=03142'
    },
    '02425': {
      data: AVAILABILITY_02425,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_02425) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=02425'
    },
    '03050': {
      data: AVAILABILITY_03050,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_03050) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=03050'
    },
    '02547': {
      data: AVAILABILITY_02547,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_02547) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=02547'
    },
    '02101': {
      data: AVAILABILITY_02101,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_02101) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=02101'
    },
    '02639': {
      data: AVAILABILITY_02639,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_02639) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=02639'
    },
    '02634': {
      data: AVAILABILITY_02634,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_02634) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=02634'
    },
    '03356': {
      data: AVAILABILITY_03356,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_03356) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=03356'
    },
    '02467': {
      data: AVAILABILITY_02467,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(AVAILABILITY_02467) }
      },
      url: '/direct/rest/availability?listingIds=T0000a64e6&locationIds=02467'
    }
  };

  mocks.storeStock = {
    '305-8509': {
      data: STORE_STOCK_305_8509,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_STOCK_305_8509) }
      },
      url: '/direct/rest/storeStock/305-8509'
    }
  };

  mocks.storeSearch = {
    '03362': {
      data: STORE_SEARCH_03362,
      resp: {
        internalError: { status: 500, responseText: 'Internal Server Error' },
        notFound: { status: 404, responseText: 'Not Found' },
        success: { status: 200, responseText: JSON.stringify(STORE_SEARCH_03362) }
      },
      url: '/direct/rest/storeSearch?lat=51.8998&lon=-0.2026&num=1&formats=Extra,Superstore'
    }
  };

  mocks.asyncCustomerBlocks = {
    '670-4017': {
      '201-2207': {
        data: ASYNC_670_4017_201_2207,
        resp: {
          internalError: { status: 500, responseText: 'Internal Server Error' },
          notFound: { status: 404, responseText: 'Not Found' },
          success: { status: 200, responseText: JSON.stringify(ASYNC_670_4017_201_2207) }
        },
        url: '/direct/blocks/common/asyncCustomerBlocks.jsp?blocks=headerFlyoutMenus,Recommendations,BuyBoxV2,inventory,WishlistV2,RVI,Analytics&skuID=201-2207&productID=670-4017'
      }
    }
  };


  /**
   *
   * @param {string} type
   * @param {Array<string>} ids
   * @param {string} [endpoint]
   * @return {void}
   */
  mocks.stubAndReturn = function (type, ids, endpoint) {
    var path = endpoint ? mocks[endpoint][type] : mocks[type];

    fn.loopArray(ids, function (i) {
      jasmine.Ajax
        .stubRequest(path[ids[i]].url)
        .andReturn(path[ids[i]].resp.success);
    });
  };


  module.exports = mocks;
});
