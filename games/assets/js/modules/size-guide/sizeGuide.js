define('modules/size-guide/sizeGuide', [
    'domlib'
], function ($) {
    'use strict';

    var sizeGuide = {
        isInit: false,
        init: function (options) {
            var optionsCopy = options || {},
                selector = optionsCopy.selector ? optionsCopy.selector : '.size_guide',
                $selector = $(selector),
                $guideWrappers = $selector.find('.guide_wrapper'),
                $guideCheckboxes = $selector.find('.guide_tgl--checkbox');

            // Global
            $guideWrappers.find('th.dual').hide();

            // All references tied to parent wrapper
            $selector.on('click', '.guide_update_trigger', function() {
                var $this = $(this);
                $this.closest('ul').find('button').removeClass('guide_table--active_option').removeAttr('disabled');
                $this.addClass('guide_table--active_option').attr('disabled', true);
                $this.closest('.guide_wrapper').find('tbody th').toggle();
            });

            // Measurement unit switch
            $selector.on('click', '.guide_tgl--btn', function() {
                var $this = $(this),
                  imperialValues = $this.closest('.guide_wrapper').find('.imperial'),
                  metricValues = $this.closest('.guide_wrapper').find('.metric'),
                  imperialTooltip = $this.closest('.guide_wrapper').find('.tooltip.imperial'),
                  metricTooltip = $this.closest('.guide_wrapper').find('.tooltip.metric');

                if ($this.prev('.guide_tgl--checkbox').prop('checked') == false) {
                    $this.prev('.guide_tgl--checkbox').prop('checked', true);

                    metricValues.addClass('guide_unit--switchOut');
                    imperialValues.addClass('guide_unit--switchIn');

                    setTimeout(function(){ imperialValues.show().siblings('.metric').hide().removeClass('guide_unit--switchOut') }, 50);
                    setTimeout(function(){ imperialValues.removeClass('guide_unit--switchIn') }, 100);

                    imperialTooltip.show().removeClass('inactive_tooltip').addClass('active_tooltip');
                    metricTooltip.hide().removeClass('active_tooltip').addClass('inactive_tooltip');
                } else {
                    $this.prev('.guide_tgl--checkbox').prop('checked', false);

                    metricValues.addClass('guide_unit--switchIn');
                    imperialValues.addClass('guide_unit--switchOut');

                    setTimeout(function(){ metricValues.show().siblings('.imperial').hide().removeClass('guide_unit--switchOut'); }, 50);
                    setTimeout(function(){ metricValues.removeClass('guide_unit--switchIn') }, 100);

                    imperialTooltip.hide().removeClass('active_tooltip').addClass('inactive_tooltip');
                    metricTooltip.show().removeClass('inactive_tooltip').addClass('active_tooltip');
                }

                $this.siblings('h5.guide_tgl--label').toggleClass('guide_tgl--active_label');
            });

            sizeGuide.isInit = true;
        },
    }

    return sizeGuide;
});
