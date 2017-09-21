/*jslint plusplus: true */
/*globals window,document,console,define,require, $ */
define('modules/tabview/common', ['modules/jscrollpane/common'], function () {
    'use strict';

    /**
     * cfg properties:
     * tabButtonsContainer: selector for the tab buttons container element
     * tabContent: selector for the tabview content pane
     * buttonsSelector - optional: selector for the tab buttons from the context of their container
     * callbacks - optional: associative array of button callback functions where the key is the button id, e.g { 'buttonIdOne': function () {...}, 'buttonIdFour': function () {...},...}
     * closeButtonCallback - optional: custom behaviour for close button in the content pane of the tabview
     */
    function TabView(cfg) {
        var self = this,
            callbacks,
            cb,
            scrollbarConfig = cfg.scrollbar !== undefined ? cfg.scrollbar : {},
            closeBtnClass = cfg.closeButton !== undefined ? cfg.closeButton : 'tab-content-close-btn, .tab-content-close-label';

        this.$tabButtonsContainer = $(cfg.tabButtonsContainer);
        this.$tabContent = $(cfg.tabContent);
        this.$currentContent = null;
        this.$currentContentContainer = null;
        this.buttonsSelector = cfg.buttonsSelector !== undefined ? cfg.buttonsSelector : 'button';
        callbacks = this.callbacks = cfg.callbacks;

        for (cb in callbacks) {
            if (callbacks[cb] !== undefined) {
                this.$tabButtonsContainer.find('#' + cb).on('click', {
                    ctx: this
                }, callbacks[cb]);
            }
        }

        this.$tabButtonsContainer.on('click', this.buttonsSelector, {
            ctx: this
        }, this.tabButtonClicked);
        if (cfg.closeButtonCallback !== undefined) {
            this.$tabContent.find('.' + closeBtnClass).on('click', {
                ctx: this
            }, cfg.closeButtonCallback);
        } else {
            this.$tabContent.find('.' + closeBtnClass).on('click', {
                ctx: this
            }, function (e) {
                e.data.ctx.hideContent();
            });
        }
        this.$tabContent.find('.tab-content').on('transitionend', function () {
            if (!self.$tabContent.find('.tab-content').hasClass('tab-content-visible')) {
                self.$tabContent.addClass('tab-content-hidden');
            }
        });

        this.$tabContent.removeClass('tab-content-hidden');
        $('.scroll-pane').jScrollPane(scrollbarConfig);
        this.scrollbarApi = $('.scroll-pane').data('jsp');
        this.$tabContent.addClass('tab-content-hidden');
    }

    TabView.prototype = {
        constructor: TabView,

        showContent: function () {
            var self = this;
            this.$tabContent.removeClass('tab-content-hidden');
            setTimeout(function () {
                self.$tabContent.find('.tab-content').addClass('tab-content-visible');
                self.scrollbarApi.reinitialise({
                    maintainPosition: true,
                    speed: self.$tabContent.find('.tab-content-body').height()
                });
            }, 10);
        },

        hideContent: function () {
            this.$tabContent.find('.tab-content').removeClass('tab-content-visible');
        },

        buttonSwitch: function ($btn) {
            this.$tabButtonsContainer.find(this.buttonsSelector).removeClass('tab-btn-active');
            $btn.addClass('tab-btn-active');
        },

        returnContent: function () {
            if (this.$currentContent !== null) {
                this.$currentContent.detach();
                this.$currentContentContainer.append(this.$currentContent);
            } else {
                this.$tabContent.find('.tab-content-body').html('');
            }
            this.$currentContent = null;
        },

        updateHeading: function ($btn) {
            var heading = $btn.text().trim();
            heading = heading.substring(0, heading.length - 1);
            this.$tabContent.find('.tab-content-head h2').text(heading);
        },

        tabButtonClicked: function (e) {
            var $button = $(this),
                url = $button.data('url'),
                buttonId = $button.attr('id'),
                tabName,
                self = e.data.ctx;

            self.$tabButtonsContainer.trigger({
                type: 'tabButtonClicked',
                $buttonClicked: $button
            });

            if ($button.hasClass('tab-btn-active')) {
                return;
            }

            self.buttonSwitch($button);
            if (buttonId !== 'tab-close-btn') {
                self.updateHeading($button);
            }

            if (self.callbacks[buttonId] !== undefined) {
                return;
            }

            if (url) {
                //Ajax call to get data
                self.returnContent();
                self.$tabContent.find('.tab-content-body').html('<h2>' + $button.text() + '</h2>');
                self.showContent();
            } else {
                //If no data url present use id naming convention to fetch hidden html content in the document and insert into tabView

                self.returnContent();

                tabName = buttonId.replace('tab-', '');
                self.$currentContent = $('.' + tabName);
                self.$currentContentContainer = self.$currentContent.parent();
                self.$currentContent.detach();
                self.$tabContent.find('.tab-content-body').append(self.$currentContent);

                self.showContent();
            }
        }
    };

    return TabView;
});