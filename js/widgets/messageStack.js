define(['base/app', 'base', 'list', 'text!./messageStack/messageStack.html'], function (app, Base, List, template) {

    'use strict';
    var baseUtil = Base.util;


    // Default Model.
    var MessageStackModel = Base.Model.extend({
        initialize: function () {
            
            var removeMessage = _.bind(this.removeMessage, this);
            var messageCollection = new MessageCollection();
            messageCollection.on('add', function (model) {
                var expires = model.get('expires');
                switch (expires) {
                    case -1:
                        model.removeSelf();
                        break;
                    case 0:
                        //do nothing
                        break;
                    default:
                        _.delay(removeMessage, expires * 1000, model);
                        break;
                }
            });
            this.messageCollection = messageCollection;
        },
        addMessage: function (obj) {
            var _this = this;
            obj.ts = new Date().getTime();
            _this.messageCollection.add(obj);
        },
        removeMessage: function (model) {
            this.messageCollection.remove(model);
        },
        removeAllMessages: function () {
            var _this = this;
            var messageIds = _this.messageCollection.pluck('ts');
            _.each(messageIds,function (id) {
                var model = _this.messageCollection.get(id);
                model.removeSelf();
            });

        }

    });

    /*
     expires can be seconds or 0 (never expires) or -1 (never shows up)
     messageType can be any string that added on class to message container
     */


    var MessageModel = Base.Model.extend({
        defaults: {
            expires: 10,
            isClosable: false,
            messageType: 'alert'
        },
        idAttribute: 'ts'
    });

    var MessageItemView = Base.View.extend({
        tagName: 'li',
        className: 'alert',
        template: app.compileTemplate("{{#if isClosable}}<button type=\"button\" class=\"close remove_message\" >&times;</button>{{/if}}{{{message}}}"),
        events: {
            'click .remove_message': 'removeMessage'
        },
        removeMessage: function () {
            this.model.removeSelf();
        },
        postRender: function () {
            var messageType = this.model.get('messageType');

            var alertClass = 'alert-danger';

            switch (messageType) {
                case 'warning':
                    alertClass = 'alert-warning';
                    break;
                case 'success':
                    alertClass = 'alert-success';
                    break;

            }
            this.$el.addClass(alertClass);
        }
    });

    // Default Collection.
    var MessageCollection = Base.Collection.extend({
        model: MessageModel
    });

    // Default View.
    var View = Base.View.extend({

        initialize: function () {
            this.viewIndex = {};
            if(!this.model){
                this.model = new MessageStackModel();
            }
            var messageCollection = this.model.messageCollection;
            this.listenTo(messageCollection, 'add remove', this.checkEmpty);
            this.listenTo(messageCollection, 'add', this.addMessage);
            this.listenTo(messageCollection, 'remove', this.removeMessage);

        },
        template: template,
        checkEmpty: function () {
            var messageCollection = this.model.messageCollection;
            if (messageCollection.length === 0) {
                this.$el.addClass("hide");
            } else {
                this.$el.removeClass("hide");
            }
        },
        addMessage: function (model) {
            if(!model.toJSON){
                model = new MessageModel(model);
            }
            var attributes = model.toJSON();
            var itemView = baseUtil.createView({
                View: MessageItemView,
                parentEl: '.' + attributes.messageType + '-list',
                parentView: this,
                model: model
            });
            this.viewIndex[model.id] = itemView;
        },
        removeMessage: function (model) {
            var itemView = this.viewIndex[model.id];
            this.viewIndex[model.id] = null;
            itemView.remove();
        }

    });


    return {
        View: View,
        Model: MessageStackModel,
        MessageCollection: MessageCollection
    };

});
