/**********************************************************
 * Module
 * Utils - Class which holds commonly used utilities. All methods are static so no need to create instance
 **********************************************************/
define(['domlib', 'modules/breakpoint'], function ($, breakpoint) {

	var utils = {
		trim: function (sVal) {
			return sVal.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		},
		removeSpaces: function (sVal) {
			return sVal.replace(/\s/g, '');
		},
		addAjaxLoader: function (oContainer, sMsg, bCenterMessage) {
			var $ajaxLoaderMarkup = $('<div class="ajaxLoader"><span>' + sMsg + '</span></div>');
			var oHeight = $(oContainer).height();
			if ($(oContainer).is('p') || $(oContainer).hasClass('store-search-form')) {
				oHeight = 30;
				$ajaxLoaderMarkup.addClass("ajaxLoaderSmall");
			} else {
				if (oHeight < 100) {
					oHeight = 100;
				}
				/*
				if ($(oContainer).hasClass('store-options-module') || $(oContainer).hasClass('store-collection-times-module')) {
					oHeight = oHeight - 31;
					$ajaxLoaderMarkup.css("top", "31px");
				}
				*/
				if ($(oContainer).hasClass('buyButtonContainer')) {
					oHeight = 30;
				}
			}

			if (bCenterMessage) {
				var $spanElem = $ajaxLoaderMarkup.find('span');
				$spanElem.css("position", "absolute");
				$spanElem.css("top", ((oHeight / 2) + 40) + "px");
				$spanElem.css("left", (($(oContainer).outerWidth() - $spanElem.outerWidth()) / 2) - 35 + "px");
			}

			if ($(oContainer).attr('id') == 'dg-holder') {
				var $spanElem = $ajaxLoaderMarkup.find('span');
				$spanElem.css("position", "absolute");
				var hght = oHeight - (oHeight - $(window).scrollTop());
				if (hght > (oHeight - 100))
					hght = oHeight - 120;
				$ajaxLoaderMarkup.css('backgroundPosition', ($(oContainer).outerWidth() - $spanElem.outerWidth()) / 2 + 'px ' + (hght + 30) + 'px');
				$spanElem.css("top", hght + "px");
				$spanElem.css("left", (($(oContainer).outerWidth() - $spanElem.outerWidth()) / 2) - 50 + "px");
			}
			$ajaxLoaderMarkup.width($(oContainer).outerWidth());
			$ajaxLoaderMarkup.height(oHeight);
			$(oContainer).prepend($ajaxLoaderMarkup);
		},
		removeAjaxLoader: function (oContainer) {
			$(oContainer).find('.loader').remove();
		},
		removeAllAjaxLoaders: function () {
			// Might need to keep a jQuery object of all ajax loaders while adding to boost performance.
			$('body').find('.loader').remove();
		},



		getProductTile: function (oElem) {
			return $(oElem).parents('li').eq(0);
		},
		getDeliveryGroup: function (oElem) {
			return $(oElem).closest('.delivery-block');
		},
		getFormByElement: function (oElem) {
			return $(oElem).closest('form');
		},

		getFormAction: function (oForm) {
			if (oForm != null && oForm != undefined && oForm.length > 0) {
				if ($('#wrapper').hasClass('checkout')) {
					return document.URL;
				}
				var sComparison = oForm.attr('action');
				if (sComparison != '' && sComparison != '#' && sComparison != '#non') {
					return sComparison;
				}
				// If form action is blank, then return the current URL, request from backend.
				else if (sComparison === '') {
					return document.URL;
				}

			}
			return '';
		},
		isArray: function (array) {
			if (typeof Array.isArray !== 'function') {
				Array.isArray = function (arr) {
					return Object.prototype.toString.call(arr) === '[object Array]';
				};
			}
		},
		isNumber: function (o) {
			return typeof o === 'number' && isFinite(o);
		},
		lazyLoadJS: function (sJSFile) {
			var d = $.Deferred();
			$.ajax({
				dataType: "script",
    			cache: true,
    			url: sJSFile,
    			beforeSend: function (jqXHR, settings) {
            		settings.url = sJSFile;
            		return;
            	},
            	complete: function() {
            		d.resolve(true);
            	}
          	});
          	return d.promise();
		},
		formatURL: function (sVal) {
			return sVal.replace(/\s/g, '-');
		},
		getSiteContext: function () {
			//TODO: needs to be updated when responsive goes live.
			// Returns context root - siteBuilderContext.site.contextRoot
			return contextPath;
		},
		isDev2: function () {
			return utils.isInDomain(document.domain, 'dbt86');
		},
		getURLParams: function (url) {
			var params = {};

			function resolveValue(value) {
				var output = undefined;

				if (typeof value === 'string') {
					if (value.indexOf('%C2%A3') >= 0) {
						output = value.replace("%C2%A3", "%25A3");
					} else if (value.indexOf('�') >= 0) {
						output = value.replace("�", "%25A3");
					} else if (value.indexOf('%25')) {
						output = value.replace("%25", "%2525");
					}
				} else if (value === undefined) {
					output = true;
				}

				return output;
			}

			if (url === undefined) {
				url = window.location.href;
			}

			url.replace(/[?&#]+([^&#]+)/gi, function (match, capture) {
				if (capture.match(/=/)) {
					capture.replace(/([^=&#]+)=([^&#]+)/gi, function (match, key, value) {
						params[key] = resolveValue(value);
					});
				} else {
					capture.replace(/([^&#]+)/gi, function (match, key) {
						params[key] = resolveValue();
					});
				}
			});

			return params;
		},
		getURLWithoutHash: function (sURL) {
			var indexOfHash = sURL.indexOf('#') || sURL.length;
			if (indexOfHash === 0) {
				return sURL;
			} else {
				return sURL.substr(0, indexOfHash);
			}
		},
		getHashURL: function (sURL) {
			var indexOfHash = sURL.indexOf('#') || sURL.length;
			if (indexOfHash < 0) {
				indexOfHash = sURL.length;
			}
			return sURL.substr(indexOfHash, sURL.length);
		},
		isInDomain: function (domainString, searchTerm) {
			var domainParts = domainString.toLowerCase().split(".");
			if (domainParts.indexOf(searchTerm) !== -1) {
				return true;
			}

			return false;
		},
		isInQueryString: function (queryString, searchTerm) {
			var queryStringParams,
				numberOfParams,
				paramName,
				paramNameLength,
				i;

			queryStringParams = queryString.toLowerCase().split("&");
			numberOfParams = queryStringParams.length;
			paramName = searchTerm + "=";
			paramNameLength = paramName.length;

			for (i = 0; i < numberOfParams; i++) {
				if (queryStringParams[i].substring(0, paramNameLength) === paramName) {
					return true;
				}
			}

			return false;
		},

		isListView: function () {
			// List view from the site has been removed
			return false;
		},
		refreshCurrentPage: function () {
			location.href = location.href;
		},
		formatVariantStyleAndName: function ($productNameElem, variantValue, customTitleHeight) {
			var myProductTitleHeight = 45;
			if (customTitleHeight !== undefined) {
				myProductTitleHeight = customTitleHeight;
			}
			if ($productNameElem.height() > myProductTitleHeight) {
				$productNameElem.ellipsis(myProductTitleHeight);
				var productInfo = $productNameElem.text();
				var variantInfo = variantValue;
				var newProductText = productInfo.substring(0, (productInfo.length - 3) - (variantInfo.length));
				$productNameElem.text(newProductText + "..." + variantInfo);
				// Ellipsis again if the variant information is very long
				if ($productNameElem.height() > myProductTitleHeight) {
					$productNameElem.ellipsis(myProductTitleHeight);
				}
			}
		},
		formatVariantStyleNameInPopupBasket: function ($elems, customTitleHeight) {
			$elems.each(function () {
				var $eC = $(this).next();
				if ($eC.hasClass('variantLabel')) {
					utils.formatVariantStyleAndName($(this), $eC.text(), customTitleHeight);
				} else {
					if (customTitleHeight !== undefined) {
						customTitleHeight = 54;
					}
					$(this).ellipsis(customTitleHeight);
				}
			});
		},
		updateHashedURL: function (myHashedURL) {
			var baseURL = this.getURLWithoutHash(window.location.href);
			window.location.href = baseURL + myHashedURL;
		},
		generateUniqueID: function () {
			return 'id' + ((new Date()).getTime());
		},
		isInfinityBrowseBookmark: function () {
			var IBCheck = utils.getURLParams();
			if (typeof IBCheck !== 'undefined') {
				return typeof IBCheck['pg'] !== 'undefined' ? true : false;
			}
			return false;
		},
		/*
		| Check for only characters and spaces
		*/
		checkForOnlyCharactersAndSpaces: function (input) {
			var regex = /^[a-zA-Z0-9\s]*$/gi;
			return regex.test(input);
		},
		/*
		| Post code validation
		*/
		checkPostCodeIsValid: function (postcode) {
			var regex;
			postcode = postcode.replace(/\s/g, "");
			regex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;
			return regex.test(postcode);
		},
		/*
		| Post code validation - first 3 characters
		*/
		checkFirstThreeCharactersOfPostCodeIsValid: function (postcode) {
			var regex;
			postcode = postcode.replace(/\s/g, "");
			regex = /[A-Z]{1,2}[0-9]/gi;
			//regex = /[A-Z]{1,2}/gi;
			return regex.test(postcode);
		},
		/*
		| Scroll to jQuery object
		*/
		scrollToElem: function ($elem, speed) {
			var s = speed || 500;
			$('html, body').animate({
				scrollTop: $elem.offset().top
			}, s);
		},
		getImagePath: function getImagePath() {
			return window.globalStaticAssetsPath;
		},
		getBaseURL: function getBaseURL(sURL) {
			var sURL = sURL || window.location.href,
				iPositionOfQueryString = sURL.indexOf('?') || 0;

			if(iPositionOfQueryString) {
				sURL = sURL.substr(0, iPositionOfQueryString);
			}
			return sURL;
		},
		getQueryStringParam: function getQueryStringParam(sQSParam) {
			var oQSParams = utils.getURLParams(),
				oQSParam = 0,
				sReturnVal = '',
				sQSParam = sQSParam.toLowerCase();

			for (oQSParam in oQSParams) {
				if (oQSParams.hasOwnProperty(oQSParam)) {
					if (oQSParam.toLowerCase() === sQSParam) {
						sReturnVal = oQSParams[oQSParam];
						break;
					}
				}
			}
			return sReturnVal;
		}
	}

	return utils;
});
