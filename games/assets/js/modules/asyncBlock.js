/*globals $,window,document,console,define,require */
/*jslint plusplus: true, regexp: true, unparam: true */
define('modules/asyncBlock', ['domlib'],  function ($) {
    'use strict';

    var logger,
        AsyncBlock,
        AsyncBlockHandlerException,
        AsyncBlockController;

    logger = function logger(sMessage, sTypeOfMessage) {
        var bLoggingEnabled = false,
            sType = sTypeOfMessage || "error";

        if (bLoggingEnabled) {
            switch (sType) {
            case "error":
                console.error(sMessage);
                break;
            case "info":
                console.info(sMessage);
                break;
            case "log":
                console.log(sMessage);
                break;
            }
        }
    };

    AsyncBlock = function AsyncBlock(oParams) {
        this.sBlockID = oParams.blockID || "";
        this.sURL = oParams.URL || "";
        this.oCallbacks = oParams.callbacks || null;
        this.sDOMSelector = oParams.sDOMSelector || '';
        this.oData = oParams.oData || null;
    };

    AsyncBlockHandlerException = function AsyncBlockHandlerException(sMsg) {
        this.message = sMsg || 'Unknown Error';
    };

    AsyncBlockHandlerException.prototype = Object.create(Error.prototype);
    AsyncBlockHandlerException.prototype.constructor = AsyncBlockHandlerException;

    AsyncBlockController = function AsyncBlockController() {
        var aBlocks = [],
            addBlock,
            removeBlock,
            removeAllBlocks,
            getBlockHandler,
            getAllBlockIDs,
            getBlocks,
            alwaysHandler,
            doneHandler,
            failHandler,
            getBlock,
            getAdditionalParams,
            bCompleted = false,
            deferCallHandler,
            bindDeferCallEvent,
            sDeferredEventName = 'AsyncBlockControllerDeferCall',
            bEventBound = false,
            sCompleteEventName = 'AsyncBlockControllerComplete';

        addBlock = function addBlock(oAsyncBlock) {
            if (oAsyncBlock instanceof AsyncBlock) {
                aBlocks.push(oAsyncBlock);
                logger('Block added', "info");
                logger(oAsyncBlock, "log");
            }
        };

        removeBlock = function removeBlock(oAsyncBlock) {
            var i;
            if (oAsyncBlock instanceof AsyncBlock) {
                for (i = 0; i < aBlocks.length; i++) {
                    if (aBlocks[i].sBlockID === oAsyncBlock.sBlockID) {
                        aBlocks.splice(aBlocks[i], 1);
                    }
                }
            }
        };

        removeAllBlocks = function removeAllBlocks() {
            aBlocks.length = 0;
        };

        getBlockHandler = function getBlockHandler(aBlockIDs) {
            var sBlockIDs = getAllBlockIDs(),
                sBaseURL = '/direct/blocks/common/asyncCustomerBlocks.jsp?blocks=',
                sAdditionalParams = getAdditionalParams();

            if (aBlockIDs === '' || aBlocks.length === 0) {
                throw new AsyncBlockHandlerException('No blocks specified or added to collection');
            }

            getBlocks(sBaseURL + sBlockIDs + sAdditionalParams);
        };

        getAllBlockIDs = function getAllBlockIDs() {
            var i,
                sBlockIDs = '';
            for (i = 0; i < aBlocks.length; i++) {
                if (sBlockIDs !== '') {
                    sBlockIDs += ',';
                }
                sBlockIDs += aBlocks[i].sBlockID;
            }
            return sBlockIDs;
        };

        getBlocks = function getBlocks(sURL) {
            $.ajax({
                url: sURL,
                async: true,
                success: doneHandler,
                error: failHandler,
                complete: alwaysHandler
            });
        };

        getBlock = function getBlock(oAsyncBlock) {
            var fDone = oAsyncBlock.oCallback.done || null,
                fFail = oAsyncBlock.oCallback.fail || null,
                fAlways = oAsyncBlock.oCallback.always || null;

            $.ajax({
                url: oAsyncBlock.sURL,
                async: true,
                done: fDone,
                fail: fFail,
                always: fAlways
            });
        };

        alwaysHandler = function alwaysHandler(oData, sTextStatus, oXHR) {
            var i;
            for (i = 0; i < aBlocks.length; i++) {
                if (typeof aBlocks[i].oCallbacks.complete === 'function') {
                    try {
                        aBlocks[i].oCallbacks.complete.apply(aBlocks[i], arguments);
                    } catch (e) {
                        //throw new AsyncBlockHandlerException('alwaysCallback on block ID ' + aBlocks[i].id + ' failed with error' + e.message);
                        console.log('alwaysCallback on block ID ' + aBlocks[i].id + ' failed with error ' + e.message);
                    }
                }
            }
            bCompleted = true;
            $(window).trigger(sCompleteEventName);
        };

        doneHandler = function doneHandler(oData, sTextStatus, oXHR) {
            var i;
            for (i = 0; i < aBlocks.length; i++) {
                if (typeof aBlocks[i].oCallbacks.success === 'function') {
                    aBlocks[i].oCallbacks.success.apply(aBlocks[i], arguments);
                }
            }
        };

        failHandler = function failHandler(oXHR, sTextStatus, sErrorThrown) {
            var i;
            for (i = 0; i < aBlocks.length; i++) {
                if (typeof aBlocks[i].oCallbacks.error === 'function') {
                    try {
                        aBlocks[i].oCallbacks.error.apply(aBlocks[i], arguments);
                    } catch (e) {
                       //throw new AsyncBlockHandlerException('failCallback on block ID ' + aBlocks[i].id + ' failed with error' + e.message);
                        console.log('failCallback on block ID ' + aBlocks[i].id + ' failed with error ' + e.message);
                    }
                }
            }
        };

        getAdditionalParams = function getAdditionalParams() {
            var i,
                sAdditionalParams = '',
                sKey;

            for (i = 0; i < aBlocks.length; i++) {
                if (aBlocks[i].oData) {
                    for (sKey in aBlocks[i].oData) {
                        if (aBlocks[i].oData.hasOwnProperty(sKey)) {
                            sAdditionalParams += "&" + sKey + "=" + aBlocks[i].oData[sKey];
                        }
                    }
                }
            }
            return sAdditionalParams;
        };

        deferCallHandler = function deferCallHandler() {
            getBlockHandler();
        };

        bindDeferCallEvent = function bindDeferCallEvent() {
            bEventBound = true;
            $(window).one(sDeferredEventName,  deferCallHandler.bind(this));
        };

        return {
            addBlock: addBlock,
            removeBlock: removeBlock,
            removeAllBlocks: removeAllBlocks,
            getBlocks: getBlockHandler,
            getBlockCollection: function getBlockCollection() {
                return aBlocks;
            },
            getBlock: getBlock,
            hasCompleted: function hasCompleted() {
                return bCompleted;
            },
            isCachedPage: function isCachedPage() {
                return aBlocks.length > 0 ? true : false;
            },
            deferDefaultCall: function deferDefaultCall() {
                if (bCompleted) {
                    return false;
                }
                if (window.deferAsyncBlockCall && !bEventBound) {
                    bindDeferCallEvent();
                }
                return window.deferAsyncBlockCall === true ? true : false;
            },
            getDeferredEventName: function getDeferredEventName() {
                return sDeferredEventName;
            },
            getCompleteEventName: function getCompleteEventName() {
                return sCompleteEventName;
            }
        };
    };

    window.AsyncBlock = AsyncBlock;
    if (!window.AsyncBlockController) {
        window.AsyncBlockController = new AsyncBlockController();
    }

});
