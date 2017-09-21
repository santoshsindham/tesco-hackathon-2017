/*global define:true, Microsoft: true, console: true */
define(['domlib', 'modules/common', 'modules/breakpoint'], function($, common, breakpoint){

	var storeDetails = {

		storesGroup: null,

		infoboxes : [],

		toggle: function (e, settings) {
		    var params = settings || {};
			e.preventDefault();
			var store = $(e.target).closest('li').find('.store-details-container');

			if (storeDetails.activeStoreDetails.length && storeDetails.activeStoreDetails[0] === store[0]) {
				storeDetails.close();
				return false;
			}
			//if were mobile create a virtual page
			if (breakpoint.mobile) {
			    var content = $('<div></div>').html(store.clone()).html();

			    $.extend(params, {
			        content: content,
			        closeSelector: '.back'
			    });

			    if (params.removePrevious) {
			        common.virtualPage.removePage();
			    }

				common.virtualPage.show(params);
				storeDetails.mobileSelectedStore = store.closest('.stores');
			} else{
				// hide any clubcard-exchange info popups if visible
				$('.clubcard-exchange').find('.info').hide();

				// close the stored active (if any)
				if (storeDetails.activeStoreDetails.length) {
					storeDetails.close();
				}

				$('.datepicker-tooltip').removeClass('visible').hide();
				store.addClass('active').show();

				// store the new active
				storeDetails.activeStoreDetails = store;

				$('body').on('tap click', function (e) {
					var $target = $(e.target);

					if (!$target.hasClass('close') && !$target.hasClass('details') && !$target.parents('.store-details-container.active').length) {
						storeDetails.close();
					}
				});
			}

			return false;
		},


		close: function(e){
			if (e) {
				e.preventDefault();
			}

			storeDetails.activeStoreDetails.removeClass('active').hide();
			storeDetails.activeStoreDetails = [];

			$('body').unbind('tap click');

			return false;
		},


		map: function(e){
			e.preventDefault();

			var activePinIndex = 0;

			//show panel and select the right tab
			$(e.target).closest('ul').find('.selected').removeClass('selected');
			$(e.target).closest('li').addClass('selected');
			$(e.target).closest('.inner').find('.store-info-details').hide();
			$(e.target).closest('.inner').find('.map-container ').show();
			
			//get variables
			var store = $(e.target).closest('.store-details-container'),
				group = (breakpoint.mobile) ? storeDetails.mobileSelectedStore : $(e.target).closest('.stores'),
				groupLocations = [];

			//get location details for group (show 3 of group)
			group.find('.geo').each(function(i, el){
				var lat = parseFloat($('.lat', this).text(), 10),
					lon = parseFloat($('.lon', this).text(), 10);

				groupLocations.push({
					lat: lat,
					lon: lon
				});

				//active store index
				var storeLat = parseFloat($('.lat', store.find('.geo')).text(), 10),
					storeLon = parseFloat($('.lon', store.find('.geo')).text(), 10);
				if(lat === storeLat && lon === storeLon){
					activePinIndex = i;
				}
			});

			//create locations
			var locations = [], i;
			for(i=0;i<groupLocations.length;i++){
				locations.push(new Microsoft.Maps.Location(groupLocations[i].lat, groupLocations[i].lon));
			}

			//generate map
			var map = common.getMap(store, $('.map-div'), locations);

			//create pins
			var createPins = function(i){
				//set group locations
				var pushpinOptions = {
					icon: (activePinIndex === i)? globalStaticAssetsPath + 'map-pin-selected.png': globalStaticAssetsPath + 'map-pin.png',
					width: 27,
					height: 42,
					typeName: (activePinIndex === i)?'map-pin-selected':'map-pin',
					textOffset: new Microsoft.Maps.Point(0,6),
					text: (i+1).toString()
				};

				//create pin
				var pin = new Microsoft.Maps.Pushpin(locations[i], pushpinOptions);

				//create infobox
				var infoboxContent = $('<div></div>').html(group.find('.vcard.store-address').eq(i).clone());
				infoboxContent.find('.driving-distance').remove();
				infoboxContent.find('.vcard').prepend('<div href="#" class="close icon" data-icon="y"></div>');
				infoboxContent.find('.vcard').prepend(group.find('.store-name').eq(i).clone());


				var infoboxOptions = {
					visible: false,
					htmlContent: infoboxContent.html(),
					showCloseButton: true
				};

				var infobox = new Microsoft.Maps.Infobox(locations[i], infoboxOptions);

				var infoClick = Microsoft.Maps.Events.addHandler(infobox, 'click', function(vi){
					var isClose = $(vi.originalEvent.target).is('.close');
					if(isClose){
						infobox.setOptions({visible: false});
					}
				});
				

				storeDetails.infoboxes.push(infobox);
				
				//attach click events to pushpin
				var pinClick = Microsoft.Maps.Events.addHandler(pin, 'click', function(){
					//hide visible infoboxes
					var infoboxes = [];
					for(i=0;i<map.entities.getLength();i++){
						//not a push pin
						var entity = map.entities.get(i);
						if(entity._typeName === 'Infobox'){
							//hide if visible
							if(entity._options.visible){
								entity.setOptions({visible: false});
							}
						}
					}

					infobox.setOptions({visible: true});
					map.setView({
						center: infobox.getLocation(),
						centerOffset: new Microsoft.Maps.Point(0, 130)
					});
				});

				//add pushpin to map
				map.entities.push(pin);
				map.entities.push(infobox);
			};
			
			Microsoft.Maps.Events.addHandler(map, 'viewchangestart', function (e) {
				if (map.getTargetZoom() !== map.getZoom()) {
					// Fix for #52322
					// storeDetails.closeInfobox();
				}
			});
			Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
				for (var i = 0, len = storeDetails.infoboxes.length; i < len; i++) {
					storeDetails.infoboxes[i].setOptions({visible: false});
				}								
			});

			//loop through group locations and create pins with info boxes!
			for(i=0;i<groupLocations.length;i++){
				createPins(i);
			}

			return false;
		},

		closeInfobox: function (e) {
			$('.vcard.store-address').hide();
		},

		mapInfo: function(vi){
//			console.log(vi);
		},


		details: function(e){
			e.preventDefault();

			$(e.target).closest('ul').find('.selected').removeClass('selected');
			$(e.target).closest('li').addClass('selected');

			$(e.target).closest('.inner').find('.store-info-details').show();
			$(e.target).closest('.inner').find('.map-container ').hide();

			return false;
		},


		reset: function(){
			$('#virtual-page').remove();
			storeDetails.mobileSelectedStore = null;
			$('.store-details-container.active').removeClass('active').hide();

		},


		// current active store details panel
		activeStoreDetails: [],

		/*
		storeDetailsCheck: function (toggle, parent) {
			var event = (common.isTouch() && !common.isWindowsPhone())? 'tap':'click';

			if (this.activeStoreDetailsClose !== null) {
				this.activeDropdownClose();
			}

			this.activeStoreDetailsClose = toggle;

			$('body').on(event, function (e) {
				if(!$(e.target).parents(parent).length){
					toggle();
				}
			});
		},
		clearCancelStoreDetails: function () {
			$('body').unbind('tap click');
			this.activeStoreDetailsClose = null;
		},
		*/

		init: function(){
			$(document).on('click', '.store-options-module .stores .details', storeDetails.toggle);
			$(document).on('click', '.store-details-container .tabs .show-map', storeDetails.map);
			$(document).on('click', '.store-details-container .tabs .show-details', storeDetails.details);
			$(document).on('click', '.store-details-container .close', storeDetails.close);
		}
	};


	breakpoint.mobileIn.push(storeDetails.reset);
	breakpoint.mobileOut.push(storeDetails.reset);


	return storeDetails;

});