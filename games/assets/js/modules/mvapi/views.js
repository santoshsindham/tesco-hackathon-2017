/*jslint plusplus: true, regexp: true, nomen: true */
/*globals window,document,console,define,require,jQuery,Backbone,_ */
define('modules/mvapi/views', ['domlib', 'modules/mvapi/models'], function ($, models) {
    'use strict';
    var self, render, renderCollectionItem, renderItem, preparePlaceholder, addPlaceholder, nestedCollections = [], numberOfNestedCollections, renderNestedCollection;

    addPlaceholder = function addPlaceholder(placeholderClass, target) {
        var container = target ? '.' + target : '#wrapper';
        jQuery(container).append('<div class="' + placeholderClass + '"></div>');
    };

    preparePlaceholder = function preparePlaceholder(params) {
        var placeholderClass = params.placeholderClass || params.templateId;

        if (!jQuery('.' + placeholderClass).length && !params.preload) {
            addPlaceholder(placeholderClass, params.target);
        }
        return jQuery("." + placeholderClass);
    };

    renderNestedCollection = function renderNestedCollection(nestedCollection) {
        var templateHtml, NestedItemsCollectionConstructor, NestedItemsViewConstructor, NestedSingleItemViewConstructor, nestedAllItemsCollection, nestedAllItemsView,
            nestedModels = [],
            params = nestedCollection.model;

        params.collection.items = nestedCollection.items;
        params.placeholderClass = nestedCollection.placeholderClass;

        templateHtml = jQuery("#" + params.templateId).html();

        nestedModels.push(Backbone.Model.extend(params));

        NestedItemsCollectionConstructor = Backbone.Collection.extend({
            model: nestedModels[nestedModels.length - 1]
        });

        NestedItemsViewConstructor = Backbone.View.extend({
            el: $('.' + params.placeholderClass),
            render: function () {
                this.collection.each(function (itemModel) {
                    var nestedItemView = new NestedSingleItemViewConstructor({ model: itemModel });
                    this.$el.append(nestedItemView.render().el);
                }, this);
            }
        });

        NestedSingleItemViewConstructor = Backbone.View.extend({
            tagName: params.collection.tagName || 'div',
            render: function () {
                this.$el.html(_.template(templateHtml, this.model.toJSON()));
                return this;
            }
        });

        nestedAllItemsCollection = new NestedItemsCollectionConstructor(params.collection.items);
        nestedAllItemsView = new NestedItemsViewConstructor({ collection: nestedAllItemsCollection });

        nestedCollections.push(nestedAllItemsView);
        numberOfNestedCollections = nestedCollections.length;

        return nestedAllItemsView;
    };

    /**
    * Required and optional params the same as for mvapi.render
    */
    renderCollectionItem = function renderCollectionItem(params) {
        var Model, ItemsCollectionConstructor, ItemsViewConstructor, SingleItemViewConstructor,
            allItemsCollection, allItemsView,
            $placeholder = preparePlaceholder(params),
            templateHtml = jQuery("#" + params.templateId).html();

        Model = Backbone.Model.extend(params);

        if (params.collection.emptyParent) {
            $placeholder.empty();
        }

        ItemsCollectionConstructor = Backbone.Collection.extend({
            model: Model
        });

        SingleItemViewConstructor = Backbone.View.extend({
            tagName: params.collection.tagName || 'div',
            render: function () {
                var model = this.model.toJSON();
                this.$el.html(_.template(templateHtml, model));
                return this;
            }
        });

        ItemsViewConstructor = Backbone.View.extend({
            el: $placeholder,
            initialize: function () {
                var x;

                this.collection.each(function (itemModel) {
                    var itemView = new SingleItemViewConstructor({ model: itemModel });
                    this.$el.append(itemView.render().el);

                    if (itemModel.attributes.nestedCollection) {
                        renderNestedCollection(itemModel.attributes.nestedCollection);
                    }
                }, this);

                if (numberOfNestedCollections) {
                    for (x = 0; x < numberOfNestedCollections; x++) {
                        nestedCollections[x].render();
                    }
                }
                nestedCollections = [];
                numberOfNestedCollections = nestedCollections.length;
            }
        });

        if (params.collection.items) {
            allItemsCollection = new ItemsCollectionConstructor(params.collection.items);
        } else {
            allItemsCollection = new ItemsCollectionConstructor(params.defaults);
        }

        allItemsView = new ItemsViewConstructor({ collection: allItemsCollection });

        return allItemsView;
    };

    /**
    * Required and optional params the same as for mvapi.render
    */
    renderItem = function (params) {
        var $itemPlaceholder = preparePlaceholder(params),
            templateHtml = jQuery("#" + params.templateId).html(),
            ItemView = Backbone.View.extend({
                el: $itemPlaceholder,
                initialize: function () {
                    this.render(params);
                },
                render: function (params) {
                    if (params.injectType === 'append') {
                        this.$el.append(_.template(templateHtml, this.model.toJSON()));
                    } else if (params.injectType === 'prepend') {
                        this.$el.prepend(_.template(templateHtml, this.model.toJSON()));
                    } else {
                        this.$el.html(_.template(templateHtml, this.model.toJSON()));
                    }
                    $itemPlaceholder.show();
                    return this;
                }
            });

        return new ItemView({ model: models.create(params.defaults) });
    };

    /**
    * Required and optional params the same as for mvapi.render
    */
    render = function render(params) {
        if (params.collection) {
            renderCollectionItem(params);
        } else {
            renderItem(params);
        }
    };

    //Exposing public API
    self = {
        render: render
    };

    return self;
});