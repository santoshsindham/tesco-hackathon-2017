/*globals define,require,window */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/product-description/eventMessagingCountDown', ['domlib', 'modules/event-messaging/common'], function ($, countDownClock) {
    'use strict';

    var EventMessaging,
        EventMessagingManager,
        EventMessage,
        CountDown,
        EventMessagingManagerException;

    EventMessagingManagerException = function EventMessagingManagerException(sMsg) {
        this.name = 'EventMessagingManagerException';
        this.message = sMsg || 'Error';
    };

    EventMessagingManagerException.prototype = Object.create(Error.prototype);
    EventMessagingManagerException.prototype.constructor = EventMessagingManagerException;

    // Instance per seller
    EventMessagingManager = function EventMessagingManager(oParams) {
        if (!oParams) {
            throw new EventMessagingManagerException('No JSON in constructor');
        }
        this.sellerID = oParams.sellerID || null;
        this.listingId = oParams.listingId || null;
        this.tCurrentTime = oParams.currentTime || window.currentTimeAsync;
        this.aEvents = [];
        this.createEvents(oParams.events);
        this.sEventMessageSelector = oParams.selector || null;
        this.$eventMessage = null;
        this.sParsedMessage = "";
        this.oPoller = null;
        this.currentEligibleEvent = null;
        this.iPollingInterval = oParams.pollingInterval || 20000;
        this.oCountDown = this.createCountDown(oParams.countdown) || null;
        this.initCountdown = oParams.initCountdown;
        this.bindEvents();
    };

    EventMessagingManager.prototype.bindEvents = function () {
        $(window).on(
            'getEligibleCountdown.' + this.listingId,
            this.onGetEligibleCountdown.bind(this)
        );
    };

    EventMessagingManager.prototype.onGetEligibleCountdown = function (event) {
        if (event.oData.callback) {
            if (this.aEvents.length === 0 || !this.getEligibleEvent(window.currentTimeAsync)) {
                event.oData.callback({
                    countdown: this.oCountDown,
                    clock: countDownClock
                });
            }
        }
    };

    EventMessagingManager.prototype.addEvent = function addEvent(oEvent) {
        if (oEvent instanceof EventMessaging) {
            this.aEvents.push(oEvent);
        }
    };

    EventMessagingManager.prototype.isCountDownValid = function isCountDownValid(tCurrentTime) {
        var oEvent = this.getEligibleEvent(tCurrentTime);
        if (!oEvent) {
            return this.oCountDown && this.oCountDown.isEligible(tCurrentTime);
        }
        return false;
    };

    EventMessagingManager.prototype.show = function show(selector) {
        var oEvent,
            bEventEligible = false;

        if (selector) {
            this.sEventMessageSelector = selector;
        }

        if (this.sEventMessageSelector) {
            this.$eventMessage = $(this.sEventMessageSelector);
            if (this.$eventMessage.length) {
                if (this.aEvents.length > 0) {
                    oEvent = this.getEligibleEvent(this.tCurrentTime);
                    if (oEvent instanceof EventMessaging) {
                        if (oEvent !== this.currentEligibleEvent) {
                            this.currentEligibleEvent = oEvent;
                            bEventEligible = true;
                            this.$eventMessage.html(oEvent.getEligibleMessage(this.tCurrentTime));
                        }
                    }
                }
            }

            if (!bEventEligible) {
                if (this.oCountDown && this.initCountdown !== false) {
                    this.oCountDown.show();
                    countDownClock.init();
                }
            }
        }

        /* if (!this.oPoller) {
            this.poll();
        } */

    };

    EventMessagingManager.prototype.get = function get() {
        var oEvent,
            bEventEligible = false,
            oRenderedEventMessage = {};

        if (this.aEvents.length > 0) {
            oEvent = this.getEligibleEvent(this.tCurrentTime);
            if (oEvent instanceof EventMessaging) {
                if (oEvent !== this.currentEligibleEvent) {
                    this.currentEligibleEvent = oEvent;
                    bEventEligible = true;
                    oRenderedEventMessage.eventMessage =
                        oEvent.getEligibleMessage(this.tCurrentTime);
                }
            }
        }

        if (!bEventEligible) {
            if (this.oCountDown) {
                oRenderedEventMessage.countdownMessage =
                    this.oCountDown.get();
            }
        }

        return oRenderedEventMessage;
    };

    EventMessagingManager.prototype.createEvents = function createEvents(aRawEvents) {
        var i = 0;
        if (aRawEvents.length > 0) {
            for (i = 0; i < aRawEvents.length; i++) {
                this.aEvents.push(new EventMessaging(aRawEvents[i]));
            }
            this.aEvents.sort(function (a, b) {
                return a.priority < b.priority;
            });
        }
    };

    EventMessagingManager.prototype.getEligibleEvent = function getEligibleEvent(tCurrentTime) {
        var i = 0,
            oEvent;

        for (i = 0; i < this.aEvents.length; i++) {
            oEvent = this.aEvents[i];
            if (oEvent.isEligible(tCurrentTime)) {
                return oEvent;
            }
        }
        return null;
    };

    EventMessagingManager.prototype.createCountDown = function createCountDown(oRawCountDown) {
        if (oRawCountDown) {
            return new CountDown(oRawCountDown);
        }
    };

    EventMessagingManager.prototype.poll = function poll() {
        var self = this;
        this.oPoller = window.setInterval(function () {
            self.show();
        }, this.iPollingInterval);
    };

    EventMessagingManager.prototype.stopPoll = function stopPoll() {
        window.clearInterval(this.oPoller);
        this.oPoller = null;
    };

    EventMessagingManager.prototype.getEvents = function getEvents() {
        return this.aEvents;
    };

/************************************************************************************************************************/

    EventMessage = function EventMessage(oParams) {
        this.tStartTime = parseFloat(oParams.startTime) || null;
        this.tEndTime = parseFloat(oParams.endTime) || null;
        this.sMessage = oParams.message || "";
    };

    EventMessage.prototype.isEligible = function isEligible(tCurrentTime) {
        return tCurrentTime >= this.tStartTime && tCurrentTime <= this.tEndTime;
    };

/************************************************************************************************************************/

    EventMessaging = function EventMessaging(oParams) {
        this.iPriority = oParams.priority || 0;
        this.tStartTime = parseFloat(oParams.startTime) || null;
        this.tEndTime = parseFloat(oParams.endTime) || null;
        this.sEventMessageSelector = oParams.selector || null;
        this.$eventMessage = null;
        this.sParsedMessage = "";
        this.aMessages = [];
        this.createMessages(oParams.messages);
    };

    EventMessaging.prototype.isEligible = function isEligible(tCurrentTime) {
        return tCurrentTime >= this.tStartTime && tCurrentTime <= this.tEndTime;
    };

    EventMessaging.prototype.getEligibleMessage = function getEligibleMessage(tCurrentTime) {
        var i = 0,
            oMessage;
        for (i = 0; i < this.aMessages.length; i++) {
            oMessage = this.aMessages[i];
            if (oMessage.isEligible(tCurrentTime)) {
                return oMessage.sMessage;
            }
        }
        return "";
    };

    EventMessaging.prototype.createMessages = function createMessages(aRawMessages) {
        var i = 0;
        if (aRawMessages.length > 0) {
            for (i = 0; i < aRawMessages.length; i++) {
                this.aMessages.push(new EventMessage(aRawMessages[i]));
            }
        }
    };

    EventMessaging.prototype.getMessages = function getMessages() {
        return this.aMessages;
    };

/********************************************************************************************************************************/
    CountDown = function CountDown(oParams) {
        this.tStartTime = parseFloat(oParams.startTime) || null;
        this.tEndTime = parseFloat(oParams.endTime) || null;
        this.tCurrentTime = oParams.currentTime || null;
        this.sEligibleMsg = oParams.message || "";
        this.sCountdownSelector = oParams.selector || null;
        this.$countdownMessage = null;
    };

    CountDown.prototype.isEligible = function isEligible(tCurrentTime) {
        return tCurrentTime >= this.tStartTime && tCurrentTime <= this.tEndTime;
    };

    CountDown.prototype.show = function show(params) {
        var paramsCopy = params || {},
            sRenderedText = '';

        if (paramsCopy.element) {
            this.sCountdownSelector = paramsCopy.element;
        }

        if (this.sCountdownSelector) {
            this.$countdownMessage = $(this.sCountdownSelector);
        }

        if (!this.$countdownMessage.length) {
            return false;
        }

        if (!this.isEligible(this.tCurrentTime)) {
            return false;
        }

        sRenderedText = this.sEligibleMsg.replace('%countdown%', '<time data-endtime="' + Math.round((this.tEndTime) / 1000) + '" data-currenttime="' + Math.round((this.tCurrentTime) / 1000) + '" class="countdown"></time>');
        this.$countdownMessage.html(sRenderedText);

        return true;
    };

    CountDown.prototype.get = function get() {
        var sRenderedText = '';
        if (this.isEligible(this.tCurrentTime)) {
            sRenderedText = this.sEligibleMsg.replace(
                '%countdown%',
                '<time data-endtime="' + Math.round((this.tEndTime) / 1000) +
                    '" data-currenttime="' + Math.round(
                        (this.tCurrentTime) / 1000
                    ) + '" class="countdown"></time>'
            );
        }
        return sRenderedText;
    };

    return {
        EventMessaging: EventMessaging,
        EventMessagingManager: EventMessagingManager,
        EventMessage: EventMessage,
        CountDown: CountDown,
        EventMessagingManagerException: EventMessagingManagerException
    };

});
