define(['base/view', 'base/itemView', 'base/util'], function(BaseView, BaseItemView, util) {
    "use strict";

    var setupCollectionRender = function() {
        var _this = this;
        var viewIndex = {};
        var el = this.$el;
        var coll = this.collection;

        _this.addItem = function(model, containerEl) {
            if (!containerEl) {
                containerEl = el;
            }
            var index = coll.indexOf(model);

            var ItemView = _this.getOption('ItemView') || BaseItemView;

            var view = util.createView({model: model, attributes:{'data-id':model.id}, View: ItemView, parentView:_this});
            viewIndex[model.cid] = view;

            if (index === 0) {
                view.$el.prependTo(containerEl);
            }else if (index >= coll.length - 1) {
                view.$el.appendTo(containerEl);
            }else {
                var beforeView = _this.getModelViewAt(coll.at(index - 1).cid);
                view.$el.insertAfter(beforeView.$el);
            }

        };

        _this.removeItem = function(model) {
            var view = _this.getModelViewAt(model.cid);
            delete viewIndex[model.cid];
            view.remove();
        };

        _this.removeAllItems = function(){
            _.each(viewIndex, function(view){
                view.remove();
            });
            viewIndex={};
        };

        _this.getModelViewAt = function(id) {
            return viewIndex[id];
        };

        if(coll.length > 0){
            _this.on('rendered', _this.renderItems);
        }

        _this.removeReferences(function(){
            _this = null;
            viewIndex = null;
            el = null;
            coll = null;
        });


    };


    var CollectionView = BaseView.extend({
        constructor: function (options) {
            var _this = this;
            BaseView.call(_this, options);
            _.each([setupCollectionRender], function (func) {
                func.call(_this, options);
            });
        },
        tagName: 'ul',
        dataEvents: {
            'add' : 'addHandler',
            'remove': 'removeHandler',
            'reset':'resetHandler'
        },
        resetHandler : function(event, collection, options){
            var _this = this;
            _.each(options.previousModels, function(model){
                _this.removeItem(model);
            });
            _this.renderItems();
        },
        renderItems: function() {
            var _this = this;
            _this.removeAllItems();
            var el = this.$el;
            var coll = this.collection;
            //el.hide();
            coll.each(function(model) {
                _this.addItem(model, el);
            });
            //el.show();
        },
        addHandler: function(event, model) {
            this.addItem(model);
        },
        removeHandler: function(event,model) {
            this.removeItem(model);
        }
    });



    return CollectionView;
});
