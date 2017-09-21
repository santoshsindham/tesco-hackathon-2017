/*jslint plusplus: true, nomen: true, indent: 4 */
/*globals window,document,console,define,require,$ */
define('modules/chip-and-pin/delivery-group', ['modules/mvapi/common', 'modules/chip-and-pin/atg-data', 'modules/ajax/common', 'modules/settings/common'], function (mvApi, atgData, ajax, SETTINGS) {
    'use strict';

    var renderGroups, getItemsForDeliveryGroup, getDeliveryGroup, getDeliveryGroups, handleDeliveryGroup, showDeliveryGroup, oCurrentDeliveryGroup, setCompleted,
        getCurrentDeliveryGroup, getCurrentDeliveryGroupID, canClickAndCollect, canDeliverToHome, updateDeliveryGroupsCollection, getDeliveryGroupCount,
        setAllDeliveryGroupsNotCompleted, setStoreInformation, populateDeliveryGroupInformation, setCurrentDeliveryGroupAsActive, parseATGDataForDeliveryMethod,
        setDeliveryOption, getSelectedDeliveryMethod, getDatePickerRequired, abSendRequest, deliveryGroupCompleteCallback;

    renderGroups = function renderGroups(oDeliveryGroups, fnCallback) {
        mvApi.render('deliveryGroups', oDeliveryGroups, fnCallback);
    };

    getItemsForDeliveryGroup = function getItemsForDeliveryGroup(sDeliveryGroupID) {
        var aDeliveryItemsModel = mvApi.getModel('deliveryItems'),
            oModel,
            aDeliveryItemsForGroup = [];

        for (oModel in aDeliveryItemsModel.collection) {
            if (aDeliveryItemsModel.collection.hasOwnProperty(oModel)) {
                if (oModel.deliveryGroupId === sDeliveryGroupID) {
                    aDeliveryItemsForGroup.push(oModel);
                }
            }
        }
        return aDeliveryItemsForGroup;
    };

    getDeliveryGroup = function getDeliveryGroup(sDeliveryGroupID) {
        var aDeliveryGroups,
            oDeliveryGroup,
            i;

        aDeliveryGroups = getDeliveryGroups();

        for (i = 0; i < aDeliveryGroups.length; i++) {
            if (aDeliveryGroups[i].deliveryGroupId === sDeliveryGroupID) {
                oDeliveryGroup = aDeliveryGroups[i];
                break;
            }
        }

        oCurrentDeliveryGroup = oDeliveryGroup;
        return oDeliveryGroup;
    };

    getDeliveryGroups = function getDeliveryGroups() {
        var oDeliveryGroupModel = mvApi.getModel('deliveryGroups'),
            oDeliveryGroup;

        if (oDeliveryGroupModel.collection.items) {
            oDeliveryGroup = oDeliveryGroupModel.collection.items;
        } else {
            if (window.TescoData.ChipAndPin.checkoutData.deliveryGroups !== 'undefined') {
                oDeliveryGroup = window.TescoData.ChipAndPin.checkoutData.deliveryGroups;                
            }
        }

        return oDeliveryGroup;
    };
    
    parseATGDataForDeliveryMethod = function parseATGDataForDeliveryMethod(oDeliveryMethod) {
        if($.type(oDeliveryMethod.atgData) === "string"){
			$.extend(oDeliveryMethod, atgData.parse(oDeliveryMethod.atgData));
		}
        
        return oDeliveryMethod;
    };

    handleDeliveryGroup = function handleDeliveryGroup() {
        var oDeliveryGroupModel = mvApi.getModel('deliveryGroups'),
            i = 0,
            bAllDeliveryGroupsCompleted = true;

        if (oDeliveryGroupModel.collection.items) {
            for (i = 0; i < oDeliveryGroupModel.collection.items.length; i++) {
                if (!oDeliveryGroupModel.collection.items[i].completed) {
                    bAllDeliveryGroupsCompleted = false;
                    oDeliveryGroupModel.collection.items[i].deliveryGroupActive = true;
                    break;
                }
            }
        }

        if (bAllDeliveryGroupsCompleted) {
            mvApi.navigateTo('review', true);
        } else {
            showDeliveryGroup(oDeliveryGroupModel.collection.items[i]);
        }
    };

    showDeliveryGroup = function showDeliveryGroup(oDeliveryGroup) {
        oCurrentDeliveryGroup = oDeliveryGroup;
        require(['modules/chip-and-pin/delivery'], function (delivery) {
            delivery.renderDeliveryComponents(oDeliveryGroup.deliveryGroupId);
        });
    };

    setCompleted = function setCompleted(oDeliveryGroup) {
        if (oDeliveryGroup) {
            oDeliveryGroup = true;
        } else {
            oCurrentDeliveryGroup.completed = true;
            oDeliveryGroup = oCurrentDeliveryGroup;
        }
        oDeliveryGroup.deliveryGroupActive = false;
        updateDeliveryGroupsCollection(oDeliveryGroup);
    };

    updateDeliveryGroupsCollection = function updateDeliveryGroupsCollection(oDeliveryGroup) {
        var oDeliveryGroupModel = mvApi.getModel('deliveryGroups'),
            i;

        if (oDeliveryGroupModel.collection.items) {
            for (i = 0; i < oDeliveryGroupModel.collection.items.length; i++) {
                if (oDeliveryGroupModel.collection.items[i].deliveryGroupId === oDeliveryGroup.deliveryGroupId) {
                    oDeliveryGroupModel.collection.items[i] = oDeliveryGroup;
                    break;
                }
            }
        }
    };

    getCurrentDeliveryGroup = function getCurrentDeliveryGroup() {
        return oCurrentDeliveryGroup;
    };

    getCurrentDeliveryGroupID = function getCurrentDeliveryGroupID() {
        return oCurrentDeliveryGroup.deliveryGroupId;
    };

    canClickAndCollect = function canClickAndCollect(oDeliveryGroup) {
        oDeliveryGroup = oDeliveryGroup || oCurrentDeliveryGroup;
        return oDeliveryGroup.deliveryOptions.availableStoreCollectOptions === undefined ? false : true;
    };

    canDeliverToHome = function canDeliverToHome(oDeliveryGroup) {
        oDeliveryGroup = oDeliveryGroup || oCurrentDeliveryGroup;
        return oDeliveryGroup.deliveryOptions.availableHomeDeliveryOptions === undefined ? false : true;
    };

    getDeliveryGroupCount = function getDeliveryGroupCount() {
        return getDeliveryGroups().length;
    };

    setAllDeliveryGroupsNotCompleted = function setAllDeliveryGroupsNotCompleted() {
        var oDeliveryGroupModel = mvApi.getModel('deliveryGroups'),
            i;

        if (oDeliveryGroupModel.collection.items) {
            for (i = 0; i < oDeliveryGroupModel.collection.items.length; i++) {
                oDeliveryGroupModel.collection.items[i].completed = false;
            }
        }
    };

    setStoreInformation = function setStoreInformation(oStoreInfo) {
        oCurrentDeliveryGroup.deliveryOptions.availableStoreCollectOptions[1].storeInfoDetails = oStoreInfo;
        updateDeliveryGroupsCollection(oCurrentDeliveryGroup);
    };
    
    setDeliveryOption = function setDeliveryOption(oDeliveryMethod) {    
        var key, i;
        for (key in oCurrentDeliveryGroup.deliveryOptions) {
            if (oCurrentDeliveryGroup.deliveryOptions.hasOwnProperty(key)) {
            	for (i = 0; i < oCurrentDeliveryGroup.deliveryOptions[key].length; i++) {
                    if (oDeliveryMethod.deliveryMethodCode === oCurrentDeliveryGroup.deliveryOptions[key][i].deliveryMethodCode) {
                        oCurrentDeliveryGroup.deliveryOptions[key][i].deliveryMethodSelected = true;
                        break;
                    }
                    else{
                    	oCurrentDeliveryGroup.deliveryOptions[key][i].deliveryMethodSelected = false;
                    }
                }
            }
        }
        
        updateDeliveryGroupsCollection(oCurrentDeliveryGroup);
    };
    
    getSelectedDeliveryMethod = function getSelectedDeliveryMethod(oDeliveryGroup) {
        var i, key, oSelectedDeliveryMethod;
        
        if (!oDeliveryGroup) {
            oDeliveryGroup = oCurrentDeliveryGroup;
        }
        
        for (key in oDeliveryGroup.deliveryOptions) {
            if (oDeliveryGroup.deliveryOptions.hasOwnProperty(key)) {
                for (i = 0; i < oDeliveryGroup.deliveryOptions[key].length; i++) {
                    if (oDeliveryGroup.deliveryOptions[key][i].deliveryMethodSelected === true) {
                        oSelectedDeliveryMethod = oDeliveryGroup.deliveryOptions[key][i];
                        break;
                    }
                }
            }
        }
        
        return oSelectedDeliveryMethod;
    
    };
    
    populateDeliveryGroupInformation = function populateDeliveryGroupInformation(oDeliveryGroups) {    	
    	if (oDeliveryGroups) {
    		window.TescoData.ChipAndPin.checkoutData.deliveryGroups = oDeliveryGroups;    		
    	}
    };
    
    setCurrentDeliveryGroupAsActive = function setCurrentDeliveryGroupAsActive() {        
        oCurrentDeliveryGroup.deliveryGroupActive = true;
        updateDeliveryGroupsCollection(oCurrentDeliveryGroup);
    };

    abSendRequest = function abSendRequest(data, callback) {
        ajax.post({
            'url': SETTINGS.CONSTANTS.URL.KIOSK_DATA,
            'data': data || {},
            'callbacks': {
                'success': callback || null
            }
        });
    };

    getDatePickerRequired = function getDatePickerRequired(data, callback, forceLocalJSONCheck) {
        if (forceLocalJSONCheck === true) {
            var bDatePickerRequired = getCurrentDeliveryGroup().deliveryOptions.availableStoreCollectOptions[0];
            callback(bDatePickerRequired);
        } else if (data !== undefined && data !== null) {
            abSendRequest(data, function (d) {
                d = (typeof d === 'string') ? JSON.parse(d) : d;
                callback(d);
            });
        } else {
            callback(false);
        }
    };

    deliveryGroupCompleteCallback = function deliveryGroupCompleteCallback(overlay) {
        overlay.hide();
        setCompleted();
        handleDeliveryGroup();
    };

    return {
        getDeliveryGroup: getDeliveryGroup,
        getDeliveryGroups: getDeliveryGroups,
        handleDeliveryGroup: handleDeliveryGroup,
        showDeliveryGroup: showDeliveryGroup,
        getItemsForDeliveryGroup: getItemsForDeliveryGroup,
        renderGroups: renderGroups,
        setCompleted: setCompleted,
        getCurrentDeliveryGroup: getCurrentDeliveryGroup,
        getCurrentDeliveryGroupID: getCurrentDeliveryGroupID,
        canDeliverToHome: canDeliverToHome,
        canClickAndCollect: canClickAndCollect,
        getDeliveryGroupCount: getDeliveryGroupCount,
        setAllDeliveryGroupsNotCompleted: setAllDeliveryGroupsNotCompleted,
        setStoreInformation: setStoreInformation,
        populateDeliveryGroupInformation: populateDeliveryGroupInformation,
        setCurrentDeliveryGroupAsActive: setCurrentDeliveryGroupAsActive,
        parseATGDataForDeliveryMethod: parseATGDataForDeliveryMethod,
        setDeliveryOption: setDeliveryOption,
        getSelectedDeliveryMethod: getSelectedDeliveryMethod,
        getDatePickerRequired: getDatePickerRequired,
        deliveryGroupCompleteCallback: deliveryGroupCompleteCallback
    };

});