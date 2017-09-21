
/**********************************************************
* Module
* Utils - Class which holds commonly used utilities. All methods are static so no need to create instance
**********************************************************/
TESCO.Utils = {	
	trim: function(sVal) {
		return sVal.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
	removeSpaces: function(sVal) {
		return sVal.replace(/\s/g, '');
	},
	addAjaxLoader: function(oContainer, sMsg) {
		var $ajaxLoaderMarkup = $('<div class="ajaxLoader"><span>' + sMsg + '</span></div>');
		var oHeight = $(oContainer).height();		
		if ($(oContainer).is('p') || $(oContainer).hasClass('store-search-form')) {
			oHeight = 30;
			$ajaxLoaderMarkup.addClass("ajaxLoaderSmall");
		}
		else {
			if (oHeight < 100) {		
				oHeight = 100;
			}
			/*
			if ($(oContainer).hasClass('store-options-module') || $(oContainer).hasClass('store-collection-times-module')) {
				oHeight = oHeight - 31;
				$ajaxLoaderMarkup.css("top", "31px");
			}
			*/
			if($(oContainer).hasClass('buyButtonContainer')){
				oHeight=30;
			}
		}		
		if($(oContainer).attr('id') == 'dg-holder'){
			var $spanElem = $ajaxLoaderMarkup.find('span');
			$spanElem.css("position","absolute");
			var hght = oHeight - (oHeight - $(window).scrollTop());
			if(hght > (oHeight-100))
				hght = oHeight-120;
			$ajaxLoaderMarkup.css('backgroundPosition', ($(oContainer).outerWidth() - $spanElem.outerWidth() ) / 2+'px '+ (hght+30) +'px');
			$spanElem.css("top", hght + "px");
		    $spanElem.css("left", ( ($(oContainer).outerWidth() - $spanElem.outerWidth() ) / 2) - 50 + "px");
		}
		$ajaxLoaderMarkup.width($(oContainer).outerWidth());
		$ajaxLoaderMarkup.height(oHeight);		
		$(oContainer).prepend($ajaxLoaderMarkup);
	},	
	removeAjaxLoader: function(oContainer) {
		$(oContainer).find('div.ajaxLoader').remove();		
	},
	removeAllAjaxLoaders: function() {
		// Might need to keep a jQuery object of all ajax loaders while adding to boost performance.
		$('body').find('div.ajaxLoader').remove();
	},
	
	removeAjaxLoadersPerRequest: function(oElem, sRequest) {		
		var _affectedModules = TESCO.Utils.getModulesForRequest(sRequest);
		for (var i = 0; i < _affectedModules.length; i++) {
			var val = _affectedModules[i];
			var _moduleInfo = TESCO.Utils.getModuleInformation(val);	
			if (_moduleInfo.length > 0) {
				if (_moduleInfo[2] === false) {
					var $selector = TESCO.Utils.getDeliveryGroup(oElem).find(_moduleInfo[0]);
				}
				else {
					var $selector = $(_moduleInfo[0]);
				}
				TESCO.Utils.removeAjaxLoader($selector);			
			}
		}
			
	},
	
	
	/***
	* We need to add an ajax loader to each specific module on what action the user has taken, this function maps the request to the modules
	*/
	addAjaxLoaderPerRequest: function(oRequest, oElem) {						
		var _affectedModules = this.getModulesForRequest(oRequest);		
		for (var i = 0; i < _affectedModules.length; i++) {
			var val = _affectedModules[i];
			var _moduleInfo = TESCO.Utils.getModuleInformation(val);			
			if (_moduleInfo.length > 0) {
				if (_moduleInfo[3] === false || _moduleInfo[3] === undefined) {
					if (typeof _moduleInfo[3] !== 'object') {
						if (_moduleInfo[2] === false) {
	    					var $selector = TESCO.Utils.getDeliveryGroup(oElem).find(_moduleInfo[0]);
	    				}
	    				else if(_moduleInfo[2] === 'basket'){
	    					var $selector = TESCO.Utils.getProductTile(oElem).find(_moduleInfo[0]);    					
	    				}
	    				else {
	    					var $selector = $(_moduleInfo[0]);
	    				}
				 		TESCO.Utils.addAjaxLoader($selector, _moduleInfo[1]);
				 	}
			 	}
			 	else {
			 		// We have passed a custom object to be performed as the Ajax loader
			 		if (typeof _moduleInfo[3] === 'object') {
			 			_moduleInfo[3].ajaxLoader.apply(undefined, arguments);
			 		}
			 	}
			}
		}	
	},
	/*** Return array of modules affected by user request/action **/
	getModulesForRequest: function(oRequest) {		
		var _requests = TESCO.Data.Global.getRequests();
		if (_requests) { 
			return _requests[oRequest];
		}
	},
	getModuleInformation: function(sModule) {
		var _modules = TESCO.Data.Global.getModules();
		if(_modules) {
			return _modules[sModule];
		}
	},
	getProductTile: function(oElem){
		return $(oElem).parents('li').eq(0);
	},
	getDeliveryGroup: function(oElem) {
		return $(oElem).parents('div.delivery-group-block');
	},
	getFormByElement: function(oElem) {
		return $(oElem).parents('form:last');
	},	
	isInlineRequest: function(sRequest) {		
		var _inlineRequests = TESCO.Data.Global.getInlineRequests();
		if (_inlineRequests[sRequest] != undefined) {		
			return true;
		}
		else {
			return false;
		}
	},
	getAction: function(sRequest, oForm) {
        var _formAction = TESCO.Utils.getFormAction(oForm);
        var _actions = TESCO.Data.Global.getActions();
        if (_formAction !== '') {
           return _formAction;
        }
        else {
            if(_actions) {
                try {
                    if (_actions[sRequest][0] === '') {
                        throw "not found";
                    }
                    return _actions[sRequest][0];
                }
                catch (e) {
                	var _defaultActions = TESCO.Data.Global.getDefaultActions();
                    return _defaultActions[sRequest][0];
                }
            }
        }
    },
    getFormAction: function(oForm) {
        if (oForm != null && oForm != undefined && oForm.length > 0) {          
        	if(oForm.parents('#page').attr('class') == 'spc'){
                return document.URL;
            }
        	var sComparison = oForm.attr('action');            
        	if (sComparison  != '' && sComparison  != '#' && sComparison  != '#non') {
                return sComparison;
            }
            // If form action is blank, then return the current URL, request from backend.
            else if (sComparison  === '') {
                return document.URL;
            }
                
        }       
        return '';
    },    
    isArray: function(array) {
    	if( typeof Array.isArray !== 'function' ) {
    	    Array.isArray = function( arr ) {
    	        return Object.prototype.toString.call( arr ) === '[object Array]';
    	    };
    	}
    },
    lazyLoadJS: function(sJSFile) {
    	var d = $.Deferred();
    	$.getScript(sJSFile, function() {			
    		d.resolve(true);
		});		
		return d.promise();
	},
	formatURL: function(sVal) {
		return sVal.replace(/\s/g, '-');
	},
	getSiteContext: function() {
		return iSiteId === 0 ? 'direct' : 'kiosk';	
	},
	getURLParams: function(sURL) {
		var params = {};
	    sURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
	    	params[key] = value;
	    });	    
	    return params;
	},
	getURLWithoutHash: function(sURL) {			    
	    var indexOfHash = sURL.indexOf('#') || sURL.length;
	    if (indexOfHash === 0) {
	    	return sURL;
	    }
	    else {
	    	return sURL.substr(0, indexOfHash);
	    }
	},
	getHashURL: function(sURL) {
		var indexOfHash = sURL.indexOf('#') || sURL.length;
		if (indexOfHash < 0) {
			indexOfHash = sURL.length;
		}
		return sURL.substr(indexOfHash, sURL.length);
	},
	isListView: function() {
		// List view from the site has been removed 
		return false;		
	},
	refreshCurrentPage: function() {
		location.href = location.href;
	},
	formatVariantStyleAndName: function($productNameElem, variantValue, customTitleHeight) {		
		var myProductTitleHeight = 45;    	
		if (customTitleHeight !== undefined) {
			myProductTitleHeight = customTitleHeight;
		}
    	if ($productNameElem.height() > myProductTitleHeight) {
    		$productNameElem.ellipsis(myProductTitleHeight);
    		var productInfo = $productNameElem.text();
        	var variantInfo = variantValue;        	
        	var newProductText = productInfo.substring(0, (productInfo.length - 3) - (variantInfo.length));    	
        	$productNameElem.text(newProductText + "..." + variantInfo);
        	// Ellipsis again if the variant information is very long
        	if ($productNameElem.height() > myProductTitleHeight) {
        		$productNameElem.ellipsis(myProductTitleHeight);
        	}
    	}
	},
	formatVariantStyleNameInPopupBasket: function($elems, customTitleHeight) {
		$elems.each(function() {
			var $eC = $(this).next();
			if ($eC.hasClass('variantLabel')) {
				TESCO.Utils.formatVariantStyleAndName($(this), $eC.text(), customTitleHeight);
			}
			else {
				if (customTitleHeight !== undefined) {
					customTitleHeight = 54;
				}
				$(this).ellipsis(customTitleHeight);
			}
		});		
	},
	updateHashedURL: function (myHashedURL) {
		var baseURL = this.getURLWithoutHash(window.location.href);
		window.location.href = baseURL + myHashedURL;
	}
};
