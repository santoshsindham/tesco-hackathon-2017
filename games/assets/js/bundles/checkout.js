require([
  'modules/checkout/common',
  'modules/order-confirmation/common',
  'modules/hooklogic/common'
], function () {});


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
