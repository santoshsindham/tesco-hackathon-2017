/*globals window, define*/
/*jslint plusplus:true*/
define([
    'domlib',
    'modules/pdp-configurator/colour-menu',
    'modules/pdp-configurator/product-info',
    'modules/pdp-configurator/observer',
    'modules/pdp-configurator/product-info-carousel'
], function ($, colourMenuFactory, productInfo, observer, productCarousel) {
    'use strict';
    var ProductFactory = function Product(name) {
        var product = this;

        product.name = name;
        product.inits = [];
        product.colourMap = {};
        product.$parentContainer = null;
        product.currentColour = null;
        product.currentColourContrast = null;
        product.currentColourName = null;
        product.currentSKU = null;

        product.inits.push(function (containerSelector) {
            product.$parentContainer = $(containerSelector);
            if (product.$parentContainer.find('.product-selector-inner').length > 0) {
                product.currentColourName = $.trim(product.$parentContainer.find('.colour-menu input[name=colour]').val());
                product.currentSKU = $.trim(product.$parentContainer.find('.product-selector-inner').attr('data-sku'));
                product.currentColour = product.getMapColour(product.currentColourName).primary;
                product.currentColourContrast = product.getMapColour(product.currentColourName).secondary;
                product.initColourMenu();
                product.initListeners();
                product.initCarousel();
                product.initImages();
                product.updateColour();
            }
        });
    };

    ProductFactory.prototype = {
        init: function () {
            var product = this,
                len = product.inits.length,
                i;

            for (i = 0; i < len; i++) {
                product.inits[i].apply(this, arguments);
            }
        },
        initCarousel: function () {
            var product = this,
                $carouselParent = product.$parentContainer.find('.product-front-back'),
                imageSet = $carouselParent.data('images').split(','),
                imageBase = $carouselParent.data('imageurl'),
                tmpl = '<li data-index="{index}"><img alt="" src="{base}{url}"></li>',
                frontBack,
                content = "";

            if (imageSet.length === 1) {
                $carouselParent.html('<img alt="" src="{base}{url}" />'.replace('{base}', imageBase).replace('{url}', imageSet[0]));
            } else if (imageSet.length > 1) {
                $.each(imageSet, function (key, val) {
                    if (key > 1) {
                        return false;
                    }

                    content += tmpl.replace('{base}', imageBase)
                        .replace('{url}', val)
                        .replace('{index}', key);
                });
                frontBack = productCarousel.create(product.name + '-front-back', content);
                frontBack.carousel.calculateVisibleItems();
                $(window).off('orientationchange').on('orientationchange', function () {
                    frontBack.carousel.calculateVisibleItems();
                    frontBack.setActiveIndicator(0);
                });
            }
        },
        initColourMenu: function () {
            var product = this,
                colourMenu;

            colourMenu = colourMenuFactory.createColourMenu();
            colourMenu.init(product.$parentContainer);
            colourMenu.onItemSelected(function (e) {
                product.currentColourName = $(e.currentTarget).attr('data-name');
                product.currentColour = product.getMapColour(product.currentColourName).primary;
                product.currentColourContrast = product.getMapColour(product.currentColourName).secondary;
                product.currentSKU = $(e.currentTarget).attr('data-sku');
                observer.publish(product.name + '-selector,colour-selected', e);
            });
        },
        initListeners: function () {
            var product = this;
            product.$parentContainer.find('button').on('click', function (e) {
                observer.publish(product.name + '-selector,' + $(this).data('action'), e);
            });

            product.$parentContainer.find('.show-product-info').on('click', function () {
                var skuID = $(this).data('skuid');
                productInfo.init(skuID, $(this).data());
                productInfo.show();
            });
        },
        initImages: function () {
            window.picturefill();
        },
        updateColour: function () {
            var product = this;
            product.$parentContainer.find('.border-color-btn').css({
                'color': product.currentColourContrast || product.currentColour,
                'backgroundColor': '#fff',
                'border': '1px solid ' + (product.currentColourContrast || product.currentColour)
            });
            product.$parentContainer.find('.background-color-btn').css({
                'color': '#fff',
                'backgroundColor': product.currentColourContrast || product.currentColour,
                'border': '1px solid ' + (product.currentColourContrast || product.currentColour)
            });
            product.$parentContainer.find('.colour-menu-item a').each(function () {
                var $colourItem = $(this),
                    colour = product.getMapColour($colourItem.data('value'));
                $colourItem.css({
                    'color': colour.secondary,
                    'backgroundColor': colour.primary,
                    'border': '1px solid ' + colour.secondary
                });
            });
        },
        registerForStockAlerts: function (isAjax) {
            var product = this,
                defer = $.Deferred(),
                promise = defer.promise(),
                $form = product.$parentContainer.find('.basket-form-action form'),
                $manageAlerts = product.$parentContainer.find('.basket-form-action .btn-manage-stock-alerts'),
                hasForm = $form.length > 0,
                hasManageAlertsLink = $manageAlerts.length > 0;

            $form.find('input[type="submit"][name*="AlertFormHandler.set"]').attr('type', 'hidden');
            if (isAjax) {
                if (hasForm) {
                    promise = $.post($form.attr('action'), $form.serialize());
                } else {
                    defer.resolve();
                }
            } else {
                if (hasForm) {
                    $form.submit();
                } else if (hasManageAlertsLink) {
                    window.location.href = $manageAlerts.attr('href');
                }
            }

            return promise;
        },
        addToBasket: function () {
            var product = this,
                defer = $.Deferred(),
                promise = defer.promise(),
                $form = product.$parentContainer.find('.basket-form-action form'),
                hasForm = $form.length > 0;

            if (hasForm) {
                promise = $.post($form.attr('action'), $form.serialize());
            } else {
                defer.resolve();
            }

            return promise;
        },
        gaGetProduct: function () {
            var product = this,
                productId = $.trim(product.$parentContainer.find('.product-selector-inner').attr('data-sku')),
                productName = $('h2', product.$parentContainer).text(),
                productCategory = $('#breadcrumbCategoryOnly').val();

            return {
                'id': productId,
                'name': productName,
                'category': productCategory,
            };

        },
        animate: function ($view) {
            var $selector = $view || this.$parentContainer;

            if (!$selector.hasClass('animating') && $('html').hasClass('csstransitions')) {
                $selector.addClass('animating');
                window.setTimeout(function () {
                    $selector.removeClass('animating');
                }, 800);
            }

            return $selector;
        },
        show: function () {
            this.animate();
            return this.$parentContainer.removeClass('background closed');
        },
        showSummary: function () {
            this.animate();
            return this.$parentContainer.removeClass('closed').addClass('background');
        },
        hide: function () {
            this.animate();
            return this.$parentContainer.removeClass('background').addClass('closed');
        },
        getMapColour: function (colourName) {
            var product = this,
                defaultSecondary = null,
                currentMap = window.PDPCONFIGURATOR.colourMap,
                primaryMap = {},
                secondaryMap = {};

            colourName = $.trim(colourName.toLowerCase());

            if (product.colourMap[colourName]) {
                return product.colourMap[colourName];
            }

            $.map(currentMap, function (val, key) {
                var colourValues = val.split(','),
                    primaryColour = colourValues[0],
                    secondaryColour = colourValues[1];
                primaryMap[$.trim(key).toLowerCase()] = $.trim(primaryColour);
                secondaryMap[$.trim(key).toLowerCase()] = $.trim(secondaryColour || defaultSecondary);
            });

            product.colourMap[colourName] = {
                primary: primaryMap[colourName] || colourName,
                secondary: secondaryMap[colourName] || defaultSecondary
            };

            return product.colourMap[colourName];
        },
        getSelectedColour: function () {
            return this.currentColour;
        },
        getContrastColour: function () {
            return this.currentColourContrast;
        },
        getSelectedColourName: function () {
            return this.currentColourName;
        },
        getSelectedSKU: function () {
            return this.currentSKU;
        }
    };

    return ProductFactory;
});
