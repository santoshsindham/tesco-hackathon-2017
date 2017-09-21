/*jslint plusplus: true*/
/*globals define,require,window,document */
define(['domlib',
        './ProductVariant',
        'modules/tesco.data',
        'modules/tesco.utils',
        'modules/page-title/common',
        'modules/expand-collapse/common',
        'modules/tesco.analytics',
        'modules/html-parser/HtmlParser',
        'modules/media-matrix/common',
        'modules/pdp-s7viewer/common',
        'modules/jargon-buster/common'], function ($, ProductVariant, DataHandler, utils, pageTitle, expandCollapse, analytics, HtmlParser, mediaMatrix, s7viewer, jargonBuster) {

    "use strict";
    var ProductVariantController = function ProductVariantController() {
        var bindEvents,
            initAjaxFramework,
            variantClickHandler,
            invokeCallToATG,
            selectVariantCompleteHandler,
            setHiddenDataValues,
            getVariantValue,
            setDocumentTitle,
            DataMethods,
            handleBazaarVoice,
            self = this,
            generateVariantURL,
            setURL,
            init,
            sVariantCompleteEventName = "PDPVariantSelectComplete",
            aProductVariants = [],
            oCurrentProductVariant,
            popStateHandler,
            oHistoryStateData = {},
            invokeCallToATGForHTML5History,
            bindVariantDropDown,
            toggleVariantDropDown,
            updateAllVariantDropDowns,
            updateDefaultTextInVariantDropDown,
            getDefaultFormAction,
            getVariantChoices,
            clearExistingVariantSelected,
            closeAllVariantDropDowns,
            setInitialHTML5HistoryData;

        bindEvents = function bindEvents() {
            $(window).on('popstate', popStateHandler.bind(self));
            $(document).on('click', '#variants', variantClickHandler.bind(self));
            bindVariantDropDown();
            $('body').on('click', closeAllVariantDropDowns);
        };

        closeAllVariantDropDowns = function closeAllVariantDropDowns() {
            var $elem = $('.vContainer');

            if ($elem.find(".filter-options").length) {
                $elem.find(".filter-options").removeClass("show-overlay");
                $elem.find('.open').removeClass("open");
            }
        };

        bindVariantDropDown = function bindVariantDropDown() {
            $(document).on('click', '.toggleVariantDropDown', toggleVariantDropDown);
        };

        toggleVariantDropDown = function toggleVariantDropDown(e) {
            var $elem = $(e.target);
            if ($elem.is('span')) {
                $elem = $elem.parent();
            }
            $elem.siblings(".filter-options").toggleClass("show-overlay");
            $elem.addClass("open");
            $elem.parent("article").siblings("article").find(".toggleVariantDropDown");
        };

        updateAllVariantDropDowns = function updateAllVariantDropDowns() {
            $(".variantDropDown").each(function () {
                updateDefaultTextInVariantDropDown($(this));
            });
        };

        updateDefaultTextInVariantDropDown = function updateDefaultTextInVariantDropDown($elem) {
            var sDropDownText = "";
            if ($elem.length) {
                sDropDownText = $elem.find('.selected > .variantDisplayName_title').text();
                if (sDropDownText !== "") {
                    $elem.siblings('.toggleVariantDropDown').find('.variantDropDownLabel').text(sDropDownText);
                }
            }
        };

        popStateHandler = function popStateHandler(e) {
            if (e.originalEvent.state !== undefined && e.originalEvent.state !== null) {
                if (e.originalEvent.state.sURL === "") {
                    e.originalEvent.state.sURL = getDefaultFormAction();
                }
                invokeCallToATGForHTML5History(e.originalEvent.state);
            }
        };

        initAjaxFramework = function initAjaxFramework() {
            var aInlineRequests = [],
                oRequests = {
                    'selectVariant': ['scene7', 'buyBoxes', 'specification', 'description', 'variants', 'title', 'miniDesc', 'priceCheck', 'priceWidget', 'collectionBlock', 'collectionLookBlock', 'linkSaveBlock', 'softBundleBlock', 'promoBlock']
                },
                oModules = {
                    'scene7': ['#product-carousel.product-carousel-s7', 'Update product image', true, true, true],
                    'buyBoxes': ['.buy-from', '', true, false, true, true],
                    'specification': ['#product-spec-section-content', 'Update product specification', true, true, true],
                    'description': ['#product-details-section-content', '', true, true, true],
                    'variants': ['#variants', '', true, true, true, true],
                    'title': ['.page-title', 'Updating product title', true, true, true],
                    'miniDesc': ['.features', 'Updating mini description', true, true, true],
                    'catno': ['.cat-no', 'Updating catalogue number', true, true, true],
                    'priceCheck': ['#price-check', 'Updating Price Check', true, true, true],
                    'priceWidget': ['#pc-container', 'Updating Price Check', true, true, true],
                    'collectionBlock': ['.collectionContainer.range', 'Updating collection block', true, true, true],
                    'collectionLookBlock': ['.collectionContainer.look', 'Updating look block', true, true, true],
                    'linkSaveBlock': ['.collectionContainer.linksave', 'Updating linksave block', true, true, true],
                    'softBundleBlock': ['.collectionContainer.bundle', 'Updating softbundle block', true, true, true],
                    'promoBlock': ['#special-offers-container', 'Updating promotion block', true, true, true]
                },
                oActions = {
                    'selectVariant': ['/stubs/select-variant.php']
                },
                oDefaultActions = {
                    'selectVariant': ['/stubs/select-variant.php']
                };

            DataHandler.Global.init({
                'inlineRequests': aInlineRequests,
                'requests': oRequests,
                'modules': oModules,
                'actions': oActions,
                'defaultActions': oDefaultActions
            });
        };

        /* Event Handlers */
        variantClickHandler = function variantClickHandler(e) {
            var $elem = $(e.target);
            e.preventDefault();
            if (($elem.is('li') || $elem.is('a') || $elem.is('img') || $elem.is('span')) && !$elem.parents('.selected').length && !$elem.hasClass('trigger') && !$elem.hasClass('icon') && !$elem.hasClass('selected') && !$elem.hasClass('variantDropDownLabel')) {
                invokeCallToATG($elem);
            }
        };

        selectVariantCompleteHandler = function selectVariantCompleteHandler() {
            var eVariantComplete = $.Event(sVariantCompleteEventName);

            eVariantComplete.currentProductVariant = oCurrentProductVariant;
            handleBazaarVoice(oCurrentProductVariant);

            require(['modules/buy-from/common', 'modules/product-description/common'], function (buyFrom, pdp) {
                buyFrom.init($(".buy-from"));
                pdp.initAddTheRangeBlock();
                pdp.initCompleteTheLookBlock();
                pdp.initLinkSaveBlock();
                try {
                    pdp.initBundleBlock();
                } catch (ignore) {}

                setDocumentTitle($('h1.page-title').text());
                pageTitle.Ellipsis.init();

                window.picturefill();

                expandCollapse.init();
                pdp.changeColumnLayout();
                pdp.truncateText();
                pdp.equalizeBundleHeights();
                mediaMatrix.init();
                if (!window.TescoData.pdp.bPersonalisedProduct) {
                    s7viewer.init();
                }
                try {
                    jargonBuster.reInit();
                } catch (ignore) {}

                pdp.reCalcShowMoreHeight();
                pdp.selectableCollectionItem.init();

                if (!window.isKiosk()) {
                    pdp.equaliseSpecialOfferHeights();
                }

                if (window.isKiosk()) {
                    buyFrom.initPromotionsManager(eVariantComplete.currentProductVariant.skuID);
                }

                $(window).trigger(eVariantComplete);
            });
        };

        generateVariantURL = function generateVariantURL(oProductVariant) {
            var sSKU = oProductVariant.skuID || oCurrentProductVariant.skuID,
                oQSParams = utils.getURLParams(),
                sURL = utils.getBaseURL() + "?",
                k,
                sQSValue;

            if (/skuid=/gi.test(window.location.href)) {
                for (k in oQSParams) {
                    if (oQSParams.hasOwnProperty(k)) {
                        sQSValue = k.toLowerCase() === "skuid" ? sSKU : oQSParams[k];
                        sURL = sURL + k + "=" + sQSValue + "&";
                    }
                }
                if (sURL.charAt(sURL.length - 1) === "&") {
                    sURL = sURL.substr(0, (sURL.length - 1));
                }
            } else {
                sQSValue = window.location.href.indexOf('?') > 0 ? "&" : "?";
                sURL = window.location.href + sQSValue + "skuId=" + sSKU;
            }
            return sURL;
        };

        /* Data Methods */
        invokeCallToATG = function invokeCallToATG($elem) {
            var sRequest = 'selectVariant',
                $form = utils.getFormByElement($elem),
                sURL = DataHandler.Utils.getAction(sRequest, $form),
                oDataLayer = new DataHandler.DataLayer(),
                sData;

            setHiddenDataValues($form, $elem);
            sData = $form.serialize();
            oHistoryStateData.sURL = sURL;
            oHistoryStateData.sFormData = sData;
            oDataLayer.get(sURL, sData, $elem, DataMethods, sRequest, null, null, selectVariantCompleteHandler);
            $(window).one(sVariantCompleteEventName, setURL);
        };

        invokeCallToATGForHTML5History = function invokeCallToATGForHTML5History(oStateData) {
            var sRequest = 'selectVariant',
                $elem = $(''),
                sURL = oStateData.sURL,
                sData = oStateData.sFormData,
                oDataLayer = new DataHandler.DataLayer();

            oHistoryStateData.sURL = sURL;
            oHistoryStateData.sFormData = sData;
            oDataLayer.get(sURL, sData, $elem, DataMethods, sRequest, null, null, selectVariantCompleteHandler);
        };

        handleBazaarVoice = function handleBazaarVoice(oProductVariant) {
            if (window.$BV) {
                setTimeout(function () {
                    window.$BV.configure('global', {
                        productId: oProductVariant.skuID
                    });
                    try {
                        window.$BV.ui("rr", "show_reviews");
                    } catch (ignore) {}
                }, 500);
            }

        };

        DataMethods = {
            handler: function (oJSON) {
                oCurrentProductVariant = new ProductVariant(oJSON);

                oCurrentProductVariant.skuID = oJSON.skuID;
                oCurrentProductVariant.productID = oJSON.productID;
                oCurrentProductVariant.variantValue = oJSON.productID;

                if (oJSON.serverTime) {
                    window.currentTimeAsync = oJSON.serverTime;
                    delete oJSON.serverTime;
                }

                delete oJSON.skuID;
                delete oJSON.productID;

                aProductVariants.push(oCurrentProductVariant);

                $.each(oJSON, function variantsResponseIterator(k, v) {
                    var oScene7PDPData = window.TescoData.pdp.scene7,
                        oWebAnalytics,
                        oReturnedScene7Data,
                        sMarkup,
                        sModuleSelector,
                        aModuleInfo;

                    if (k === 'analytics') {
                        if (analytics) {
                            oWebAnalytics = new analytics.WebMetrics();
                            oWebAnalytics.submit(v);
                        }
                        return;
                    }

                    if (k === 'catno') {
                        $('#BVReturnURL').remove();
                    }

                    if (k === 'scene7Data') {
                        oReturnedScene7Data = $.parseJSON(v);
                        if (window.TescoData === undefined) {
                            window.TescoData = {};
                        }
                        if (window.TescoData.pdp === undefined) {
                            window.TescoData.pdp = {};
                        }
                        if (window.TescoData.pdp.scene7 === undefined) {
                            window.TescoData.pdp.scene7 = {};
                        }
                        oScene7PDPData.s7ServerUrl = oReturnedScene7Data.s7ServerUrl;
                        oScene7PDPData.s7ImageSet = oReturnedScene7Data.s7ImageSet;
                        oScene7PDPData.s7SpinSet = oReturnedScene7Data.s7SpinSet;
                        /*jslint nomen: true*/
                        oScene7PDPData._s7VideoSet = oReturnedScene7Data.s7Video;
                        window._mediaCollectionUpdated = [];
                        /*jslint nomen: false*/
                        return;
                    }

                    aModuleInfo = DataHandler.Utils.getModuleInformation(k);
                    sModuleSelector = aModuleInfo[0];

                    if (k === 'scene7') {
                        sMarkup = v;
                        $('#prodZoomView .s7setindicator, #prodZoomView div canvas, #prodZoomView .btn-s7-step').remove();
                        $('#prodZoomView').find('div:first-child').remove();

                        if (window.TescoData.pdp.bPersonalisedProduct === true) {
                            sMarkup = $($.parseHTML(sMarkup));
                            $(sMarkup).eq(3).css({ "visibility": "hidden", "display": "none"});
                        } else {
                            $('.static-product-image.scene7-enabled').remove();
                        }
                    } else if (k === 'description') {
                        sMarkup = v === '' ? '' : HtmlParser.parseMarkupString(v);
                    } else {
                        sMarkup = DataHandler.Common.cleanMarkup(v);
                    }

                    try {
                        if (sMarkup !== '') {
                            if (aModuleInfo[4] === true) {
                                $(sModuleSelector).replaceWith(sMarkup);
                            } else {
                                $(sModuleSelector).get(0).innerHTML = sMarkup;
                            }
                        }
                    } catch (ignore) {}

                });

                updateAllVariantDropDowns();
            }
        };

        setHiddenDataValues = function setHiddenDataValues($form, $elem) {
            var sVariantValue,
                $elemVariantData,
                $variantChoices,
                $excludeLI;

            if ($elem.not('.variantDataElement')) {
                $elemVariantData = $elem.find('.variantDataElement');
                if (!$elemVariantData.length) {
                    $elem = $elem.parents('.variantDataElement').eq(0);
                } else {
                    $elem = $elemVariantData;
                }
            }

            sVariantValue = getVariantValue($elem);
            $variantChoices = getVariantChoices();

            if ($variantChoices.length > 1) {
                if ($elem.prop('name') === $variantChoices.eq(0).val()) {
                    clearExistingVariantSelected();
                } else {
                    $excludeLI = $elem.parent('li');
                    $form.find('li.selected').not($excludeLI).each(function () {
                        var $self = $(this).find('a'),
                            $excludeLnk = $excludeLI.find('a');
                        if ($self.attr('name') !== $excludeLnk.attr('name')) {
                            $('input[name="' + $self.attr('name') + '"]', $form).val(getVariantValue($self));
                        }
                    });
                }
            }

            $('input[name="' + $elem.prop('name') + '"]').val(sVariantValue);
            $('input[name="lastSelected"]').val($elem.prop('name'));

            // Hidden field not being serialised, making visible and modifiying property to type="hidden"
            $form.find('input[name="update"]').height(0).show();
            $form.find('input[name="update"]').prop('type', 'hidden');
        };

        clearExistingVariantSelected = function clearExistingVariantSelected() {
            var $variantChoices = getVariantChoices(),
                i = 0;

            for (i = 0; i < $variantChoices.length; i++) {
                $('input[name="' + $($variantChoices[i]).val() + '"]').val("");
            }
        };

        getVariantValue =  function getVariantValue($elem) {
            var oValue = "";
            if ($elem.is("select")) {
                oValue = $elem.val();
            } else {
                oValue = $elem.data('variant-value') || $elem.prop('name');
            }
            return oValue;
        };

        /* Helper Functions */

        setDocumentTitle = function setDocumentTitle(sVal) {
            document.title = sVal;
        };

        setURL = function setURL() {
            if (window.history) {
                window.history.pushState(oHistoryStateData, "", generateVariantURL(oCurrentProductVariant));
            }
        };

        getDefaultFormAction = function getDefaultFormAction() {
            return $('.buy form:eq(0)').prop('action');
        };

        getVariantChoices = function getVariantChoices() {
            return $('.variantChoices');
        };

        setInitialHTML5HistoryData = function setInitialHTML5HistoryData() {
            var oInitialHistoryStateData = {},
	        sCurrentURL = window.location.href;

            if ($('#variant-form').length) {
                oInitialHistoryStateData.sFormData = $('#variant-form').serialize();
                if (window.history) {
                    window.history.pushState(oInitialHistoryStateData, "", sCurrentURL);
                }
            }
        };

        init = function init() {
            initAjaxFramework();
            bindEvents();
            updateAllVariantDropDowns();
            setInitialHTML5HistoryData();
        };


        /* Rendering */

        init();

        return {
            DataMethods: DataMethods,
            selectVariantCompleteHandler: selectVariantCompleteHandler,
            setURL: setURL
        };

    };

    return ProductVariantController;

});
