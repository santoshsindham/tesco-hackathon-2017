define(['domlib', 'modules/breakpoint', './common', 'modules/common'], function ($, breakpoint, addToCompare, common) {

    addToCompare.bindEvents = function () {
        $('#clear-all').on('click', function (e) {
            addToCompare.uncheckAll.call(addToCompare, e);
            return false;
        });

        $('#exit-compare-mode').on('click', this.onExitCompareMode.bind(this));

        $('.compare-cta').on('click', this.compareProducts);

        if (!breakpoint.kiosk) {
            $('#listing').on('click', 'div.add-to-compare', this.toggleState);
            this.scroll(breakpoint.currentViewport);
        } else {
            this.replaceKioskSpecific();
            $('#compare-mode').on('click', this.enterCompareMode);
        }
    };


    addToCompare.enterCompareMode = function (e) {
        e.preventDefault();
        $('#listing').find('.products').addClass('compare');
        $('body').addClass('listing-compare-mode');

        $('#listing').on('click', '.compare .product', function (e) {
            e.preventDefault();
            e.stopPropagation();
            addToCompare.selectProduct.call(addToCompare, e);
        });

        addToCompare.$compareDialog.removeClass('hidden');
    };

    common.init.push(addToCompare.init);

});