define(['domlib', 'modules/tesco.utils', 'jquery.cookie'], function ($, utils) {
    'use strict';

    var wasRedirectFromGooglePaidSearch,
        setCookie;

    wasRedirectFromGooglePaidSearch = function (referrerUrl) {
        var urlParts = referrerUrl.split("?"),
            expectedDomain = "google",
            isExpectedDomain,
            expectedQueryStringParameter = "adurl",
            hasExpectedQueryStringParameter;

        if (urlParts.length === 2) {
            isExpectedDomain = utils.isInDomain(urlParts[0], expectedDomain);
            hasExpectedQueryStringParameter = utils.isInQueryString(urlParts[1], expectedQueryStringParameter);

            if (isExpectedDomain && hasExpectedQueryStringParameter) {
                return true;
            }
        }
        return false;
    };

    setCookie = function (name, value) {
        var nameValuePair = encodeURIComponent(name) + "=" + encodeURIComponent(value),
            domain = utils.isDev2() ? 'dbt86.tscl' : 'tesco';

        document.cookie = nameValuePair + '; path=/direct; domain=.' + domain + '.com';
    };

    return {
        setCookieIfFromPaidSearch: function (referrerUrl) {
            var fromGooglePaidSearch = wasRedirectFromGooglePaidSearch(referrerUrl);

            if (fromGooglePaidSearch) {
                setCookie("ga_adurl", 1);
                return true;
            }

            return false;
        },

        getCookieFromPaidSearch: function () {
            var value = $.cookie("ga_adurl");
            if (value === "1") {
                return true;
            }
            return false;
        }
    };
});