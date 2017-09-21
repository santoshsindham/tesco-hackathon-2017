/*globals jasmine, define, describe, it, expect, beforeEach*/
define(['modules/product-description/eventMessagingCountDown'], function (eventMessagingCountDown) {
    'use strict';

    describe('Event Messaging & Count Down', function () {
        var oEventJSON = {
                "events": [
                    {
                        "priority": 1,
                        "startTime": 1431601792018,
                        "endTime": 1431614663404,
                        "messages": [{
                            "startTime": 1431601792018,
                            "endTime": 1431614663404,
                            "message" : "This the first message in the event messages array"
                        }
                            ]
                    }
                ],
                "countdown": {
                    "startTime": 1431560663404,
                    "endTime": (new Date()).setHours(23),
                    "messages": "Order in the next %countdown% and collect from your local store after 3pm tomorrow."
                }
            },
            oAdditionalEvent = {
                "priority": 2,
                "startTime": 1431601792018,
                "endTime": 1431614663404,
                "messages": [{
                    "startTime": 1431601792018,
                    "endTime": 1431614663404,
                    "message" : "This the second message in the event messages array"
                }
                    ]
            },
            tEligableTime = (new Date().getTime()),
            oEventEligable = {
                "priority": 3,
                "startTime": 1431601792018,
                "endTime": (new Date()).setHours(22),
                "messages": [{
                    "startTime": 1431601792018,
                    "endTime": (new Date()).setHours(21),
                    "message" : "This the first message of the eligable event"
                }, {
                    "startTime": 1431601792018,
                    "endTime": (new Date()).setHours(22, 0),
                    "message" : "This the second message of the eligable event"
                }
                    ]
            };

        describe('Object Presence', function () {

            it('GIVEN we have NOT provided a JSON structure to the constructor', function () {
                expect(function () {
                    return new eventMessagingCountDown.EventMessagingManager();
                }).toThrowError(eventMessagingCountDown.EventMessagingManagerException);
            });

            describe('GIVEN we have provided a valid JSON structure', function () {
                var oEventMessagingManager = new eventMessagingCountDown.EventMessagingManager(oEventJSON);

                it('We are returned a valid EventMessagingManager', function () {
                    expect(oEventMessagingManager).toEqual(jasmine.any(eventMessagingCountDown.EventMessagingManager));
                });

                it('We have the same number of events while adding an incorrect Event', function () {
                    oEventMessagingManager.addEvent({});
                    expect(oEventMessagingManager.getEvents().length).toEqual(1);
                });

            });

        });

        describe('Event Scenarios', function () {
            var oEventMessagingManager = new eventMessagingCountDown.EventMessagingManager(oEventJSON),
                aEvents = oEventMessagingManager.getEvents(),
                aMessages = [];

            describe('GIVEN we have provided a valid JSON with 1 event & 1 message', function () {

                it('it should have only 1 event', function () {
                    expect(aEvents.length).toEqual(1);
                });

                it('it should have only 1 event with 1 message', function () {
                    aMessages = aEvents[0].getMessages();
                    expect(aMessages.length).toEqual(1);
                });

            });

            describe('GIVEN we have provided a valid JSON with 1 event which is no longer eligable', function () {

                it('it should have no eligable events', function () {
                    expect(oEventMessagingManager.getEligibleEvent(new Date().getTime())).toEqual(null);
                });

                it('it should have only 1 event with 1 message', function () {
                    aMessages = aEvents[0].getMessages();
                    expect(aMessages.length).toEqual(1);
                });

            });

            describe('GIVEN we have provided a valid JSON with 1 event', function () {

                it('we have incremented the number of events while adding a new Event', function () {
                    var oEvent = new eventMessagingCountDown.EventMessaging(oAdditionalEvent);
                    oEventMessagingManager.addEvent(oEvent);
                    expect(oEventMessagingManager.getEvents().length).toEqual(2);
                });

                it('we have incremented the number of events while adding a new eligable Event', function () {
                    var oEvent = new eventMessagingCountDown.EventMessaging(oEventEligable);
                    oEventMessagingManager.addEvent(oEvent);
                    expect(oEventMessagingManager.getEvents().length).toEqual(3);
                });

                it('we receive the first message from the eligable event', function () {
                    var oReturnedEvent = oEventMessagingManager.getEligibleEvent(tEligableTime);
                    expect(oReturnedEvent.getEligibleMessage(tEligableTime)).toEqual("This the first message of the eligable event");
                });

                it('we receive the second message from the eligable event', function () {
                    var tTestingTime = ((new Date()).setHours(22, 0) - 10000),
                        oReturnedEvent = oEventMessagingManager.getEligibleEvent(tTestingTime);
                    expect(oReturnedEvent.getEligibleMessage(tTestingTime)).toEqual("This the second message of the eligable event");
                });

            });

            describe('GIVEN we have provided a valid JSON with no eligable events but have a Countdown clock', function () {

                it('when the time is within the range it will show the count down clock', function () {
                    expect(oEventMessagingManager.isCountDownValid((new Date()).setHours(23) - 10000)).toBe(true);
                });

                it('when the time is within the range it will NOT show the count down clock', function () {
                    expect(oEventMessagingManager.isCountDownValid((new Date()).setHours(23) + 10000)).toBe(false);
                });

            });

        });
    });
});