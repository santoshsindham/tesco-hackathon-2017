define(['domlib', './common', 'modules/common'], function($, pdp, common) {
	pdp.swatchesAndSizesRules.maximumAmount = 20;
	common.init.push(function() {
		pdp.init();
	});
});