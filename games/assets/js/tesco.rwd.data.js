/**
 * Carousel Module : Image carousel
 */
/*global define: true */

define(['domlib', 'modules/common'], function($, breakpoint, common){
/**********************************************************

* DataLayer - Class to handle AJAX IO
* 
**********************************************************/
	function DataLayer(settings) {		
		if (settings) {
			$.extend(DataLayer.Properties, settings);
		}
		
		if (DataLayer.Properties.singleton) {
			if ( arguments.callee._singletonInstance ) {
	    		return arguments.callee._singletonInstance;
	  		}
	  		arguments.callee._singletonInstance = this;
	  	}
		this.init.apply( this, arguments );
	}

	DataLayer.Properties = {
		postUrl: '',
		lastPostUrl: '',
		lastRequest: '',
		lastResponseCode: '',
		method: 'POST',
		dataType: 'json',
		singleton: false,
		currentlyExecuting: false,
		maxQueueLength: 99,
		delayBetweenRequests: false,
		delayRequest: 1000,
		isDestroyed: false,
		timeout: 60000,
		errorHandler: {
			409: 'refresh',
			500: 'refresh'		
		}
	},
	
	DataLayer.prototype = { 		
		init: function() {
			this._queue = [];
		},	
		
		get: function(url, data, oElem, handlerNS, sRequest, doneCallback, failCallback, completeCallback) {			
			// if the timeout is the default check if the backend is returning a different value
			if (DataLayer.Properties.timeout === 60000) {
				DataLayer.Properties.timeout = TESCO.Data.Global.getTimeout();
			}
			
			$.ajaxSetup({			   
			   timeout: DataLayer.Properties.timeout
			});
			
			//If Safari 6, then add cache-control header to stop the infamous Ajax POST cache issue.
			try {
				if ($.browser.safari) {
					var userAgent = navigator.userAgent;
					userAgent = userAgent.substring(userAgent.indexOf('Version/')+8);
					version = userAgent.substring(0,userAgent.indexOf('.'));				
					if (version === "6") {
						$.ajaxSetup({
							headers: {'cache-control': 'no-cache, must-revalidate, max-age=0, no-store'}
						});
					}
				}				
			}
			catch (e) {
				
			}
			
			// No handler object passed, so use our TESCO default handler			
			if (handlerNS === null) {
				handlerNS = TESCO.Data;			
			}
									
			if (DataLayer.Properties.singleton === true && DataLayer.Properties.currentlyExecuting) {
				if(this._queue.length <= DataLayer.Properties.maxQueueLength) {
					TESCO.Utils.addAjaxLoaderPerRequest(sRequest, oElem);
					this._queue.push(arguments);
				}				
			}
			else {
				this.execute(url, data, oElem, handlerNS, sRequest, doneCallback, failCallback, completeCallback);
			}
		},
		execute: function(url, data, oElem, handlerNS, sRequest, doneCallback, failCallback, completeCallback) {
		
			DataLayer.Properties.currentlyExecuting = true;		
		
			var _self = this;
			this.objXHTTP = $.ajax({				
				url: url,
				type: DataLayer.Properties.method,
				dataType: DataLayer.Properties.dataType,
				data: data,				
				beforeSend: function() {
					// Add ajax loaders over relevant modules
					TESCO.Utils.addAjaxLoaderPerRequest(sRequest, oElem);
				},
				success: function(oResp, textStatus, jqXHR) {
					var _callbackRes;
					if ($.isFunction(doneCallback)) {
						_callbackRes = doneCallback(oResp, oElem);
					}
					
					if (_callbackRes === 'destroy') { 
						DataLayer.Properties.isDestroyed = true;
						return;
					}
					
					// If request is inline, e.g. store details, surpress default complete method as this call the default data handler method.
					if (!TESCO.Utils.isInlineRequest(sRequest)) {
						_self.done(oResp, oElem, sRequest, handlerNS);
					}
				},
				error: function(xhr, status, errorThrown) {
					if ($.isFunction(failCallback)) {
						failCallback(xhr, status, errorThrown, oElem);
					}
					_self.fail(xhr, status, errorThrown, oElem);
				},
				complete: function(xhr, status) {					
					_self.complete(xhr, status, oElem, sRequest);
					
					if ($.isFunction(completeCallback)) {
						completeCallback(xhr, status, oElem, sRequest);
					}
				}
			});					

		},

		fail: function(xhr, status, errorThrown, oElem) {
			/*Below check is to re-direct the user to sign-in/register page if session expires
			 * href is hard-coded as per dev team. should find a generic way to handle this. 
			 * */
			 if(status == 'parsererror' && xhr.responseText.indexOf('Sign In') > 0 ){
				 location.href = '/' + TESCO.Utils.getSiteContext() + '/my/register.page';
			 }
			
			//Default timeout behaviour is to reload the current page and also on error.
			//|| status === 'error'
			if (status === 'timeout') {
				TESCO.Utils.refreshCurrentPage(); 
			}
			
			//Handler for HTTP error codes			
			switch (DataLayer.Properties.errorHandler[xhr.status]) {
				case 'refresh': TESCO.Utils.refreshCurrentPage(); 
								break;
			}
						
			DataLayer.Properties.currentlyExecuting = false;
			DataLayer.Properties.isDestroyed = false;
		},
	
		done: function(oResp, oElem, sRequest, handlerNS) {	
			handlerNS.handler(oResp, oElem);
			TESCO.Utils.removeAjaxLoadersPerRequest(oElem, sRequest);			
		},
	
		complete: function(xhr, status, oElem, sRequest) {
			// If the request needs to be thrown out 
			if (DataLayer.Properties.isDestroyed) {
				DataLayer.Properties.isDestroyed = false;
			}
			else {
				DataLayer.Properties.lastResponseCode = this.objXHTTP.status;
				DataLayer.Properties.lastPostUrl = this.objXHTTP.url;
				DataLayer.Properties.lastRequest = sRequest;
				DataLayer.Properties.currentlyExecuting = false;
				
				// Check if the dependency has been loaded
				if (TESCO.Analytics) {
					var _oMVT = new TESCO.Analytics.MVT();				
					_oMVT.testAndTarget.apply(undefined, arguments);
				}
			}			
			this.processQueue();				
		},
		processQueue: function() {
			if (DataLayer.Properties.singleton === true) {
				if (this._queue.length > 0) {
					if (DataLayer.Properties.delayBetweenRequests) {
						setTimeout(	function() {
							this.execute.apply(this, this._queue.shift())
						}, DataLayer.Properties.delayRequest);
					}
					else {
						this.execute.apply(this, this._queue.shift());
					}
				}
			}		
		}
	}			
		
	
	return DataLayer;
	
//TESCO.DataLayer = DataLayer;


TESCO.Data = {
	/*** 
    *   From the oElem (DOM element which triggered data), we can determine which module has been triggered
    **/
    handler: function(oJSON, oElem) {
        // Based on JSON response, we need to look up each element in object, relate it to the module and then lookup the module for the DOM element                
        $.each(oJSON, function(k, v) {
            if (k === 'analytics') {
                if (TESCO.Analytics) {
	            	var _oWebAnalytics = new TESCO.Analytics.WebMetrics();
	                _oWebAnalytics.submit(v);
                }
            }
            else if(k === 'redirection') {
            	var sLocation = v;
            	// Added condition to check if "error" attribute exists
            	if (oJSON.error != undefined) {
                	sLocation += '&error='+oJSON.error; 
                }
            	location.href = sLocation; 
            }
            else {               
                // Get Module information, dom element, message and if it is a global element
				var _myModuleInfo = TESCO.Utils.getModuleInformation(k);
				var _myModuleSelector = _myModuleInfo[0];
                // Update DOM with markup returned
                var _markup = TESCO.Data.cleanMarkup(v);                
                try {
                    // Do not allow no html to be inserted
                    if (_markup != '') {
                        $(_myModuleSelector).get(0).innerHTML = _markup;
                    }
                }
                catch(e) {
                    
                }
            }         
        });        
    },
    cleanMarkup: function(sHTML) {              
        if (sHTML != null) {
            return sHTML.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm, '').replace(/<(link|meta)[^>]+>/g,'');
        }
        else {
            return '';
        }
    }
}

/***
 * This global object will hold all requests, actions etc required for the any Ajax module loaded
 * Any module using the framework will have to add its UNIQUE requests, actions etc via the method below
 * Collections/Array have been made private to stop accidental removal or corrupting other modules requests
 */ 
 
TESCO.Data.Global = function() {
	var myInlineRequests = [];
	var myRequests = [];	
	var myModules = {};
	var myActions = {};	         
	var myDefaultActions = {};
	var myTimeout = 60000;
	
	return {
		init: function(oOptions) {			
			$.extend(true, myInlineRequests, oOptions.inlineRequests);
			$.extend(true, myRequests, oOptions.requests);
			$.extend(true, myModules, oOptions.modules);
			$.extend(true, myActions, oOptions.actions);
			$.extend(true, myDefaultActions, oOptions.defaultActions);
			if (oOptions.timeout) { 
				if (!isNaN(oOptions.timeout)) {
					myTimeout = parseInt(oOptions.timeout);
				}
			}
		},
		addInlineRequests: function(oRequests) {
			$.extend(true, myInlineRequests, oRequests);	
		},
		getInlineRequests: function() {
			return myInlineRequests;			
		},
		addRequests: function(oRequests) {
			$.extend(true, myRequests, oRequests);	
		},
		getRequests: function() {
			return myRequests;			
		},
		addModules: function(oModules) {
			$.extend(true, myModules, oModules);	
		},
		getModules: function() {
			return myModules;			
		},
		addActions: function(oActions) {
			$.extend(true, myActions, oActions);	
		},
		getActions: function() {
			return myActions;			
		},
		addDefaultActions: function(oDefaultActions) {
			$.extend(true, myDefaultActions, oDefaultActions);	
		},
		getDefaultActions: function() {
			return myDefaultActions;			
		},
		setTimeout: function(iVal) {
			myTimeout = parseInt(iVal);
		},
		getTimeout: function() {
			return myTimeout;
		}		
	}
}();
