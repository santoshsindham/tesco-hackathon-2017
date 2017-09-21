/*globals define,require,window */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/smart-menu-hover/common', ['domlib', 'modules/breakpoint'], function ($, breakpoint) {
    'use strict';

    var SmartMenuHover = function SmartMenuHover(oConfig) {
        if (!oConfig || !oConfig.delegate || !oConfig.target || !oConfig.child || !oConfig.position.desktop) {
            return;
        }
        this.oSelectors = {
            delegate: oConfig.delegate,
            target: oConfig.target,
            child: oConfig.child
        };
        this.oElements = {
            parent: null,
            target: null,
            child: null,
            prevParent: null
        };
        this.oMenuPos = {
            desktop: oConfig.position.desktop,
            device: oConfig.position.device || oConfig.position.desktop
        };
        this.oAngles = {
            from: null,
            to: null
        };
        this.oStates = {
            advanced: oConfig.advanced || false,
            cursorPolling: false,
            menuOpened: false,
            mouseEntered: false,
            cursorSlowedEventBound: false,
            cursorAngleChangedEventBound: false
        };
        this.reset = oConfig.reset || null;

        if (this.reset !== null) {
            this.reset.event = oConfig.reset.event + '.smartMenuHover';
        }
    };

    SmartMenuHover.prototype.init = function () {
        this.bindEvents();

        if (this.reset !== null) {
            this.bindResetToConfigEvent();
        }
    };

    SmartMenuHover.prototype.bindEvents = function () {
        $(this.oSelectors.delegate).on('mouseenter.smartMenuHover', this.oSelectors.target, this.mouseEnter.bind(this))
            .on('mouseleave.smartMenuHover', this.oSelectors.target, this.mouseLeave.bind(this));
    };

    SmartMenuHover.prototype.bindResetToConfigEvent = function () {
        var self = this;

        $(self.reset.delegate).on(self.reset.event, self.resetStates.bind(self));
    };

    SmartMenuHover.prototype.resetStates = function (e) {
        this.oStates.menuOpened = false;
        this.oStates.mouseEntered = false;
        this.oStates.cursorSlowedEventBound = false;
        this.oStates.cursorAngleChangedEventBound = false;
    };

    SmartMenuHover.prototype.mouseEnter = function (e) {
        var self = this,
            $eventTarget = $(e.currentTarget),
            parentElem = $(e.currentTarget).closest('ul')[0];

        if (self.oStates.cursorAngleChangedEventBound === true) {
            return;
        }

        self.oElements.child = e.currentTarget.querySelectorAll(self.oSelectors.child)[0];

        window.CursorMovement.startPolling();
        self.oStates.cursorPolling = true;

        if (parentElem !== e.fromElement && parentElem.contains(e.fromElement) && self.oStates.menuOpened === true && self.oStates.advanced === true) {
            if (self.oStates.mouseEntered === false) {
                $eventTarget.trigger('smartMenuHover.mouseenter');
                self.oStates.mouseEntered = true;
                self.oStates.menuOpened = true;
            }
        } else {
            self.oStates.cursorSlowedEventBound = true;

            $(window).on('cursorMovement.slowed', function () {
                if (self.oStates.mouseEntered === false) {
                    $eventTarget.trigger('smartMenuHover.mouseenter');
                    self.oStates.mouseEntered = true;
                    self.oStates.menuOpened = true;
                }
            });
        }
    };

    SmartMenuHover.prototype.mouseLeave = function (e) {
        var self = this,
            prevTargetElem = e.currentTarget,
            toElement = e.toElement,
            toTargetElem,
            parentElem = $(e.currentTarget).closest('ul')[0],
            currentPositionElem;

        if (self.oStates.mouseEntered === false) {
            $(window).off('cursorMovement.slowed');
            self.oStates.cursorSlowedEventBound = false;
            window.CursorMovement.stopPolling();
            self.oStates.cursorPolling = false;
            return;
        }

        if (self.oStates.mouseEntered === true) {
            if (parentElem === toElement || parentElem.contains(toElement) === false || self.oElements.child === undefined || self.oStates.advanced === false) {
                $(prevTargetElem).trigger('smartMenuHover.mouseleave');
                self.oStates.mouseEntered = false;
                $(window).off('cursorMovement.slowed');
                self.oStates.cursorSlowedEventBound = false;
                window.CursorMovement.stopPolling();
                self.oStates.cursorPolling = false;
                return;
            }

            self.getCursorMoveArea();
            window.CursorMovement.setAngles(self.oAngles.from, self.oAngles.to);
            self.oStates.cursorAngleChangedEventBound = true;

            $(window).on('cursorMovement.angleChanged', function (e) {
                currentPositionElem = window.CursorMovement.getCurrentPositionElement();
                toTargetElem = $(currentPositionElem).closest(self.oSelectors.target)[0] || null;

                if (toTargetElem === null) {
                    return;
                }

                if (toTargetElem === prevTargetElem || prevTargetElem.contains(currentPositionElem)) {
                    self.oStates.cursorAngleChangedEventBound = false;
                    $(window).off('cursorMovement.angleChanged');
                    window.CursorMovement.unsetAngles();
                    return;
                }

                self.oStates.cursorAngleChangedEventBound = false;
                $(window).off('cursorMovement.angleChanged');
                window.CursorMovement.unsetAngles();
                $(prevTargetElem).trigger('smartMenuHover.mouseleave');
                $(toTargetElem).trigger('smartMenuHover.mouseenter');
            });
        }
    };

    SmartMenuHover.prototype.getCursorMoveArea = function () {
        var cursorPosY = window.CursorMovement.getPosition().y,
            cursorPosX = window.CursorMovement.getPosition().x,
            pos = this.getPointPositions(this.getElementCoordinates(this.oElements.child));

        this.oAngles.from = this.getAngleBetweenPoints(pos.to.y, cursorPosY, pos.to.x, cursorPosX);
        this.oAngles.to = this.getAngleBetweenPoints(pos.from.y, cursorPosY, pos.from.x, cursorPosX);
    };

    SmartMenuHover.prototype.getElementCoordinates = function (elem) {
        return elem.getBoundingClientRect();
    };

    SmartMenuHover.prototype.getPointPositions = function (elemRect) {
        var menuPos = breakpoint.desktop || breakpoint.largeDesktop ? this.oMenuPos.desktop : this.oMenuPos.device,
            posFrom,
            posTo;

        switch (menuPos) {
        case 'below':
            posFrom = {
                y: elemRect.top,
                x: elemRect.left
            };
            posTo = {
                y: elemRect.top,
                x: elemRect.right
            };
            break;
        case 'right':
            posTo = {
                y: elemRect.top,
                x: elemRect.left
            };
            posFrom = {
                y: elemRect.bottom,
                x: elemRect.left
            };
            break;
        }

        return {
            from: posFrom,
            to: posTo
        };
    };

    SmartMenuHover.prototype.getAngleBetweenPoints = function (farPosY, nearPosY, farPosX, nearPosX) {
        return Math.atan2(farPosY - nearPosY, farPosX - nearPosX) * 180 / Math.PI;
    };

    return SmartMenuHover;

});