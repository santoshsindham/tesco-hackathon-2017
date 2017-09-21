/*jslint plusplus: true, nomen: true */
/*globals window,document,console,define,require, $ */
define('modules/toggle-expand-collapse/common', [], function () {
    'use strict';

    /**
    * @constructor
    * @param {object} oSettings Required
    * @param {string} oSettings.sToggleContainer Required
    * @param {string} oSettings.sToggleTriggerElement Required
    * @param {string} oSettings.sToggleElementParent Required
    */
    function ToggleExpandCollapse(oSettings) {
        if (oSettings === null || oSettings === undefined ||
                oSettings.sToggleContainer === undefined ||
                oSettings.sToggleTriggerElement === undefined ||
                oSettings.sToggleElementParent === undefined) {
            return;
        }

        this.$toggleContainer = $(oSettings.sToggleContainer);
        this.$toggleTriggerElement = $(oSettings.sToggleTriggerElement);
        this.sToggleElementParent = oSettings.sToggleElementParent;
        this.sToggleTriggerElement = oSettings.sToggleTriggerElement;
        this.sToggleParentClassName =
            oSettings.sToggleParentClassName || 'toggle-parent';
        this.sToggleCustomEventName =
            oSettings.sToggleCustomEventName || 'ToggleStateUpdated';
        this.sSetExpandedCSSClassName =
            oSettings.sSetExpandedCSSClassName || 'toggle-expand';
        this.sSetCollapsedCSSClassName =
            oSettings.sSetCollapsedCSSClassName || 'toggle-collapse';
        this.sToggleContainer =
            oSettings.sToggleContainer;
        this.bToggleAnimationEnabled =
            oSettings.bToggleAnimationEnabled !== undefined ?
                    oSettings.bToggleAnimationEnabled : true;
        this.bAccordionEnabled =
            oSettings.bAccordionEnabled !== undefined ? oSettings.bAccordionEnabled : true;
        this.bEnableCustomEvent =
            oSettings.bEnableCustomEvent !== undefined ? oSettings.bEnableCustomEvent : false;
    }

    ToggleExpandCollapse.prototype = {
        constructor: ToggleExpandCollapse,

        isToggleEventBound: function isToggleEventBound() {
            var self = this, oEvents, aClickEvents, i;

            if (self.$toggleContainer.length) {
                oEvents = $._data($(self.$toggleContainer)[0], 'events');
                if (oEvents !== undefined) {
                    if (oEvents.click) {
                        aClickEvents = oEvents.click;
                        for (i = 0; i < aClickEvents.length; i++) {
                            if (aClickEvents[i].namespace === "toggleExpandCollapse") {
                                return true;
                            }
                        }
                    }
                }
            }
        },

        bindToggleEvents: function bindToggleEvents() {
            var self = this;

            self.$toggleContainer.on('click.toggleExpandCollapse',
                self.sToggleTriggerElement, function (e) {
                    self.toggleElement(e);
                    e.preventDefault();
                });
            self.$toggleContainer.addClass(self.sToggleParentClassName);
            self.enableAnimation();
        },

        enableAnimation: function enableAnimation() {
            var $toggleParentElementsCollection = this.$toggleContainer.
                find(this.sToggleElementParent);
            if (this.bToggleAnimationEnabled) {
                $toggleParentElementsCollection.addClass('animate');
            }
        },

        getTarget: function getTarget(e) {
            var $targetElement = $(e.target);
            return $targetElement;
        },

        getToggleState: function getToggleState($target) {
            var bSetExpandeded = $target.closest($(this.sToggleElementParent)).
                hasClass(this.sSetExpandedCSSClassName) ? true : false;
            return bSetExpandeded;
        },

        toggleElement: function toggleElement(e) {
            var $targetElement = this.getTarget(e);
            if (this.getToggleState($targetElement) === false) {
                if (this.bAccordionEnabled) {
                    this.setAllCollapsed();
                }
                this.setExpanded($targetElement);
            } else {
                this.setCollapsed($targetElement);
            }
        },

        setExpanded: function setExpanded($target) {
            $target.closest($(this.sToggleElementParent))
                .addClass(this.sSetExpandedCSSClassName)
                .attr('data-expanded', true);
            if (this.bEnableCustomEvent) {
                this.triggerCustomEvent('toggle-expand');
            }
        },

        setCollapsed: function setCollapsed($target) {
            $target.closest($(this.sToggleElementParent))
                .removeClass(this.sSetExpandedCSSClassName)
                .removeAttr('data-expanded');
            if (this.bEnableCustomEvent) {
                this.triggerCustomEvent('toggle-collapse');
            }
        },

        setAllCollapsed: function setAllCollapsed() {
            this.$toggleContainer.find($(this.sToggleElementParent)).
                removeClass(this.sSetExpandedCSSClassName);
        },

        triggerCustomEvent: function triggerCustomEvent(sEventType) {
            $(window).trigger(this.sToggleCustomEventName, {
                toggleContainer: this.$toggleContainer,
                toggleTriggerElement: this.$toggleTriggerElement,
                toggleElementParent: $(this.sToggleElementParent),
                toggleEventType: sEventType
            });
        },

        unbindToggleEvents: function unbindToggleEvents() {
            var self = this;

            self.$toggleContainer.off('click.toggleExpandCollapse',
                self.sToggleTriggerElement);
            self.$toggleContainer.removeClass(self.sToggleParentClassName);
        },

        init: function init() {
            if (this.isToggleEventBound() === true) {
                this.unbindToggleEvents();
            }
            this.bindToggleEvents();
        }
    };

    return ToggleExpandCollapse;
});
