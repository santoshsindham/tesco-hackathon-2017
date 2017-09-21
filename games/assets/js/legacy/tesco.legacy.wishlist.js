$(function() {
    "use strict";
});

/**********************************************************
* Module
* Wishlists - 
**********************************************************/
TESCO.extend( 'Wishlist', {
    init: function() {
        // Initialise all modules required
        //this.Validation.init();
        this.bindWishlistTooltip();
        this.createWishlist();
        this.editWishlistName();
        this.bindDeleteWishlistTooltip();
        this.bindWishlistRecipients();
        this.bindEllipsis();
        this.bindWishlistNameTooltip();
        //this.bindSetDelAdr();
        this.createSocialBtns();
        this.bindSharedWishlistsEllipsis();
    },
    
    createSocialBtns: function() {
        //facebook
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        
        //twitter
        !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    },
    
    bindWishlistTooltip: function() {
        $('div.user-wishlists').hide();         
        $('div.wishlist-button input, div.wishlist-button > a').each(function(i, e) {
            if ($(this).next('div.user-wishlists').length) {
                $(e).tooltip({
                    initiate: 'hover click',
                    autohide: true,
                    tooltip: $(this).next('div.user-wishlists').eq(0)
                });
            }
        });
    },
    
    createWishlist: function() {
        var $elemCache = $('div#create-wishlist-form input[type="text"]');
        
        $elemCache.addClass('noChange');
                
        $('body').delegate("a#create-wishlist-trigger", "click", function(e) {
            //hide edit wishlist name form
            TESCO.Wishlist.hideEditWishlistNameForm();
            //show create wishlist form
            $(this).hide();
            $('div#create-wishlist-form').slideDown(function(){
                //$('div#create-wishlist-form input[type="text"]').focus();
            });
            return false;
        });
        
        $('body').delegate("div#create-wishlist-form input.cancel", "click", function(e) {
            TESCO.Wishlist.hideCreateWishlistForm();
            return false;
        });
        
        var defaultVal = $elemCache.val();
        $elemCache.focus(function(){
            if ($elemCache.val() === defaultVal ) {
                $elemCache.val('');
            }
        })
        .blur(function(){
            if ($elemCache.val() === ''){
                $elemCache.val(defaultVal);
                $elemCache.addClass('noChange');
            }
            else {
                $elemCache.removeClass('noChange');
            }
        });
        
        $("div#create-wishlist-form form").submit( function(e) {
            if($elemCache.hasClass('noChange')){
                $elemCache.val("");
            }
        });
    },
    
    editWishlistName: function() {
        $('body').delegate("a.edit-wishlist-name-trigger", "click", function(e) {
            //hide create wishlist form
            TESCO.Wishlist.hideCreateWishlistForm();
            //hide all edit wishlist name forms
            TESCO.Wishlist.hideEditWishlistNameForm();
            //show current edit wishlist name form
            $(this).hide();
            var $elemCache = $(this).parents('td.wishlist-name').children('form');
            $elemCache.children('h2').hide();
            $elemCache.children('div.edit-wishlist-name-module').removeClass('displayNone');
            e.preventDefault();
            //assign current input val to data attr
            var prevVal = $(this).parent().prev().children('input[type="text"]').val();
            $(this).parent().prev().children('input[type="text"]').data('prev',prevVal);
        });
        $('body').delegate("div.edit-wishlist-name-module input.cancel", "click", function(e) {
            var $elemCache = $(this).parents('td.wishlist-name').children('form');
            $(this).parents('div.edit-wishlist-name-module').addClass('displayNone');
            $elemCache.children('h2').show();
            $elemCache.children('.wishlist-settings').children('a.edit-wishlist-name-trigger').show();
            e.preventDefault();
            //set value back to original
            var myInput = $(this).prevAll('input[type="text"]');
            myInput.val(myInput.data('prev'));
        });       
    },
    
    hideCreateWishlistForm: function() { 
        $('div#create-wishlist-form').slideUp();
        $('a#create-wishlist-trigger').show();
    },
    
    hideEditWishlistNameForm: function() { 
        $('div.edit-wishlist-name-module').addClass('displayNone');
        $('td.wishlist-name h2').show();
        $('td.wishlist-name div.wishlist-settings a.edit-wishlist-name-trigger').show();
    },
    
    bindDeleteWishlistTooltip: function() {     
        $('a.delete-wishlist-trigger').each(function(i, e) {
            $(e).tooltip({
                initiate: 'click',
                autohide: true,
                tooltip: $(this).next('div.delete-wishlist-confirm').eq(0)
            });
        });
    },
    
    bindWishlistRecipients: function() {
        //Blank default value onfocus       
        $('textarea.wishlist-email-recipient').each(function(){
            
            $(this).addClass('noChange');
            
            var defaultVal = $(this).val();
            $(this).focus(function(){
                var $eC = $(this);
                if ($eC.val() === defaultVal ) {
                    $eC.val('');
                }
            })
            .blur(function(){
                var $eC = $(this);
                if ($eC.val() === ''){
                    $eC.val(defaultVal);
                    $eC.addClass('noChange');
                }
                else {
                    $eC.removeClass('noChange');
                }
            });
        });
        
        //Blank value before submit if it is has not changed
        $("div.share-wishlist-module form").each(function(){
            $(this).submit( function(e) {
                var $eC = $(this).children('textarea.wishlist-email-recipient');
                if($eC.hasClass('noChange')){
                    $eC.val("");
                }
            });
        });     
        
        //Insert semicolon on carriage return
        $('body').delegate("textarea.wishlist-email-recipient", "keydown", function(e) {
            if(e.which === 13){
                var lastChar = $(this).val();
                if (lastChar.substr(lastChar.length - 1) !== ";") {
                    $(this).val($(this).val() + ';');
                }
            }
        });     
    },
    
    bindEllipsis: function() {
        $('table.wishlist-table td.wishlist-name h2').ellipsis('45');
    	$('table.wishlist-buyer-table td.wishlist-name span.wishlist-owner').ellipsis('32');
    },
    
    bindWishlistNameTooltip: function() {       
        $('div.shared-wishlists ul li a').each(function(i, e) {
            var title = $(e).attr("title");
            $(e).removeAttr("title");
            $(e).parent('li').append('<div class="wl-name-tip"><span>' + title + '</span></div>');
            $('div.wl-name-tip').hide();
            $(e).tooltip({
                initiate: 'hover focus',
                autohide: true,
                placement: 'above',
                bindInternalEvents: false,          
                tooltip: $(e).parent('li').children('div.wl-name-tip').eq(0)
            });
        });
    },
    
    bindSetDelAdr: function() {
        $('div.wishlists-del-adr-holder').hide();
        $('div.wishlists-delivery-address div.form-actions').hide();
        
        var $chbox = $('input.wl-del-adr-init');
        
        $chbox.each(function() {
            var $eC = $(this).parents('div.control-group').siblings('div.wishlists-del-adr-holder');
            
            //on ready
            if($(this).is(':checked')) {
                $eC.show();
            }
            else {
                $eC.hide();
            }
            
            //on click
            $(this).click(function() {
                if($(this).is(':checked')) {
                    $eC.show( function(){
                        
                        $(this).parents('form').submit();
                    });
                }
                else {
                    $eC.hide( function(){
                        
                        $(this).parents('form').submit();
                    });
                }
            });
            
            //has multiple addresses
            if($eC.find('select.myaccount-adr').length > 0) {
                var $combo = $('select.myaccount-adr');
                $combo.nextAll('input.btn').hide();
                $combo.change(function() {
                    
                    $(this).parents('form').submit();
                });
            }
        });
    },
    
    bindSharedWishlistsEllipsis: function() {

        // First check for shared wishlists
        if ($('div.shared-wishlists ul').length) {
            
            var $el = $('div.shared-wishlists ul li');
            var containerWidth = $el.parents('ul').width();
            var singleLineHeight = $el.css('line-height').replace('px','');
            var maxNameWidth = parseInt(containerWidth * 0.7); // max-width for WL name is 70% of line width
            var maxOwnerWidth = parseInt(containerWidth * 0.3);
            
            $el.each(function() {
                var $name = $(this).children('a');
                var $owner = $(this).children('span');
                var nameWidth = $name.width();
                var ownerWidth = $owner.width();
                var remWidth = containerWidth - nameWidth;
                
                // If height of el is more than the singleLineHeight,
                // we know it has multiple lines
                if ($(this).height() > singleLineHeight) {
                    
                    // Run ellipsis if width of WL name is longer than max-width allowed
                    // Calc remaining space available to display WL owner
                    if (nameWidth > maxNameWidth) {
                        $name.css('max-width',maxNameWidth).ellipsis('15');
                        nameWidth = $name.width();
                        remWidth = containerWidth - nameWidth;
                        ownerWidth = $owner.outerWidth();
                    }
                    
                    // Run ellipsis on WL owner if longer than remaining space available
                    if (ownerWidth > remWidth) {
                        $owner.css('max-width',remWidth).ellipsis('15');
                    }
                }
            });
        }
    }

});


/**********************************************************
* Module 
* Validation - Holds all bindings for fields, validator rules and proxy function to jQuery plugin
**********************************************************/
TESCO.Wishlist.Validation = {

    init: function() {
        this.addValidators();  
        this.bindFormValidation();   
    },

    addValidators: function() {
        
        /*
        $.validator.addMethod('wishlistemailmax', function(value, element) {
            if(value.indexOf(";") > 0){
                var emailArray = value.split(";");
                var emailCount = 0;
                for (var i = 0; i < emailArray.length; i++){
                    if ($.trim(emailArray[i])!==""){
                        emailCount++;
                    }
                }
                if (emailCount >= 20) {
                    return false;
                }
            }
            return true;
        }, 'Please enter no more than 20 email addresses.');
        */
        
        $.validator.addMethod('wishlistemail', function(value, element) {
            var emailRegEx=/^[0-9a-zA-Z]+@[0-9a-zA-Z]+[\.]{1}[0-9a-zA-Z]+[\.]?[0-9a-zA-Z]+$/;
            if(value.indexOf(";") > 0){
                var emailArray = value.split(";");
                for (var i = 0; i < emailArray.length; i++){
                    if ($.trim(emailArray[i]) !== ""){
                        if (!emailRegEx.test($.trim(emailArray[i]))){
                            return false;
                        }
                    }
                }
            }
            else {
                if ($.trim(value) !== ""){
                    if (!emailRegEx.test($.trim(value))){
                        return false;
                    }
                }
            }
            return true;
        }, 'Please enter a valid email address.');
        
        $.validator.addMethod('createwishlistdefault', function(value, element) {
            if(value === "Enter wishlist name"){
                return false;
            }
            return true;
        }, 'This field is required.');
        
    },
    
    bindFormValidation: function() {
        
        // Create wishlist name
        $('div.create-wishlist-module form').validate({
            onkeyup: false,
            errorClass: 'invalid2',
            validClass: 'valid2',
            ignoreTitle: true,
            rules: {
                'wishlist-name': {
                    required: true,
                    'createwishlistdefault': true
                }
            },
            errorPlacement: function(error, element) {              
                switch (element.attr("name")) {
                    case "wishlist-name": error.insertAfter(element.nextAll('input.btn-primary'));
                    break;                                               
                }
            }
        });
        
        // Edit wishlist name
        $('td.wishlist-name form').each(function() {
            $(this).validate({
                onkeyup: false,
                errorClass: 'invalid2',
                validClass: 'valid2',
                ignoreTitle: true,
                rules: {
                    'wishlist-name': {
                        required: true
                    }
                },
                errorPlacement: function(error, element) {              
                    switch (element.attr("name")) {
                        case "wishlist-name": error.insertAfter(element.nextAll('input.btn-primary'));
                        break;                                               
                    }
                }
            });
        });
        
        // Share wishlist by email
        $('div.share-wishlist-module form').each(function() {
            $(this).validate({
                onkeyup: false,
                onfocusout: false,
                errorClass: 'invalid2',
                validClass: 'valid2',
                ignoreTitle: true,
                rules: {
                    'wishlist-recipient': {
                        required: true,
                        //'wishlistemailmax': true,
                        'wishlistemail': true
                    }
                },
                messages: {
                    'wishlist-recipient': {
                        //'wishlistemailmax': 'Please enter no more than 20 email addresses.',
                        'wishlistemail': 'Please enter a valid email address.'
                    }
                }
            });
        });
        
    }

};


$().ready(function() {
    if ($('#wishlists-init').length) {
        TESCO.Wishlist.init();
    }
    
    if ($('#product-summary').length) {
        TESCO.Wishlist.bindWishlistTooltip();
    }
});
