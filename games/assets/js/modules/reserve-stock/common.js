define('modules/reserve-stock/common',[
    'domlib',
    'modules/common',
    'modules/validation'
], function ($, common, validationExtras) {
	var reserve = {
			storeLat: '',
			storeLong: '',
			showStoreMap: function(e){
	            $('.storeDetailsHolder').show();
				reserve.storeLat = parseFloat($('#lat').html());
				reserve.storeLong = parseFloat($('#lon').html());
				//Generate map
				var map = common.getMap( $('#stock-reservation-section'), $('.storeMapHolder'), [reserve.storeLat, reserve.storeLong]);
				reserve.locateStoreOnMap(map);
	        },
			locateStoreOnMap: function(mapObj) {
				var pushpinOptions = {
						icon: globalStaticAssetsPath +'map-pin-selected.png',
						width: 27,
						height: 42,
						typeName: 'map-pin-selected',
						textOffset: new Microsoft.Maps.Point(0,6),
						text: '1'
					};
					//create pin
					var pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(reserve.storeLat, reserve.storeLong), pushpinOptions);	
					//add pushpin to map
					mapObj.entities.push(pin);
					mapObj.setView({
						center: new Microsoft.Maps.Location(reserve.storeLat, reserve.storeLong),
						centerOffset: new Microsoft.Maps.Point(0, 10)
					});
			},
			reserveFormSubmit: function(){
				reserve.formValidate($('#personalDetailsForm'));
			},
			formValidate: function($reserveForm){
				$reserveForm.validate({
					ignore: "",
					onkeyup: function (e) {
						if (this.check(e)) {
							$(e).addClass('valid');
						} else {
							$(e).removeClass('valid');
						}
					},
					focusInvalid: true,
					onfocusout: function (e) {
						this.element(e);
					},
					errorElement: 'span',
					showErrors: function () {
						this.defaultShowErrors();
					},
					errorPlacement: function (error, element) {
						error.insertBefore(validationExtras.errorPlacementElement(element));
					},
					rules : {
						'reserve-name': {
							required: true
						},
						'reserve-email': {
							required: true
						},
						'reserve-phone': {
							 required: true,
		                      phone: {
		                           depends: function depends() {
		                               var val = $(this).val();
		                               /*jslint regexp: true*/
		                               $(this).val($.trim(val.replace(/[^0-9]/g, '')));
		                               /*jslint regexp: false*/
		                               return true;
		                           }
		                       }
						}
					},
					messages: {
						'reserve-name': {
							required: 'required name'
						},
						'reserve-email': {
							required: validationExtras.msg.email.required,
							email: validationExtras.msg.email.inValid
						},
						'reserve-phone': {
							required: validationExtras.msg.phone.required,
							phone: validationExtras.msg.phone.inValid
						}
					}
				});
			},
	        init: function(){
	        	$('a.viewStoreMap').on('click tap', function(e){
					e.preventDefault();
					e.stopPropagation();
					reserve.showStoreMap(e);
				});
				$('.storeDetailsHolder a.close').on('click tap', function(e){
					e.preventDefault();
					e.stopPropagation();
					$('.storeDetailsHolder').hide();
				});

				$('.storeInfo').on('click tap', function(e){
					e.stopPropagation();
					if($('.storeAddress').is(':visible')){
						$('.storeAddress').hide();
						$('.storeInfo').removeClass( "open" );
					}else{
						$('.storeAddress').show();
						$('.storeInfo').addClass( "open" );
					}
				});
				
				 $('.storeTime').each(function(i){
					var timeTxt = $(this).text().trim();
					if(/[0-9]/.test(timeTxt)){
						if (timeTxt.length > 11) {
							$(this).text(timeTxt.substr(0, 11));
						}
					}
				 });
				 
				validationExtras.customMethods.phone();
				reserve.reserveFormSubmit();
	        }
	                                    
	    };
		common.init.push(function() {
			reserve.init();
		});
	    return reserve;
});
