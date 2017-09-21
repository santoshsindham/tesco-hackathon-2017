/* eslint-disable */
define([
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/tesco.data',
    'modules/domlib-utils/common',
    'modules/footer/common',
    'modules/breadcrumb/common',
    'modules/carousel/desktop',
    'modules/tile-carousel/desktop',
    'modules/colour-swatch/common',
    'modules/product-variants/ProductVariantController',
    'modules/product-offers/common',
    'modules/load-more/common',
    'modules/integrated-registration/common',
    'modules/navigation/common',
   'modules/buy-from/desktop',
    'modules/product-sort-by/common',
    'modules/recently-viewed/common',
    'modules/sort-by/common',
    'modules/add-to-compare/desktop',
    'modules/product-filters/common',
    'modules/home-page-stamps/common',
    'modules/expand-collapse/common',
    'modules/basket/common',
    'modules/product-description/desktop',
    'modules/delivery-options/desktop',
    'modules/save-for-later/desktop',
    'modules/sign-out/common',
    'modules/compare-page/common',
    'modules/visual-nav/common',
    'modules/scroll-to/desktop',
    'modules/checkout/common',
    'modules/order-confirmation/common',
    'modules/seller-directory/common',
    'modules/buying-guides/common',
    'modules/buying-guides-directory/common',
    'modules/my-account/desktop',
    'modules/manage-stock-alerts/common',
    'modules/deferred-block/common',
    'modules/self-service/common',
    'modules/track-parcel/common',
    'modules/media-matrix/common',
    'modules/carousel-position-indicator/common',
    'modules/vat-invoice/desktop',
    'modules/pdp-s7viewer/common',
    'modules/dfp/common',
    'modules/event-messaging/common',
    'modules/order-amendments/common',
    'modules/pdp-configurator/common',
    'modules/warranty/resaleWidget',
    'modules/google-analytics/googleAnalytics',
    'modules/my-account/manage-clubcard-details',
    'modules/my-account/manage-contact-details',
    'modules/my-account/change-email-address',
    'modules/my-account/manage-payment-details',
    'modules/reserve-stock/common',
    'modules/ui-components/common',
    'modules/personalise-product/common',
    'modules/catalog-navigation/init',
    'modules/fixed-header/init',
    'modules/pagination/pagination',
    'modules/pdp/controllers/AppController',
    'modules/pdp/media-viewer/common',
    'modules/ues/common',
    'modules/set-page-title/SetPageTitle',
    'modules/hooklogic/common',
    'modules/affiliate/common',
    'modules/add-on-items/common'
], function ($, breakpoint, common, data) {

    $(function () {
        common.windowsPhoneDetect();
        $(document).ready(function () {
            breakpoint.init();
            breakpoint.check();
            common.app();
            common.helpRatings();
            setTimeout(function () {
                breakpoint.update(breakpoint.check(true));
            }, 4);
        });
    });

});
