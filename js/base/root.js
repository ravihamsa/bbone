define(['base/view', 'base/app', 'widgets/header'], function(BaseView, baseApp, Header) {

    "use strict";

    var currentPageView;
    var currentApp;


    var renderPage = function(appId, pageId, params) {
        console.log('renderPage', appId, pageId, params);
        if (currentPageView) {
            //console.log('currentPageView removed ', new Date().toLocaleTimeString());
            currentPageView.remove();
        }



        require(['apps/' + appId + '/pages/' + pageId], function(Page) {
            var view = new Page.View({
                model: new Page.Model(params)
            });
            var el = $(baseApp.appBody);
            el.empty();
            el.html(view.el);
            view.render();
            currentPageView = view;
        });
    };

    var RootView = BaseView.extend({
        postRender: function() {
            var header = new Header.View({
                el: this.$('#header'),
                model: this.model
            });
            header.render();
        },

        changeHandler: function(changes) {
            var _this = this;
            var attr = _this.model.toJSON();
            console.log(changes);
            if (changes.hasOwnProperty('appId')) {
                require(['apps/' + attr.appId], function() {
                    require(['apps/' + attr.appId + '/app'], function(activeApp) {

                        if (currentApp) {
                            currentApp.tearApp();
                        }
                        activeApp.setupApp(function() {
                            if (!attr.hasOwnProperty('pageId')) {
                                _this.model.set('pageId', activeApp.defaultPage);
                            } else {
                                renderPage(attr.appId, attr.pageId, attr);
                            }
                        });
                        currentApp = activeApp;

                    });
                });
            } else if (changes.hasOwnProperty('pageId')) {
                require(['apps/' + attr.appId + '/app'], function(activeApp) {
                    if (changes.pageId === undefined) {
                        _this.model.set('pageId', activeApp.defaultPage);
                        attr = _this.model.toJSON();
                    } else {
                        renderPage(attr.appId, attr.pageId, attr);
                    }

                });
            } else if (currentPageView) {
                currentPageView.model.reset(attr);
            }
        },
        preRendered: true
    });

    return {
        View: RootView
    };

});