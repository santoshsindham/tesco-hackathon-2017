define([
	'domlib',
	'modules/breakpoint',
	'modules/common'
], function($, breakpoint, common){

	/** @namespace */
	var trackParcel = {

		accordionSpeed: 300,
		isAnimating: false,

		toggleTracking: function(e,dgId,dataHeight) {
			var self		=	trackParcel;
			var	dgParent	=	$('#' + dgId);
			
			if(self.isAnimating === false){
				if(dgParent.hasClass('open')) {
					self.closeTracking(e,dgParent);
				} else {
					self.openTracking(e,dgParent,dataHeight);
				}
			}
		},
		
			openTracking: function(e,dgId,dataHeight) {		
			var self			=	trackParcel;
			var currentEl		=	$(e.target).closest('a.tertiary-button');
			var parentEl		=	currentEl.parent().parent();
			var dataEl			=	parentEl.find('table');
			var iconEl			=	currentEl.find('span');
			
			parentEl.addClass('open');
			dataEl.css('height',dataHeight);

			currentEl.removeAttr("onclick");			
			
			e.preventDefault();
			e.stopPropagation();
			iconEl.attr('data-icon', '1');
			currentEl.text('Hide tracking details').append(iconEl);
			
			self.isAnimating = true;
			currentEl.addClass('open');			
			dataEl.parent().stop(true).animate({
				opacity: 1						//this should be calculated
			}, trackParcel.accordionSpeed, function() {
				$(this).removeClass('hidden');
				$(this).show();
				self.isAnimating = false;
			});
		},

		closeTracking: function(e,dgId) {
			var self			=	trackParcel;
			var currentEl		=	$(e.target).closest('a.tertiary-button');
			var parentEl		=	currentEl.parent().parent();
			var dataEl			=	parentEl.find('table');
			var iconEl			=	currentEl.find('span');
			e.preventDefault();
			e.stopPropagation();

			if(dgId.hasClass('open')) {	
				self.isAnimating = true;
				dgId.removeClass('open');
				currentEl.attr("onclick", "s.tl(this,'o','ParcelTrackingButton', null); return false;");
				dataEl.parent().stop(true).animate({
					opacity: 0
				}, trackParcel.accordionSpeed, function() {	
					$(this).addClass('hidden');
					$(this).hide();
					iconEl.attr('data-icon', '2');
					currentEl.text('Full tracking details').append(iconEl).removeClass('open');
					self.isAnimating = false;
				});
			}			
		},
		
		createUniqueDeliveries: function() {
			var deliveryGroup = $('div.parcel-details');
			if(deliveryGroup) {
				var	i = 1;				
				deliveryGroup.each(function(i) {
					$(this).attr('id', 'trackParcel-' + i);
				});
			}
		},
		
		eventBindsDesktop: function() {
			
			if($('.parcel-tracking-container').length){
				$('.parcel-tracking-container').each(function(){
					$('.parcel-tracking-container ul li span').not(".icon").each(function( index ) {
					$(this).css('margin-left', - ($(this).outerWidth()/2) + 5) 
				});
					$(this).find('li.status.active:last').addClass('live'); 
				}); 
			}
			$('a.track-parcel').attr("onclick", "s.tl(this,'o','ParcelTrackingButton', null); return false;");

			$('a.track-parcel').each(function() {
				$(this).on('click', function(e) {
					var	$target			=	$(e.target).closest('a');
					var	dgParent		=	$target.parent().parent();
					var	dgId			=	dgParent.attr('id');
					var	dataLoaded		=	dgParent.find('#trackingPopup').length;
					var	dataHeight;
					e.preventDefault();
					e.stopPropagation();
					$('div.track-parcel-data .track-parcel').toggle();
					function calcHeight() {
						var dataTable		=	dgParent.find('#trackingPopup table');
						var	tmpTableHeight	=	dataTable.data('tableHeight');
						//if($('div.track-parcel-data'))
						
						if(typeof tmpTableHeight === 'undefined') {
							var	tmpTable	=	dataTable.clone();
							dgParent.find('.delivery-type').append(tmpTable);
							tmpTable.removeClass('hidden').css({
								'position' : 'absolute',
								'top' : '0',
								'display' : 'block',
								'left' : '-3000px'
							});
							dataHeight		=	tmpTable.height();
							tmpTable.remove();
							dataTable.data('tableHeight', dataHeight);
							
							return dataHeight;							
						} else {							
							dataHeight	=	dataTable.data('tableHeight');
							return dataHeight;
						}						
					}
					
					if(dataLoaded > 0) {						
						trackParcel.toggleTracking(e,dgId,calcHeight());
					} else {					
						var	spanVal	=	$target.find('span').attr('data-icon');
						if(spanVal !== 'o') {
							var	trackingNumber	=	$target.data('trackingNumber'),
								parcelId		=	$target.data('parcelId'),
								counter			=	$target.data('counter'),
								orderId			=	$target.data('orderId'),
								shipGroupId		=	$target.data('shipGroupId'),
								contextRoot		=	$target.data('contextRoot'),
								url				=	'/' + contextRoot + '/services/parcel-tracking-info.page';
							
							$.ajax({
								type: 'get',
								url: url,
								data: {'trackingId' : trackingNumber, 'parcelNo' : counter, 'orderId' : orderId, 'shipGroupId' : shipGroupId},
								dataType: 'html',
								timeout: 10000,
								success: function(data) {
									var	tableData	=	$(data).find('#trackingPopup');
									var	trackingUrl	=	$('#trackingURL');

									if(trackingUrl.length > 0) {
										window.open(trackingUrl + trackingNumber.val(), '_blank');														
									} else {
										dgParent.find('.delivery-type').append(tableData);
										trackParcel.toggleTracking(e,dgId,calcHeight());
									}
								},
								error: function(jqXHR, textStatus, errorThrown) {
									alert("The parcel tracking information failed to load - " + textStatus, errorThrown);
								}
							});
						}
					}
				});
			});
		},
		
		eventBindsDevice: function() {
			var	trackingToggle	=	$("a.track-parcel");
			trackingToggle.attr("onclick", "s.tl(this,'o','ParcelTrackingButton', null); return false;");
			
			trackingToggle.each(function() {
				var	spanVal	=	$(this).find('span').attr('data-icon');
				if(spanVal !== 'o') {
					$(this).find('span').attr('data-icon', 'r');
				}
			});

			$('.delivery-type #trackingPopup').hide();
			$('.delivery-type #trackingPopup').addClass('hidden');
			$('.parcel-details').removeClass('open');
	
			trackingToggle.on('tap click', function(e) {				
				var	$target			=	$(e.target).closest('a');				
				var	spanValue		=	$target.find('span').attr('data-icon');
				var	dgParent		=	$target.parent().parent();
				var	dgId			=	dgParent.attr('id');
				var	dataLoaded		=	dgParent.find('#trackingPopup').length;
				var backLink		=	"<a href='#' class='back'><span class='icon' data-icon='g' aria-hidden='true'></span> Back to My Order Details</a>";
				e.preventDefault();
				e.stopPropagation();
				//$(dgId).removeClass('open');
				function dataConversion() {
					var tableId		=	$target.parent().find('table');
					var	tableData	=	tableId.clone();
					var dataEmpty	=	tableData.find('span.tracking-empty');
					var	rootData	=	tableData.html();
					if(dataEmpty.length > 0) {					
						var	cleanData	=	rootData.replace(/<tr>/g,"<div>").replace(/<\/tr>/g,"</div>").replace(/<tbody>/g,"<div class='track-parcel-table'>").replace(/<\/tbody>/g,"</div>").replace(/\s{2,}/g, ' ');
					} else {
						var	cleanData	=	rootData.replace(/<tr>/g,"<div>").replace(/<\/tr>/g,"</div>").replace(/<td colspan="4">/g,"<span class='title'>").replace(/<th>/g,"<span>").replace(/<\/th>/g,"</span>").replace(/<td>/g,"<span>").replace(/<\/td>/g,"</span>").replace(/<tbody>/g,"<div class='track-parcel-table'>").replace(/<\/tbody>/g,"</div>").replace(/\s{2,}/g, ' ');
					}
					
					var trackingUrlValue =tableData.find('input#trackUrl').val();
					
					if(typeof trackingUrlValue !== 'undefined'){
						cleanData += "<a class='track-parcel' style='float:right;padding-right:6px;' href='javascript:void(0);' onclick='window.open(\""+trackingUrlValue+"\",\"mywindow\"); return false;'>View courier parcel tracking <span data-icon='o' class='icon'></span></a><div style='clear:both;'></div>";
					}
					
					var	content		=	"<h1 class='page-title'>Track parcel</h1><div class='product-description'><section class='product-specifications'>" + backLink + cleanData + backLink + "</section></div>";
					var opts		=	{
						content: content,
						closeSelector: '.back'
					};
					
					return opts;					
				}
				
				if(spanValue !== 'o') {
					if(dataLoaded > 0) {
						common.virtualPage.show(dataConversion());
					} else {
						var	trackingNumber	=	$target.data('trackingNumber'),
							parcelId		=	$target.data('parcelId'),
							counter			=	$target.data('counter'),
							orderId			=	$target.data('orderId'),
							shipGroupId		=	$target.data('shipGroupId'),
							shippingMethod	=	$target.data('shippingMethod'),
							fulfillerType	=	$target.data('fulfillerType'),
							contextRoot		=	$target.data('contextRoot'),
							url				=	'/' + contextRoot + '/services/parcel-tracking-info.page';
						
						$.ajax({
							type: 'get',
							url: url,
							data: {'trackingId' : trackingNumber, 'parcelNo' : counter, 'orderId' : orderId,'shipGroupId' : shipGroupId,  'shippingMethod' : shippingMethod, 'fulfillerType' : fulfillerType},
							dataType: 'html',
							timeout: 10000,
							success: function(data) {
								var	tableData	=	$(data).find('#trackingPopup');								
								var	trackingUrl	=	$('#trackingURL');

								if(trackingUrl.length > 0) {
									window.open(trackingUrl + trackingNumber.val(), '_blank');														
								} else {
									dgParent.find('.delivery-type').append(tableData);
									tableData.hide();
									common.virtualPage.show(dataConversion());									
								}
							},
							error: function(jqXHR, textStatus, errorThrown) {
								alert("The parcel tracking information failed to load - " + textStatus, errorThrown);
							}
						});
					}
				}
			});
		},
		
		resetBinds: function() {
			$('.delivery-group-block').removeClass('open');
			$('.parcel-details table.track-parcel-data').removeAttr('style').addClass('hidden');
			$('a.track-parcel').unbind('tap click').removeClass('open').each(function() {
				var spanVal	=	$(this).find('span').attr('data-icon');
				if(spanVal !== 'o') {
					$(this).html('Track parcel <span class="icon" data-icon="2"></span>');
				}
			});			
		},
	
		init: function () {	
			if(common.isPage('orderDetails')) {
				if(breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet) {
					trackParcel.eventBindsDevice();
				} else if(breakpoint.desktop || breakpoint.largeDesktop) {
					trackParcel.eventBindsDesktop();
					if(window.location.href.indexOf("trackOrder=true") > -1){
						$("a.track-parcel:first").trigger('click');
						var pos = $('a.track-parcel:first').offset().top;
						pos= pos - 100;
						$('html, body').animate({scrollTop:pos}, 'fast');
						$("a.track-parcel:first").css({
							'border-color' : '#00a1e0',
							'background' : '#00a1e0',
							'color' : '#fff',
							'text-decoration' : 'none'
						});
					}
				}			
				trackParcel.createUniqueDeliveries();
			}
		},		

	};
	
	breakpoint.mobileIn.push(function(){
		trackParcel.init();
	});
	breakpoint.mobileOut.push(function(){
		trackParcel.resetBinds();
	});
	
	breakpoint.vTabletIn.push(function(){
		trackParcel.init();
	});
	breakpoint.vTabletOut.push(function(){
		trackParcel.resetBinds();
	});
	
	breakpoint.hTabletIn.push(function(){
		trackParcel.init();
	});
	breakpoint.hTabletOut.push(function(){
		trackParcel.resetBinds();
	});
	
	breakpoint.desktopIn.push(function(){
		trackParcel.init();
	});
	breakpoint.desktopOut.push(function(){
		trackParcel.resetBinds();
	});
	
	breakpoint.largeDesktopIn.push(function(){
		trackParcel.init();
	});
	breakpoint.largeDesktopOut.push(function(){
		trackParcel.resetBinds();
	});
	
	breakpoint.kioskIn.push(function(){
		trackParcel.resetBinds();
	});
	breakpoint.kioskOut.push(function(){
		trackParcel.resetBinds();
	});

	return trackParcel;

});