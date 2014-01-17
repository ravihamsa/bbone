define(['base/bareModel'], function(BareModel) {

    "use strict";

    var syncConfigs = function(configs, isInitial) {
        _.each(configs, function(value, config) {
            var handler = this[config + 'ConfigHandler'];
            if (handler && typeof handler === 'function') {
                handler.call(this, value, isInitial);
            }
            this.trigger('configChange:' + config, value);
        }, this);

        var configHandler = this.configHandler;
        if (configHandler && typeof configHandler === 'function') {
            configHandler.call(this, configs, isInitial);
        }
        this.trigger('configChange', configs);
    };

    var setupConfig = function(context) {
        var configs = context.getOption('configs');
        var configDefaults = context.getOption('configDefaults');

        configs = _.extend({},configDefaults, configs);
        if (!_.isEmpty(configs)) {
            var configModel = new BareModel(configs);

            context.setConfig = function(key, value) {
                configModel.set(key, value);
            };

            context.setConfigs = function(map) {
                configModel.set(map);
            };

            context.getConfigs = function() {
                return configModel.toJSON();
            };

            context.resetConfigs = function(map) {
                configModel.reset(map);
            };

            context.getConfig = function(key) {
                return configModel.get(key);
            };

            var syncAndWatch = function() {
                syncConfigs.call(context, configModel.toJSON(), true);
                context.listenTo(configModel, 'change', function() {
                    syncConfigs.call(context, configModel.changedAttributes());
                });
            };

            if (context instanceof Backbone.View && !context.getOption('preRendered')) {
                context.listenToOnce(context, 'rendered', syncAndWatch);
            }else{
                syncAndWatch();
            }
        }
    };


    return setupConfig;

});