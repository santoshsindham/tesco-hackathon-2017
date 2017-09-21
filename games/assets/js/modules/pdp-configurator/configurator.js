/*global window, define*/
define([
    'domlib',
    'modules/breakpoint',
    'modules/pdp-configurator/product-updater',
    'modules/pdp-configurator/tablet-selector',
    'modules/pdp-configurator/case-selector',
    'modules/pdp-configurator/add-to-basket',
    'modules/pdp-configurator/inspiration-panel',
    'modules/pdp-configurator/observer',
    'modules/pdp-configurator/combinationsHelper',
    'modules/pdp-configurator/accessory-selector',
    'modules/pdp-configurator/upsell-selector',
    'modules/pdp-configurator/product-service',
    'modules/common'
], function ($, breakpoint, productUpdater, tabletSelector, caseSelector, addToBasketView, inspirationPanel, observer, combiner, accessorySelector, upsellSelector, productService) {
    'use strict';

    var init,
        loadInitialProduct,
        actionMap,
        actionMapMobile,
        openTabletContainer,
        tabletSelected,
        updateColourTheme,
        tabletColourUpdated,
        openCaseContainer,
        caseSelected,
        cancelSelection,
        changeTabletColour,
        caseColourUpdated,
        changeCaseColour,
        selectCaseCategory,
        addToBasket,
        upselllSelection,
        closeTabletContainer,
        closeCaseCategory,
        addCase,
        removeCase,
        reloadATBView,
        performAction,
        postInitMobile,
        tabletSelectedMobile,
        openCaseCategory,
        removeCaseMobile,
        openAccessorySelector,
        addToBasketAccessory,
        closeAccessorySelector,
        inspirationSelected,
        inspirationSelectPre,
        accessoryColourUpdated,
        changeAccessoryColour,
        cancelSelectionProduct,
        getProductData,
        updateProductColour,
        viewBasket,
        data = {};

    init = function init() {

        actionMap = {
            'tablet-selector,change-product': changeTabletColour,
            'tablet-selector,product-selected': tabletSelected,
            'tablet-selector,colour-selected': tabletColourUpdated,
            'tablet-selector,product-cancel': cancelSelection,
            'tablet-selector,close': cancelSelectionProduct,
            'tablet-selector,add-case': openCaseCategory,

            'case-selector,change-colour': changeCaseColour,
            'case-selector,change-category': openCaseCategory,
            'case-selector,colour-selected': caseColourUpdated,
            'case-selector,product-selected': caseSelected,
            'case-selector,product-cancel': cancelSelectionProduct,
            'case-selector,case-category-close': closeCaseCategory,
            'case-selector,select-category': selectCaseCategory,
            'case-selector,no-case': removeCase,
            'case-selector,remove-case': removeCase,

            'add-to-basket,add-case': openCaseCategory,
            'add-to-basket,update-tablet': openTabletContainer,
            'add-to-basket,add-to-basket': addToBasket,

            'accessory-selector,change-product': changeAccessoryColour,
            'accessory-selector,add-to-basket': addToBasketAccessory,
            'accessory-selector,colour-selected': accessoryColourUpdated,
            'accessory-selector,close': closeAccessorySelector,

            'inspiration-panel,inspiration-selected': inspirationSelected,

            'upsell-selector,upsell-selected': upselllSelection,
            'upsell-selector,open-accessory-selector': openAccessorySelector,
            'upsell-selector,view-basket': viewBasket
        };

        actionMapMobile = {
            'tablet-selector,product-selected': tabletSelectedMobile,
            'configurator,post-init': postInitMobile,
            'case-selector,no-case': removeCaseMobile
        };

        loadInitialProduct();
        inspirationPanel.init('.inspiration-panel');
        observer.subscribe(function () {
            performAction.apply(this, arguments);
        });

        performAction('configurator,post-init');

        $('.configurator-banner .accessories-banner .back-btn').on('click', closeAccessorySelector);

    };

    loadInitialProduct = function loadInitialProduct() {
        tabletSelector.init('.product-selector.tablet');
        upsellSelector.init('.category-selector.upsell');
        caseSelector.init('.product-selector.case');
        caseSelector.initCategory();
        addToBasketView.init('.add-to-basket-container');
        combiner.init('.product-selector.tablet', '.product-selector.case', '.add-to-basket-container');
        updateColourTheme();
        $('.pdp-configurator .content-container > .loader').fadeOut('fast');
    };

    performAction = function performAction(message, event) {
        if (actionMapMobile[message] && breakpoint.mobile) {
            actionMapMobile[message](event);
        } else {
            if (actionMap[message]) {
                actionMap[message](event);
            }
        }
    };

    viewBasket = function viewBasket() {
        window.location.href = '/direct/basket-details/basket-details.page';
    };

    addCase = function addCase() {
        caseSelector.addCase();
        reloadATBView();
    };

    removeCase = function removeCase(event) {
        if (event) {
            event.preventDefault();
        }

        caseSelector.removeCase();
        closeCaseCategory();
        reloadATBView();
        addToBasketView.showDetails();
        tabletSelector.showSummary();
        caseSelector.hide();
        caseSelector.animateCategories();
    };

    tabletSelected = function tabletSelected() {
        data.originalTabletSku = tabletSelector.getSelectedSKU();
        data.originalTabletColour = tabletSelector.getSelectedColourName();
        reloadATBView();
        closeTabletContainer();
    };

    openTabletContainer = function openTabletContainer() {
        addToBasketView.hideDetails();
        tabletSelector.show();
        caseSelector.hide();
    };

    closeTabletContainer = function closeTabletContainer() {
        tabletSelector.showSummary();
        caseSelector.showSummary();
        addToBasketView.showDetails();
    };

    changeTabletColour = function changeTabletColour() {
        data.originalTabletSku = tabletSelector.getSelectedSKU();
        data.originalTabletColour = tabletSelector.getSelectedColourName();

        if (breakpoint.mobile) {
            $('.product-selector.tablet .colour-menu').addClass('open');
        } else {
            openTabletContainer();
        }
    };

    tabletColourUpdated = function tabletColourUpdated(event) {
        updateProductColour(getProductData($(event.currentTarget)), 'tablet', function () {
            tabletSelector.show();
        });
    };

    caseColourUpdated = function caseColourUpdated(event) {
        updateProductColour(getProductData($(event.currentTarget)), 'case', function () {
            caseSelector.show();
        });
    };

    openCaseContainer = function openCaseContainer() {
        addToBasketView.hideDetails();
        caseSelector.show();
        tabletSelector.hide();
    };

    openCaseCategory = function openCaseCategory(event) {
        if (event && $(event.currentTarget).hasClass('add-case')) {
            $('.category-selector.case-category').addClass('has-close-all');
        }

        if (event && ($('.product-selector.case').hasClass('background') || $('.product-selector.case').hasClass('closed'))) {
            caseSelector.animateCategories();
        }

        addToBasketView.hideDetails();
        caseSelector.showCategories();
        caseSelector.show();
        tabletSelector.hide();
    };

    closeCaseCategory = function closeCaseCategory(event) {
        if (event && $('.category-selector.case-category').hasClass('has-close-all')) {
            $('.category-selector.case-category').removeClass('has-close-all');
            cancelSelection();
        }
        caseSelector.hideCategories();
    };

    selectCaseCategory = function selectCaseCategory(event) {
        event.preventDefault();
        closeCaseCategory();
        productUpdater.update(getProductData($(event.currentTarget)), 'case', function (initProduct) {
            initProduct.done(function () {
                openCaseContainer();
                caseSelector.init('.product-selector.case');
                $('.category-selector.case-category').removeClass('has-close-all');
            });
        });
    };

    changeCaseColour = function changeCaseColour() {
        data.originalCaseSku = caseSelector.getSelectedSKU();
        data.originalCaseColour = caseSelector.getSelectedColourName();

        if (breakpoint.mobile) {
            $('.product-selector.case .colour-menu').addClass('open');
        } else {
            openCaseContainer();
        }
    };

    caseSelected = function caseSelected() {
        data.originalCaseSku = caseSelector.getSelectedSKU();
        data.originalCaseColour = caseSelector.getSelectedColourName();
        caseSelector.showSummary();
        tabletSelector.showSummary();
        addToBasketView.showDetails();
        addCase();
    };

    updateColourTheme = function updateColourTheme() {
        var hasCase = caseSelector.hasCase(),
            dominantColor;

        if (hasCase) {
            dominantColor = caseSelector.getContrastColour() || caseSelector.getSelectedColour();
        } else {
            dominantColor = tabletSelector.getContrastColour() || tabletSelector.getSelectedColour();
        }
        $('.colour-aware').css({
            'backgroundColor': dominantColor
        });
        addToBasketView.updateColor(dominantColor, hasCase);
        tabletSelector.updateColour();
        caseSelector.updateColour();
    };

    cancelSelection = function cancelSelection() {
        caseSelector.showSummary();
        tabletSelector.showSummary();
        addToBasketView.showDetails();
    };

    cancelSelectionProduct = function cancelSelectionProduct(event) {
        var $productSelector = $(event.currentTarget).closest('.product-selector'),
            isTablet = $productSelector.hasClass('tablet'),
            colourName = isTablet ? data.originalTabletColour : data.originalCaseColour,
            $colourMenu = $productSelector.find('.colour-menu'),
            $colourItem = $colourMenu.find('a[data-name="colour"][data-value="' + colourName + '"]');

        if (colourName && colourName.length > 0) {
            updateProductColour(getProductData($colourItem), isTablet ? 'tablet' : 'case', cancelSelection);
        } else {
            cancelSelection();
        }
    };

    addToBasket = function addToBasket(event) {
        var $this = $(event.currentTarget),
            action = $this.data('formaction'),
            hasCaseLoaded = false,
            hasTabletLoaded = false,
            isCaseOnlyAction = action === combiner.config.statusAction.addP2 || action === combiner.config.statusAction.alertP2,
            isTabletOnlyAction = action === combiner.config.statusAction.addP1 || action === combiner.config.statusAction.alertP1,
            isAlertAction = action === combiner.config.statusAction.alertP1 || action === combiner.config.statusAction.alertP2 || action === combiner.config.statusAction.alertP1P2,
            upsellMsgTpl = combiner.getUpsellMsgTpl(combiner.config.data().upsellMsgTpl.add),
            cb = function cb(d) {
                var hasBothLoaded = hasCaseLoaded && hasTabletLoaded;
                addToBasketView.setAnalytics(d);
                addToBasketView.setBasketCount();
                if (isCaseOnlyAction || isTabletOnlyAction || hasBothLoaded) {
                    openTabletContainer();
                    upsellSelector.toggleUpsellView(true);
                    upsellSelector.setUpsellMsg(upsellMsgTpl);

                    window.setTimeout(function () {
                        $this.removeClass('loading');
                    }, 750);
                }
            };

        if (!$this.hasClass('loading')) {
            $this.addClass('loading');
            if (isAlertAction) {
                if (isCaseOnlyAction) {
                    caseSelector.registerForStockAlerts();
                } else if (isTabletOnlyAction) {
                    tabletSelector.registerForStockAlerts();
                } else {
                    caseSelector.registerForStockAlerts(true).always(function () {
                        tabletSelector.registerForStockAlerts();
                    });
                }
                $this.removeClass('loading');
            } else {
                if (isCaseOnlyAction) {
                    caseSelector.addToBasket().then(cb);
                } else if (isTabletOnlyAction) {
                    tabletSelector.addToBasket().then(cb);
                } else {
                    tabletSelector.addToBasket().then(function () {
                        hasTabletLoaded = true;
                        return this;
                    }).then(cb);
                    caseSelector.addToBasket().then(function () {
                        hasCaseLoaded = true;
                        return this;
                    }).then(cb);
                }
            }
        }
        return false;
    };

    addToBasketAccessory = function addToBasketAccessory(event) {
        event.preventDefault();
        var $this = $(event.currentTarget),
            $accessorySelector = accessorySelector.$parentContainer,
            action = $accessorySelector.find('.product-selector-inner').data('status'),
            isAlertAction = action === combiner.config.statusId.outOfStock;

        if (!$this.hasClass('loading')) {
            $this.addClass('loading');
            if (isAlertAction) {
                accessorySelector.registerForStockAlerts();
            } else {
                accessorySelector.addToBasket().then(function (d) {
                    upsellSelector.setUpsellMsg(accessorySelector.getUpsellMsgTpl());
                    $this.removeClass('loading');
                    addToBasketView.setAnalytics(d);
                    addToBasketView.setBasketCount();
                    return this;
                }).done(closeAccessorySelector);
            }
        }
    };

    upselllSelection = function upselllSelection() {

        if (!breakpoint.mobile) {
            closeTabletContainer();
        }
        upsellSelector.toggleUpsellView(false);
        loadInitialProduct();
        removeCase();
        reloadATBView();
    };

    reloadATBView = function reloadATBView() {
        updateColourTheme();
        combiner.setAll();
    };

    openAccessorySelector = function openAccessorySelector(event) {
        event.preventDefault();
        closeTabletContainer();
        $('.category-selector.accessory').removeClass('closed').addClass('open');
        $('.category-selector.accessory .product-selector').addClass('background').removeClass('open');
        addToBasketView.hideDetails();
        productUpdater.update(getProductData($(event.currentTarget)), 'accessory', function (initProduct) {
            initProduct.done(function () {
                accessorySelector.init(".category-selector.accessory .product-selector");
                $('.category-selector.accessory .product-selector').removeClass('background').addClass('open');
                if (breakpoint.mobile) {
                    $('.configurator-banner').addClass('is-accessory');
                }
            });
        });
    };

    postInitMobile = function postInitMobile() {
        openTabletContainer();
        $('.pdp-configurator').addClass('init-complete');
    };

    tabletSelectedMobile = function tabletSelectedMobile() {
        data.originalTabletSku = tabletSelector.getSelectedSKU();
        data.originalTabletColour = tabletSelector.getSelectedColourName();

        reloadATBView();

        if (caseSelector.hasCase()) {
            closeTabletContainer();
        } else {
            openCaseCategory();
        }
    };

    removeCaseMobile = function removeCaseMobile(event) {
        event.preventDefault();
        caseSelector.removeCase();
        closeCaseCategory();
        reloadATBView();
        caseSelector.showSummary();
        tabletSelector.showSummary();
        addToBasketView.showDetails();
        caseSelector.animateCategories();
    };

    changeAccessoryColour = function changeAccessoryColour() {
        $('.accessory .product-selector .colour-menu').addClass('open');
    };

    accessoryColourUpdated = function accessoryColourUpdated(event) {
        event.preventDefault();
        $('.accessory .product-selector .colour-menu').removeClass('open');
        productUpdater.update(getProductData($(event.currentTarget)), 'accessory', function (initProduct) {
            initProduct.done(function () {
                accessorySelector.init(".category-selector.accessory .product-selector");
            });
        });
    };

    closeAccessorySelector = function closeAccessorySelector() {
        $('.category-selector.accessory').removeClass('open').addClass('closed');
        upsellSelector.toggleUpsellView(true);
        if (breakpoint.mobile) {
            $('.configurator-banner').removeClass('is-accessory');
        }
    };

    inspirationSelectPre = function inspirationSelectPre() {
        $('html,body').animate({
            scrollTop: $('.configurator-banner').offset().top
        }, 'slow');
        $('.product-selector-block').css('position', 'relative').append('<div class="loader-both"></div>');
        caseSelector.showSummary().addClass('animating-both');
        tabletSelector.showSummary().addClass('animating-both');
        addToBasketView.showDetails();
        caseSelector.addCase();
        $('.category-selector.accessory').removeClass('open').addClass('closed');
        $('#productInfoOverlay').removeClass('is-info-shown');
        closeCaseCategory();
        upsellSelector.toggleUpsellView(false);
    };

    inspirationSelected = function inspirationSelected(event) {
        event.preventDefault();

        var $inspirationItem = $(event.currentTarget),
            $inspirationForms = $inspirationItem.closest('li').find('form'),
            hasTabletLoaded,
            hasCaseLoaded,
            cb;

        inspirationSelectPre();
        $inspirationForms.each(function () {
            var $form = $(this),
                aboutBlock = window.PDPCONFIGURATOR.aboutBlockMap[$form.find('.fav-product-id').val()],
                postData = {
                    actionurl: productService.addQueryParam($form.attr('action'), 'about', aboutBlock)
                };
            $form.serializeArray().map(function (x) {
                postData[x.name] = x.value;
            });

            productUpdater.update(postData, $form.hasClass('primary-product-form') ? 'tablet' : 'case', function (initProduct) {
                initProduct.then(function () {
                    if ($form.hasClass('primary-product-form')) {
                        hasTabletLoaded = true;
                    } else {
                        hasCaseLoaded = true;
                    }
                    return this;
                }).done(cb);
            });
        });

        cb = function cb() {
            $('.product-selector-block').css('position', 'relative').append('<div class="loader-both"></div>');
            if (hasCaseLoaded && hasTabletLoaded) {
                tabletSelector.init('.product-selector.tablet');
                caseSelector.init('.product-selector.case');
                addCase();
                $('.category-selector.case-category').removeClass('has-close-all');
                addToBasketView.showDetails();
                caseSelector.showSummary().removeClass('animating-both');
                tabletSelector.showSummary().removeClass('animating-both');
                $('.product-selector-block').find('.loader-both').remove();
            }
        };
    };

    /* Shared product query handler methods */

    updateProductColour = function updateProductColour(postData, id, cb) {
        $('.colour-menu').removeClass('open');
        productUpdater.update(postData, id, function (initProduct) {
            initProduct.done(cb).done(function () {
                switch (id) {
                case "tablet":
                    tabletSelector.init('.product-selector.tablet');
                    break;
                case "case":
                    caseSelector.init('.product-selector.case');
                    break;
                }
            });
        });
    };

    getProductData = function getProductData($selector) {
        var $selectorForm = $selector.closest('form'),
            postData = {
                actionurl: $selectorForm.attr('action'),
                sku: $selector.data('sku')
            };

        $selectorForm.serializeArray().map(function (x) {
            postData[x.name] = x.value;
        });

        if ($selector.data('name') && $selector.data('value')) {
            postData[$selector.data('name')] = $selector.data('value');
        }
        return postData;
    };


    return {
        init: init
    };
});