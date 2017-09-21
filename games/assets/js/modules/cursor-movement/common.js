/*globals define,require,window */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/cursor-movement/common', ['domlib', 'modules/common'], function ($, common) {
    'use strict';

    var CursorMovement = function CursorMovement() {
        var pvInit,
            bindEvents,
            startPolling,
            stopPolling,
            takeSnapshot,
            setCursorPosition,
            setNewCursorPosition,
            setOldCursorPosition,
            calcCursormoveDistance,
            calcCursormoveSpeed,
            calcCursormoveVelocity,
            calcCursormoveAngle,
            getPosition,
            getElementFromPosition,
            mouseMoveSlowed,
            mouseMoveStopped,
            mouseMoveAngleChanged,
            setMouseMoveAngles,
            unsetMouseMoveAngles,
            oAngles = {
                from: null,
                to: null
            },
            oCursor = {
                timer: null,
                time: 100,
                positionX: null,
                positionY: null,
                newPositionX: null,
                newPositionY: null,
                oldPositionX: null,
                oldPositionY: null,
                distance: null,
                speed: null,
                velocity: null,
                angle: null,
                isPolling: false
            },
            iPollingCounter = 0;

        pvInit = function pvInit() {
            bindEvents();
        };

        bindEvents = function bindGlobalEvents() {
            $(document).on('mousemove.cursor', setCursorPosition);
        };

        startPolling = function startPolling() {
            iPollingCounter++;
            if (!oCursor.timer) {
                oCursor.timer = setInterval(function () {
                    takeSnapshot();
                    mouseMoveSlowed();
                    mouseMoveStopped();
                    mouseMoveAngleChanged();
                }, oCursor.time);
                oCursor.isPolling = true;
            }
        };

        stopPolling = function stopPolling() {
            iPollingCounter--;
            if (iPollingCounter === 0) {
                clearInterval(oCursor.timer);
                oCursor.timer = null;
                oCursor.isPolling = false;
            }
        };

        takeSnapshot = function takeSnapshot() {
            setOldCursorPosition();
            setNewCursorPosition();
            calcCursormoveDistance();
            calcCursormoveSpeed();
            calcCursormoveVelocity();
            calcCursormoveAngle();
        };

        setCursorPosition = function setCursorPosition(e) {
            var windowScrollTop = window.currentScrollTop || 0;

            oCursor.positionX = e.pageX;
            oCursor.positionY = e.pageY - windowScrollTop;
        };

        setNewCursorPosition = function setNewCursorPosition() {
            oCursor.newPositionX = oCursor.positionX;
            oCursor.newPositionY = oCursor.positionY;
        };

        setOldCursorPosition = function setOldCursorPosition() {
            oCursor.oldPositionX = oCursor.newPositionX === null ? oCursor.positionX : oCursor.newPositionX;
            oCursor.oldPositionY = oCursor.newPositionY === null ? oCursor.positionY : oCursor.newPositionY;
        };

        calcCursormoveDistance = function calcCursormoveDistance() {
            oCursor.distance = Math.sqrt(Math.pow(Math.abs(oCursor.newPositionX - oCursor.oldPositionX), 2) + Math.pow(Math.abs(oCursor.newPositionY - oCursor.oldPositionY), 2));
        };

        calcCursormoveSpeed = function calcCursormoveSpeed() {
            oCursor.speed = oCursor.distance / oCursor.time;
        };

        calcCursormoveVelocity = function calcCursormoveVelocity() {
            oCursor.velocity = oCursor.speed / oCursor.time;
        };

        calcCursormoveAngle = function calcCursormoveAngle() {
            oCursor.angle = Math.atan2(oCursor.newPositionY - oCursor.oldPositionY, oCursor.newPositionX - oCursor.oldPositionX) * 180 / Math.PI;
        };

        getPosition = function getPosition() {
            return {
                x: oCursor.positionX,
                y: oCursor.positionY
            };
        };

        getElementFromPosition = function getElementFromPosition() {
            return document.elementFromPoint(oCursor.positionX, oCursor.positionY);
        };

        mouseMoveSlowed = function mouseMoveSlowed() {
            var oEvent;

            if (oCursor.speed !== null) {
                if (oCursor.speed < 0.1) {
                    oEvent = $.Event('cursorMovement.slowed');
                    oEvent.positionX = oCursor.positionX;
                    oEvent.positionY = oCursor.positionY;
                    $(window).trigger(oEvent);
                }
            }
        };

        mouseMoveStopped = function mouseMoveStopped() {
            var oEvent;

            if (oCursor.speed !== null) {
                if (oCursor.speed === 0) {
                    oEvent = $.Event('cursorMovement.stopped');
                    oEvent.positionX = oCursor.positionX;
                    oEvent.positionY = oCursor.positionY;
                    $(window).trigger(oEvent);
                }
            }
        };

        mouseMoveAngleChanged = function mouseMoveAngleChanged() {
            var oEvent;

            if (oAngles.from !== null && oAngles.to !== null) {
                if (oCursor.angle !== null) {
                    if (oCursor.angle < oAngles.from || oCursor.angle > oAngles.to) {
                        oEvent = $.Event('cursorMovement.angleChanged');
                        oEvent.positionX = oCursor.positionX;
                        oEvent.positionY = oCursor.positionY;
                        oEvent.angle = oCursor.angle;
                        $(window).trigger(oEvent);
                    }
                }
            }
        };

        setMouseMoveAngles = function setMouseMoveAngles(angleFrom, angleTo) {
            oAngles.from = angleFrom;
            oAngles.to = angleTo;
        };

        unsetMouseMoveAngles = function unsetMouseMoveAngles() {
            oAngles.from = null;
            oAngles.to = null;
        };

        pvInit();

        return {
            startPolling: startPolling,
            stopPolling: stopPolling,
            isPolling: function () {
                return oCursor.isPolling;
            },
            getPosition: getPosition,
            getCurrentPositionElement: getElementFromPosition,
            getDistance: function () {
                return oCursor.distance;
            },
            getSpeed: function () {
                return oCursor.speed;
            },
            getVelocity: function () {
                return oCursor.velocity;
            },
            getAngle: function () {
                return oCursor.angle;
            },
            setAngles: setMouseMoveAngles,
            unsetAngles: unsetMouseMoveAngles
        };
    };

    if (!common.isTouch() || !window.isKiosk()) {
        if (!window.CursorMovement) {
            window.CursorMovement = new CursorMovement();
        }
    }
});