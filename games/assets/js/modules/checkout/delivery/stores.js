/*global define: true */
define([
    'domlib',
    'modules/common',
    './collection-details',
    './refresh-all',
    'modules/tesco.utils',
    'modules/tesco.data',
    './lockers',
    'modules/dialog-box/common'
], function ($, common, collectionDetails, refreshAll, utils, data, lockers, dialogBox) {

    'use strict';

    var stores,
        postcodeValidator,
        refreshViewMoreStoresBinding;

    refreshViewMoreStoresBinding = function refreshViewMoreStoresBinding() {
        $('.view-more-stores').off().on('tap click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            stores.toggleViewMore(e);
        });
    };

    stores = {
        group: null,
        toggleViewMore: function (e) {
            var $target = e ? $(e.target) : $('.store-options-module .view-more-stores'),
                moreStores = $target.closest('.delivery-options').find('.other-stores');

            if (moreStores.hasClass('hidden')) {
                stores.showViewMore(e);
            } else {
                stores.hideViewMore(e);
            }

            return false;
        },
        showViewMore : function (e) {
            var $target = e ? $(e.target) : $('.store-options-module .view-more-stores'),
                moreStores = $target.closest('.delivery-options').find('.other-stores'),
                //msg = lockers.isLockersOn() ? 'View less collection points' : 'View less stores';
            	msg = 'View less collection points';

            moreStores = e.type ? moreStores : e.closest('.delivery-options').find('.other-stores');

            if (common.isTouch()) {
                moreStores.show();
            } else {
                moreStores.slideDown();
                var $moreLi = moreStores.find('.custom-radio.checked').parents('li');
				if($moreLi.hasClass('preferStoreEnable')){
					$moreLi.css('padding-bottom', '44px');
					var $chkBox = $moreLi.find('.checkbox-wrapper');
					$chkBox.show();
					common.customCheckBox.init($('.store-options-module'), stores.setPreferredStore);
				}
            }

            moreStores.removeClass('hidden');
            $target.closest('.store-options-module').find('.view-more-stores .icon').attr('data-icon', 'c');
            $target.closest('.store-options-module').find('.view-more-stores .label').text(msg);
            $('.datepicker-tooltip').removeClass('visible').hide();

            return false;
        },
        hideViewMore : function (e) {
            var $target = e ? $(e.target) : $('.store-options-module .view-more-stores'),
                moreStores = $target.closest('.delivery-options').find('.other-stores'),
                //msg = lockers.isLockersOn() ? 'View more collection points' : 'View more stores';
                msg = 'View more collection points';

            postcodeValidator.resetForm();

            if (common.isTouch()) {
                moreStores.hide();
            } else {
                moreStores.slideUp();
            }

            moreStores.addClass('hidden');
            $target.closest('.store-options-module').find('.view-more-stores .icon').attr('data-icon', 'a');
            $target.closest('.store-options-module').find('.view-more-stores .label').text(msg);
            $('.datepicker-tooltip').removeClass('visible').hide();

            return false;
        },
        update: function (open) {
            common.customRadio($('.stores-container', stores.group));
            common.customRadio($('.other-stores', stores.group));

            if (open && $('.other-stores').hasClass('hidden') && !$('.other-stores').find('.invalid2').length) {
            	stores.showViewMore(stores.group.find('.view-more-stores'));
            }

            if ($('.edit-contact-details', stores.group).hasClass('open')) {
                collectionDetails.toggle(stores.group);
            }

            //reset validation
            stores.validation(stores.group).trigger('reset');
        },
        get: function (e, postcode, refreshViewMoreStores, searchStores) {
	        var $elem = $(e),
	            request,
	            $form,
	            url,
	            DL,
	            myData;

	        if (e.type) {
	            e.preventDefault();
	            $elem = $(e.target);
	        }

	        stores.group = $elem.closest('.delivery-group-block');
	        request = 'selectDeliveryOptionStore';
	        $form = utils.getFormByElement($elem);
	        url = utils.getFormAction($form);
	        DL = new data.DataLayer({ singleton: true });
	        myData = $form.serialize();

	        /* START - Defect #56606 */
	        var $isActiveAmendSection = $('.simpleOrderAmend .isActiveAmendSection');
	        $isActiveAmendSection.addClass('white');
	        $isActiveAmendSection.find('.stores-container h2').addClass('white');
	        /* END - Defect #56606 */

	        if (lockers.isLockersOn()) {
	            request = postcode ? 'searchForStoresLockersOn' : 'selectStoreOptionLockersOn';
	        }

	        lockers.disableSelection();
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function(data) {
	            lockers.enableSelection();
	            if (searchStores)
	                stores.update(searchStores);
	            else
	                stores.update(postcode);

	            if (!postcode) {
	                lockers.disableSelection();
	                collectionDetails.get(stores.group, function() {
	                    lockers.enableSelection();
	                    
	                    if(stores.group.attr('id') == 'dg-1'){
	                    	var $li = stores.group.find('.store-options-module .custom-radio.checked').parent('li');
	                    	if($li.hasClass('preferStoreEnable')){
								$li.css('padding-bottom', '44px');
								var $chkBox = $li.find('.checkbox-wrapper');
								$chkBox.show();
								common.customCheckBox.init($('.store-options-module'), stores.setPreferredStore);
							}
                    	}

	                });
	            }

	            if (refreshViewMoreStores) {
	                refreshViewMoreStoresBinding();
	            }

	            /* START - Defect #56375 */

	            if ($('.amendStoreError').length) {
	                if ($('.amendStoreError').html().trim().length > 10) {
	                    $('.amendStoreError').hide();
	                    dialogBox.showDialog({
	                        "className": "dialogWarning ",
	                        "content": $('.amendStoreError').html(),
	                        "buttons": [{
	                            "className": "button tertiary-button buttonDefault",
	                            "title": "OK"
	                        }]
	                    });

	                    if ($('#virtual-page').length) {
	                        $('#overlay').css('z-index', 99999);
	                        $('#lightbox').css('z-index', 999999);
	                    }

	                    $('.amendStoreError').html('');
	                } else {
	                    require(['modules/order-amendments/store-change'], function(storeChange) {
	                        storeChange.common.errorResponseHandler(data.responseText, true);
	                    });
	                }
	            }

	            /* END - Defect #56375 */

	            if (lockers.isLockersOn()) {

	                var res = JSON.parse(data.responseText);

	                if (res.lockersAvailability === "Available") {
	                    lockers.updateLockers(stores.group, postcode);
	                } else {
	                    if (postcode) {
	                        $('.more-lockers-holder').empty();
	                    }
	                }

	            }


	            /* START - Defect #56606 */
	            $isActiveAmendSection.removeClass('white');
	            $isActiveAmendSection.find('.stores-container h2').removeClass('white');
	            /* END - Defect #56606 */

	            $(document).trigger('storeChangeRequestSuccessful', data);

	            setTimeout(function() {
	                $('.rdo-standard-delivery').each(function() {
	                    if ($(this).is(':checked')) {
	                        $(this).closest('.delivery-options-list').find('.datepicker-wrapper').hide();
	                    }
	                });
	            }, 900);

	        });

	        return false;
	    },
	    setPreferredStore: function(e){
	    	var $elem = $(e);
	         
	        if (e.type) {
	            e.preventDefault();
	            $elem = $(e.target);
	        }

	        var request = 'selectPreferredStore';
	        var $form = $('#prefer-store-form');
	        var url = $elem.closest('.checkbox-wrapper').attr('data-url');
	        var DL = new data.DataLayer();
	        var myData = $form.serialize();
	        
	        DL.get(url, myData, $elem, data.Handlers.Checkout, request, null, null, function (data) {
		        common.customRadio($('.store-options-module'));
		        $elem.closest('li').css('padding-bottom','32px');
		        var findText = $elem.closest('li').find('label');
		        var confirmedText = $.parseJSON(data.responseText).preferredStore;
		        var responseContainer = $('<p class="preferredStoreText">').insertAfter(findText);
		        responseContainer.html(confirmedText);
		        $elem.closest('.checkbox-wrapper').hide();
	        });

	    },
        validation: function (group) {
            var $form = $('.store-search-form form', group);

            if($form.length){
	            postcodeValidator = $form.validate({
	                onkeyup: function (el) {
	                    if ($(el).val().length >= 3) {
	                        $(el).removeClass('highlight');
	                    } else {
	                        $(el).addClass('highlight');
	                    }
	                },
	                focusInvalid: true,
	                submitHandler: function (form) {
	                    stores.get(form, false, null, true);
	                },
	                rules: {
	                    'store-finder-postalcode': {
	                        required: true
	                    }
	                },
	                messages: {
	                    'store-finder-postalcode': {
	                        required: 'Please enter your town or postcode.'
	                    }
	                }
	            });

	            $('.postcode', $form).rules('add', {
	                required: true,
	                minlength: 3
	            });

	            return $form;
            }
        },
        init: function (params) {
            var defaultOptionSelectors = '.store-options-module .stores-container .custom-radio, .more-stores-holder .custom-radio',
                optionSelectors = params && params.optionSelectors ? params.optionSelectors : defaultOptionSelectors,
                refreshViewMoreStores = params && params.refreshViewMoreStores ? params.refreshViewMoreStores : undefined;

            $(document).off('tap click', optionSelectors).on('tap click', optionSelectors, function (e) {
                stores.get(e, false, refreshViewMoreStores);
                if (lockers.isLockersOn()) {
                    stores.hideViewMore();
                    lockers.unselectLockers();
                    common.scrollToOffset($(e.target).parents('.delivery-options').offset().top);
                }
            });

            refreshAll.reInit.push(function () {
                stores.validation($('.checkout'));
            });

        }
    };

    return stores;
});
