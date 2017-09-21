/* eslint-disable */
define([
    'domlib',
    'modules/breakpoint',
    'modules/common',
    'modules/domlib-utils/common',
    'modules/footer/common',
    'modules/breadcrumb/common',
    'modules/carousel/touch',
    'modules/integrated-registration/common',
    'modules/tile-carousel/touch',
    'modules/colour-swatch/common',
    'modules/product-variants/ProductVariantController',
    'modules/load-more/common',
    'modules/navigation/common',
    'modules/buy-from/touch',
    'modules/product-offers/common',
    'modules/product-sort-by/common',
    'modules/recently-viewed/common',
    'modules/sort-by/common',
    'modules/add-to-compare/touch',
    'modules/product-filters/common',
    'modules/home-page-stamps/common',
    'modules/expand-collapse/common',
    'modules/basket/common',
    'modules/delivery-options/touch',
    'modules/save-for-later/touch',
    'modules/sign-out/common',
    'modules/compare-page/common',
    'modules/visual-nav/common',
    'modules/product-description/touch',
    'modules/scroll-to/touch',
    'modules/checkout/common',
    'modules/order-confirmation/common',
    'modules/seller-directory/common',
    'modules/buying-guides/common',
    'modules/buying-guides-directory/common',
    'modules/my-account/touch',
    'modules/deferred-block/common',
    'modules/self-service/common',
    'modules/track-parcel/common',
    'modules/vat-invoice/touch',
    'modules/media-matrix/common',
    'modules/carousel-position-indicator/common',
    'modules/pdp-s7viewer/common',
    'modules/event-messaging/common',
    'modules/order-amendments/common',
    'modules/dfp/common',
    'modules/pdp-configurator/common',
    'modules/warranty/resaleWidget',
    'modules/google-analytics/googleAnalytics',
    'modules/my-account/manage-clubcard-details',
    'modules/my-account/manage-contact-details',
    'modules/my-account/change-email-address',
    'modules/my-account/manage-payment-details',
    'modules/ui-components/common',
    'modules/personalise-product/common',
    'modules/catalog-navigation/init',
    'modules/fixed-header/init',
    'modules/reserve-stock/common',
    'modules/pagination/pagination',
    'modules/pdp/media-viewer/common',
    'modules/ues/common',
    'modules/set-page-title/SetPageTitle',
    'modules/hooklogic/common',
    'modules/affiliate/common',
    'modules/add-on-items/common'
], function ($, breakpoint, common) {

    $(function () {
        common.androidDetect();
        $(document).ready(function () {
            //common.orientationViewportFix();
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
