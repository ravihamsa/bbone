define(['base/app', 'base/model', 'base/util', 'base/mixins/config'], function(app, BaseModel, util, setupConfig) {
    "use strict";

    var BaseView = Backbone.View.extend({
        constructor: function(options) {
            var _this = this;
            _this.removeQue = [];
            _this.removed = false;
            _this.rendered = false;
            Backbone.View.call(_this, options);
            _.each(setupFunctions, function(func) {
                func(_this);
            });

            /*
             _.each(_this.extensions, function (func) {
             func.call(_this, options);
             });

             var addOns = _this.getOption('addOns')
             if (addOns && addOns.length > 0) {
             _.each(addOns, function (func) {
             func.call(_this, options);
             })
             }
             */

        },
        setupView: function() {

        },
        tearUpView: function() {

        },
        postSetup: function() {

        },
        postMetaLoad: function() {

        },
        render: function() {
            var _this = this;
            _this.$el.addClass('rendering');
            if (!_this.model) {
                _this.model = new BaseModel();
            }

            var time = new Date().getTime();
            _this.beforeRender();

            var continueRender = ifNotRemoved(_this, function() {

                if (_this.removeChildViews) {
                    _this.removeChildViews();
                }
                app.getTemplateDef(_this.getTemplate(), _this.getTemplateType()).done(ifNotRemoved(_this, function(templateFunction) {
                    _this.renderTemplate(templateFunction);
                    setupSubViews(_this);
                    if (_this.setState) {
                        _this.clearState();
                        var defaultState = _.keys(_this.getOption('states'))[0];
                        _this.setState(_this.getState() || _this.getOption('state') || defaultState);
                    }
                    _this.postRender();
                    _this.$el.removeClass('rendering');
                    var diffTime = new Date().getTime() - time;
                    if (diffTime > 20) {
                        console.warn(this.$el[0], diffTime);
                    }
                    _this.rendered = true;
                    _this.trigger('rendered');
                }));

            });

            var metaLoadSuccess = function() {
                _this.postMetaLoad.apply(_this, arguments);
                continueRender();
            };

            if (!_this.rendered) {
                var metaDef = _this.loadMeta();
                metaDef.done(ifNotRemoved(_this, metaLoadSuccess));
            } else {
                continueRender();
            }
            return _this;
        },
        postRender: function() {

        },
        beforeRender: function() {

        },
        renderTemplate: function(templateFunction) {
            this.$el.html(templateFunction(this.serialize()));

        },
        getOption: function(option) {
            //console.log(this.$el[0],option, this.options[option],this[option]);
            return this.options[option] || this[option];
        },
        loadingHandler: function(isLoading) {
            this.$el.toggleClass('loading', isLoading);
        },
        metaLoadErrorHandler: function() {
            this.$el.html('Error Loading Meta Data');
        },
        addMethod: function(methodName, func) {
            if (!this[methodName]) {
                this[methodName] = func;
            }
        },
        serialize: function() {
            var useDeepJSON = this.getOption('useDeepJSON');
            return this.model.toJSON(useDeepJSON);
        },
        remove: function() {
            this.removeChildViews();
            Backbone.View.prototype.remove.call(this);
            this.removeReferences();
            this.stopListening();
            this.removeQue = null;
            this.removed = true;
        },
        removeReferences: function(func) {
            if (func) {
                this.removeQue.push(func);
            } else {
                _.each(this.removeQue, function(func) {
                    func.call(this);
                });
            }
        },
        show: function() {
            this.$el.show();
        },
        hide: function() {
            this.$el.hide();
        },
        postMessage: function() {
            var args = _.toArray(arguments);
            args.unshift('all');
            args.unshift('postMessage');
            this.trigger.apply(this, args);
        },
        postMessageTo: function(viewName) {
            var args = _.rest(arguments);
            args.unshift(viewName);
            args.unshift('postMessage');
            this.trigger.apply(this, args);
        }
    });



    BaseView.deepExtendMethods = function(methodMap) {
        var viewPrototype = this.prototype;
        _.each(methodMap, function(func, name) {
            var oldFunc = viewPrototype[name];
            if (oldFunc) {
                viewPrototype[name] = function() {
                    oldFunc.apply(this, arguments);
                    func.apply(this, arguments);
                };
            } else {
                throw new Error('Method with name: ' + name + ' doesn\'t exists to deep extend');
            }
        });
    };

    BaseView.templateTypes = {
        UNDERSCORE: 'underscore',
        HANDLEBARS: 'handlebars'
    };


    var bindDataEvents = function(context) {
        var modelOrCollection = context.model || context.collection;
        var eventList;
        eventList = context.dataEvents;
        _.each(eventList, function(handler, event) {
            var events, handlers, splitter;
            splitter = /\s+/;
            handlers = handler.split(splitter);
            events = event.split(splitter);
            _.each(handlers, function(shandler) {
                _.each(events, function(sevent) {
                    context.listenTo(modelOrCollection, sevent, function() {
                        if (context[shandler]) {
                            var args = Array.prototype.slice.call(arguments);
                            args.unshift(sevent);
                            context[shandler].apply(context, args);
                        } else {
                            throw shandler + ' Not Defined';
                        }
                    });
                });
            });
        });
    };

    var bindAppEvents = function(context) {
        var eventList = context.getOption('appEvents');
        if (!_.isEmpty(eventList)) {
            _.each(eventList, function(handler, event) {
                var events, handlers, splitter;
                splitter = /\s+/;
                handlers = handler.split(splitter);
                events = event.split(splitter);
                _.each(handlers, function(shandler) {
                    _.each(events, function(sevent) {
                        context.listenTo(app, sevent, function() {
                            if (context[shandler]) {
                                var args = Array.prototype.slice.call(arguments);
                                args.unshift(sevent);
                                context[shandler].apply(context, args);
                            } else {
                                throw shandler + ' Not Defined';
                            }
                        });
                    });
                });
            });
        }
    };

    var bindCustomEvents = function(context) {
        var eventList;
        eventList = context.customEvents;
        _.each(eventList, function(handler, event) {
            var events, handlers, splitter;
            splitter = /\s+/;
            handlers = handler.split(splitter);
            events = event.split(splitter);
            _.each(handlers, function(shandler) {
                _.each(events, function(sevent) {
                    context.listenTo(context, sevent, function() {
                        if (context[shandler]) {
                            var args = Array.prototype.slice.call(arguments);
                            //args.unshift(sevent);
                            context[shandler].apply(context, args);
                        } else {
                            throw shandler + ' Not Defined';
                        }
                    });
                });
            });
        });
    };

    var setupStateEvents = function(context) {

        var stateConfigs = context.getOption('states');
        if (!stateConfigs) {
            return;
        }

        var state;
        var statedView;


        var cleanUpState = function() {
            if (statedView) {
                statedView.remove();
            }
        };

        var renderState = function(StateView) {

            if (context.$('.state-view').length === 0) {
                throw new Error('Rendering state needs element with class "state-view".');
            }

            statedView = util.createView({
                View: StateView,
                model: context.model,
                parentEl: '.state-view',
                parentView: context
            });

            context.listenTo(statedView, 'setState', function(state) {
                context.setState(state);
            });
        };

        context.setState = function(toState) {
            if (typeof toState === 'string') {
                if (state === toState) {
                    return;
                }
                state = toState;
                var StateView = stateConfigs[toState];
                if (_.isFunction(StateView)) {
                    StateView.call(context, state);
                } else {
                    if (StateView) {
                        cleanUpState();
                        renderState(StateView);
                    } else {
                        throw new Error('Invalid State');
                    }
                }


            } else {
                throw new Error('state should be a string');
            }
        };

        context.getState = function() {
            return state;
        };

        context.clearState = function() {
            cleanUpState();
            state = undefined;
        };

        context.removeReferences(function() {
            stateConfigs = null;
            state = null;
            statedView = null;
            context = null;
        });



    };

    var setupTemplateEvents = function(context) {

        var template = context.getOption('template') || context.template;
        //if (template) {
        context.setTemplate = function(newTemplate) {
            template = newTemplate;
            context.render();
        };

        context.getTemplate = function() {
            return template;
        };

        context.getTemplateType = function() {
            return context.getOption('templateType') || 'Handlebars';
        };

        context.removeReferences(function() {
            template = null;
            context = null;
        });
    };

    var setupSubViews = function(context) {
        var views = {};

        var subViewConfigs = context.getOption('views');

        context.getSubView = function(id) {
            var subView = views[id];
            if (subView) {
                return subView;
            } else {
                throw new Error('No View Defined for id :' + id);
            }
        };

        context.setSubView = function(viewName, view) {
            views[viewName] = view;
            context.addToMessageRoom(view, viewName);
        };

        context.getAllSubViews = function() {
            return views;
        };

        context.getSubCollection = function(viewId) {
            return context.getSubView(viewId).collection;
        };

        context.getSubModel = function(viewId) {
            return context.getSubView(viewId).model;
        };

        context.getSubAttribute = function(viewId, attributeName) {
            return context.getSubModel(viewId).get(attributeName);
        };

        context.removeReferences(function() {
            subViewConfigs = null;
            views = null;
            context = null;

        });

        context.addToMessageRoom(context, 'owner');

        _.each(subViewConfigs, function(viewConfig, viewName) {
            if (typeof viewConfig === 'function') {
                viewConfig = viewConfig.call(context);
            }
            viewConfig.parentView = context;
            var view = util.createView(viewConfig);
            context.setSubView(viewName, view);
        });

    };


    var setupAttributeWatch = function(context) {

        var model = context.model;
        var preRendered = context.getOption('preRendered');

        var syncAndWatch = function() {
            syncAttributes.call(context, model.toJSON(), true);
            context.listenTo(model, 'change', function() {
                syncAttributes.call(context, model.changedAttributes());
            });
        };

        if (model) {
            if (!preRendered) {
                context.listenToOnce(context, 'rendered', syncAndWatch);
            } else {
                syncAndWatch();
            }
        }

    };

    var syncAttributes = function(changes, isInitial) {
        _.each(changes, function(value, attribute) {
            var handler = this[attribute + 'ChangeHandler'];
            if (handler && typeof handler === 'function') {
                handler.call(this, value, isInitial);
            }
        }, this);

        var changeHandler = this.changeHandler;
        if (changeHandler && typeof changeHandler === 'function') {
            changeHandler.call(this, changes, isInitial);
        }
    };

    var setupActionNavigateAnchors = function(context) {

        var verifyPropagation = function(e) {
            if (e.actionHandled) {
                e.stopPropagation();
                $('body').trigger('click');
            }
        };

        if (context.actionHandler) {
            context.$el.on('click', '.action', function(e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                var action = target.attr('href').substr(1);
                context.actionHandler.call(context, action, e);
                verifyPropagation(e);
            });
        }


        context.$el.on('click', '.dummy', function(e) {
            e.preventDefault();
        });

        context.removeReferences(function() {
            context.$el.off();
            context = null;
        });
    };

    var setupRenderEvents = function(context) {

        var renderEvents = context.getOption('renderEvents') || context.renderEvents;
        if (renderEvents && renderEvents.length > 0) {
            context.listenTo(context.model, renderEvents.join(' '), function() {
                context.render.call(context);
            });
        }

    };


    var setupMetaRequests = function(context) {
        var requestConfigs = context.getOption('requests') || context.requests;
        var runningRequestCount = 0;

        var bumpLoadingUp = ifNotRemoved(context, function() {
            runningRequestCount++;
            if (runningRequestCount > 0) {
                context.loadingHandler.call(context, true);
            }
        });

        var bumpLoadingDown = ifNotRemoved(context, function() {
            runningRequestCount--;
            if (runningRequestCount < 1) {
                context.loadingHandler.call(context, false);
            }
        });


        context.addRequest = function(config, callback) {
            var configArray = config;
            if (!_.isArray(configArray)) {
                configArray = [configArray];
            }

            var defArray = _.map(configArray, function(config) {
                var def = app.getRequestDef(config);
                if (config.callback) {
                    def.always(config.callback);
                }
                bumpLoadingUp();
                def.always(bumpLoadingDown);
                return def;
            });

            var requestPromise = $.when.apply(null, defArray);

            if (callback) {
                requestPromise.then(callback);
            }

            return requestPromise;
        };

        context.loadMeta = function() {
            if (!context.metaDef) {
                var def = requestConfigs ? context.addRequest(requestConfigs, ifNotRemoved(context, function() {
                    var requestsParser = context.getOption('requestsParser');
                    if (requestsParser) {
                        requestsParser.apply(context, arguments);
                    }
                })) : $.when({});
                context.metaDef = def;
            }
            return context.metaDef;
        };


        context.removeReferences(function() {
            requestConfigs = null;
            runningRequestCount = null;
            context = null;
        });


    };

    var setupChildViews = function(context) {

        var childViews = [];
        context.addChildView = function(view) {
            childViews.push(view);
            //view.parentView = context;
        };
        context.removeChildViews = function() {
            _.each(childViews, function(view) {
                view.parentView = null;
                if (view && view.remove) {
                    view.remove();
                }

            });
            childViews = [];
        };

        context.removeReferences(function() {
            childViews = null;
            context = null;
        });
    };


    /*
    var setupMessageRoom = function(context) {
        var fromIndex = {};
        var toIndex = {};
        context.listenFromView = function(view, name) {
            var currentView = fromIndex[name];
            if (currentView) {
                console.warn('removing listen from ', currentView);
                delete fromIndex[name];
            }
            fromIndex[name] = view;

            context.listenTo(view, 'viewEvent', function() {
                var args = _.rest(arguments);
                args.unshift('viewEvent:'+name);
                _.each(toIndex, function(toView) {
                    toView.trigger.apply(toView, args);
                });
            });
        };

        context.publishToView = function(view) {
            toIndex[view.cid] = view;
        };

        context.publishViewEvent = function() {
            var args = Array.prototype.slice(arguments);
            args.unshift('viewEvent');
            context.trigger.apply(context, args);
        };

        context.removeReferences(function() {
            fromIndex = null;
            toIndex = null;
            context = null;
        });
    };
    */

    var setupMessageRoom = function(context) {
        var eventViewIndex = {};
        context.addToMessageRoom = function(view, viewName) {
            eventViewIndex[viewName] = view;
            context.listenTo(view, 'postMessage', function() {
                var targetView = _.first(arguments);
                var eventName = 'message';
                var args = _.rest(arguments);
                args.unshift(view);
                args.unshift(viewName);
                args.unshift(eventName);
                if (targetView === 'all') {
                    _.each(eventViewIndex, function(toView, toViewName) {
                        //trigger only if view is not source
                        if (viewName !== toViewName) {
                            toView.trigger.apply(toView, args);
                        }
                    });
                }else{
                    var toView = eventViewIndex[targetView];
                    if(toView){
                        toView.trigger.apply(toView, args);
                    }
                }
            });
        };

        context.removeReferences(function() {
            eventViewIndex = null;
            context = null;
        });

    };


    var ifNotRemoved = function(view, fn) {
        return function() {
            if (!view.removed) {
                fn.apply(view, arguments);
            }
        };
    };

    var setupFunctions = [bindDataEvents,  bindAppEvents, bindCustomEvents, setupMessageRoom, setupMetaRequests, setupTemplateEvents, setupAttributeWatch, setupActionNavigateAnchors, setupRenderEvents, setupStateEvents, setupChildViews, setupConfig];

    return BaseView;
});
