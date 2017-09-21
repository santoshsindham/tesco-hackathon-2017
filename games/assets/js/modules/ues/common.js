/*global define: true */
define(['domlib', 'modules/breakpoint', 'modules/common'], function ($, breakpoint, common) {

    'use strict';

	var uniformEmbService = {
			activeIndex: 1,
			nextActiveIndex:1,
			prevActiveIndex:1,
			searchSchool : function($elem){
				var userInput = $.trim($elem.val());

				if(/^[a-zA-Z-0-9\'\s]*$/.test(userInput) == false || userInput.length == 0){
					$('.userMessage').hide();
					$('.schoolResultsSection').hide();
				}
				else if(userInput.length < 3 ) {
				   $('.userMessage').show();
				   $('.schoolResultsSection').hide();
				}
				else {
				   $('.userMessage').hide();
				   $('.schoolResultsSection').show();
				   uniformEmbService.getSchoolResults($elem);
				}
			},
            getSchoolResults: function($elem){
            	var _url = $('#schoolSearchUrl').val(),
        		textVal = $elem.val(),
        		limit = $('#schoolLimit').val(),
        		timeOut =$('#uesApiTimeout').val();
	        	var sUrl = _url +'?query=' + $elem.val() + '&limit='+ limit;

				$.ajax( {
					  url: sUrl,
					  contentType: "application/json; charset=utf-8",
					  type: "GET",
					  dataType: 'json',
					  timeout: timeOut,
					  beforeSend: function(){
						  $('.searchHolder .loader').show();
					  },
					  success: function(data) {
						$('.searchHolder .loader').hide();
						if($('.schoolResultsSection .schoolDetails').length >0){
							$('.schoolResultsSection .schoolDetails').remove();
						}
						if(data.count >0){
							var schoolHouseIndex = 0;
							$('.schoolResultsSection .noResults').hide();
							$.each(data.organizations, function(key, value){
								var responseName = data.organizations[key].name,
									textBox = $('.schoolIndicator').val(),
							    	schoolName= responseName.replace(new RegExp(textBox, "ig"), "<b>" + textBox +"</b>"),
							    	responsePostCode = data.organizations[key].address.postcode,
							    	postcode = responsePostCode.replace(new RegExp(textBox, "ig"), "<b>" + textBox +"</b>"),
									responseAddress1 = data.organizations[key].address.address1,
									responseAddress2 = data.organizations[key].address.address2,
									address1, address2;

								if (responseAddress1 != null && responseAddress1 != undefined && responseAddress1 != ''){
									address1 = responseAddress1.replace(new RegExp(textBox, "ig"), "<b>" + textBox +"</b>");
								}
								else {
									address1 = "";
								}
								if (responseAddress2 != null && responseAddress2 != undefined && responseAddress2 != ''){
									address2 = responseAddress2.replace(new RegExp(textBox, "ig"), "<b>" + textBox +"</b>");
								}
								else {
									address2 = "";
								}
								schoolHouseIndex = schoolHouseIndex+1;
								var content= '<div class="schoolDetails" id="schoolDetails_'+key +'">' +
								'<div class="schools schoolHouse_'+schoolHouseIndex+'"><span class="schoolId">'+data.organizations[key].school_data_id+'</span>'+
								'<span class="orgId">' + data.organizations[key].organization_id + '</span>'+
								'<img src="'+data.organizations[key].emblem.png+'" alt="schoolEmblem" title="schoolEmblem" style="background-color:rgb('+data.organizations[key].emblem.background+')"/><span class="schoolName">'+schoolName;
								/*if(data.organizations[key].subunits){
									content = content + ' <span class="icon" data-icon="r"></span>';
								}*/
								content = content + '</span>'+
								'<div class="schoolAddress"><span class="address1">'+address1 +'</span><span class="address2">'+address2 +'</span>'+
								'<span class="postcode">'+ postcode +'</span></div><br />' +
								'</div>' +
								'<div class="houseBlock">';

								var houseContent = "";
								if(data.organizations[key].subunits){
									$.each(data.organizations[key].subunits, function(key1, value){
										schoolHouseIndex = schoolHouseIndex+1;
										houseContent = houseContent +
										'<div class="houses schoolHouse_'+schoolHouseIndex +'" id="house_' + key1 + '">'+
										'<span class="schoolId">'+data.organizations[key].subunits[key1].school_data_id+'</span>'+
										'<span class="orgId">' + data.organizations[key].subunits[key1].organization_id + '</span>'+
										'<img src="' + data.organizations[key].subunits[key1].emblem.png + '" style="background-color:rgb('+data.organizations[key].subunits[key1].emblem.background+')" alt="schoolEmblem" title="schoolEmblem">'+
										'<span class="schoolName">' + data.organizations[key].subunits[key1].name + ' </span></span>'+
										'<div class="houseAddress">'+
										'	<span class="address1">' + data.organizations[key].subunits[key1].address.address1 + '</span>'+
										'	<span class="address2">' + data.organizations[key].subunits[key1].address.address2 +'</span>'+
										'	<span class="postcode">'+ data.organizations[key].subunits[key1].address.postcode +'</span>'+
										'</div>'+
										'</div><br/>';
									});
								}
								content = content + houseContent + '</div>' + '</div>';

								$('.schoolResultsContent').append(content);
								$('.schoolResultsSection .schoolDetails').show().css('height', 'auto');

								$('#schoolDetails_'+key).click(function(e){
									var target = $(e.target),
									$clickedUnit;
									if(target.parents('.schools').length){
										$clickedUnit = $(target.parents('.schools'));
									}
									else if(target.parents('.houses').length){
										$clickedUnit = $(target.parents('.houses'));
									}
									if(!(target.parents('.parentSchool').length)){
										var selectedSchoolName = $clickedUnit.find('.schoolName').text(),
											selectedSchoolId = $clickedUnit.find('.schoolId').text(),
											selectedOrgId = $clickedUnit.find('.orgId').text();
											$('#schoolName').val(selectedSchoolName);
											$('#schoolId').val(selectedSchoolId);
											$('#organisationId').val(selectedOrgId);
											$('#selectSchool').submit();
									}
								});
							});
							if(breakpoint.largeDesktop || breakpoint.kiosk){
								var _viewWidth = $(window).innerWidth()*0.375;
								$('.schoolResultsSection').css({
									width: _viewWidth,
									/*left: -($(window).width() - $('.fullWidth').width())*/
								});
							}
							else if(breakpoint.desktop){
								var _viewWidth = $(window).innerWidth()*0.475;
								$('.schoolResultsSection').css({
									width: _viewWidth,
									/*left: -($(window).innerWidth() / 8)*/
								});
							}
							else if (breakpoint.vTablet || breakpoint.hTablet) {
								var _viewWidth = $(window).innerWidth()*0.6;
								$('.schoolResultsSection').css({
									width: _viewWidth,
									/*left: -($(window).innerWidth() / 5)*/
								});
							}
							else if(breakpoint.mobile){
								$('.schoolResultsSection').css('width',$('.searchSec').width())
							}

							$('.schoolDetails').each(function(){
								if($(this).find('.houses').length != 0){
									$(this).find('.schools').addClass('parentSchool');
								}
							});

						}
						else{
							$('.schoolResultsSection .noResults').show();
							$('.schoolResultsSection .schoolDetails').remove();
						}

					  },
					  error: function() {
						  $('.searchHolder .loader').hide();
						  $('.schoolResultsContent').text('Oops! Something went wrong… Please refresh your page or try again later.');
						  $('.schoolResultsSection').css({
							  'font-size' : '16px',
							  'line-height': '21px'
						  });
					  }
				});
	        },
	        currencyFormat : function (x) {
			    var parts = x.toString().split(".");
			    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			    return parts[0];
			},
	        totalDonation : function(){
	        	var timeOut =$('#uesApiTimeout').val();
				if($('.donationCounter').length > 0 ){
					$.ajax( {
						url: $('#totalDonation').val(),
						timeout: timeOut,
						success: function(data) {
							if(data.statistics != undefined){
								$('.donationAmt').html("&pound;"+ uniformEmbService.currencyFormat(data.statistics.organization_funds_raised));
							}
						},
						error: function() {
							$('.donationAmt .loader').hide();
							$('.donationAmt').text('Sorry – we can’t display the donation information now');
							$('.donationAmt').css({
							    'white-space': 'nowrap',
						    	'font-size':'16px',
						    	'font-family': 'Tesco'
							});
						 }
					});
				}
			},
			selectSchoolHouseUp: function(e){
				var _this = uniformEmbService;

				if($('div[class*="schoolHouse_"]').hasClass('selected')){
					var elem = $('.schoolHouse_'+_this.activeIndex).attr('class').split(' ')[1];
						_this.activeIndex = parseInt(elem.split('_')[1]);
						_this.prevActiveIndex = _this.activeIndex == 1 ? $('div[class*="schoolHouse_"]').length : parseInt(_this.activeIndex -1);

						$('.schoolHouse_'+_this.activeIndex).removeClass('selected');
						if(_this.prevActiveIndex ==1){
							$('.schoolHouse_'+_this.prevActiveIndex).addClass('selected').focus();
							_this.activeIndex = _this.prevActiveIndex;
						} else{
							$('.schoolHouse_'+_this.prevActiveIndex).addClass('selected').focus();
							_this.activeIndex = _this.prevActiveIndex;
						}
				}
				else{
					$('.schoolHouse_1').addClass('selected').focus();
					_this.activeIndex = 1;
				}
			},
			selectSchoolHouseDown: function(e){
				var _this = uniformEmbService;

				if($('div[class*="schoolHouse_"]').hasClass('selected')){
					var elem = $('.schoolHouse_'+_this.activeIndex).attr('class').split(' ')[1];
						_this.activeIndex = parseInt(elem.split('_')[1]);
						_this.nextActiveIndex = parseInt(_this.activeIndex) + 1;

						$('.schoolHouse_'+_this.activeIndex).removeClass('selected');
						if($('.schoolHouse_'+_this.nextActiveIndex).length){
							$('.schoolHouse_'+_this.nextActiveIndex).addClass('selected').focus();
							_this.activeIndex = _this.nextActiveIndex;
						} else{
							$('.schoolHouse_1').addClass('selected').focus();
							_this.activeIndex = 1;
						}
				}
				else{
					$('.schoolHouse_1').addClass('selected').focus();
					_this.activeIndex = 1;
				}
			},
      sendSchoolInfo: function(){
				if($('.schoolResultsSection').is(':visible')){
					$.each($('div[class*="schoolHouse_"]').not('.parentSchool'), function(){
							if($(this).hasClass('selected')){
								var selectedSchoolName = $(this).find('.schoolName').text(),
									selectedSchoolId = $(this).find('.schoolId').text(),
									selectedOrgId = $(this).find('.orgId').text();
									$('#schoolName').val(selectedSchoolName);
									$('#schoolId').val(selectedSchoolId);
									$('#organisationId').val(selectedOrgId);
									$('#selectSchool').submit();
							}

					});
				}
			},
			init: function(){
				var debouncer = null;

				$(document).on('keyup click', 'input.schoolIndicator', function(e) {
					var code = e.keyCode || e.which;
					if(debouncer) {
						clearTimeout(debouncer);
					}
					debouncer = setTimeout(function(evt){
						switch (code) {
              case 13:
							case 38:
							case 40:
								e.preventDefault();
								break;

							case 27:
								if($('.ues-content').length){
									var $dropDown = $('.ssTable .schoolResultsSection').is(':visible') ? $('.schoolResultsSection') : $('.userMessage');
									$dropDown.hide();
								}

								break;
							default:
								uniformEmbService.searchSchool($('input.schoolIndicator'));
						}
					}, 500);


					if(common.isTouch()){
						if (e.keyCode === 13) {
							e.preventDefault();
							$('input.schoolIndicator').blur();
						}
					}
				});

				$(document).keyup(function(e) {
					if (e.keyCode === 38) {
						uniformEmbService.selectSchoolHouseUp(e);
					}
					if(e.keyCode === 40){
						uniformEmbService.selectSchoolHouseDown(e);
					}
          if(e.keyCode === 13){
						uniformEmbService.sendSchoolInfo();
					}
				});

				if($('.ues-content').length){
					$('#wrapper:not(input.schoolIndicator)').on('click', function(e){
						if(!$(e.target).closest('.parentSchool').length){
							var $dropDown = $('.ssTable .schoolResultsSection').is(':visible') ? $('.schoolResultsSection') : $('.userMessage');
							$dropDown.hide();
						}
					});
				}

				if (breakpoint.mobile || breakpoint.vTablet || breakpoint.hTablet || breakpoint.kiosk) {
					$('.schoolInfo').click(function(e){
						$(this).hide();
						$('.searchSec').show();
					});
				}
				uniformEmbService.totalDonation();
			}

	};
	common.init.push(function() {
		uniformEmbService.init();
	});
	return uniformEmbService;

});
