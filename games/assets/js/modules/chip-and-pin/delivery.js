/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,TescoData */
define('modules/chip-and-pin/delivery', ['domlib', 'modules/common', 'modules/mvapi/common', 'modules/chip-and-pin/delivery-models', 'modules/chip-and-pin/breadcrumb', 'modules/ajax/common', 'modules/settings/common', 'modules/chip-and-pin/delivery-home', 'modules/chip-and-pin/delivery-store', 'modules/chip-and-pin/delivery-group', 'modules/chip-and-pin/bundles', 'modules/chip-and-pin/atg-data', 'modules/overlay/common'], function($, common, mvApi, mvModels, breadcrumb, ajax, SETTINGS, homeDelivery, storeCollect, deliveryGroup, bundles, atgData, overlay) {
    'use strict';

    var self,
        init,
        renderDeliveryComponents,
        updateDomReferences,
        injectItemsSummary,
        getNumberOfElems,
        renderStoreDeliveryGroup,
        renderHomeDeliveryGroup,
        renderItems,
        renderDeliveryOptions,
        updateItemsDependants,
        initializeItemsNav,
        bindDeliveryOptionsEvents,
        bindItemsNavClicks,
        $numberOfItemsBox,
        $itemsList,
        $itemsListContainer,
        $itemsNav,
        $arrows,
        $arrowUp,
        $arrowDown,
        clearAllActiveOptions,
        createSlides,
        deliveryGroupCount,
        slideOverflowIcon,
        createSlideOverflowIcons,
        $iconInjectionPoint,
        deliveryTabContainer,
        slideCapacity,
        slideCount,
        deliveryTabs,
        deliveryTabsInit,
        deliveryTabsStateHandler,
        deliveryTabsSlideAnimationHandler,
        slideWidth,
        slideDistance,
        updatedTabSlide,
        sendRequest,
        currentTabSlide = 1,
        renderDeliveryOptionArea,
        getHomeDeliveryOptions,
        getStoreDeliveryOptions,
        selectThisStoreDeliveryOption,
        handleResponseFromThisStoreOption,
        bRenderedDeliveryGroupTabs = false,
        bDeliveryOptionsEventsBound = false,
        renderUpdatedSectionHeading,
        getNumberOfElemsResult,
        deliveryHeading,
        deliveryShowingLabelHandler,
        iDeliveryShowingLabelStartPos = 1,
        iDeliveryShowingLabelEndPos = 3,
        $productDetailContainer,
        selectThisDeliveryOption,
        renderStoreCollectOptions,
        renderHomeDeliveryOptions,
        bDoubleTapState = false,
        nDoubleTapTime = 625,
        sDoubleTapTimer = null,
        deliveryOptionsCtaDoubleTapCheck,
        fUpdateOverlay,
        fSendRequest,
        displayDatePickerOverlay,
        completeDeliveryGroupCallback,
        createDatePicker,
        sDatePickerTitle,
        selectAnotherStoreDeliveryOption,
        $flowersHospitalMessage,
        toggleFlowersHospitalMessage;

    getNumberOfElems = function getNumberOfElems(selector) {
        getNumberOfElemsResult = $(selector).length;
        renderUpdatedSectionHeading(getNumberOfElemsResult);
        return getNumberOfElemsResult;
    };

    renderUpdatedSectionHeading = function renderUpdatedSectionHeading(iItemCount) {
        if ($('#wrapper.spi header h1').text() === 'Select a delivery option') {
            if (iItemCount > 1) {
                deliveryHeading = $('#wrapper.spi header h1');
                deliveryHeading.text(bundles['spc.chipAndPin.delivery.sectionTitle.multiple'] || 'Select delivery options').append('<span>(showing <em>1 - 3</em> of ' + iItemCount + ' deliveries)</span>');
            }
        }
    };

    deliveryShowingLabelHandler = function deliveryShowingLabelHandler(iUpdatedTabSlide) {
        iDeliveryShowingLabelStartPos = ((slideCapacity * iUpdatedTabSlide) - slideCapacity) + 1;
        iDeliveryShowingLabelEndPos = (slideCapacity * iUpdatedTabSlide);
        $('#wrapper.spi header h1 span em').text(iDeliveryShowingLabelStartPos + ' - ' + iDeliveryShowingLabelEndPos);
    };

    deliveryTabsStateHandler = function deliveryTabHandler(updatedIndex) {
        updatedIndex = parseInt(updatedIndex, 10);
        if (updatedIndex < (deliveryGroupCount + 1) || updatedIndex <= deliveryGroupCount) {
            $('#wrapper.spi .itemsListContainer ul.itemsList').removeAttr('style');
            mvApi.navigateTo('delivery', false, false);
            $(deliveryTabs).removeClass('disabled active completed').each(function() {
                if ($(this).data('index') < updatedIndex) {
                    $(this).addClass('completed');
                } else if ($(this).data('index') > updatedIndex) {
                    $(this).addClass('disabled');
                } else if ($(this).data('index') === updatedIndex) {
                    $(this).addClass('active');
                }
            });

            if (updatedIndex > slideCapacity) {
                updatedTabSlide = Math.ceil(updatedIndex / slideCapacity);
                if (updatedTabSlide > currentTabSlide) {
                    deliveryTabsSlideAnimationHandler(updatedTabSlide);
                    deliveryShowingLabelHandler(updatedTabSlide);
                }
            }
        }
    };

    deliveryTabsSlideAnimationHandler = function deliveryTabsSlideAnimationHandler(updatedTabSlide) {
        slideWidth = $(deliveryTabContainer).width();
        slideDistance = (updatedTabSlide - 1) * slideWidth;
        $(deliveryTabContainer).find('ul').animate({
            left: '-' + slideDistance + 'px'
        }, 1000);
        currentTabSlide += 1;
    };

    deliveryTabsInit = function deliveryTabsInit(iNewIndex) {
        var i;
        if (!bRenderedDeliveryGroupTabs) {
            bRenderedDeliveryGroupTabs = true;
            deliveryGroupCount = deliveryGroup.getDeliveryGroupCount();
            deliveryTabContainer = '#wrapper.spi .tabs';
            deliveryTabs = '#wrapper.spi .tabs li:not([slideOverflowIcon])';
            slideCapacity = 3;
            currentTabSlide = 1;

            createSlideOverflowIcons = function createSlideOverflowIcons() {
                slideOverflowIcon = '<li class="slideOverflowIcon"><strong>...</strong></li>';
                slideCount = Math.ceil(deliveryGroupCount / slideCapacity);
                for (i = 1; i < slideCount; i++) {
                    $iconInjectionPoint = $(deliveryTabContainer).find('li[data-index="' + (i * slideCapacity) + '"]');
                    $(slideOverflowIcon).insertAfter($iconInjectionPoint);
                }
            };

            createSlides = function createSlides() {
                if (deliveryGroupCount > 1) {
                    if (deliveryGroupCount > slideCapacity) {
                        createSlideOverflowIcons();
                    }
                } else {
                    $(deliveryTabContainer).parent().addClass('hide-tabs');
                }
            };

            createSlides();
        }

        if (iNewIndex) {
            deliveryTabsStateHandler(iNewIndex);
        }
    };

    bindItemsNavClicks = function bindItemsNavClicks() {
        var directionDown, currentPosition, newPosition,
            $arrow,
            dblClickProtection = false,
            listHeight = $itemsList.outerHeight(),
            containerHeight = $itemsListContainer.height(),
            step = containerHeight,
            hiddenHeight = listHeight - containerHeight;

        $arrows.unbind().on('click tap', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if ($(this).hasClass('enabled') && !dblClickProtection) {
                var $pages = $('.pages li', $itemsNav),
                    current = $pages.filter('.active'),
                    index = current.index('.pages li'),
                    newIndex;

                dblClickProtection = true;
                currentPosition = parseInt($itemsList.css('top'), 10);
                directionDown = ($(this).attr('class').replace('enabled', '').replace(' ', '') === 'down') ? true : false;
                $arrow = directionDown ? $arrowUp : $arrowDown;
                newPosition = currentPosition - (directionDown ? step : -step);

                $arrow.addClass('enabled');

                if (newPosition === 0 || (directionDown && newPosition < -hiddenHeight)) {
                    $(this).removeClass('enabled');
                }

                $itemsList.animate({
                    top: newPosition + 'px'
                }, {
                    duration: 1000,
                    complete: function() {
                        dblClickProtection = false;
                    }
                });

                $pages.removeClass('active');

                newIndex = directionDown ? index + 1 : index - 1;
                newIndex = (newIndex < 0) ? 0 : newIndex;
                newIndex = (newIndex > ($pages.length - 1)) ? ($pages.length - 1) : newIndex;

                $($pages[newIndex]).addClass('active');
            }
        });
    };

    clearAllActiveOptions = function clearAllActiveOptions() {
        var $allOptions = $('.deliveryOptionsGroups li');
        $allOptions.removeClass('active');
    };

    deliveryOptionsCtaDoubleTapCheck = function deliveryOptionsCtaDoubleTapCheck() {
        clearTimeout(sDoubleTapTimer);

        sDoubleTapTimer = setTimeout(function() {
            bDoubleTapState = false;
        }, nDoubleTapTime);
    };

    bindDeliveryOptionsEvents = function bindDeliveryOptionsEvents() {
        bDeliveryOptionsEventsBound = true;
        $(document).on('click tap', '.deliveryOptions a:not(".disabled")', function(e) {
            var $chosenOption = $(this).closest('li'),
                optionid = $chosenOption.children('a').data('optionid');
            e.preventDefault();
            e.stopPropagation();

            deliveryOptionsCtaDoubleTapCheck();
            if (!bDoubleTapState) {
                clearAllActiveOptions();
                $chosenOption.addClass('active');

                switch (optionid) {
                    case "thisStore":
                        selectThisStoreDeliveryOption();
                        break;
                    case "anotherStore":
                        selectAnotherStoreDeliveryOption('anotherStore', 'Click & Collect from another store');
                        if (storeCollect.getStatusOfSearchResultsUpdated()) {
                            storeCollect.updateSearchedBeforeStatus(true);
                        }
                        mvApi.navigateTo('delivery&findAnotherStore');
                        break;
                    case "standard":
                        homeDelivery.setDeliveryAddress('standard-delivery');
                        selectThisDeliveryOption('standard', 'standard-delivery');
                        break;
                    case "express":
                        homeDelivery.setDeliveryAddress('express-delivery');
                        selectThisDeliveryOption('express', 'express-delivery');
                        break;
                    default:
                        console.warn('default');
                        break;
                }
                bDoubleTapState = true;
            }
        });
    };

    initializeItemsNav = function initializeItemsNav() {
        var x, itemsHeight = $itemsList.height(),
            containerHeight = $itemsListContainer.height() - 1,
            $pagesContainer = $('.pages', $itemsNav),
            numberOfPages = 0;

        if (itemsHeight > containerHeight) {
            $itemsNav.show();
            $arrowDown.addClass('enabled');

            numberOfPages = Math.ceil(itemsHeight / containerHeight);

            for (x = 0; x < numberOfPages; x++) {
                $pagesContainer.append('<li>' + (x + 1) + '</li>');
            }

            $('li:first-child', $pagesContainer).addClass('active');

        } else {
            $itemsNav.hide();
        }

        bindItemsNavClicks();
    };

    injectItemsSummary = function injectItemsSummary() {
        var number = getNumberOfElems('.itemsList > li');
        $($numberOfItemsBox).html(number + ' item' + ((number > 1) ? 's' : ''));
    };

    updateItemsDependants = function updateItemsDependants() {
        injectItemsSummary();
        initializeItemsNav();

        $productDetailContainer.dotdotdot({
            'height': 60
        });
    };

    updateDomReferences = function updateDomReferences() {
        $numberOfItemsBox = $('.numberOfItemsBox');
        $itemsList = $('.itemsList');
        $itemsNav = $('.itemsNav');
        $arrowDown = $('a.down', $itemsNav);
        $arrowUp = $('a.up', $itemsNav);
        $arrows = $('a', $itemsNav);
        $itemsListContainer = $('.itemsListContainer');
        $productDetailContainer = $('.productDetail');
        updateItemsDependants();
    };

    renderItems = function renderItems(oDeliveryItem, callback) {
        mvApi.updateModel('deliveryItems', {
            defaults: {
                giftMessageIndicativeText: TescoData.ChipAndPin.checkoutData.cmsContent.giftMessageIndicativeText,
                section: 'delivery'
            }
        });
        mvApi.render('deliveryItems', oDeliveryItem, callback);
    };

    sendRequest = function sendRequest(data, callback) {
        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': data || {},
            'callbacks': {
                'success': callback || null
            }
        });
    };

    selectThisDeliveryOption = function selectThisDeliveryOption(selMethod, selMethotType) {
        var oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            i,
            aAvailableHomeDelOptions = oDeliveryGroup.deliveryOptions.availableHomeDeliveryOptions,
            sDeliveryMethodID = '',
            oSubmitData,
            oCurrentDeliveryMethod,
            sDeliveryMethod;

        for (i = 0; i < aAvailableHomeDelOptions.length; i++) {
            if (aAvailableHomeDelOptions[i].deliveryMethodType === selMethod) {
                sDeliveryMethod = aAvailableHomeDelOptions[i].deliveryMethod;
                oCurrentDeliveryMethod = aAvailableHomeDelOptions[i];
                break;
            }
        }

        deliveryGroup.setDeliveryOption(oCurrentDeliveryMethod);
    };

    selectAnotherStoreDeliveryOption = function selectAnotherStoreDeliveryOption(selMethod) {
        var oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            i,
            aAvailableStoreOptions = oDeliveryGroup.deliveryOptions.availableStoreCollectOptions,
            oCurrentDeliveryMethod;

        for (i = 0; i < aAvailableStoreOptions.length; i++) {
            if (aAvailableStoreOptions[i].deliveryMethodType === selMethod) {
                oCurrentDeliveryMethod = aAvailableStoreOptions[i];
                break;
            }
        }

        deliveryGroup.setDeliveryOption(oCurrentDeliveryMethod);
    };

    selectThisStoreDeliveryOption = function selectThisStoreDeliveryOption() {
        var oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            i,
            aAvailableStoreOptions = oDeliveryGroup.deliveryOptions.availableStoreCollectOptions,
            sDeliveryMethodID = '',
            oSubmitData, oCurrentDeliveryMethod;

        for (i = 0; i < aAvailableStoreOptions.length; i++) {
            if (aAvailableStoreOptions[i].deliveryMethodType === 'thisStore') {
                sDeliveryMethodID = aAvailableStoreOptions[i].deliveryMethodType;
                oCurrentDeliveryMethod = aAvailableStoreOptions[i];
                break;
            }
        }

        oCurrentDeliveryMethod = deliveryGroup.parseATGDataForDeliveryMethod(oCurrentDeliveryMethod);
        oSubmitData = {
            "deliveryGroupID": oDeliveryGroup.deliveryGroupId,
            "deliveryMethodID": sDeliveryMethodID
        };
        $.extend(oSubmitData, oCurrentDeliveryMethod.atgData);

        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': oSubmitData || {},
            'callbacks': {
                'success': function(oResp) {
                    oResp = JSON.parse(oResp);
                    if (oResp.isDeliveryDateRequired && oResp.isDeliveryDateRequired === "true") {
                        deliveryGroup.setDeliveryOption(oCurrentDeliveryMethod);
                        homeDelivery.displayDatePickerOverlay(oResp);
                    } else {
                        handleResponseFromThisStoreOption(oCurrentDeliveryMethod);
                    }
                }
            }
        });

    };

    handleResponseFromThisStoreOption = function handleResponseFromThisStoreOption(oDeliveryMethod) {
        deliveryGroup.setDeliveryOption(oDeliveryMethod);
        deliveryGroup.setCompleted();
        deliveryGroup.handleDeliveryGroup();
    };

    getHomeDeliveryOptions = function deliveryGroupItems(oDeliveryGroup) {
        return oDeliveryGroup.deliveryOptions.availableHomeDeliveryOptions;
    };

    getStoreDeliveryOptions = function deliveryGroupItems(oDeliveryGroup) {
        return oDeliveryGroup.deliveryOptions.availableStoreCollectOptions;
    };

    renderDeliveryOptions = function renderOptions() {
        renderStoreDeliveryGroup(renderStoreCollectOptions);
        renderHomeDeliveryGroup(renderHomeDeliveryOptions);
    };

    renderStoreCollectOptions = function renderStoreCollectOptions() {
        var oDeliveryOption,
            oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup();

        if (deliveryGroup.canClickAndCollect()) {
            oDeliveryOption = mvApi.getModel('storeDeliveryOption');
            oDeliveryOption.collection.items = [];
            oDeliveryOption.collection.items = getStoreDeliveryOptions(oDeliveryGroup);
            if (oDeliveryOption.collection.items !== 'undefined') {
                oDeliveryOption.collection.emptyParent = true;
                mvApi.render('storeDeliveryOption', oDeliveryOption);
            }
        }
    };

    renderHomeDeliveryOptions = function renderHomeDeliveryOptions() {
        var oDeliveryOption,
            oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup();

        if (deliveryGroup.canDeliverToHome()) {
            oDeliveryOption = mvApi.getModel('homeDeliveryOption');
            oDeliveryOption.collection.items = [];
            oDeliveryOption.collection.items = getHomeDeliveryOptions(oDeliveryGroup);
            if (oDeliveryOption.collection.items !== 'undefined') {
                if (!deliveryGroup.canClickAndCollect()) {
                    oDeliveryOption.collection.emptyParent = true;
                }
                mvApi.render('homeDeliveryOption', oDeliveryOption);
            }
        }
    };

    renderStoreDeliveryGroup = function renderStoreDeliveryGroup(callback) {
        mvApi.render('deliveryOptionsGroupStore', {}, callback);
    };

    renderHomeDeliveryGroup = function renderHomeDeliveryGroup(callback) {
        mvApi.render('deliveryOptionsGroupHome', {}, callback);
    };
    
    toggleFlowersHospitalMessage = function toggleFlowersHospitalMessage() {
        var oDeliveryGroup = deliveryGroup.getCurrentDeliveryGroup(),
            oDeliveryItems = oDeliveryGroup.deliveryGroupItems,
            $deliveryNotes = $('section.deliveryOptionsArea article.deliveryNotes');

        if (oDeliveryItems.length && oDeliveryItems.length > 0 && oDeliveryItems[0].giftMessageLength) {
            $flowersHospitalMessage = $(TescoData.ChipAndPin.checkoutData.cmsContent.flowersHospitalMessage);
            $deliveryNotes.find('p').remove();
            $deliveryNotes.append($flowersHospitalMessage);
        }
    };
    
    renderDeliveryOptionArea = function renderDeliveryOptionArea() {
    	mvApi.render('deliveryOptionsArea', null, toggleFlowersHospitalMessage);
    };

    renderDeliveryComponents = function renderDeliveryComponents(sDeliveryGroupID) {
        var oDeliveryItemModel = mvApi.getModel('deliveryItems'),
            oDeliveryGroupModel = mvApi.getModel('deliveryGroups'),
            aDeliveryGroupItems = [],
            aDeliveryGroupItemsWithServices = [],
            aDeliveryGroupItemsLength,
            aDeliveryGroups,
            oDeliveryGroup,
            serviceItem = {},
            serviceItemsLength,
            x,
            y;

        aDeliveryGroups = deliveryGroup.getDeliveryGroups();
        if (!sDeliveryGroupID) {
            sDeliveryGroupID = aDeliveryGroups[0].deliveryGroupId;
        }

        oDeliveryGroup = deliveryGroup.getDeliveryGroup(sDeliveryGroupID);

        oDeliveryGroupModel.collection.items = aDeliveryGroups;

        if (oDeliveryGroup.deliveryGroupItems) {
            aDeliveryGroupItems = oDeliveryGroup.deliveryGroupItems;
            aDeliveryGroupItemsLength = aDeliveryGroupItems.length;
            for (x = 0; x < aDeliveryGroupItemsLength; x++) {
                aDeliveryGroupItemsWithServices.push(aDeliveryGroupItems[x]);
                if (aDeliveryGroupItems[x].serviceItems && aDeliveryGroupItems[x].serviceItems.length) {
                    serviceItemsLength = aDeliveryGroupItems[x].serviceItems.length;
                    for (y = 0; y < serviceItemsLength; y++) {
                        serviceItem = {
                            type: 'service',
                            itemName: aDeliveryGroupItems[x].serviceItems[y].serviceItem,
                            productImgURL: null,
                            productQuantity: aDeliveryGroupItems[x].serviceItems[y].quantity,
                            price: aDeliveryGroupItems[x].serviceItems[y].serviceItemPrice
                        };
                        aDeliveryGroupItemsWithServices.push(serviceItem);
                    }
                }
            }
            oDeliveryItemModel.collection.items = aDeliveryGroupItemsWithServices;
            delete oDeliveryItemModel.request;
        }

        deliveryGroup.setCurrentDeliveryGroupAsActive();

        if (!bRenderedDeliveryGroupTabs) {
            deliveryGroup.renderGroups(oDeliveryGroupModel, function() {
                deliveryTabsInit(oDeliveryGroup.deliveryGroupNumber);
            });
        } else {
            deliveryTabsInit(oDeliveryGroup.deliveryGroupNumber);
        }

        renderItems(oDeliveryItemModel, updateDomReferences);
        renderDeliveryOptionArea();
        renderDeliveryOptions();
    };

    init = function init() {
        mvApi.cacheInitialModels(mvModels);
        breadcrumb.set(2);
        bRenderedDeliveryGroupTabs = false;
        deliveryGroup.setAllDeliveryGroupsNotCompleted();
        mvApi.render('deliveryLayout', renderDeliveryComponents);
        if (!bDeliveryOptionsEventsBound) {
            bindDeliveryOptionsEvents();
        }
        if (typeof common === "undefined") {
            require(['modules/common'], function(common) {
                common.disableKioskButtons();
            });
        }
    };

    self = {
        init: init,
        pageModel: mvModels.pageModel,
        renderDeliveryComponents: renderDeliveryComponents,
        clearAllActiveOptions: clearAllActiveOptions,
        sendRequest: sendRequest,
        deliveryTabsStateHandler: deliveryTabsStateHandler,
        displayDatePickerOverlay: displayDatePickerOverlay
    };

    return self;
});