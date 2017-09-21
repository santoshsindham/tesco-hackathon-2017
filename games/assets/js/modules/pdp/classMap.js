define(function (require, exports, module) {
  'use strict';

  var AddRemoveServiceController = require('modules/pdp/controllers/AddRemoveServiceController');
  var AddToBasketController = require('modules/pdp/controllers/AddToBasketController');
  var AddToBasketView = require('modules/pdp/views/AddToBasketView');
  var AssetModel = require('modules/pdp/models/AssetModel');
  var BucketGroupModel = require('modules/pdp/models/bucket-group/index');
  var BundleController = require('modules/pdp/controllers/BundleController');
  var BuyboxView = require('modules/pdp/views/BuyboxView');
  var CategoryModel = require('modules/pdp/models/CategoryModel');
  var DeliveryOptionsController = require('modules/pdp/controllers/DeliveryOptionsController');
  var DeliveryOptionsModel = require('modules/pdp/models/DeliveryOptionsModel');
  var DeliverySnippetView = require('modules/pdp/views/DeliverySnippetView');
  var FormHandlerModel = require('modules/pdp/models/FormHandlerModel');
  var InlineContentController = require('modules/pdp/controllers/InlineContentController');
  var InventoryProductModel = require('modules/pdp/models/InventoryProductModel');
  var InventorySKUModel = require('modules/pdp/models/InventorySKUModel');
  var InventoryStoreModel = require('modules/pdp/models/InventoryStoreModel');
  var ItemActionsController = require('modules/pdp/controllers/ItemActionsController');
  var KioskProductPageView = require('modules/pdp/views/KioskProductPageView');
  var KioskTabsController = require('modules/pdp/controllers/kiosk-tabs/index');
  var LinksaveController = require('modules/pdp/controllers/linksave/index');
  var MarketingSkuModel = require('modules/pdp/models/marketing/sku/index');
  var PanelController = require('modules/pdp/controllers/PanelController');
  var PersonaliseController = require('modules/pdp/controllers/PersonaliseController');
  var PriceCheckController = require('modules/pdp/controllers/PriceCheckController');
  var ProductController = require('modules/pdp/controllers/ProductController');
  var ProductModel = require('modules/pdp/models/ProductModel');
  var PromotionsController = require('modules/pdp/controllers/PromotionsController');
  var PromotionsModel = require('modules/pdp/models/PromotionsModel');
  var PromotionsView = require('modules/pdp/views/PromotionsView');
  var RecommendersController = require('modules/pdp/controllers/RecommendersController');
  var RelatedItemsController = require('modules/pdp/controllers/RelatedItemsController');
  var RelatedItemsModel = require('modules/pdp/models/RelatedItemsModel');
  var RelatedProductController = require('modules/pdp/controllers/RelatedProductController');
  var RelatedProductView = require('modules/pdp/views/RelatedProductView');
  var RelatedSKUController = require('modules/pdp/controllers/RelatedSKUController');
  var RelatedSKUView = require('modules/pdp/views/RelatedSKUView');
  var RequestStockAlertController = require('modules/pdp/controllers/RequestStockAlertController');
  var SellerController = require('modules/pdp/controllers/SellerController');
  var SellerModel = require('modules/pdp/models/SellerModel');
  var ServicesBannerView = require('modules/pdp/views/ServicesBannerView');
  var ServicesController = require('modules/pdp/controllers/ServicesController');
  var ServicesFormView = require('modules/pdp/views/ServicesFormView');
  var ServicesModel = require('modules/pdp/models/ServicesModel');
  var SkuController = require('modules/pdp/controllers/SkuController');
  var SkuModel = require('modules/pdp/models/SkuModel');
  var StoreModel = require('modules/pdp/models/StoreModel');
  var StoreStockCheckController = require('modules/pdp/controllers/StoreStockCheckController');
  var VariantsController = require('modules/pdp/controllers/VariantsController');
  var VariantsView = require('modules/pdp/views/VariantsView');
  var WarrantiesController = require('modules/pdp/controllers/WarrantiesController');
  var WishlistsController = require('modules/pdp/controllers/WishlistsController');
  var WishlistsModel = require('modules/pdp/models/WishlistsModel');

  /**
   * Used by a page controller to look up which models, views and controllers it needs to create.
   * It is also used by the data controller to determine when to fire certain events.
   *
   * @type {Object}
   */
  var classMap = {
    classes: {
      model: {
        assets: AssetModel,
        bucketGroup: BucketGroupModel,
        categories: CategoryModel,
        deliveryOptions: DeliveryOptionsModel,
        formHandler: FormHandlerModel,
        inventoryProduct: InventoryProductModel,
        inventorySKU: InventorySKUModel,
        inventoryStore: InventoryStoreModel,
        links: RelatedItemsModel,
        marketingSku: MarketingSkuModel,
        products: ProductModel,
        promotions: PromotionsModel,
        sellers: SellerModel,
        services: ServicesModel,
        sku: SkuModel,
        stores: StoreModel,
        wishlists: WishlistsModel
      },
      view: {
        deliveryOptions: {
          snippet: DeliverySnippetView
        },
        products: {
          dropdown: VariantsView,
          links: RelatedProductView,
          variants: VariantsView
        },
        promotions: {
          _default: PromotionsView
        },
        services: {
          banner: ServicesBannerView,
          form: ServicesFormView
        },
        sku: {
          buybox: BuyboxView,
          buybutton: AddToBasketView,
          kioskPage: KioskProductPageView,
          links: RelatedSKUView
        }
      },
      controller: {
        deliveryOptions: {
          _default: DeliveryOptionsController
        },
        formHandler: {
          addToBasket: AddToBasketController,
          requestStockAlert: RequestStockAlertController,
          services: AddRemoveServiceController
        },
        inherit: {
          bundle: BundleController,
          itemActions: ItemActionsController,
          recommender: RecommendersController
        },
        links: {
          _default: RelatedItemsController,
          tabs: KioskTabsController
        },
        panel: {
          _default: PanelController
        },
        products: {
          _default: ProductController,
          links: RelatedProductController,
          variants: VariantsController
        },
        promotions: {
          _default: PromotionsController,
          linksave: LinksaveController
        },
        sellers: {
          _default: SellerController,
          warranties: WarrantiesController
        },
        services: {
          _default: ServicesController
        },
        sku: {
          _default: SkuController,
          competitors: PriceCheckController,
          inlineContent: InlineContentController,
          links: RelatedSKUController,
          personalise: PersonaliseController,
          variants: VariantsController
        },
        stores: {
          storeStockCheck: StoreStockCheckController
        },
        wishlists: {
          _default: WishlistsController
        }
      }
    },
    /**
     * Finds and returns a Class from the type and namespace.
     * @param {String} sType The type of Class, i.e. 'view'
     * @param {String} sNamespace The Class's namespace, i.e. 'product'
     * @param {String} sTag The Class's tag, i.e. 'addToBasket'
     * @return {Function} A Class.
     */
    find: function (sType, sNamespace, sTag) {
      var mOutput = false;

      if (classMap.classes[sType][sNamespace]) {
        if (sType === 'model') {
          mOutput = classMap.classes[sType][sNamespace];
        } else if (sType === 'controller') {
          if (sTag && classMap.classes[sType][sNamespace].hasOwnProperty(sTag)) {
            mOutput = classMap.classes[sType][sNamespace][sTag];
          } else if (classMap.classes[sType][sNamespace].hasOwnProperty('_default')) {
            mOutput = classMap.classes[sType][sNamespace]._default;
          }
        } else {
          mOutput = classMap.classes[sType][sNamespace][sTag];
        }
      }

      return mOutput;
    },
    /**
     * Checks if a namespace exists as a property of the class's model object.
     * @param {String} sType The type of class to search in.
     * @param {String} sNamespace The namespace to search for.
     * @return {Boolean} Whether the namespace is mapped.
     */
    hasNamespace: function (sType, sNamespace) {
      if (classMap.classes[sType].hasOwnProperty(sNamespace)) {
        return true;
      }

      return false;
    }
  };

  module.exports = classMap;
});
