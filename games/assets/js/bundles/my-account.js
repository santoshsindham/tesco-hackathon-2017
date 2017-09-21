require([
  'modules/footer/common',
  'modules/breadcrumb/common',
  'modules/navigation/common',
  'modules/catalog-navigation/init',
  'modules/fixed-header/init',
  'modules/integrated-registration/common',
  'modules/sign-out/common',
  'modules/manage-stock-alerts/common',
  'modules/self-service/common',
  'modules/track-parcel/common',
  'modules/order-amendments/common',
  'modules/my-account/manage-clubcard-details',
  'modules/my-account/manage-contact-details',
  'modules/my-account/change-email-address',
  'modules/my-account/manage-payment-details',
  'modules/reserve-stock/common'
], function () {});


if (window.isTouch() && !window.isKiosk()) {
  require([
    'modules/my-account/touch',
    'modules/vat-invoice/touch'
  ], function () {});
} else if (!window.isKiosk()) {
  require([
    'modules/my-account/desktop',
    'modules/vat-invoice/desktop'
  ], function () {});
}


require(['modules/common', 'modules/breakpoint'], function (common, breakpoint) {
  $(function () {
    if (window.isTouch()) {
      common.androidDetect();
    } else {
      common.windowsPhoneDetect();
    }

    breakpoint.init();
    breakpoint.check();
    common.app();
    common.helpRatings();
    setTimeout(function () {
      breakpoint.update(breakpoint.check(true));
    }, 4);
  });
});
