define([
       'domlib',
       'modules/common',
       'modules/breakpoint',
       'modules/custom-dropdown/common',
    'modules/validation',
    'modules/checkout/resetForm'
], function($, common, breakpoint, dropdown, validationExtras, resetForm){

    var vatInvoice = {
        
        // default event is click
        eventName: 'click',
        
        vatInvoiceContainer: '#vat-invoice-details',
        
        vatInvoiceItemsContainer: '.vat-invoice-items',
        
        saveButtonClicked: '',
        
        submitVatName: '#submitVatName',
        
        submitVatForm: '#submitVatForm',
        
        setupDropdown: function() {
        	var self = vatInvoice;
            $(self.vatInvoiceContainer).find('select').each( function() {
                $(this).addClass('visually-hidden-select');
                dropdown.init( $(this) );
            });
            console.log( $(self.vatInvoiceContainer+' .customDropdown a.control'));
            //FIX- in VAT Invoice page, clicking of address dropdown, goes to top of the page.
//            $(self.vatInvoiceContainer).on('click','.customDropdown a.control', function(e){
//            		console.log('TEST TEST');
//            		e.preventDefault();	
//            });
            $(self.vatInvoiceContainer+' .customDropdown a.control').click(function(e) {
            	e.preventDefault();	
            });
        },
        
        toggleVatItems: function(e){            
            
            var $allSellers = $('.delivery-item-holder');
            var $thisSeller = $(e.currentTarget).parents().next('.delivery-item-holder');
            var target = e.currentTarget;
            
            if ($thisSeller.hasClass('open')) {
                if (common.isTouch()) {
                    $thisSeller.removeClass('open').hide();
                } else {
                    $thisSeller.removeClass('open').slideUp();
                }
                $(target).find('.icon').attr('data-icon', 'a');
                $(target).next('.seller-contact').hide();
            } else {
                if (common.isTouch()) {
                    $allSellers.removeClass('open').hide();
                    $thisSeller.addClass('open').show();
                } else {
                    $allSellers.removeClass('open').slideUp();
                    $thisSeller.addClass('open').slideDown();
                }
                // all targets - change icon and hide seller contact info
                $('p.supplied-by').find('.icon').attr('data-icon', 'a');
                $('.seller-contact').hide();
                // current target - change icon and show seller contact info
                $(target).find('.icon').attr('data-icon', 'c');
                $(target).next('.seller-contact').show();
            }
            return false;
        },
        
        toggle: function(e){
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            var $form = $('.edit-vat-name');
            var $vatNameHolder = $('.vat-name');
            if ($form.hasClass('open')) {
                if (common.isTouch() || !common.isModern()) {
                    $form.removeClass('open').hide();
                } else {
                    $form.removeClass('open').slideUp();
                }
                $vatNameHolder.show();
            } else {
                $vatNameHolder.hide();
                if (common.isTouch()) {
                    $form.addClass('open').show();
                } else {
                    $form.addClass('open').slideDown();
                }
                // if it's a touch device, we need to update the dimensions of the select box to ensure that
                // it's clickable over the .control element - this is normally done in the setup of the custom
                // drop down, but doesn't work in this scenario as it's hidden by default so the dimensions
                // cannot be retrieved
                dropdown.updateSelectDimension( $form.find('select') );
            }
            return false;
        },
        
        cancel: function(e){
            e.preventDefault();
            
            var $form = $(e.currentTarget).parents('.edit-vat-name');
            
            vatInvoice.toggle(e);
            
           // resetForm.init($form);
            
            var $fields = $form.find('[name=honorific-prefix], [name=given-name], [name=family-name]');
            var $save = $form.find('#submitVatName');

            // check if the save should be enabled
            validationExtras.enableSave( $fields, $save );

            return false;
        },
        
        save: function( $elem ){
            
            // exit if name has not changed
            if ( $elem.hasClass('disabled') ) {
                return true;
            }
            
            // get new name val
            var prefix = $('[name=honorific-prefix]').val();
            var fn = $('[name=given-name]').val();
            var ln = $('[name=family-name]').val();
            var name = prefix + ' ' + fn + ' ' + ln;
            
            //ATG integration specific hidden fields.
            $('#atg-user-title').val(prefix);
            $('#atg-user-firstName').val(fn);  
            $('#atg-user-lastName').val(ln);
            
            // output name
            $('#fn').text(name);
            
            // close form
            vatInvoice.toggle();
            
            // reset save button state to disabled
            $elem.addClass('disabled');            
            
            // update default values with new values
            $('#vatSubmission .edit-vat-name').find('input:text, select').each(function(i) { 
                var value = this.value;
                var tagName = this.tagName.toLowerCase();

                if (tagName === 'select') {
                    this.prefilledValue = value;
                } else {
                    this.defaultValue = value;
                }
            });
            
            return false;
        },
        
        changeVatInvoiceAddress: function() {            
            var addr = $('#vat-address-select').find('option:selected').attr('title');
            addr = addr.replace("<br/>", "");
            $('#vat-address-output').text(addr);
        },
        
        toggleChangeAdr: function(e){
            e.preventDefault();
            e.stopPropagation();
            
            var target = e.currentTarget;
            var $content = $(target).next('.toggle-content');            
            
            if ($content.hasClass('open')) {
                if (common.isTouch()) {
                    $content.removeClass('open').hide();
                } else {
                    $content.removeClass('open').slideUp();
                }
            } else {
                if (common.isTouch()) {
                    $content.addClass('open').show();
                } else {
                    $content.addClass('open').slideDown();
                }
            }
            return false;
        },
        
        validation: function() {
        
            var self = '#vatSubmission';

            var $save = $(self).find('#submitVatName');

            var getFields = function() {
                var $fields = $(self).find('[name=honorific-prefix], [name=given-name], [name=family-name]');

                return $fields;
            };

            // add the custom validation methods to the validation library before form validation setup
            validationExtras.customMethods.nameCheck();

            $(self).validate({
                onkeyup: function(elm) {
                    if (this.check(elm)) {
                        $(elm).addClass('valid');
                    } else {
                        $(elm).removeClass('valid');
                    }
                    validationExtras.enableSave( getFields(), $save ); // save enabler must be placed after the element validation
                },
                focusInvalid: false,
                onfocusout: function(elm) {
                    this.element(elm);
                    validationExtras.enableSave( getFields(), $save ); // save enabler must be placed after the element validation
                },
                errorPlacement: function (error, element) {
                    error.insertBefore( validationExtras.errorPlacementElement(element) );
                },
                rules: {
                    'honorific-prefix': {
                        required: true
                    },
                    'given-name': {
                        required: true,
                        nameCheck: {
                            isLastname: false
                        }
                    },
                    'family-name': {
                        required: true,
                        nameCheck: {
                            isLastname: true
                        }
                    }
                },
                messages: {
                    'honorific-prefix': {
                        required: validationExtras.msg.title.required
                    },
                    'given-name': {
                        required: validationExtras.msg.firstname.required,
                        nameCheck: validationExtras.msg.firstname.inValid
                    },
                    'family-name': {
                        required: validationExtras.msg.lastname.required,
                        nameCheck: validationExtras.msg.lastname.inValid
                    },
                    'email' : {
                        required: validationExtras.msg.email.required,
                        email: validationExtras.msg.email.inValid
                    }
                },
                submitHandler: function(form) {
                    if ( vatInvoice.saveButtonClicked === vatInvoice.submitVatForm ) {
                        form.submit();
                    } else {
                        vatInvoice.save( $('#submitVatName') );
                    }
                }
            });

            // apply focus fix for android devices
            validationExtras.focusoutFix( $(self) );
            validationExtras.selectChangeFix( $(self), getFields(), $save );

            // set up max character limits
            validationExtras.limitCharacters( $(self).find('[name=given-name]'), 20 );
            validationExtras.limitCharacters( $(self).find('[name=family-name]'), 25 );
            
            // check if the save should be enabled
            validationExtras.enableSave( getFields(), $save );
            
            // validate fields not included in enableSave
            var fieldsNotEnableSave = 'input[name=email]';
            $(self).find(fieldsNotEnableSave).each(function(i) { 
                if ($(this).val() !== '') {
                    $(this).valid();
                }
            });
              },
        
        init: function (){
            var self = vatInvoice;
            
            // setup dropdowns
            self.setupDropdown();
            
            // setup validation
            self.validation( $('#vatSubmission') );
            
            // toggle vat items
            $(document).on(self.eventName, '.vat-invoice-items p.supplied-by', function(e){
                self.toggleVatItems(e);
            });
            
            // toggle edit vat name
            $(document).on(self.eventName, '#vat-invoice-details .vat-name .edit', function(e){
                self.toggle(e);
            });
            
            // toggle cancel edit vat name
            $(document).on(self.eventName, '#vat-invoice-details .edit-vat-name .cancel', function(e){
                self.cancel(e);
            });
            
            // onchange, update vat address
            $(document).on('change', '#vat-address-select', vatInvoice.changeVatInvoiceAddress );
            
            // toggle change address content
            $(document).on(self.eventName, '#vat-invoice-details .change-adr .toggle-link', function(e){
                self.toggleChangeAdr(e);
            });
            
            // get name for save buttons
            if ( $(self.submitVatName).length ) {
                self.submitVatName = $(vatInvoice.submitVatName).attr("name");
            }
            self.submitVatForm = $(vatInvoice.submitVatForm).attr("name");
            
            // get name of save button clicked, required for submitHandler
            $(document).on(self.eventName, '#submitVatName, #submitVatForm', function(e){
                vatInvoice.saveButtonClicked = e.target.name;
            });
            
            // disable tel link if not touch device
            if ( !common.isTouch() ) {
                $(document).on(self.eventName, '.vat-invoice-items span.tel a', function(e){
                    e.preventDefault();
                });
            }
        }
    };
    
    return vatInvoice;
});

