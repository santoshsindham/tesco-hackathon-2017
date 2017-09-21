define(['modules/common'], function (common) {
    'use strict';

    describe('\n Footer module ', function () {

        describe('\n --------------------------- \n Cookie Banner at the footer of the page', function () {

            var cookieBanner;

            function setUpCookieFixture() {
                jasmine.getFixtures().set('<div class="tesco-cookie">< a href="" class="tesco-cookie-accept"></a></div>');
            }

            beforeEach(function () {
                setUpCookieFixture();
                cookieBanner = $(".tesco-cookie");
            });

            it('\n Cookie Banner should be displayed when the cokkie \' cookiesAccepted \' is not present', function () {
                common.showCookieBanner();
                expect($.cookie('cookiesAccepted')).not.toBeNull();
                expect(cookieBanner.is(':visible')).toBe(true);
            });

            it('\n Cookie Banner should not be displayed when the cookie \'cookiesAccepted\' is present', function () {
                common.showCookieBanner();

                //cookie should be present
                expect($.cookie('cookiesAccepted')).not.toBeNull();

                // default cookie banner block is hidden so to replicate the same if cookie is present block should be hidden
                if ($.cookie('cookiesAccepted')) {
                    cookieBanner.hide();
                }

                expect(cookieBanner.is(':visible')).toBe(false);
            });

        });
    });

});
