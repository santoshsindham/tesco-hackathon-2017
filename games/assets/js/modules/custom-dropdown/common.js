define(['domlib', 'modules/breakpoint', 'modules/common'], function($, breakpoint, common){

    var customDropdown = {

        // store the event type (updated in init for touch devices)
        eventType: 'click',

        // used by the mouse enter/leave events to set a timer to close any open menus if left inactive
        closeTimer: null,

        // store the currently opened custom dropdown wrapper (can only ever be one open at a time)
        $currentWrapper: [],

        // flag set once the custom drop down menu is shown
        isVisibleFlag: 'sortbyIsVisible',

        // ensure that the drop down is only setup once - could extend this so that other functions
        // can reset the value of this flag to destroy a current custom drop down and rebuild it
        isSetupFlag: 'customDropdownIsSetup',

        // can't use siblings as it can return multiples for groups (e.g. expiry date in the checkout)
        getSelect: function( $wrapper ) {
            var self = customDropdown;

            if (!$wrapper.hasClass('customDropdown')) {
                $wrapper = self.getWrapper( $wrapper );
            }

            var $select = $wrapper.next('select');

            if (!$select.length) {
                $select = $wrapper.prevAll('select:eq(0)');
            }

            return $select;
        },
        getWrapper: function( $child ) {
            if (common.isTouch() && !window.isKiosk())
                return $child.siblings('.customDropdown');
            else
                return $child.parents('.customDropdown');
        },

        // update the icon and display text for dropdown control
        updateControlIcon: function( $element ) {
            var $icon = $element.find('.icon');
            $icon.attr('data-icon', $icon.attr('data-icon') === '2' ? '1' : '2' );
        },
        updateControlText: function( $element, txt ) {
            $element.find('.control .innerText').text( txt );

            if (common.isTouch()) {
                customDropdown.updateSelectDimension( $element );
            }
        },

        // bind mouse enter/leave events to set a timer to close any open menus if left inactive
        bindMouseEvents: function( $wrapper ) {
            var self = customDropdown;
            $wrapper
                .on('mouseenter', self.closeTimerClear )
                .on('mouseleave', self.closeTimerStart );
        },
        closeTimerClear: function() {
            var self = customDropdown;
            window.clearTimeout( self.closeTimer );
        },
        closeTimerStart: function() {
            var self = customDropdown;
            self.closeTimer = setTimeout(function() {
                self.close();
            }, 10000);
        },

        // open drop down menu
        // NOT CALLED FOR TOUCH DEVICES!
        open: function( $control ) {
            var self     = customDropdown;
            var $wrapper = self.getWrapper( $control );

            // close any currently opened drop downs
            if (self.$currentWrapper.length) {
                self.close();
            }

            // if its not a touch device, update the icon and open the custom menu
            if (!common.isTouch() || window.isKiosk()) {
                self.updateControlIcon( $control );
                $wrapper
                    .addClass('open')
                    .data( self.isVisibleFlag, true );
            }

            // bind event to body to close any currently opened drop downs
            $('body').on( self.eventType, self.close );

            // store the newly opened drop down ready to be closed
            self.$currentWrapper = $wrapper;
        },
        // close any currently opened drop downs
        // NOT CALLED FOR TOUCH DEVICES!
        close: function() {
            var self = customDropdown;

            // exit early if no drop down is stored
            if (!self.$currentWrapper.length) {
                return;
            }

            var $select = self.getSelect( self.$currentWrapper );

            // ensure that the visible flag has been set before hiding hte custom menu
            if (self.$currentWrapper.data( self.isVisibleFlag )) {
                self.updateControlIcon( self.$currentWrapper );

                self.$currentWrapper
                    .removeClass('open')
                    .data( self.isVisibleFlag, false );

                $select.trigger('blur');
            }

            $select.css('width', self.$currentWrapper.width() );

            // if not a touch device, clear the timer used to close the menu if left inactive
            if (!common.isTouch()) {
                self.closeTimerClear();
            }

            // unbind event to body to close any currently opened drop downs
            $('body').off( self.eventType, self.close );

            self.$currentWrapper = [];
        },
        // update the custom drop down based on the selection from the drop down menu
        // NOT CALLED FOR TOUCH DEVICES!
        updateMenu: function( $anchor ) {
            var self     = customDropdown;
            var $wrapper = self.getWrapper( $anchor );
            var $select  = self.getSelect( $wrapper );

            if (!$select.length) {
                return false;
            }

            var $current = $wrapper.find('.current');
            var $options = $select.find('option');
            var value    = $anchor.attr('data-value');

            // make sure we've not re-selecting the current
            if ($current[0] !== $anchor[0]) {

                // update the display text for when dropdown is closed
                self.updateControlText( $wrapper, $anchor.text() );

                // remove existing current class and set the new
                $current.removeClass('current');
                $anchor.addClass('current');

                // remove existing selected attribute and set the new
                $options.removeAttr('selected');
                $options.filter('[value="' + value + '"]').attr('selected', 'selected');

                // update the selected index, value and trigger the change event on the original select element
                $select[0].selectedIndex = $options.index( $options.filter('[value="' + value + '"]') );
                $select
                    .val( value )
                    .trigger('change');
            }

            self.close();
        },
        // create the custom drop down menu
        // NOT CALLED FOR TOUCH DEVICES!
        createMenu: function( $wrapper ) {
            var self        = customDropdown;
            var $select     = self.getSelect( $wrapper );
            var $menu       = $('<ul />');

            var txtLabel    = $('label[for="' + $select[0].id + '"]' ).html().replace(/<.*>/, '');
            var txtSelected = $select.find(':selected').text();

            $menu.append('<li class="alt-heading">' + txtLabel + '</li>');

            $select.find('option').each(function() {
                var currentClass  = (txtSelected === this.innerHTML) ? ' current' : '';
                var dataAttribute = (this.getAttribute('data-other')) ? 'data-other="' + this.getAttribute('data-other') + '"' : '';

                $menu.append('<li><a class="sort' + currentClass + '" href="#non" data-value ="' + this.value + '"' + dataAttribute + '>' + this.innerHTML + '</a></li>');
            });

            $menu.find('a').on( self.eventType, function(e) {
                e.preventDefault();
                e.stopPropagation();

                self.updateMenu( $(this) );

                return false;
            });

            $wrapper
                .append( $menu )
                .data( self.isSetupFlag, true );
        },

        // set the dimensions of the select to match that of the select/label element for touch devices
        // NOTE: this function can be called from external scripts - if it's a touch device, we need to
        // update the dimensions of the select box to ensure that it's clickable over the .control
        // element - this is normally done in the setup of the custom drop down, but doesn't work in
        // scenarios where it's hidden by default so the dimensions cannot be retrieved
        // as external functions can call, allow a collection of .customDropdown wrappers to be passed
        updateSelectDimension: function( $select ) {
            var self = customDropdown;
            var $wrappers = customDropdown.getWrapper( $select );
            // exit if not a touch device
            if (!common.isTouch()) {
                return;
            }

            $wrappers.each(function(){
                var $select    = self.getSelect( $(this) );
                var $control   = $(this).find('.control');

                var totalWidth = $control.outerWidth(true)+20;
                var totalHeight = $control.outerHeight(true);
                $select
                    .addClass('native-select-trigger')
                    .css({'width':totalWidth, 'height':totalHeight, 'top':'auto'});

                if (breakpoint.mobile) {
                    var $label     = $('label[for="' + $select[0].id + '"]');
                    if ($label.is(':hidden')) {
                        $select.css('top', $(this).top);
                    }
                    else {
                        $select.css('top', $label.outerHeight(true));
                    }
                }
            });
        },

        // create the custom drop down wrapper and control
        setup: function( $select ) {
            var self        = customDropdown;
            var txtSelected = $select.find(':selected').text();
            var $wrapper    = $('<div class="customDropdown"><a class="control" href="#non"><span class="innerText">' + txtSelected + '</span><span data-icon="2" class="icon"></span></a></div>');
            var $control    = $wrapper.find('.control');

            $select.addClass('been-customised');

            // need to insert into the dom before updating dimensions for mobile
            $wrapper = $wrapper.insertAfter( $select );
            customDropdown.updateSelectDimension($select);
            // no custom drop down generated - just bind change event to update the control display text
            if (common.isTouch() && !breakpoint.kiosk) {
                $control.on('tap click', function(e) {
                    e.preventDefault();
                });

                $select.on('change', function() {
                    self.updateControlText( $wrapper, $(this).find(':selected').text() );
                });

                // add fix for earlier version of Android (2.x)
                // issue - tap on the $dropdown.find('.control') element is returning the select element
                // this fix is only required for Android (2.x) - applying the fix to Android 4.x will cause it to break (oh joy!)
                if (common.isAndroid()) {
                    var ua = navigator.userAgent.toLowerCase();
                    if (parseFloat( ua.slice( ua.indexOf('android') +8 ) ) < 4) {
                        $select.css('z-index', 0);
                    }
                }
            }

            // bind event to open the drop down
            else {

                $control.on( self.eventType, function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if ($(this).hasClass('open')) {
                        self.close();
                    } else {
                        self.open( $(this) );
                    }

                    return false;
                });

                // if not a touch device, bind mouse enter/leave events to set a timer to close the menu if left inactive
                if (!breakpoint.kiosk) {
                    self.bindMouseEvents( $wrapper );
                }
            }

            // set the dimensions of the select to match that of the select/label element for touch devices
            if (common.isTouch() && !breakpoint.kiosk) {
                self.updateSelectDimension( $wrapper );
            } else {
                self.createMenu( $wrapper );
            }
        },

        updateHandler: function( $select ) {
            customDropdown.updateSelectDimension( $select );
        },

        initViewport: function( $select ) {
            breakpoint.mobileOut.push(function(){
                customDropdown.updateHandler($select);
            });
            breakpoint.vTabletOut.push(function(){
                customDropdown.updateHandler($select);
            });
            breakpoint.hTabletOut.push(function(){
                customDropdown.updateHandler($select);
            });
            breakpoint.desktopOut.push(function(){
                customDropdown.updateHandler($select);
            });
            breakpoint.largeDesktopOut.push(function(){
                customDropdown.updateHandler($select);
            });
        },

        init: function( $select ) {
            var self = customDropdown;

            // update the event type (default is click - click too slow on windows phone, tap not recognised)
            if (common.isTouch()) {
                self.eventType = (common.isWindowsPhone()) ? 'MSPointerDown' : 'tap click';
            }

            $select = $select.not('.been-customised');

            $select.each(function(){
                self.setup( $(this) );
            });

            // re initialise custom dropdown dimensions on breakpoint change
            self.initViewport( $select );

            //feature detection for ie8 - does not support addEventListener
            if(window.addEventListener) {
                window.addEventListener("orientationchange", function() {
                    customDropdown.updateHandler($select);
                }, false);
            }
        }
    };

    return customDropdown;
});
