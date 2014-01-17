define(['base', 'list/singleSelect'], function(Base, SingleSelect) {

    "use strict";

    var setupFunctions = [setupMultiSelection];

    var Model = Base.Model.extend({
        constructor: function(options) {
            var _this = this;
            Base.Model.call(_this, options);
            _.each(setupFunctions, function(func) {
                func(_this, {});
            });
        }
    });


    function setupMultiSelection(context, varObj) {

        varObj.selected = [];
        varObj.coll = context.get('items');

        if (!varObj.coll) {
            varObj.coll = new SingleSelect.ItemCollection();
            context.set('items', varObj.coll);
        }


        context.getSelected = function() {
            return varObj.selected;
        };

        context.setSelectedById = function(id) {
            var curItem = varObj.coll.get(id);
            curItem.toggleSelect();
            context.updateSelected();
        };

        context.setSelected = function(curItem) {
            curItem.toggleSelect();
            context.updateSelected();
        };

        context.selectAll = function() {
            varObj.coll.each(function(model) {
                model.select();
            });
            context.updateSelected();
        };

        context.selectNone = function() {
            varObj.coll.each(function(model) {
                model.deselect();
            });
            context.updateSelected();
        };
        context.updateSelected = function() {
            varObj.selected = varObj.coll.where({selected: true});
            context.set('selectedCount', varObj.selected.length);
        };

        context.updateSelected();
    }

    return {
        View: SingleSelect.View,
        Model: Model,
        ItemView: SingleSelect.ItemView,
        ItemCollection: SingleSelect.ItemCollection
    };

});
