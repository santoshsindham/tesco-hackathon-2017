/*globals define, window, document */
define('modules/show-more/ShowMoreHandler', [
    'modules/show-more/ShowMore'
], function (ShowMore) {
    'use strict';

    //
    // ShowMoreHandler class
    // -------------------------------------
    var ShowMoreHandler = function (aShowMoreConfig) {
        this.aShowMoreConfig = aShowMoreConfig;
    };

    ShowMoreHandler.prototype.init = function () {
        var i,
            oShowMore,
            array = this.aShowMoreConfig,
            iCount = array.length;

        if (!Array.isArray(array)) {
            return;
        }

        for (i = 0; i < iCount; i += 1) {
            oShowMore = new ShowMore(array[i]);
            oShowMore.fnInit();
        }
    };

    return ShowMoreHandler;
});
