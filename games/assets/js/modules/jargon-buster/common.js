/*global define:true,window */
/*jslint plusplus: true */
define('modules/jargon-buster/common', ['domlib', 'modules/tesco.analytics', 'modules/toggle-expand-collapse/common', 'modules/common'], function ($, analytics, ToggleExpandCollapse, common) {
    'use strict';

    var sDataAttr = 'data-internal-attr-name',
        sCustomExpandCollapseEvent = 'jbExpandCollapseOpen',
        $productSpecContainer,
        fnInit,
        fnRetrieveData,
        fnProcessJargonData,
        fnAddToolTipMessage,
        fnActivateJargonPanel,
        fnSendTracking,
        fnBindEvents,
        fnToggleExpandCollapse,
        fnJargonBusterUI,
        fnReInit,
        oJsonData,
        oShowMore,
        bInitiated = false;

    fnRetrieveData = function retrieveData() {
        var sUrl = (window.globalStaticJSPath !== undefined ? window.globalStaticJSPath : '/assets/js/') + 'data/JargonDataJSON.xml';
        $.ajax({
            url: sUrl,
            method: 'GET',
            dataType: "json",
            beforeSend: function () {
                var args = arguments;
                args[1].url = sUrl;
            },
            success: function (oReturnedData) {
                oJsonData = oReturnedData;
                fnProcessJargonData(oReturnedData);
            },
            error: function () {
                //console.log('Unable to load Jargon Data.');
                return;
            }
        });
    };

    fnProcessJargonData = function processJargonData() {
        var oJardonData,
            oInternalAttributes = {},
            sAttrName,
            sBccL4Cat,
            $bccL4Cat,
            $self;

        oJardonData = Array.isArray(oJsonData) === true ? oJsonData[0] : null;
        $productSpecContainer = $('#product-spec-container');
        $bccL4Cat = $('#breadcrumb li:eq(3)');

        if (oJardonData === null || oJardonData.length === 0) {
            //console.log('Jargon Buster data empty');
            return;
        }

        if ($bccL4Cat.length > 0) {
            sBccL4Cat = $.trim($('a', $bccL4Cat).text());
        }

        if (oJardonData.jargonDisplayInfo !== undefined && oJardonData.jargonDisplayInfo.internalAttributes !== undefined) {
            oInternalAttributes = oJardonData.jargonDisplayInfo.internalAttributes;
        }

        if ($productSpecContainer.length > 0 && oInternalAttributes.length > 0) {
            $('[' + sDataAttr + ']', $productSpecContainer).each(function () {
                var i, j;
                $self = $(this);
                sAttrName = $self.attr(sDataAttr);
                for (i in oInternalAttributes) {
                    if (oInternalAttributes.hasOwnProperty(i)) {
                        if (oInternalAttributes[i].name === sAttrName) {
                            if (oInternalAttributes[i].bccl4cats) {
                                for (j in oInternalAttributes[i].bccl4cats) {
                                    if (oInternalAttributes[i].bccl4cats.hasOwnProperty(j)) {
                                        if (sBccL4Cat === oInternalAttributes[i].bccl4cats[j].name) {
                                            fnJargonBusterUI($self, oInternalAttributes[i].bccl4cats[j].jargonText);
                                        }
                                    }
                                }
                            } else {
                                fnJargonBusterUI($self, oInternalAttributes[i].jargonText);
                            }
                        }
                    }
                }
            });

            fnToggleExpandCollapse();

            if (!bInitiated) {
                fnBindEvents();
                oShowMore = $productSpecContainer.data('ShowMore') || {};
                bInitiated = true;
            }
        }
    };

    fnJargonBusterUI = function jargonBusterUI($specRow, sMessage) {
        fnActivateJargonPanel($specRow);
        fnAddToolTipMessage($specRow, sMessage);
    };

    fnToggleExpandCollapse = function toggleExpandCollapse() {
        var oTEC = new ToggleExpandCollapse({
            sToggleContainer: '.product-spec-row-container.jbActive',
            sToggleElementParent: '.product-spec-row-container.jbActive',
            sToggleTriggerElement: '.product-spec-row',
            bAccordionEnabled: true,
            bEnableCustomEvent: true,
            sToggleCustomEventName: sCustomExpandCollapseEvent
        });
        oTEC.init();
    };

    fnSendTracking = function sendTracking($specRow) {
        var sEvar59,
            oWebAnalytics,
            aAnalyticsData;
        if ($specRow.length > 0) {
            sEvar59 = 'Jargon buster:' + $specRow.attr(sDataAttr);
            oWebAnalytics = new analytics.WebMetrics();
            aAnalyticsData = [{
                'eVar59': sEvar59,
                'events': 'event32'
            }];
            oWebAnalytics.submit(aAnalyticsData);
        }
    };

    fnBindEvents = function bindEvents() {
        var $specRow = null;

        function updateSetWrapperHeights() {
            oShowMore.fnCalcSelectorHeight();
            oShowMore.fnSetWrapperHeight(oShowMore.iSelectorHeight);
        }

        $productSpecContainer.on('click', '.jbActive .product-spec-row', function () {
            if (oShowMore !== undefined && oShowMore.bShowMore !== undefined && oShowMore.bShowMore) {
                if (window.Modernizr && window.Modernizr.csstransitions) {
                    $('.product-spec-description').one('transitionend', function () {
                        updateSetWrapperHeights();
                    });
                } else {
                    updateSetWrapperHeights();
                }
            }
            $specRow = $(this).parents('.toggle-expand');
            if ($specRow.length > 0) {
                fnSendTracking($specRow);
            }
        });
    };

    fnActivateJargonPanel = function activateJargonPanel($specRow) {
        $specRow.addClass('jbActive');
    };

    fnAddToolTipMessage = function addToolTipMessage($specRow, sJargonText) {
        $('.product-spec-description', $specRow).text(sJargonText);
    };

    fnReInit = function reInit() {
        fnProcessJargonData();
    };

    fnInit = function init() {
        if (common.isPage('PDP')) {
            fnRetrieveData();
        }
    };

    return {
        init: fnInit,
        reInit: fnReInit
    };

});