define('modules/pdp/DataEndpointMap', [], function () {
  'use strict';

  var DataEndpointMap = function DataEndpointMap() {
    this.oMap = {
      bucketgroup: {
        action: {
          fetch: {
            href: 'content/catalog/bucketGroup/'
          }
        }
      },
      products: {
        action: {
          fetch: {
            href: 'content/catalog/product/'
          }
        },
        type: 'product'
      },
      sku: {
        action: {
          buybox: {
            href: '/direct/blocks/catalog/productdetailv2/buyBoxDetails.jsp?'
                + 'skuID=%SKUID%&productID=%PRODUCTID%&asyncBuyBoxPassed=true'
                + '&onAsync=true%SCHOOLID%%SCHOOLNAME%%SLOGOREF%'
          },
          fetch: {
            href: 'content/catalog/sku/'
          },
          ndo: {
            href: '/direct/blocks/catalog/productdetailv2/JSON/fetchDOForListing.jsp?skuId='
          },
          price: {
            href: 'price/sku/'
          },
          relationships: {
            href: 'content/relationships/{relationship}/'
          },
          competitors: {
            href: 'competitor/price/sku/'
          }
        },
        type: 'skus'
      },
      inventorysku: {
        action: {
          fetch: {
            href: 'inventory/sku/'
          }
        }
      },
      inventoryproduct: {
        action: {
          fetch: {
            href: 'inventory/product/'
          }
        }
      },
      marketingsku: {
        action: {
          fetch: {
            href: 'marketing/sku/'
          }
        }
      },
      promotions: {
        action: {
          fetch: {
            href: 'content/catalog/promotion/'
          }
        }
      },
      categories: {
        action: {
          fetch: {
            href: 'content/catalog/category/'
          }
        }
      },
      stores: {
        action: {
          fetch: {
            href: 'storeSearch?lat={LAT}&lon={LON}&num=30&formats=Extra,Superstore'
          },
          storeDetails: {
            href: 'content/stores/store/'
          }
        }
      },
      inventorystore: {
        action: {
          fetch: {
            href: 'availability?listingIds={LISTINGID}&locationIds={STOREIDS}'
          }
        }
      },
      links: {
        action: {
          relationships: { href: 'content/relationships/{relationship}/' }
        }
      }
    };
  };

  DataEndpointMap.prototype.getEndpoint = function (sProp) {
    var sSanitisedProp = '';

    if (sProp) {
      sSanitisedProp = sProp.toLowerCase();
      if (this.oMap.hasOwnProperty(sSanitisedProp)) {
        return this.oMap[sSanitisedProp];
      }
    }
    return null;
  };

  return DataEndpointMap;
});
