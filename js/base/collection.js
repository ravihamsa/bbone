define(['base/app','base/model', 'base/mixins/config'], function(baseApp, BaseModel, setupConfig) {
    "use strict";
    var BaseCollection = Backbone.Collection.extend({
        model: BaseModel,
        constructor: function (array, options) {
            var _this = this;
            _this.options = options || {};

            //to avoid config options from being passed to model
            arguments[1] = _.omit(options, 'configs');

            Backbone.Collection.apply(_this,arguments);
            setupConfig.call(null, _this);
        },
        getOption: function (option) {
            //console.log(option, this.options[option],this[option]);
            return this.options[option] || this[option];
        }
    });


    /*

    Example Usage:
    var arr = [{name:'ravi kumar ravi', kam:'coding'}, {name:'john', kam:'going home'}]
    var coll = new BaseCollection();
    coll.addFilter({column:'name', expr:'eq', value:'ravi'})
    coll.addFilter({column:'name', expr:'startsWith', value:'ravi'})
    coll.addFilter({column:'name', expr:'endsWith', value:'ravi'})
    coll.addFilter({column:'name', expr:'has', value:'ravi'})
     */






    return BaseCollection;
});
