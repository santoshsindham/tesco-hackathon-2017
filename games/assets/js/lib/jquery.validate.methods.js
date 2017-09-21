/*!
 * $ Validation Plugin 1.12.0pre
 *
 * http://bassistance.de/$-plugins/$-plugin-validation/
 * http://docs.$.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

//Matches UK postcode. based on http://snipplr.com/view/3152/postcode-validation/
$.validator.addMethod('postcodeUK', function(postcode, element) {
	postcode = (postcode.toUpperCase()).replace(/\s+/g,'');
	return this.optional(element) || postcode.match(/^([^QZ][^IJZ]{0,1}\d{1,2})(\d[^CIKMOV]{2})$/) || postcode.match(/^([^QV]\d[ABCDEFGHJKSTUW])(\d[^CIKMOV]{2})$/) || postcode.match(/^([^QV][^IJZ]\d[ABEHMNPRVWXY])(\d[^CIKMOV]{2})$/) || postcode.match(/^(GIR)(0AA)$/) || postcode.match(/^(BFPO)(\d{1,4})$/) || postcode.match(/^(BFPO)(C\/O\d{1,3})$/);
}, 'Please specify a valid postcode');

$.validator.addMethod('fixedLength', function (value, element, params) {
	return this.optional(element) || $.inArray($.trim(value).length, params) !== -1;
}, "Please enter a value" );