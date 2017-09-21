/*globals define, jasmine, describe, it, expect, beforeEach, afterEach, spyOn */
define(['modules/google-analytics/cookie'], function (cookie) {
    'use strict';

    describe('Google Analytics cookie module', function () {

        var expectedValue;

        afterEach(function () {
            expectedValue = null;
        });

        describe('GIVEN I have navigated to the site via a Google paid search advert (the referrer url contains google and adurl)', function () {
            var paidSearchTestUrl;

            beforeEach(function () {
                paidSearchTestUrl = "http://www.google.co.uk?adurl=testad123";
            });

            afterEach(function () {
                paidSearchTestUrl = null;
            });

            describe('WHEN the GA paid search cookie is not present', function () {
                it('THEN I set the GA session cookie (name - ga_adurl, boolean value 1, path: "/direct", domain : "tesco.com")', function () {
                    expectedValue = cookie.setCookieIfFromPaidSearch(paidSearchTestUrl);
                    expect(expectedValue).toEqual(true);
                });
            });
        });

        describe('GIVEN I have not navigated to the site via a Google paid search advert (the referrer url does not contain google or adurl)', function () {
            var nonPaidSearchTestUrl;

            beforeEach(function () {
                nonPaidSearchTestUrl = "http://www.tesco.com/direct";
            });

            afterEach(function () {
                nonPaidSearchTestUrl = null;
            });

            describe('WHEN the GA paid search cookie is not present', function () {
                it('THEN I do not set the GA session cookie (name - ga_adurl, boolean value 1, path: "/direct", domain : "tesco.com")', function () {
                    expectedValue = cookie.setCookieIfFromPaidSearch(nonPaidSearchTestUrl);
                    expect(expectedValue).toEqual(false);
                });
            });
        });

        describe('GIVEN I have not navigated to the site via a Google paid search advert (the referrer url does not contain google but does have adurl parameter)', function () {
            var nonPaidSearchTestUrl;

            beforeEach(function () {
                nonPaidSearchTestUrl = "http://www.tesco.com/direct/?adurl=1234";
            });

            afterEach(function () {
                nonPaidSearchTestUrl = null;
            });

            describe('WHEN the GA paid search cookie is not present', function () {
                it('THEN I do not set the GA session cookie (name - ga_adurl, boolean value 1, path: "/direct", domain : "tesco.com")', function () {
                    expectedValue = cookie.setCookieIfFromPaidSearch(nonPaidSearchTestUrl);
                    expect(expectedValue).toEqual(false);
                });
            });
        });

        describe('GIVEN I have not navigated to the site via a Google paid search advert (the referrer url does not contain adurl but is from google domain)', function () {
            var nonPaidSearchTestUrl;

            beforeEach(function () {
                nonPaidSearchTestUrl = "http://www.google.co.uk/?notanadurl=1234";
            });

            afterEach(function () {
                nonPaidSearchTestUrl = null;
            });

            describe('WHEN the GA paid search cookie is not present', function () {
                it('THEN I do not set the GA session cookie (name - ga_adurl, boolean value 1, path: "/direct", domain : "tesco.com")', function () {
                    expectedValue = cookie.setCookieIfFromPaidSearch(nonPaidSearchTestUrl);
                    expect(expectedValue).toEqual(false);
                });
            });
        });

        describe('GIVEN I arrived on the site via a Google paid search advert', function () {

            beforeEach(function () {
                spyOn($, "cookie").and.returnValue("1");
            });

            describe('WHEN I look in the cookies', function () {
                it('THEN I see the GA session cookie (name - ga_adurl, boolean value 1, path: "/direct", domain : "tesco.com")', function () {
                    expect(cookie.getCookieFromPaidSearch()).toEqual(true);
                    expect($.cookie).toHaveBeenCalledWith("ga_adurl");
                });
            });
        });

        describe('GIVEN I did not arrive on the site via a Google paid search advert', function () {

            beforeEach(function () {
                spyOn($, "cookie").and.returnValue(null);
            });

            describe('WHEN I look in the cookies', function () {
                it('THEN I do not see the GA session cookie (name - ga_adurl, boolean value 1, path: "/direct", domain : "tesco.com")', function () {
                    expect(cookie.getCookieFromPaidSearch()).toEqual(false);
                    expect($.cookie).toHaveBeenCalledWith("ga_adurl");
                });
            });
        });
    });
});