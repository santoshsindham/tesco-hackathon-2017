/*global define: true */
define(['domlib','modules/common', 'modules/breakpoint', '../loader', 'modules/tesco.utils', 'modules/tesco.data', 'jquery.datepicker'], function($, common, breakpoint, loader, utils, data){

	var datepickerValue,
		datepicker = {

			group: null,
			isNominatedDayPage: false,
			setIntialDate: function(target){
				var parentForm = $(target).parents('form');
				if($(parentForm).find('select[id^="ship-dates-sg"]').find('option').length){
					var firstDate = $(parentForm).find('select[id^="ship-dates-sg"]').find('option').first().val();
					var lastDate = $(parentForm).find('select[id^="ship-dates-sg"]').find('option').last().val();

					if ($(parentForm).find('.dDeliveryDate').length) {
						var sptDateFirst = $(parentForm).find('.dDeliveryDate').val().split('-');
						sptDateFirst1 = sptDateFirst[0]+'/'+sptDateFirst[1]+'/'+sptDateFirst[2];
					}
					else {
						var sptDateFirst = firstDate.split('-');
						sptDateFirst1 = sptDateFirst[2]+'/'+sptDateFirst[0]+'/'+sptDateFirst[1];
					}


					var sptDatelast = lastDate.split('-');
					sptDatelast1 = sptDatelast[2]+'/'+sptDatelast[0]+'/'+sptDatelast[1];

					$('.datepicker-tooltip .datepicker').data('first',sptDateFirst1).val(sptDateFirst1);
					$('.datepicker-tooltip .datepicker').data('last',sptDatelast1);
				}
				else{
					$('.datepicker-tooltip .datepicker').data('first',new Date());
				}
			},

			toggle: function(e){

				var target = e;

				if(e){
					e.preventDefault();
					e.stopPropagation();
					target = $(e.target);
				}

				datepicker.setIntialDate(target);

				var tooltip = target.closest('.datepicker-tooltip-module').find('.datepicker-tooltip');
				if(!target.hasClass('disabled')){
					if(breakpoint.mobile){
						var tooltip = target.closest('.datepicker-tooltip-module');
						var content = $.trim($('<div></div>').html(tooltip.clone(true)).html());

						datepicker.group = target.closest('.delivery-options');

						common.virtualPage.show({
							content: content,
							customClass: 'datepicker-tooltip',
							closeSelector: '.close-button',
							callbackReady: function(el){
								tooltip.show();
								el.find('div.datepicker').remove();
								datepicker.setIntialDate(target);
								datepicker.create(el);
								if(datepicker.isNominatedDayPage) {
									if(tooltip.hasClass('home-delivery-container')){
										$('.delivery-options-list .date-text-show, .delivery-options-list .expected .note, .delivery-options-list .datepicker-note').hide();
									}
									else{
										$('.delivery-options-list li:nth-child(1), .delivery-options-list li:nth-child(2)').not('.datepicker-wrapper-holder').hide();
										$('.delivery-options-list .date-text-show, .datepicker-tooltip-module .date-time').hide();
									}
									$('#virtual-page .datepicker-tooltip').show();
									datepicker.isNominatedDayPage = true;
								}
								if($('.datepicker-tooltip-module').hasClass('collection-details-picker')){
									$('#virtual-page .datepicker-tooltip .selected-date-info .label').text('Your delivery date:');
								}

								$('#virtual-page .datepicker-tooltip').show();

								if(el.find('.available.selected').length <= 0){
									el.find('.available:eq(0)').addClass('selected');
								}
								if($('.datepicker-tooltip-module').hasClass('collection-details-picker')){
									$('.selected-date-info label').text('Your chosen date:');
								}
								$('#virtual-page .datepicker-tooltip').find('.available.selected').trigger('click');
							},
							callbackOut : function (cb, e) {
								if (e && ($(e.target).hasClass('close-button') || e.type === "hashchange")) {
									if(datepicker.isNominatedDayPage) {
										$('.delivery-options-list .date-text-show').show();
									}
								}
								var editButton = $('.datepicker-cta').hasClass('edit');
								if($('.datepicker-cta').is(':visible') && !editButton){
									tooltip.find('.date-time').show();
								}
								else{
									if($('.datepicker-tooltip-module .selected-delivery-date').length > 0){
										tooltip.find('.date-time').hide();
									}
								}
							}
						});
						$('#virtual-page .datepicker-tooltip-module').children().not('form:eq(0)').hide();
						$('#virtual-page .datepicker-cta, #virtual-page .custom-radio, #virtual-page .type, #virtual-page .selected-delivery-date').hide();

						$('#virtual-page .datepicker-tooltip').show();

					}else{

						if(tooltip.hasClass('visible')){
							tooltip.removeClass('visible').hide();
						}else{
							tooltip.addClass('visible').show();
							//only create a new date picker if there is none!
							tooltip.find('div.datepicker').remove();
							datepicker.create(tooltip);
							if(tooltip.find('.available.selected').length <= 0){
								tooltip.find('.available:eq(0)').addClass('selected');
								tooltip.find('.available.selected').trigger('click');
							}
							else{
								tooltip.find('.available.selected').trigger('click');
							}
						}
					}
				}
				return false;
			},

		create: function(target){

			var dp = target.find('.datepicker').datepicker({
				update: function(e, d){
					var date = new Date(e);
					var dateString = this.longDayNames[date.getDay()] + ' ' +
						date.getDate() + this.suffix(date.getDate()) + ' ' +
						this.monthNames[date.getMonth()] + ' '+
						date.getFullYear(),
						dateVar = (date.getMonth() + 1)+'-'+date.getDate() + '-' +date.getFullYear();

					target.closest('.datepicker-tooltip').find('.selected-date').text(dateString);
					if(d != undefined && d!= "FREE"){
						target.closest('.datepicker-tooltip').find('.selected-date-info .value').html('&pound;'+d);
					}
					else{
						target.closest('.datepicker-tooltip').find('.selected-date-info .value').html(d);
					}

					$('.dds-details-chosen-date-var').val(dateVar);
					if($('.date-text-show').length) {
						datepicker.isNominatedDayPage = true;
						/* Code snippet adding for client side update date format */
						var tday = (""+date.getDate()).length != 1 ? date.getDate() : '0'+ date.getDate(),
							tmonth = (""+(date.getMonth() + 1)).length != 1 ? (date.getMonth() + 1): ('0'+(date.getMonth() + 1));
						$('.datepicker-tooltip').find('.dDeliveryDate').val(date.getFullYear()+'-'+tmonth+'-'+tday);
					}

					datepickerValue = dateString;
				}
			});
			datepicker.unselectableDates(target);
		},
		unselectableDates : function (target) {
			target.find('.datepicker .calendar .overlap.available').removeClass('available');
			target.find('.datepicker .next, .datepicker .prev').on('click', function () {
				target.find('.datepicker .calendar .overlap.available').removeClass('available');
			});
		},



		update: function(result){
			$('.datepicker-tooltip-module', datepicker.group).html(result.deliveryOptions);
			common.customRadio(datepicker.group);
		},


		get: function(e){
			if(datepicker.isNominatedDayPage) {
			//  $('.date-text-show p').html($('.selected-date').first().text()+'<div>&pound;7.5</div>');
			  $('.date-text-show div').show();
			  if(!breakpoint.mobile){
				  $('.date-text-show p').html($('.selected-date').first().text());
			     // datepicker.toggle(e);
			  } else {
				 $('.date-text-show p').html($('.selected-date').last().text());
				//common.virtualPage.close();
			  }
			//  return false;
			}
			var target = $(e);

			if(e.type){
				e.preventDefault();
				target = $(e.target);
			}
			if(!breakpoint.mobile){
				datepicker.group = target.closest('.delivery-options, .collection-details');
				datepicker.toggle(e);
			}else{
				common.virtualPage.close();
			}

			$(target).parents('form').find('.selectDeliveryOptionHiddenBtn').remove();

			loader($('.datepicker-tooltip-module', datepicker.group), 'Updating your delivery details');

			var $form = $(target).parents('form').length > 0 ? $(target).parents('form') : $('.delivery-block .confirm-date').closest('form');
	        var $elem = $(target);
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();

	        if (target.closest('.datepicker-tooltip-module').hasClass('collection-details-picker')) {
	        	var request = 'updateCollection';
	        	var url = $elem.attr('data-url');
	        }
	        else{
	        	var request = 'selectSlots';
	        	var url = utils.getFormAction($form);
	        }

	        if(breakpoint.mobile){
				DL.get(url, myData, $elem, data.Handlers.Checkout, request, function(result) {
					datepicker.update(result);
					datepicker.bindDeliverySaverEvents();
					$('.delivery-options .loader, .collection-details .loader').remove();
					if(datepicker.isNominatedDayPage) {
						$('.datepicker-tooltip-module .loader').remove();
						$('.delivery-options-list .date-text-show').show();
						$('.delivery-options-list .date-text-show .long-date').text(datepickerValue);
					}

					}, null, function(){
						if ($('label.invalid2').length){
							$('.datepicker-tooltip-module .loader').remove();
						}
						if($('.datepicker-tooltip-module .selected-delivery-date').length > 0){
							$('label.invalid2').hide();
						}
					common.customRadio(datepicker.group);
				});
			}
			else{
				DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(result) {
					$('.delivery-options .loader, .collection-details .loader').remove();
					if($('.datepicker-tooltip-module .selected-delivery-date').length > 0){
						$('label.invalid2').hide();
					}
					if(datepicker.group.find('.selected-delivery-date').length){
						datepicker.group.find('.date-time').hide();
					}
					datepicker.bindDeliverySaverEvents();
					datepicker.update(result);
				});
			}

			return false;
		},
		bindDeliverySaverEvents: function(e){
			if($(".delivery-saver-message")){
				require(['modules/common', 'modules/checkout/payment'], function(common, payment) {
					payment.bindEvents();
				});
			}
		},

		init: function(){
			if(!$('#integrated-registration').length){
				$(document).on('click', '.datepicker-cta', datepicker.toggle);
				$(document).on('click', '.datepicker-tooltip .close, .datepicker-tooltip .close-button', datepicker.toggle);
				$(document).on('click', '.datepicker-tooltip .confirm-date', datepicker.get);
				if (!common.isIOS() && !navigator.userAgent.match(RegExp('Version/8'))) {
					$(document).on('click', function () {
						$('.datepicker-tooltip-module').find('.datepicker-tooltip').removeClass('visible').hide();
					});
				}
			}
			$(document).on('click', '.datepicker-tooltip', function (e) {
				e.stopPropagation();
			});
		}
	};

	return datepicker;

});
