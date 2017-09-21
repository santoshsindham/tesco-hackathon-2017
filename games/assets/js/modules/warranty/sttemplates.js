st_resale.onLoadTemplates({

    "one_quote":    '<div class="st_resale_product_widget_container">' +
                        '<div class="heading">' +
                            '<span><strong>Protect Your Purchase</strong></span>' +
                            '<img src="${scope.state.imagesPath}/st-logo.png">' +
                        '</div>' +
                        '<div class="body">' +
                            '<div class="pricing_selector">' +
                                '<label>' +
                                    '<input class="st_fn_mvc_click_select" type="checkbox" ${scope.state.quotes.base.checked} data-event-data="quotetype:base">' +
                                    '<span>${scope.state.quotes.base.display}</span>' +
                                '</label>' +
                                '<a class="st_icon st_fn_mvc_click_moreinfo" data-event-data="quotetype:base,overlay:${scope.state.quotes.base.moreInfoID}" href="#" style="background-image: url(${scope.state.imagesPath}/mark.png);"></a>' +
                                '<span class="price"><strong>\u00A3 ${scope.state.quotes.base.price}</strong></span>' +
                            '</div>' +
                        '</div>' +
                    '</div>',

    "two_quotes":   '<div class="st_resale_product_widget_container">' +
                        '<div class="heading">' +
                            '<span><strong>Protect Your Purchase</strong></span>' +
                            '<img src="${scope.state.imagesPath}/st-logo.png">' +
                        '</div>' +
                        '<div class="body">' +
                            '<div class="pricing_selector">' +
                                '<label>' +
                                    '<input class="st_fn_mvc_click_select" type="checkbox" ${scope.state.quotes.base.checked} data-event-data="quotetype:base">' +
                                    '<span>${scope.state.quotes.base.display}</span>' +
                                '</label>' +
                                '<a class="st_icon st_fn_mvc_click_moreinfo" data-event-data="quotetype:base,overlay:${scope.state.quotes.base.moreInfoID}" href="#" style="background-image: url(${scope.state.imagesPath}/mark.png);"></a>' +
                                '<span class="price"><strong>\u00A3 ${scope.state.quotes.base.price}</strong></span>' +
                            '</div>' +
                            '<div class="pricing_selector">' +
                                '<label>' +
                                    '<input class="st_fn_mvc_click_select" type="checkbox" ${scope.state.quotes.upsell.checked} data-event-data="quotetype:upsell">' +
                                    '<span>${scope.state.quotes.upsell.display}</span>' +
                                '</label>' +
                                '<a class="st_icon st_fn_mvc_click_moreinfo" data-event-data="quotetype:upsell,overlay:${scope.state.quotes.upsell.moreInfoID}" href="#" style="background-image: url(${scope.state.imagesPath}/mark.png);"></a>' +
                                '<span class="price"><strong>\u00A3 ${scope.state.quotes.upsell.price}</strong></span>' +
                            '</div>' +
                        '</div>' +
                    '</div>',

    "overlay_one_quote":    '<div class="st_warranty_interstitial" style="background-image:url(${scope.state.imagesPath}/interstitial-content-body.png)">' +

                                '<div class="body">' +

                                    '<fieldset>' +

                                        '<label>' +
                                            '<input class="st_fn_mvc_click_select" type="radio" ${scope.state.quotes.base.checked} data-event-data="quotetype:base">' +
                                            '<span>${scope.state.quotes.base.display}</span>' +
                                            '<span class="price"><strong>\u00A3 ${scope.state.quotes.base.price}</strong></span>' +
                                        '</label>' +

                                    '</fieldset>' +

                                    '<div class="actions">' +

                                        '<a class="add-warranty-to-basket st_fn_mvc_click_purchase st_overlay_close" href="#">' +
                                            'Add to basket' +
                                        '</a>' +

                                        '<a class="no-thanks st_fn_mvc_click_decline st_overlay_close" href="#">' +
                                            'No, thanks' +
                                        '</a>' +
                                    '</div>' +

                                '</div>' +
                            '</div>',

    "overlay_two_quotes":   '<div class="st_warranty_interstitial" style="background-image:url(${scope.state.imagesPath}/interstitial-content-body.png)">' +

                                '<div class="body">' +

                                    '<fieldset>' +

                                        '<label>' +
                                            '<input class="st_fn_mvc_click_select" type="radio" ${scope.state.quotes.base.checked} data-event-data="quotetype:base">' +
                                            '<span>${scope.state.quotes.base.display}</span>' +
                                            '<span class="price"><strong>\u00A3 ${scope.state.quotes.base.price}</strong></span>' +
                                        '</label>' +

                                        '<label>' +
                                            '<input class="st_fn_mvc_click_select" type="radio" ${scope.state.quotes.upsell.checked} data-event-data="quotetype:upsell">' +
                                            '<span>${scope.state.quotes.upsell.display}</span>' +
                                            '<span class="price"><strong>\u00A3 ${scope.state.quotes.upsell.price}</strong></span>' +
                                        '</label>' +

                                    '</fieldset>' +

                                    '<div class="actions">' +

                                        '<a class="add-warranty-to-basket st_fn_mvc_click_purchase st_overlay_close" href="#">' +
                                            'Add to basket' +
                                        '</a>' +


                                        '<a class="no-thanks st_fn_mvc_click_decline st_overlay_close" href="#">' +
                                            'No, thanks' +
                                        '</a>' +
                                    '</div>' +

                                '</div>' +
                            '</div>',

        "me_adh":   '<div class="st_more_info_popup">' +

                        '<img src="${scope.state.imagesPath}/electrical.png">' +

                        '<a class="corner st_overlay_close">' +
                            '<img src="${scope.state.imagesPath}/xmark.png">' +
                        '</a>' +

                        '<a class="st-learn-more" href="#">' +
                            '<span class="st_fn_mvc_click_moreinfo" data-event-data="new-window:data-href" data-href="http://www.tesco.com/direct/drops-spills/">' +
                                'Learn More' +
                            '</span>' +
                        '</a>' +

                        '<a class="st-terms-conditions" href="#">' +
                            '<span class="st_fn_mvc_click_moreinfo" data-event-data="new-window:data-href" data-href="http://www.tesco.com/direct/tts-drops-spills/">' +
                                'Terms &amp; Conditions' +
                            '</span>' +
                        '</a>' +

                        '<a href="#" class="btn-select-plan st_fn_mvc_click_select st_overlay_close" data-event-data="quotetype:${scope.state.overlayQuoteType}" style="background-image: url(${scope.state.imagesPath}/btn-select-plan.png)"></a>' +
                    '</div>',

        "tv_adh":   '<div class="st_more_info_popup">' +

                        '<img src="${scope.state.imagesPath}/television.png">' +

                        '<a class="corner st_overlay_close">' +
                            '<img src="${scope.state.imagesPath}/xmark.png">' +
                        '</a>' +

                        '<a class="st-learn-more" href="#">' +
                            '<span class="st_fn_mvc_click_moreinfo" data-event-data="new-window:href" href="http://www.tesco.com/direct/drops-spills/">' +
                                'Learn More' +
                            '</span>' +
                        '</a>' +

                        '<a class="st-terms-conditions" href="#">' +
                            '<span class="st_fn_mvc_click_moreinfo" data-event-data="new-window:href" href="http://www.tesco.com/direct/tts-drops-spills/">' +
                                'Terms &amp; Conditions' +
                            '</span>' +
                        '</a>' +

                        '<a href="#" class="btn-select-plan st_fn_mvc_click_select st_overlay_close" data-event-data="quotetype:${scope.state.overlayQuoteType}" style="background-image: url(${scope.state.imagesPath}/btn-select-plan.png)"></a>' +
                    '</div>',

        "cn_adh":   '<div class="st_more_info_popup">' +

                        '<img src="${scope.state.imagesPath}/computer.png">' +

                        '<a class="corner st_overlay_close">' +
                            '<img src="${scope.state.imagesPath}/xmark.png">' +
                        '</a>' +

                        '<a class="st-learn-more" href="#">' +
                            '<span class="st_fn_mvc_click_moreinfo" data-event-data="new-window:data-href" data-href="http://www.tesco.com/direct/drops-spills/">' +
                                'Learn More' +
                            '</span>' +
                        '</a>' +

                        '<a class="st-terms-conditions" href="#">' +
                            '<span class="st_fn_mvc_click_moreinfo" data-event-data="new-window:data-href" data-href="http://www.tesco.com/direct/tts-drops-spills/">' +
                                'Terms &amp; Conditions' +
                            '</span>' +
                        '</a>' +

                        '<a href="#" class="btn-select-plan st_fn_mvc_click_select st_overlay_close" data-event-data="quotetype:${scope.state.overlayQuoteType}" style="background-image: url(${scope.state.imagesPath}/btn-select-plan.png)"></a>' +
                    '</div>'
});