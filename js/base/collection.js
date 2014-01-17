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
        },
        moveTo: function (model1Id, model2Id, position) {
            var index1 = this.get(model1Id).index();
            var index2 = this.get(model2Id).index();

            //console.log(model1Id, model2Id, index1, index2, position);

            var delta;
            if (index1 < index2) {
                delta = position === 'after' ? 0 : -1;
            } else {
                delta = position === 'before' ? 0 : -1;
            }
            index2 += delta;
            var model1 = this.models.splice(index1, 1)[0];
            this.models.splice(index2, 0, model1);
            //this.swapModels(index1, index2);
        },
        batchEach:function(fun, perBatch, start){
            var _this = this;
            if(perBatch === undefined){
                perBatch = 20;
            }
            if(start === undefined){
                start = 0;
            }

            var length = _this.length;

            for(var i=start, counter=0; counter < perBatch && i<length; i++){
                fun.call(_this, _this.at(i),_this);
                counter++
            }

            if(i<length && !_this.removed){
                setTimeout(function(){
                    _this.batchEach.call(_this, fun, perBatch, start+perBatch);
                },0)
            }


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
