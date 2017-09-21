/**********************************************************
* Module
* Analytics - Class/Namespace to contain Analytics & MVT
**********************************************************/

define(['domlib', 'modules/tesco.utils'], function($, utils){

	/**********************************************************
	* Module
	* WebMetrics - Class to handle Web metrics
	* Object "s" contains the instance of the web analytics on a global level via inline JS
	**********************************************************/

	function WebMetrics() {
	    this.init.apply( this, arguments );
	}

	WebMetrics.prototype = {
	    init: function() {
	        if (typeof(s) !== "undefined") {
	            this.oAnalytics = jQuery.extend({}, s);
	        }
	    },
	    submit: function(oJSON) {
	        if (typeof(s) !== "undefined") {
	            if (oJSON !== '' || oJSON !== null) {
	            	if (typeof (oJSON[0]) === 'object') {
		            	if (!this.isEmpty(oJSON[0])) {
		            		this.populateProperties(oJSON);
				            this.removeExceptions();
				            /* Take copy of original "s" object as .t() method is not aware of "this"
				             * all functions within "s" are referencing "s" rather than the instance!
				             */
				            var orig_s = s;
				            s = this.oAnalytics;
				            // Execute default Web Metrics call
				            s.t();
				            s = orig_s;
		            	}
	            	}
		        }
	        }
	    },
	    populateProperties: function(oAnalyticsData) {
	    	if (typeof(oAnalyticsData) !== 'object') {
	        	oAnalyticsData = $.parseJSON(oAnalyticsData);
	        }
	    	if (typeof (oAnalyticsData[0]) === 'object') {
				for(var propName in oAnalyticsData[0]) {
		        	this.oAnalytics[propName] = oAnalyticsData[0][propName];
		        }
		    }
	    },
	    removeExceptions: function() {
	    	// Business rule to remove the "products" property when the "events" property contains "scCheckout"
	    	if (!window.isKiosk() && this.oAnalytics['events'] === 'scCheckout') {
	    		if (!this.oAnalytics['onLoad']) {
	    			delete this.oAnalytics['products'];
	    		}
	    	}
	    },
	    isEmpty: function(oAnalyticsData) {
	    	for (var prop in oAnalyticsData) {
	            if (oAnalyticsData.hasOwnProperty(prop)) {
	            	return false;
	            }
	        }
	        return true;
	    }
	}

	/**********************************************************
	* Module
	* MVT - Class to handle MVT (Test & Target).
	* This is a wrapper to proxy the call to the predefined function (fSinglePageCheckoutMVT) controlled by the Publishing team
	**********************************************************/
	function MVT() {
		this.init.apply(this, arguments);
	}

	MVT.prototype = {
		init: function() {
			// Dummy init function
		},
		testAndTarget: function() {
			/***
			 * MVTAfterAjax will be the unique function name which publishing control through test and target.
			 * If the function exists, it will execute, if not, the function will return.
			 */
			if (typeof(MVTAfterAjax) !== 'undefined') {
				if ($.isFunction(MVTAfterAjax)) {
					/***
					 * Wrapping in try/catch just in case the JS in the controlled function is invalid as we do not
					 * want to cause any knock on effect in the subsequent Ajax calls.
					 */
					try {
						MVTAfterAjax.apply(undefined, arguments);
					}
					catch (e) {	}
				}
			}
		}
	}


	var Analytics = {
		WebMetrics: WebMetrics,
		MVT: MVT
	};

	return Analytics;

});
