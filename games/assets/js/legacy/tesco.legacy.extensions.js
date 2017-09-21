/*!
* jQuery Overflow Ellipsis function
* Requires jQuery Core 1.4+ - http://www.jquery.com/
* Copyright 2010, Ray Brooks
* Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function($) {
	$.fn.ellipsis = function(titleLength) {
		return this.each(function(i, a){
			var origHeight;				
			if(titleLength){
				origHeight = titleLength;
			}							
			if (a.offsetHeight <= origHeight) {
				return;
			}
			//var $a = $(a).clone();
			var origText = $(a).text();
			a.style.height = "auto";								
							
			var objText;
			/***
			 * Improved performance if the input string is very long as this will cut the string up rather than 
			 * removing one letter at a time. There is a fallback to the traditional method as we cannot be sure
			 * the values returned are on the assumption each line is full rather than half complete. Therefore
			 * we also make the calculated lines returned be 1 more than the function returns, it can then use the traditional
			 * method. For smaller strings, performance will be affectged slightly but not by a great deal (iz02)
			 */
			if(titleLength) {
            	// Try and get the line-height so we can calculate if we are spanning over too many lines
            	try {
                	var lineHeight = parseInt(document.defaultView.getComputedStyle(a,null).getPropertyValue("line-height"));
                }
                catch (e) {
                	var lineHeight = a.currentStyle["lineHeight"];
                    if (lineHeight === 'Normal') {
                    	lineHeight = 18;
                    }
                    else {                        	
                    	lineHeight = parseFloat(lineHeight);                       	
                    }
               	}
               	objText = $(a).text();
				var iLines = a.offsetHeight / lineHeight; 
				var charsPerLine = objText.length / iLines;
				var expectedLines = Math.floor((origHeight / lineHeight) + 1);
				var currentLines = objText.length / charsPerLine;
				if (currentLines <= expectedLines) {
						
				}
				else {
					var result = Math.ceil(charsPerLine * expectedLines);
					$(a).text(objText.substr(0, result));
				}
            }
			
			//chop off a letter at a time until we reach the desired height
			while (a.offsetHeight > origHeight) {
				objText = $(a).text();
				a.innerHTML = objText.substr(0, objText.length - 1);
			}
						
			if (origText != $(a).text()) {
				objText = a.innerHTML;
				a.innerHTML = objText.substr(0, objText.length - 3) + "&hellip;";
			}
			
		});		
	};
})(jQuery);

/*!
 * jQuery UI Carousel 0.2.0
 *
 * Copyright 2010, George Paterson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function($, undefined) {
	$.widget("ui.carousel", {
    options: {
			scroll: 3,
			visible: 3,
			itemWidth: null,
			setWidth: false,
			track: true,
			easing: 'swing',
			speed: 'normal'
    },
		_create: function() {
			var self = this,
				o = this.options,
				el = this.element;
			self.animated = false;
			el.addClass('ui-carousel ui-widget ui-corner-all');
			$(" > ul", el).addClass('ui-carousel-slide');
			$(".ui-carousel-slide > li", el).addClass('ui-carousel-item');
			$(".ui-carousel-slide", el).wrap('<div class="ui-carousel-clip ui-widget-content ui-corner-all"></div>');

			var navigation_html = '<ul class="ui-carousel-navigation"><li class="ui-carousel-previous"><a href="#">Previous</a></li><li class="ui-carousel-next"><a href="#">Next</a></li></ul>';
			if (this.options.navigationPlacement !== undefined) {
				if (this.options.navigationPlacement) {
					this.options.navigationPlacement( navigation_html );
				}
			} else {
				$( '.ui-carousel-clip', el ).before( navigation_html );
			}

			self.dimensions();
			if(o.track) {
				self._setTracker();
			}

			self._navigationState();
			self._events();
		},
		destroy: function() {
			var el = this.element;
			$('.ui-carousel-previous a', el).unbind('click');
			$('.ui-carousel-next a', el).unbind('click');
			$('.ui-carousel-navigation', el).remove();
			$('.ui-carousel-slide', el).unwrap('<div class="ui-carousel-clip"></div>');
			$(".ui-carousel-slide > li", el).removeClass('ui-carousel-item');
			$(' > ul', el).removeClass('ui-carousel-slide');
			el.removeClass('ui-carousel ui-widget ui-corner-all');
			return this;
		},
		dimensions: function() {
			var self = this,
				o = this.options,
				el = this.element;
			self.currentItem = 1;
			self.totalItems = $('.ui-carousel-slide > li', el).length;
			if(!o.itemWidth) {
				o.itemWidth = $('.ui-carousel-slide > li', el).outerWidth(true);
			}
			self.distance = parseInt(o.itemWidth * o.scroll, 10);
			if(o.setWidth) {
				if(!o.itemWidth) {
					o.itemWidth = $(' > li', el.children('ul')).outerWidth(true);
				}
				self.carouselWidth = o.visible * o.itemWidth;
				$('.ui-carousel-clip', el).css({'width': self.carouselWidth+'px'});
			}
		},
		update: function() {
			this.totalItems = $( '.ui-carousel-slide > li', this.element ).length;
			this._updateTracker();
		},
		_setTracker: function() {
			$( '.ui-carousel-navigation', this.element ).after( this._getTracker() );
		},
		_getTracker: function() {
			var range = (this.currentItem + this.options.scroll) - 1;
			if (range > this.totalItems) {
				range = this.totalItems;
			}

			this.currentItem = this.currentItem < 1 ? 1 : this.currentItem;
			var text = this.currentItem + ' - ' + range + ' of ' + this.totalItems;
			if ((this.currentItem > this.totalItems) && this.totalItems) {
				this.carouselAnimation( 'previous', this.distance );
			} else if (this.currentItem >= this.totalItems) {
				this.currentItem = this.totalItems;
				text = this.currentItem + ' of ' + this.totalItems;
			}

			return '<p class="ui-carousel-tracker">showing ' + text + '</p>';
		},
		_updateTracker: function() {
			$( '.ui-carousel-tracker', this.element ).replaceWith( this._getTracker() );
		},
		_navigationState: function() {
			var self = this,
				el = this.element,
				o = this.options;
			if((self.currentItem - o.scroll) < 1){
				$('.ui-carousel-previous', el).addClass('ui-state-disabled');

      }
			else {
				if($('.ui-carousel-previous', el).hasClass('ui-state-disabled')) {
					$('.ui-carousel-previous', el).removeClass('ui-state-disabled');
				}
			}
			if(self.currentItem > (self.totalItems - o.scroll)){
				$('.ui-carousel-next', el).addClass('ui-state-disabled');

      }
			else {
				if($('.ui-carousel-next', el).hasClass('ui-state-disabled')) {
					$('.ui-carousel-next', el).removeClass('ui-state-disabled');
				}
			}
		},
		_events: function() {
			var self = this,
				el = this.element,
				o = this.options,
				direction = null;
			$('.ui-carousel-previous a', el).click(function(element) {
				element.preventDefault();
				direction = 'previous';
				if(self.currentItem > 1){
	          self.carouselAnimation(direction, self.distance);
	      }
			});
			$('.ui-carousel-next a', el).click(function(element) {
				element.preventDefault();
				direction = 'next';
				if(self.currentItem <= (self.totalItems - o.scroll)){
						self.carouselAnimation(direction, -self.distance);
	      }
			});
		},
		carouselAnimation: function(direction, distance) {
			var self = this,
				o = this.options,
				el = this.element;
			if(!self.animated){
				self.animated = true;
				if ($('.ui-carousel-slide', el).css('left') == 'auto') {
					current = 0;
				}
				else {
					current = parseInt($('.ui-carousel-slide', el).css('left'), 10);
				}
				if (direction == 'previous') {
					self.currentItem = self.currentItem - o.scroll;
				}
				else {
					self.currentItem = self.currentItem + o.scroll;
				}
				distance = current + distance;
				$('.ui-carousel-slide', el).animate({left: distance+"px"}, o.speed, o.easing, function() {
					if(o.track) {
						self._updateTracker();
					}
					self._navigationState();
					self.animated = false;
			  });
      }
		}
	});
	$.extend($.ui.carousel, {
		version: 0.2
	});
})(jQuery);

/*!
* jQuery Cookie plugin
*
* Copyright (c) 2010 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

/**
* Create a cookie with the given key and value and other optional parameters.
*
* @example $.cookie('the_cookie', 'the_value');
* @desc Set the value of a cookie.
* @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
* @desc Create a cookie with all available options.
* @example $.cookie('the_cookie', 'the_value');
* @desc Create a session cookie.
* @example $.cookie('the_cookie', null);
* @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
* used when the cookie was set.
*
* @param String key The key of the cookie.
* @param String value The value of the cookie.
* @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
* @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
* If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
* If set to null or omitted, the cookie will be a session cookie and will not be retained
* when the the browser exits.
* @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
* @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
* @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
* require a secure protocol (like HTTPS).
* @type undefined
*
* @name $.cookie
* @cat Plugins/Cookie
* @author Klaus Hartl/klaus.hartl@stilbuero.de
*/

/**
* Get the value of a cookie with the given key.
*
* @example $.cookie('the_cookie');
* @desc Get the value of a cookie.
*
* @param String key The key of the cookie.
* @return The value of the cookie.
* @type String
*
* @name $.cookie
* @cat Plugins/Cookie
* @author Klaus Hartl/klaus.hartl@stilbuero.de
*/
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

/*!
 * jQuery validation plug-in 1.7
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2008 Jörn Zaefferer
 *
 * $Id: jquery.validate.js 6403 2009-06-17 14:27:16Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function($){$.extend($.fn,{validate:function(options){if(!this.length){options&&options.debug&&window.console&&console.warn("nothing selected, can't validate, returning nothing");return;}var validator=$.data(this[0],'validator');if(validator){return validator;}validator=new $.validator(options,this[0]);$.data(this[0],'validator',validator);if(validator.settings.onsubmit){this.find("input, button").filter(".cancel").click(function(){validator.cancelSubmit=true;});if(validator.settings.submitHandler){this.find("input, button").filter(":submit").click(function(){validator.submitButton=this;});}this.submit(function(event){if(validator.settings.debug)event.preventDefault();function handle(){if(validator.settings.submitHandler){if(validator.submitButton){var hidden=$("<input type='hidden'/>").attr("name",validator.submitButton.name).val(validator.submitButton.value).appendTo(validator.currentForm);}validator.settings.submitHandler.call(validator,validator.currentForm);if(validator.submitButton){hidden.remove();}return false;}return true;}if(validator.cancelSubmit){validator.cancelSubmit=false;return handle();}if(validator.form()){if(validator.pendingRequest){validator.formSubmitted=true;return false;}return handle();}else{validator.focusInvalid();return false;}});}return validator;},valid:function(){if($(this[0]).is('form')){return this.validate().form();}else{var valid=true;var validator=$(this[0].form).validate();this.each(function(){valid&=validator.element(this);});return valid;}},removeAttrs:function(attributes){var result={},$element=this;$.each(attributes.split(/\s/),function(index,value){result[value]=$element.attr(value);$element.removeAttr(value);});return result;},rules:function(command,argument){var element=this[0];if(command){var settings=$.data(element.form,'validator').settings;var staticRules=settings.rules;var existingRules=$.validator.staticRules(element);switch(command){case"add":$.extend(existingRules,$.validator.normalizeRule(argument));staticRules[element.name]=existingRules;if(argument.messages)settings.messages[element.name]=$.extend(settings.messages[element.name],argument.messages);break;case"remove":if(!argument){delete staticRules[element.name];return existingRules;}var filtered={};$.each(argument.split(/\s/),function(index,method){filtered[method]=existingRules[method];delete existingRules[method];});return filtered;}}var data=$.validator.normalizeRules($.extend({},$.validator.metadataRules(element),$.validator.classRules(element),$.validator.attributeRules(element),$.validator.staticRules(element)),element);if(data.required){var param=data.required;delete data.required;data=$.extend({required:param},data);}return data;}});$.extend($.expr[":"],{blank:function(a){return!$.trim(""+a.value);},filled:function(a){return!!$.trim(""+a.value);},unchecked:function(a){return!a.checked;}});$.validator=function(options,form){this.settings=$.extend(true,{},$.validator.defaults,options);this.currentForm=form;this.init();};$.validator.format=function(source,params){if(arguments.length==1)return function(){var args=$.makeArray(arguments);args.unshift(source);return $.validator.format.apply(this,args);};if(arguments.length>2&&params.constructor!=Array){params=$.makeArray(arguments).slice(1);}if(params.constructor!=Array){params=[params];}$.each(params,function(i,n){source=source.replace(new RegExp("\\{"+i+"\\}","g"),n);});return source;};$.extend($.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusInvalid:true,errorContainer:$([]),errorLabelContainer:$([]),onsubmit:true,ignore:[],ignoreTitle:false,onfocusin:function(element){this.lastActive=element;if(this.settings.focusCleanup&&!this.blockFocusCleanup){this.settings.unhighlight&&this.settings.unhighlight.call(this,element,this.settings.errorClass,this.settings.validClass);this.errorsFor(element).hide();}},onfocusout:function(element){if(!this.checkable(element)&&(element.name in this.submitted||!this.optional(element))){this.element(element);}},onkeyup:function(element){if(element.name in this.submitted||element==this.lastElement){this.element(element);}},onclick:function(element){if(element.name in this.submitted)this.element(element);else if(element.parentNode.name in this.submitted)this.element(element.parentNode);},highlight:function(element,errorClass,validClass){$(element).addClass(errorClass).removeClass(validClass);},unhighlight:function(element,errorClass,validClass){$(element).removeClass(errorClass).addClass(validClass);}},setDefaults:function(settings){$.extend($.validator.defaults,settings);},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",accept:"Please enter a value with a valid extension.",maxlength:$.validator.format("Please enter no more than {0} characters."),minlength:$.validator.format("Please enter at least {0} characters."),rangelength:$.validator.format("Please enter a value between {0} and {1} characters long."),range:$.validator.format("Please enter a value between {0} and {1}."),max:$.validator.format("Please enter a value less than or equal to {0}."),min:$.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:false,prototype:{init:function(){this.labelContainer=$(this.settings.errorLabelContainer);this.errorContext=this.labelContainer.length&&this.labelContainer||$(this.currentForm);this.containers=$(this.settings.errorContainer).add(this.settings.errorLabelContainer);this.submitted={};this.valueCache={};this.pendingRequest=0;this.pending={};this.invalid={};this.reset();var groups=(this.groups={});$.each(this.settings.groups,function(key,value){$.each(value.split(/\s/),function(index,name){groups[name]=key;});});var rules=this.settings.rules;$.each(rules,function(key,value){rules[key]=$.validator.normalizeRule(value);});function delegate(event){var validator=$.data(this[0].form,"validator"),eventType="on"+event.type.replace(/^validate/,"");validator.settings[eventType]&&validator.settings[eventType].call(validator,this[0]);}$(this.currentForm).validateDelegate(":text, :password, :file, select, textarea","focusin focusout keyup",delegate).validateDelegate(":radio, :checkbox, select, option","click",delegate);if(this.settings.invalidHandler)$(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler);},form:function(){this.checkForm();$.extend(this.submitted,this.errorMap);this.invalid=$.extend({},this.errorMap);if(!this.valid())$(this.currentForm).triggerHandler("invalid-form",[this]);this.showErrors();return this.valid();},checkForm:function(){this.prepareForm();for(var i=0,elements=(this.currentElements=this.elements());elements[i];i++){this.check(elements[i]);}return this.valid();},element:function(element){element=this.clean(element);this.lastElement=element;this.prepareElement(element);this.currentElements=$(element);var result=this.check(element);if(result){delete this.invalid[element.name];}else{this.invalid[element.name]=true;}if(!this.numberOfInvalids()){this.toHide=this.toHide.add(this.containers);}this.showErrors();return result;},showErrors:function(errors){if(errors){$.extend(this.errorMap,errors);this.errorList=[];for(var name in errors){this.errorList.push({message:errors[name],element:this.findByName(name)[0]});}this.successList=$.grep(this.successList,function(element){return!(element.name in errors);});}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors();},resetForm:function(){if($.fn.resetForm)$(this.currentForm).resetForm();this.submitted={};this.prepareForm();this.hideErrors();this.elements().removeClass(this.settings.errorClass);},numberOfInvalids:function(){return this.objectLength(this.invalid);},objectLength:function(obj){var count=0;for(var i in obj)count++;return count;},hideErrors:function(){this.addWrapper(this.toHide).hide();},valid:function(){return this.size()==0;},size:function(){return this.errorList.length;},focusInvalid:function(){if(this.settings.focusInvalid){try{$(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin");}catch(e){}}},findLastActive:function(){var lastActive=this.lastActive;return lastActive&&$.grep(this.errorList,function(n){return n.element.name==lastActive.name;}).length==1&&lastActive;},elements:function(){var validator=this,rulesCache={};return $([]).add(this.currentForm.elements).filter(":input").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){!this.name&&validator.settings.debug&&window.console&&console.error("%o has no name assigned",this);if(this.name in rulesCache||!validator.objectLength($(this).rules()))return false;rulesCache[this.name]=true;return true;});},clean:function(selector){return $(selector)[0];},errors:function(){return $(this.settings.errorElement+"."+this.settings.errorClass,this.errorContext);},reset:function(){this.successList=[];this.errorList=[];this.errorMap={};this.toShow=$([]);this.toHide=$([]);this.currentElements=$([]);},prepareForm:function(){this.reset();this.toHide=this.errors().add(this.containers);},prepareElement:function(element){this.reset();this.toHide=this.errorsFor(element);},check:function(element){element=this.clean(element);if(this.checkable(element)){element=this.findByName(element.name)[0];}var rules=$(element).rules();var dependencyMismatch=false;for(method in rules){var rule={method:method,parameters:rules[method]};try{var result=$.validator.methods[method].call(this,element.value.replace(/\r/g,""),element,rule.parameters);if(result=="dependency-mismatch"){dependencyMismatch=true;continue;}dependencyMismatch=false;if(result=="pending"){this.toHide=this.toHide.not(this.errorsFor(element));return;}if(!result){this.formatAndAdd(element,rule);return false;}}catch(e){this.settings.debug&&window.console&&console.log("exception occured when checking element "+element.id
+", check the '"+rule.method+"' method",e);throw e;}}if(dependencyMismatch)return;if(this.objectLength(rules))this.successList.push(element);return true;},customMetaMessage:function(element,method){if(!$.metadata)return;var meta=this.settings.meta?$(element).metadata()[this.settings.meta]:$(element).metadata();return meta&&meta.messages&&meta.messages[method];},customMessage:function(name,method){var m=this.settings.messages[name];return m&&(m.constructor==String?m:m[method]);},findDefined:function(){for(var i=0;i<arguments.length;i++){if(arguments[i]!==undefined)return arguments[i];}return undefined;},defaultMessage:function(element,method){return this.findDefined(this.customMessage(element.name,method),this.customMetaMessage(element,method),!this.settings.ignoreTitle&&element.title||undefined,$.validator.messages[method],"<strong>Warning: No message defined for "+element.name+"</strong>");},formatAndAdd:function(element,rule){var message=this.defaultMessage(element,rule.method),theregex=/\$?\{(\d+)\}/g;if(typeof message=="function"){message=message.call(this,rule.parameters,element);}else if(theregex.test(message)){message=jQuery.format(message.replace(theregex,'{$1}'),rule.parameters);}this.errorList.push({message:message,element:element});this.errorMap[element.name]=message;this.submitted[element.name]=message;},addWrapper:function(toToggle){if(this.settings.wrapper)toToggle=toToggle.add(toToggle.parent(this.settings.wrapper));return toToggle;},defaultShowErrors:function(){for(var i=0;this.errorList[i];i++){var error=this.errorList[i];this.settings.highlight&&this.settings.highlight.call(this,error.element,this.settings.errorClass,this.settings.validClass);this.showLabel(error.element,error.message);}if(this.errorList.length){this.toShow=this.toShow.add(this.containers);}if(this.settings.success){for(var i=0;this.successList[i];i++){this.showLabel(this.successList[i]);}}if(this.settings.unhighlight){for(var i=0,elements=this.validElements();elements[i];i++){this.settings.unhighlight.call(this,elements[i],this.settings.errorClass,this.settings.validClass);}}this.toHide=this.toHide.not(this.toShow);this.hideErrors();this.addWrapper(this.toShow).show();},validElements:function(){return this.currentElements.not(this.invalidElements());},invalidElements:function(){return $(this.errorList).map(function(){return this.element;});},showLabel:function(element,message){var label=this.errorsFor(element);if(label.length){label.removeClass().addClass(this.settings.errorClass);label.attr("generated")&&label.html(message);}else{label=$("<"+this.settings.errorElement+"/>").attr({"for":this.idOrName(element),generated:true}).addClass(this.settings.errorClass).html(message||"");if(this.settings.wrapper){label=label.hide().show().wrap("<"+this.settings.wrapper+"/>").parent();}if(!this.labelContainer.append(label).length)this.settings.errorPlacement?this.settings.errorPlacement(label,$(element)):label.insertAfter(element);}if(!message&&this.settings.success){label.text("");typeof this.settings.success=="string"?label.addClass(this.settings.success):this.settings.success(label);}this.toShow=this.toShow.add(label);},errorsFor:function(element){var name=this.idOrName(element);return this.errors().filter(function(){return $(this).attr('for')==name;});},idOrName:function(element){return this.groups[element.name]||(this.checkable(element)?element.name:element.id||element.name);},checkable:function(element){return/radio|checkbox/i.test(element.type);},findByName:function(name){var form=this.currentForm;return $(document.getElementsByName(name)).map(function(index,element){return element.form==form&&element.name==name&&element||null;});},getLength:function(value,element){switch(element.nodeName.toLowerCase()){case'select':return $("option:selected",element).length;case'input':if(this.checkable(element))return this.findByName(element.name).filter(':checked').length;}return value.length;},depend:function(param,element){return this.dependTypes[typeof param]?this.dependTypes[typeof param](param,element):true;},dependTypes:{"boolean":function(param,element){return param;},"string":function(param,element){return!!$(param,element.form).length;},"function":function(param,element){return param(element);}},optional:function(element){return!$.validator.methods.required.call(this,$.trim(element.value),element)&&"dependency-mismatch";},startRequest:function(element){if(!this.pending[element.name]){this.pendingRequest++;this.pending[element.name]=true;}},stopRequest:function(element,valid){this.pendingRequest--;if(this.pendingRequest<0)this.pendingRequest=0;delete this.pending[element.name];if(valid&&this.pendingRequest==0&&this.formSubmitted&&this.form()){$(this.currentForm).submit();this.formSubmitted=false;}else if(!valid&&this.pendingRequest==0&&this.formSubmitted){$(this.currentForm).triggerHandler("invalid-form",[this]);this.formSubmitted=false;}},previousValue:function(element){return $.data(element,"previousValue")||$.data(element,"previousValue",{old:null,valid:true,message:this.defaultMessage(element,"remote")});}},classRuleSettings:{required:{required:true},email:{email:true},url:{url:true},date:{date:true},dateISO:{dateISO:true},dateDE:{dateDE:true},number:{number:true},numberDE:{numberDE:true},digits:{digits:true},creditcard:{creditcard:true}},addClassRules:function(className,rules){className.constructor==String?this.classRuleSettings[className]=rules:$.extend(this.classRuleSettings,className);},classRules:function(element){var rules={};var classes=$(element).attr('class');classes&&$.each(classes.split(' '),function(){if(this in $.validator.classRuleSettings){$.extend(rules,$.validator.classRuleSettings[this]);}});return rules;},attributeRules:function(element){var rules={};var $element=$(element);for(method in $.validator.methods){var value=$element.attr(method);if(value){rules[method]=value;}}if(rules.maxlength&&/-1|2147483647|524288/.test(rules.maxlength)){delete rules.maxlength;}return rules;},metadataRules:function(element){if(!$.metadata)return{};var meta=$.data(element.form,'validator').settings.meta;return meta?$(element).metadata()[meta]:$(element).metadata();},staticRules:function(element){var rules={};var validator=$.data(element.form,'validator');if(validator.settings.rules){rules=$.validator.normalizeRule(validator.settings.rules[element.name])||{};}return rules;},normalizeRules:function(rules,element){$.each(rules,function(prop,val){if(val===false){delete rules[prop];return;}if(val.param||val.depends){var keepRule=true;switch(typeof val.depends){case"string":keepRule=!!$(val.depends,element.form).length;break;case"function":keepRule=val.depends.call(element,element);break;}if(keepRule){rules[prop]=val.param!==undefined?val.param:true;}else{delete rules[prop];}}});$.each(rules,function(rule,parameter){rules[rule]=$.isFunction(parameter)?parameter(element):parameter;});$.each(['minlength','maxlength','min','max'],function(){if(rules[this]){rules[this]=Number(rules[this]);}});$.each(['rangelength','range'],function(){if(rules[this]){rules[this]=[Number(rules[this][0]),Number(rules[this][1])];}});if($.validator.autoCreateRanges){if(rules.min&&rules.max){rules.range=[rules.min,rules.max];delete rules.min;delete rules.max;}if(rules.minlength&&rules.maxlength){rules.rangelength=[rules.minlength,rules.maxlength];delete rules.minlength;delete rules.maxlength;}}if(rules.messages){delete rules.messages;}return rules;},normalizeRule:function(data){if(typeof data=="string"){var transformed={};$.each(data.split(/\s/),function(){transformed[this]=true;});data=transformed;}return data;},addMethod:function(name,method,message){$.validator.methods[name]=method;$.validator.messages[name]=message!=undefined?message:$.validator.messages[name];if(method.length<3){$.validator.addClassRules(name,$.validator.normalizeRule(name));}},methods:{required:function(value,element,param){if(!this.depend(param,element))return"dependency-mismatch";switch(element.nodeName.toLowerCase()){case'select':var val=$(element).val();return val&&val.length>0;case'input':if(this.checkable(element))return this.getLength(value,element)>0;default:return $.trim(value).length>0;}},remote:function(value,element,param){if(this.optional(element))return"dependency-mismatch";var previous=this.previousValue(element);if(!this.settings.messages[element.name])this.settings.messages[element.name]={};previous.originalMessage=this.settings.messages[element.name].remote;this.settings.messages[element.name].remote=previous.message;param=typeof param=="string"&&{url:param}||param;if(previous.old!==value){previous.old=value;var validator=this;this.startRequest(element);var data={};data[element.name]=value;$.ajax($.extend(true,{url:param,mode:"abort",port:"validate"+element.name,dataType:"json",data:data,success:function(response){validator.settings.messages[element.name].remote=previous.originalMessage;var valid=response===true;if(valid){var submitted=validator.formSubmitted;validator.prepareElement(element);validator.formSubmitted=submitted;validator.successList.push(element);validator.showErrors();}else{var errors={};var message=(previous.message=response||validator.defaultMessage(element,"remote"));errors[element.name]=$.isFunction(message)?message(value):message;validator.showErrors(errors);}previous.valid=valid;validator.stopRequest(element,valid);}},param));return"pending";}else if(this.pending[element.name]){return"pending";}return previous.valid;},minlength:function(value,element,param){return this.optional(element)||this.getLength($.trim(value),element)>=param;},maxlength:function(value,element,param){return this.optional(element)||this.getLength($.trim(value),element)<=param;},rangelength:function(value,element,param){var length=this.getLength($.trim(value),element);return this.optional(element)||(length>=param[0]&&length<=param[1]);},min:function(value,element,param){return this.optional(element)||value>=param;},max:function(value,element,param){return this.optional(element)||value<=param;},range:function(value,element,param){return this.optional(element)||(value>=param[0]&&value<=param[1]);},email:function(value,element){return this.optional(element)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);},url:function(value,element){return this.optional(element)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);},date:function(value,element){return this.optional(element)||!/Invalid|NaN/.test(new Date(value));},dateISO:function(value,element){return this.optional(element)||/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);},number:function(value,element){return this.optional(element)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);},digits:function(value,element){return this.optional(element)||/^\d+$/.test(value);},creditcard:function(value,element){if(this.optional(element))return"dependency-mismatch";if(/[^0-9-]+/.test(value))return false;var nCheck=0,nDigit=0,bEven=false;value=value.replace(/\D/g,"");for(var n=value.length-1;n>=0;n--){var cDigit=value.charAt(n);var nDigit=parseInt(cDigit,10);if(bEven){if((nDigit*=2)>9)nDigit-=9;}nCheck+=nDigit;bEven=!bEven;}return(nCheck%10)==0;},accept:function(value,element,param){param=typeof param=="string"?param.replace(/,/g,'|'):"png|jpe?g|gif";return this.optional(element)||value.match(new RegExp(".("+param+")$","i"));},equalTo:function(value,element,param){var target=$(param).unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){$(element).valid();});return value==target.val();}}});$.format=$.validator.format;})(jQuery);;(function($){var ajax=$.ajax;var pendingRequests={};$.ajax=function(settings){settings=$.extend(settings,$.extend({},$.ajaxSettings,settings));var port=settings.port;if(settings.mode=="abort"){if(pendingRequests[port]){pendingRequests[port].abort();}return(pendingRequests[port]=ajax.apply(this,arguments));}return ajax.apply(this,arguments);};})(jQuery);;(function($){if(!jQuery.event.special.focusin&&!jQuery.event.special.focusout&&document.addEventListener){$.each({focus:'focusin',blur:'focusout'},function(original,fix){$.event.special[fix]={setup:function(){this.addEventListener(original,handler,true);},teardown:function(){this.removeEventListener(original,handler,true);},handler:function(e){arguments[0]=$.event.fix(e);arguments[0].type=fix;return $.event.handle.apply(this,arguments);}};function handler(e){e=$.event.fix(e);e.type=fix;return $.event.handle.call(this,e);}});};$.extend($.fn,{validateDelegate:function(delegate,type,handler){return this.bind(type,function(event){var target=$(event.target);if(target.is(delegate)){return handler.apply(target,arguments);}});}});})(jQuery);


(function($){	
	var ARROW_HEIGHT_LR = 36;
	var ARROW_HEIGHT_TB = 15;	
	var ARROW_WIDTH_LR = 15;
	var ARROW_WIDTH_TB = 27;
	
	// Initialising the tooltip is just a case of adding in the arrow tip,
	// positioning it in the horizontally center if required, and also
	// wrap the content in the jt-tooltip-content class. Also call the
	// initialise callback event if one was specified.
	function initialise(settings) {
		var tooltipParent = settings.tooltip.parent();
		var content = settings.tooltip.addClass('jt-tooltip').children().detach();
		settings.tooltip.prepend('<div class="jt-tooltip-content"></div>');
		settings.tooltip.children('div.jt-tooltip-content').append(content);
		settings.tooltip.prepend('<span class="tooltip"></span>');
		
		if (settings.showCloseButton) {
			settings.tooltip.prepend('<a href="#" class="tooltip-close default-close" title="Close Popup">Close</a>');
			settings.tooltip.children('div.jt-tooltip-content').addClass('has-close-button');
		} 
		

		if(settings.loadTooltipInline){
			settings.trigger.next('.inline-tooltip-content').append(settings.tooltip.detach());
		}
		else if(settings.tooltip.hasClass('gcd-block')){
			$('#dg-gcd-blocks').append(settings.tooltip.detach());
		}
		else{
			$(document.body).append(settings.tooltip.detach());
		}
				
		if ($.isFunction(settings.onInitialise)) {
			settings.onInitialise(settings);
		}
		settings.initialised = true;
	}

	// Reposition the tooltip. This is done each time the user clicks
	// or hovers on the trigger. It places the tooltip above or below
	// the trigger depending on the position of the trigger in the
	// window and whether or not the tooltip will fit above or below.
	function reposition(settings) {
		var trigger = settings.trigger;
		var tooltip = settings.tooltip;
		var pos = trigger.offset();
		var tip = settings.tooltip.find('span.tooltip');
		var tipExcess = 0;
		var tipPosition = 0;
		var positionDifference = 0;
		
		var tooltipProps = {
			left: 0,
			top: 0,
			height: 0,
			width: 0, 
			midPoint: 0,
			leftPosShifted: false		
		};
		
		var triggerProps = {
			me: null,
			left: 0,
			top: 0,
			height: 0,
			width: 0,
			toTop: 0,
			toBottom: 0,
			contentWidth: function() {
				var $clonedOriginal = triggerProps.me.clone();				
				$clonedOriginal.html('<span>' + $clonedOriginal.html() + '</span>');
				$('body').append($clonedOriginal);
				var width = $clonedOriginal.find('span:first').width();
				$clonedOriginal.remove();
				if (width === 0) {
					width = this.width;
				}
				return width;
			}
		};
				
		tooltipProps.height = tooltip.outerHeight(false); 
		tooltipProps.width = tooltip.outerWidth(false);
		tooltipProps.midPoint = (tooltipProps.width / 2);
		
		triggerProps.me = settings.trigger;
		triggerProps.left = pos.left;
		triggerProps.top = pos.top;
		triggerProps.height = trigger.outerHeight(false);
		triggerProps.width = trigger.outerWidth(false);
		triggerProps.midPoint = triggerProps.left + (triggerProps.contentWidth() / 2);
		triggerProps.toTop = triggerProps.top - $(window).scrollTop();
		triggerProps.toBottom = $(window).height() - triggerProps.toTop - triggerProps.height;			
		
		tooltip.removeClass('tooltip-position-above tooltip-position-below tooltip-position-right tooltip-position-left tooltip-position-center');
				
		if (triggerProps.toBottom < tooltipProps.height && triggerProps.toTop > triggerProps.toBottom) {
			settings.placement = 'above';						
		}		
				
		switch (settings.placement) {
			case "below" :
			case "above" :
			 				tooltipProps.left = triggerProps.left;
							positionDifference = Math.abs(tooltipProps.width - triggerProps.width) / 2;
							if (tooltipProps.width > triggerProps.width) {
								tooltipProps.left = triggerProps.left - positionDifference;
							}							
							else {
								tooltipProps.left = triggerProps.left + positionDifference;
							}							
							tooltipProps.left = checkIfTooltipExceedsBody(tooltipProps);
							tipPosition = tooltipProps.midPoint - (ARROW_WIDTH_TB / 2);
							if (tooltipProps.leftPosShifted) {
								tipExcess = Math.abs(tooltipProps.left - tooltipProps.prevLeft);								
								if (tooltipProps.movedWasNegative) {
									tipPosition = tipPosition + tipExcess; 
								}
								else {
									tipPosition = tipPosition - tipExcess;
								}
							}							
							tooltipProps.top = (triggerProps.top + triggerProps.height);
							if (settings.placement === "above") {
								tooltipProps.top = (triggerProps.top - tooltipProps.height);
								tooltip.addClass('tooltip-position-above');
							}
							else {
								tooltip.addClass('tooltip-position-below');
							}
							tip.css('left', tipPosition + 'px');
							break;			
			case "left" :	tooltipProps.left = (triggerProps.left - tooltipProps.width) - 20;
							tooltipProps.top = ((triggerProps.top + (triggerProps.height / 2) ) - (tooltipProps.height / 2));
							tooltip.addClass('tooltip-position-left');
							tipPosition = (tooltipProps.height / 2) - (ARROW_HEIGHT_LR / 2);
							tip.css('top', tipPosition + 'px');
							break;
			case "right" : 	tooltipProps.left = (triggerProps.left + triggerProps.contentWidth()) + ARROW_WIDTH_LR + 20;
							tooltipProps.top = ((triggerProps.top + (triggerProps.height / 2) ) - (tooltipProps.height / 2))
							tooltip.addClass('tooltip-position-right');
							tipPosition = (tooltipProps.height / 2) - (ARROW_HEIGHT_LR / 2);
							tip.css('top', tipPosition + 'px');
							break;
			case "center" : tooltipProps.left = (($(window).width() / 2) - (tooltipProps.width / 2));
							tooltipProps.top = ($(window).scrollTop() + ($(window).height()/ 2)) - (tooltipProps.height / 2);
							tooltip.addClass('tooltip-position-center');							
							break;
			case "center-top" : tooltipProps.left = (($(window).width() / 2) - (tooltipProps.width / 2));
								tooltipProps.top = ($(window).scrollTop() + ($(window).height() / 3)) - (tooltipProps.height / 2);
								tooltip.addClass('tooltip-position-center');							
							break;
		}

		if(!settings.loadTooltipInline){
			tooltip.css({'top': tooltipProps.top + 'px', 'left': tooltipProps.left + 'px'});	
		}
		
	}
	
	function applyAutoHide(settings) {
		if (settings.autohide) {
			if (settings.viewCounter > 0) {
				if (settings.timeout) {
					window.setTimeout(function(){
						if (settings.viewCounter == 1) {
							settings.tooltip.hide();
							settings.viewCounter = 0;
						} else if (settings.viewCounter > 1) {
							settings.viewCounter--;
						}
					}, settings.timeout);
				} else {
					settings.viewCounter = 0;
					settings.tooltip.hide();
				}
			}
		}
	}
	
	function checkIfTooltipExceedsBody(myPosition) {
		fMaxLeftPosition = $('#content').offset().left + $('#content').width();	
		fMinLeftPosition = $('#content').offset().left;
		if ((myPosition.left + myPosition.width) > fMaxLeftPosition) {
			myPosition.leftPosShifted = true;
			myPosition.movedWasNegative = true;
			myPosition.prevLeft = myPosition.left;
			return fMaxLeftPosition - myPosition.width;
		}
		else if(myPosition.left < fMinLeftPosition) {
			myPosition.leftPosShifted = true;
			myPosition.movedWasNegative = false;
			myPosition.prevLeft = myPosition.left;
			return fMinLeftPosition;
		}
		else {
			return myPosition.left;
		}
	}
	
	function isTooltipAlready(settings) {
		if (settings.trigger.data('tooltip') !== undefined) {
			return true;
		}		
		if (settings.tooltip.find('div.jt-tooltip-content').length > 0) {
			return true;
		}
		return false;
	}
	
	function handleAjaxContent(settings) {		
		if (settings.ajaxLoader) {			
			var $elem = settings.tooltip.find('div.jt-tooltip-content');
			$elem.html('<p/>');
			$elem = $elem.find("p").css({'height': '30px', 'width': '100px'});		
			TESCO.Utils.addAjaxLoader($elem, settings.ajaxLoaderMessage);
		}		
		//Register a "done" method to the deferred object
		settings.ajaxContent(settings).done(function(resp) {
			settings.tooltip.find('div.jt-tooltip-content').html(resp);
			/***
			 * We need to reposition the tooltip again as the ajax'd content has now been injected
			 * and it will affect the height of the tooltip
			 */			
			reposition(settings);
		});
	}
	
	function refreshToolTip(settings) {
		settings.tooltip.find("div.jt-tooltip-content").remove();		
	}
	
	//Check if the if tooltip has content, this is important for Ajax based content. 
	function isTooltipPopulated(settings) {
		return settings.tooltip.find("div.jt-tooltip-content").html() !== '' ? true : false;	
	}
	
	function handleTooltipCore(settings) {
		if ($.isFunction(settings.beforeShow)) {
			if (settings.beforeShow(settings) == false) {
				return false;
			}
		}
		//Show tooltip and add inner content div
		if (settings.viewCounter == 0) {
			if (settings.initialised == false) {
				initialise(settings);
			}
		}
		settings.viewCounter++;
		
		if(settings.refreshToolTip){
			refreshToolTip(settings);									
		}									
		if (!isTooltipPopulated(settings)) {
			if ($.isFunction(settings.ajaxContent)) {
				handleAjaxContent(settings);									
			}
			else {										
				//applyAutoHide(settings);
			}
		}
		else {									
			//applyAutoHide(settings);
		}
		reposition(settings);
		settings.tooltip.show();
		$("div.jt-tooltip-content").find('input[type="submit"]:visible,a:visible').eq(0).focus();
	}
	
	// jQuery plugin implementation
	$.fn.tooltip = function(options) {
		var settings = {
			initiate: 'hover, focus, click',
			autohide: true,
			tooltip: false,
			placement: 'below',
			ajaxContent: '',
			refreshToolTip: false,
			showCloseButton: false,
			loadTooltipInline: false,
			autoReposition: true,
			bindInternalEvents: true,
			delay: 30,
			eventToHide: '',
			ajaxLoader: false,
			ajaxLoaderMessage: ''
		};

		// Install tooltip for each entry in jQuery object.
		return this.each(function() {
			var me = $(this);
			// Timer used to introduce delay for hovering
			var myTimer;

			if (options) {
				$.extend(settings, options);
			}
			settings.viewCounter = 0;
			settings.initialised = false;
			settings.trigger = me;
			
			// If there's no tooltip setting then we
			// check to see if one is defined as a data
			// attribute on the trigger.
			if (settings.tooltip === false) {
				if (me.data('tooltip-id')) {
					var tooltip = $('#' + me.data('tooltip-id'));
					if (tooltip.length == 1) {
						settings.tooltip = tooltip;
					}
				}
			}
			
			// We should have a valid jQuery object
			// for our tooltip setting now.
			if (settings.tooltip instanceof jQuery) {
				settings.tooltipPresent = isTooltipAlready(settings);
				
				/***
				 * We need to initiate the tooltip without binding to the triggers click event as the trigger can change do to ajax calls
				 * manipulating and changing content, hence the "now".
				**/
				if (settings.initiate.indexOf('now') != -1) {
					if(settings.reInitialise && settings.tooltipPresent && !settings.tooltip.hasClass('jt-tooltip')){
						initialise(settings);
					}
					
					if (settings.viewCounter == 0) {						
						if (settings.initialised == false) {
							if (!settings.tooltipPresent) {							
								initialise(settings);
							}
						}
						reposition(settings);												
					}
					if ($.isFunction(settings.beforeShow)) {
						if (settings.beforeShow(settings) == false) {
							return false;
						}
					}
					if(settings.refreshToolTip){						
						refreshToolTip(settings);						
					}									
					if (!isTooltipPopulated(settings)) {
						if ($.isFunction(settings.ajaxContent)) {
							settings.tooltip.show();
							handleAjaxContent(settings);
						}
						else {
							settings.tooltip.show();
							applyAutoHide(settings);
						}
					}
					else {
						settings.tooltip.show();
						applyAutoHide(settings);
					}
	
					if (settings.eventToHide !== '') {							
						me.unbind(settings.eventToHide).bind(settings.eventToHide, function(e) { 
							e.stopPropagation();
							applyAutoHide(settings);								
						});
					}
					
					//$(".jt-tooltip-content").find('input[type="submit"]:visible,a:visible').eq(0).focus();
					settings.viewCounter++;
				}
				
				// If the user hovers over the trigger then
				// we show the tooltip, and vice versa when
				// they hover out of the trigger, unless the
				// user is hovering over the tooltip itself.				
				if (settings.initiate.indexOf('hover') != -1) {
					me.hover(
						function(){							
							myTimer = setTimeout(function() {
								handleTooltipCore(settings);							
							}, settings.delay);							
						},
						function(){
							clearInterval(myTimer);
							if (settings.autohide) {
								if (settings.viewCounter > 0) {
									if (settings.timeout) {
										window.setTimeout(function(){
											if (settings.viewCounter == 1) {
												settings.tooltip.hide();
												settings.viewCounter = 0;
											} else if (settings.viewCounter > 1) {
												settings.viewCounter--;
											}
										}, settings.timeout)
									} else {
										settings.viewCounter = 0;
										settings.tooltip.hide();
									}
								}
							}
						}
					);
				}

				if (settings.initiate.indexOf('focus') != -1) {
					me.focus(function(){
						handleTooltipCore(settings);						
						$("div[class*=tooltip]").find('input[type="submit"]:visible,a:visible:last').focusout(function(){settings.tooltip.hide();});
						return false;
					});
				} else {
					if (settings.bindInternalEvents) {
						me.focus(function(){
							return false;
						});
					}
				}
				
				// Click is more straightforward than hover,
				// we just show the tooltip on click and leave
				// the hiding to a custom event or the timeout.
				if (settings.initiate.indexOf('click') != -1) {
					me.click(function(){
						handleTooltipCore(settings);
						return false;
					});
				} else {
					if (settings.bindInternalEvents) {
						me.click(function(){
							return false;
						});
					}
				}
				
				// This takes care of the hovering over the tooltip.
				// Same checks apply as for the hover state.
				settings.tooltip.focus(
					function(){
						if (settings.initialised == false) {
							initialise(settings);
						}
						if (settings.autoReposition) {
							reposition(settings);
						}
						settings.viewCounter++;
						settings.tooltip.show();
						
					}	
				);				
				settings.tooltip.hover(
					function(){
						if (settings.initialised == false) {
							initialise(settings);
						}
						if (settings.autoReposition) {
							reposition(settings);
						}
						settings.viewCounter++;
						settings.tooltip.show();
					},
					function(){
						if (settings.autohide) {
							if (settings.viewCounter > 0) {
								// if view counter is greater than zero yet the
								// tooltip isn't visible then something else
								// changed the display of the tooltip
								if (settings.tooltip.is(':visible') == false) {
									settings.viewCounter = 0;
								}
								else if (settings.timeout) {
									window.setTimeout(function(){
										if (settings.viewCounter == 1) {
											settings.tooltip.hide();
											//settings.trigger.focus();
											settings.viewCounter = 0;
										} else {
											settings.viewCounter--;
										}
									}, settings.timeout)
								} else {
									settings.viewCounter = 0;
									settings.tooltip.hide();
									//settings.trigger.focus();
								}
							}
						}
					}
				);
				
				// To create a "Close" button just add a class of
				// 'tooltip-close' to an element.
				settings.tooltip.find('.tooltip-close').click(function(){
					settings.tooltip.hide();
					settings.trigger.focus();
					settings.viewCounter = 0;
					return false;
				});

				me.data('tooltip', settings);
				settings.tooltip.data('trigger', settings.trigger);
			}
		});
	};

}) (jQuery);


/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    return self;
  })();
  
})(jQuery,this);

/*
 * jQuery $.browser re-implementation to support legacy plugins that use $.browser
 * The $.browser property is deprecated in jQuery 1.3, and its functionality may be moved to a team-supported plugin in a future release of jQuery.
 */
// Limit scope pollution from any deprecated API
(function() {

    var matched, browser;

	// Use of jQuery.browser is frowned upon.
	// More details: http://api.jquery.com/jQuery.browser
    // jQuery.uaMatch maintained for back-compat
    jQuery.uaMatch = function( ua ) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
            /(msie) ([\w.]+)/.exec( ua ) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
            [];

        return {
            browser: match[ 1 ] || "",
            version: match[ 2 ] || "0"
        };
    };

    matched = jQuery.uaMatch( navigator.userAgent );
    browser = {};

    if ( matched.browser ) {
        browser[ matched.browser ] = true;
        browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if ( browser.chrome ) {
        browser.webkit = true;
    } else if ( browser.webkit ) {
        browser.safari = true;
    }

    jQuery.browser = browser;

    jQuery.sub = function() {
        function jQuerySub( selector, context ) {
            return new jQuerySub.fn.init( selector, context );
        }
        jQuery.extend( true, jQuerySub, this );
        jQuerySub.superclass = this;
        jQuerySub.fn = jQuerySub.prototype = this();
        jQuerySub.fn.constructor = jQuerySub;
        jQuerySub.sub = this.sub;
        jQuerySub.fn.init = function init( selector, context ) {
            if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
                context = jQuerySub( context );
            }

            return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
        };
        jQuerySub.fn.init.prototype = jQuerySub.fn;
        var rootjQuerySub = jQuerySub(document);
        return jQuerySub;
    };

})();