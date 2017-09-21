define('modules/affiliate/common', ['domlib', 'modules/common', 'modules/tesco.utils'],
function ($, common, utils) {
  'use strict';

  /**
   *  There are changes between seconds and milliseconds due to the backend implementation
   *  unfortunatly, it needs to be backwards-compatible
   */

  var CONSTS = {
      source: 'source',
      sourceValues: ['awin', 'zenaps'],
      sourceAWIN: 'aw',
      sourceDirect: 'direct',
      sourceOther: 'others',
      cookieName: 'aw_ck',
      cookieExpiryName: 'AW_Expires_In',
      cookieExpiryMilliSeconds: 1000 * 60 * 60 * 24 * 30,
      cookiePath: '/direct'
    },

    affiliateTracking = {

      init: function () {
        var sourceValue = null;

        try {
          if (!this.isCookieSet()) {
            sourceValue = this.getSourceValue();
            this.setCookie(sourceValue);
          } else {
            sourceValue = this.getSourceFromURL();
            if (sourceValue !== '') {
              if (this.isRequestFromAffiliate(sourceValue)) {
                sourceValue = this.getSourceValue();
              }
              this.updateCookie(sourceValue);
            }
          }
        } catch (ex) {}
      },

      isRequestFromAffiliate: function (sourceFromURL) {
        var i = 0;

        for (; i < CONSTS.sourceValues.length; i += 1) {
          if (sourceFromURL === CONSTS.sourceValues[i]) {
            return true;
          }
        }
        return false;
      },

      getSourceFromURL: function () {
        return utils.getQueryStringParam(CONSTS.source);
      },

      getSourceValue: function () {
        var sourceFromURL = this.getSourceFromURL();

        if (sourceFromURL !== '') {
          return this.isRequestFromAffiliate(sourceFromURL)
          ? CONSTS.sourceAWIN : CONSTS.sourceOther;
        }

        return CONSTS.sourceDirect;
      },

      setCookie: function (sourceValue) {
        var currentDateEPOC = Date.now(),
          baseExpiryDate = new Date(),
          expiryDate = new Date(baseExpiryDate.setTime(baseExpiryDate.getTime() +
          CONSTS.cookieExpiryMilliSeconds)),
          expiryDateInSeconds = Math.floor((expiryDate.getTime() - currentDateEPOC) / 1000),
          domainName = $('#domainName').val();

        $.cookie(CONSTS.cookieName, sourceValue, { path: CONSTS.cookiePath, expires: expiryDate, domain: domainName });
        $.cookie(CONSTS.cookieExpiryName, expiryDateInSeconds, {
          path: CONSTS.cookiePath, expires: expiryDate, domain: domainName });
      },

      updateCookie: function (sourceValue) {
        var currentDate = new Date(),
          newExpiryDate = new Date(currentDate.setTime(currentDate.getTime() +
           CONSTS.cookieExpiryMilliSeconds)),
          expiryCookieDate = $.cookie(CONSTS.cookieExpiryName),
          domainName = $('#domainName').val();

        if (expiryCookieDate === null) {
          expiryCookieDate = newExpiryDate;
        } else {
          currentDate = new Date();
          expiryCookieDate = new Date(
            currentDate.setTime(currentDate.getTime() + (expiryCookieDate * 1000)));
        }
        $.cookie(CONSTS.cookieName, sourceValue, {
          path: CONSTS.cookiePath, expires: expiryCookieDate, domain: domainName
        });
      },

      isCookieSet: function () {
        return $.cookie(CONSTS.cookieName);
      }
    };

  common.init.push(function () {
    affiliateTracking.init();
  });

  return affiliateTracking;
});
