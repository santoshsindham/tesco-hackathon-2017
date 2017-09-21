/*jslint plusplus: true */
/*globals define */
define('modules/pdp-s7viewer/tabHandler', ['domlib'], function ($) {
    'use strict';

    var tabHandler,
        sMediaControls = '.media-controls',
        numberOfTabsToShow = null,
        $currentTab,
        configureMediaTabs,
        setCurrentTabClass;

    configureMediaTabs = function configureMediaTabs(iMediaTypeCount) {
        switch (iMediaTypeCount) {
        case (0):
            break;
        case (1):
            numberOfTabsToShow = 'one-pdpproducts';
            break;
        case (2):
            numberOfTabsToShow = 'two-pdpproducts';
            break;
        case (3):
            numberOfTabsToShow = 'three-pdpproducts';
            break;
        }
        $(sMediaControls).css({ position: 'relative', left: '0px'}).children('div:visible').addClass(numberOfTabsToShow).not(':first').addClass('pdpproducts-notFirstButton');
    };

    setCurrentTabClass = function setCurrentTabClass(el) {
        $currentTab = $(el);
        $currentTab.parent().find('.current').removeClass('current');
        $currentTab.addClass('current');
    };

    tabHandler = {
        configureMediaTabs : configureMediaTabs,
        setCurrentTabClass : setCurrentTabClass
    };

    return tabHandler;
});