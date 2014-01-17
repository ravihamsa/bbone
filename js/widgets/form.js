/**
 * Created with JetBrains WebStorm.
 * User: ravi.hamsa
 * Date: 14/06/13
 * Time: 12:28 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'base/app',
    'base/util',
    'base',
    'widgets/form/element',
    'widgets/messageStack',
    'widgets/calendar',
    'text!./form/checkListView.html',
    'text!./form/checkBoxView.html',
    'text!./form/radioListView.html',
    'text!./form/selectView.html',
    'text!./form/textAreaView.html',
    'text!./form/buttonView.html',
    'text!./form/dateInputView.html',
    'text!./form/messageView.html'
], function(app, baseUtil, Base, Element, MessageStack, Calendar, checkListTemplate, checkBoxTemplate, radioListTemplate, selectViewTemplate, textAreaTemplate, buttonViewTemplate, dateInputTemplate, messageViewTemplate) {
    'use strict';

    var ElementView = Element.View;
    var ElementModel = Element.Model;
    var ElementCollection = Element.Collection;

    var ButtonView = ElementView.extend({
        template: buttonViewTemplate,
        valueFunction: function () {
            return this.$('button').text();
        },
        valueChangeHandler: function (value) {
            this.$('button').text(value);
        },
        activeChangeHandler:function(value){
            this.$('button').prop('disabled', !value);
        }
    });

var InputView = ElementView.extend({
        events: {
            'change input': 'updateValue',
            'blur input': 'resetIfEmpty',
            'focus input': 'selectIfDefault',
            'click input': 'clearIfDefault'
        },
        selectIfDefault: function() {
            if (this.model.isElementDefault()) {
                this.$('input').select();
            }
        },
        clearIfDefault: function() {
            if (this.model.isElementDefault()) {
                this.$('input').val('');
            }
        },
        resetIfEmpty: function() {
            var inputValue = this.$('input').val();
            if (inputValue === '') {
                var attr = this.model.toJSON();
                if (attr.defaultValue) {
                    this.$('input').val(attr.defaultValue);
                }
            }
            this.updateValue();
        }
    });

    var DateInputView = InputView.extend({
        template: dateInputTemplate,
        events: {
            'click .dateInput': 'showDatePicker',
            'change .dateInput': 'dateChangeHandler'
        },
        postRender: function() {
            var _this = this;
            _this.hideDatePicker();
            var monthView = this.getSubView('monthView');
            this.listenTo(monthView, 'dateClicked', function(date) {
                _this.hideDatePicker();
                _this.$('.dateInput').val(date.format('L'));
                _this.updateValue();
            });

            var monthViewEl = monthView.$el;

            this.listenTo(app,'bodyClick',function  (e) {
                var target = $(e.target);
                if (target.parents().index(_this.$el) == -1) {
                    if (monthViewEl.is(":visible")) {
                        monthViewEl.hide();
                    }
                }
            });
        },
        views: {
            monthView: {
                View: Calendar.Month.View,
                Model: Calendar.Month.Model,
                parentEl: '.monthView'
            }
        },
        showDatePicker: function() {
            var monthView = this.getSubView('monthView');
            var value = this.model.get('value');
            var date = moment(value, 'MM/DD/YYYY');
            monthView.model.set({
                year: date.year(),
                month: date.month(),
                selectedEpoch: date.valueOf()
            });
            monthView.show();

        },
        hideDatePicker: function() {
            var monthView = this.getSubView('monthView');
            monthView.hide();
        },
        valueFunction: function() {
            return this.$('.dateInput').val();
        },
        valueChangeHandler: function(value) {
            var date = moment(value, 'MM/DD/YYYY');
            if (!date.isValid()) {
                date = moment();
                this.model.set('value', date.format('L'));
            }
            this.$('.dateInput').val(date.format('L'));
        },
        dateChangeHandler: function() {
            var value = this.$('.dateInput').val();
            var date = moment(value, 'MM/DD/YYYY');
            if (!date.isValid()) {
                this.valueChangeHandler(this.model.get('value'));
            } else {
                this.model.set('value', value);
                this.hideDatePicker();
            }
        }
    });
    var CheckboxView = ElementView.extend({
        template: checkBoxTemplate,
        valueFunction: function () {
            return this.$('input').is(':checked');
        },
        valueChangeHandler: function (value) {
            this.$('input').attr('checked', value);
        }
    });
    var TextAreaView = ElementView.extend({
        template: textAreaTemplate,
        valueFunction: function () {
            return this.$('textarea').val();
        },
        valueChangeHandler: function (value) {
            this.$('textarea').val(value);
        }
    });

    var SelectView = ElementView.extend({
        template: selectViewTemplate,
        valueFunction: function () {
            return this.$('select').val();
        },
        valueChangeHandler: function (value) {
            this.$('select').val(value);
        },
        disabledChangeHandler: function (value) {
            this.$el.toggleClass('disabled', value);
            this.$('select').attr('disabled', value);
        }
    });


    var RadioListView = ElementView.extend({
        template: radioListTemplate,
        valueFunction: function () {
            return this.$('input:checked').val();
        },
        valueChangeHandler: function (value) {
            this.$('input[value=' + value + ']').attr('checked', true);
        }
    });

    var CheckListView = ElementView.extend({
        template: checkListTemplate,
        valueFunction: function () {
            var selectedOptions = this.$('input:checked');

            var valueArr = _.map(selectedOptions, function (option) {
                return $(option).val();
            });

            return valueArr;
        },
        valueChangeHandler: function (valueArr) {
            //this.$('input[value='+value+']').attr('checked',true);
            if (_.isArray(valueArr)) {
                _.each(valueArr, function (value) {
                    this.$('input[value=' + value + ']').attr('checked', true);
                }, this);
            }
        }
    });

    var HiddenView = ElementView.extend({
        template: '<input type="hidden" value="{{value}}" name="{{name}}" />',
        valueChangeHandler: function (value) {
            this.$('input').val(value);
            this.$('input').trigger('change');
        },
        valueFunction: function () {
            return '' + this.$('input').val();
        }
    });

    var ContainerView = ElementView.extend({
        template: ' ',
        valueChangeHandler: function (value) {
            //this.$('input').val(value);
        },
        valueFunction: function () {
            //return this.$('input').val();
        }
    });


    var InputView = ElementView.extend({
        selectIfDefault: function () {
            if (this.model.isElementDefault()) {
                this.$('input').select();
            }
        },
        clearIfDefault: function () {
            if (this.model.isElementDefault()) {
                this.$('input').val('');
            }
        },
        resetIfEmpty: function () {
            var inputValue = this.$('input').val();
            if (inputValue === '') {
                var attr = this.model.toJSON();
                if(attr.defaultValue){
                    this.$('input').val(attr.defaultValue);
                }
            }
            this.updateValue();
        }
    });



    var MessageView = ElementView.extend({
        template:messageViewTemplate,
        valueChangeHandler:function(value){
            this.$('.message').html(value);
        },
        valueFunction:function(){
            return this.$('.message').html();
        }
    });


    var HiddenJSONView = ElementView.extend({
        template: '<input type="hidden" value="{{value}}" name="{{name}}" />',
        valueChangeHandler: function (value) {
            this.$('input').val(JSON.stringify(value));
            //console.log(value, 'HiddenJSONView');
            this.updateValue();
        },
        valueFunction: function () {
            return JSON.parse(this.$('input').val());
        }
    });

    var CheckboxList = ElementView.extend({
        valueFunction: function () {
            return this.$('input').is(':checked');
        },
        valueChangeHandler: function (value) {
            this.$('input').attr('checked', value);
        }
    });

    var typeViewIndex = {
        'select': SelectView,
        'textarea': TextAreaView,
        'checkbox': CheckboxView,
        'dateInput': DateInputView,
        'radioList': RadioListView,
        'checkList': CheckListView,
        'hidden': HiddenView,
        'json': HiddenJSONView,
        'button': ButtonView,
        'message': MessageView,
        'container': ContainerView
    };

    var getViewByType = function (type) {
        return typeViewIndex[type] || InputView;
    };

    var setViewByType = function (type, View) {
        typeViewIndex[type] = View;
    };

    var updateTypeViewIndex = function (indexObj) {
        typeViewIndex = _.extend({}, typeViewIndex, indexObj);
    };

    var FormModel = Base.Model.extend({
        constructor: function () {
            Base.Model.apply(this, arguments);
        },
        defaults: {
            elements: new ElementCollection()
        },
        setElementAttribute: function (elementName, attribute, value) {
            var elements = this.get('elements');
            elements.get(elementName).set(attribute, value);
        },
        getValueObject: function () {
            var elements = this.get('elements');
            elements.each(function(model){
                model.trigger('forceUpdate');
            });
            var errors = this.validateElements();
            var obj = {};
            if (errors.length === 0) {
                elements.each(function (model) {
                    if (model.is('active') && model.isNotEqual('type', 'button')) {
                        obj[model.id] = model.get('value');
                    }
                });
            }else{
                obj.errors = errors;
            }
            return obj;
        },
        validateElements: function () {
            var elements = this.get('elements');
            var errors = [];
            elements.each(function (model) {

                errors = errors.concat(model.isElementValid());

            });
            return errors;
        },
        elementsChangeHandler: function () {

            var elements = this.get('elements');
            elements.on('change', function (model) {
                var eventName = 'change';
                var args = Array.prototype.slice.call(arguments, [0]);
                args[0] = 'elements:' + eventName;
                this.trigger.apply(this, args);
                args[0] = 'elements:' + model.get('name') + ':' + eventName;
                this.trigger.apply(this, args);
            }, this);
        }

    });


    var groupPrefix = 'grp-';


    var FormView = Base.View.extend({
        constructor: function (options) {
            this.typeViewIndex = {};
            Base.View.apply(this, arguments);
        },
        tagName: 'div',
        className: 'form-view',
        events: {
            'submit form': 'formSubmitHandler'
        },
        template: '<div class="message-stack"></div><form action="{{actionId}}" class="form-vertical" method=""> <div class="group-list"></div> <div class="grp-buttons"> </div> </form>',

        postRender: function () {
            this.formEl = this.$('form');
            this.renderGroupContainers();
            this.renderMessageStack();
            var model = this.model;
            var elements = model.get('elements');
            elements.each(function (elementModel) {
                this.addElement(elementModel);
            }, this);
        },
        addElement: function (model) {
            var attr = model.toJSON();
            var thisView = this;
            var ElementView = this.typeViewIndex[attr.type] || getViewByType(attr.type);

            var name = attr.name;
            var view;
            //if element already rendered dont render again
            var viewEl = this.$('.element-' + name);

            if (viewEl.length !== 0) {
                view = new ElementView({
                    model: model,
                    el: viewEl
                });
                view.trigger('rendered');
                view.postRender();
            } else {

                view = baseUtil.createView({
                    View: ElementView,
                    model: model,
                    parentView: thisView
                });

                var group = attr.group;
                this.$('.' + groupPrefix + group).append(view.el);
            }
        },
        removeElement: function (model) {
            //TODO: needs to be implemented
        },
        renderGroupContainers: function () {
            var model = this.model;
            var elements = model.get('elements');
            var groupList = _.unique(elements.pluck('group'));
            var groupListEl = this.$('.group-list');
            _.each(groupList, function (groupName) {
                if (this.$('.' + groupPrefix + groupName).length === 0) {
                    groupListEl.append('<div class="' + groupPrefix + groupName + '"></div>');
                }
            }, this);
        },

        renderMessageStack: function () {
            /*
            var messageStack = new MessageStack.Model();

            var messageStackView = new MessageStack.View({
                model: messageStack,
                el: this.$('.message-stack')
            });
             messageStackView.render();
            */
            
            var messageStackView = baseUtil.createView({
                View:MessageStack.View,
                Model:MessageStack.Model,
                parentEl:'.message-stack',
                parentView:this
            });


            var messageStack = messageStackView.model;

            messageStackView.listenTo(this,'showMessages', function (messages) {
                messageStack.removeAllMessages();
                _.each(messages, function (message) {
                    var messageModel = new MessageStack.Model(message);
                    messageStack.addMessage(messageModel.toJSON());
                });
            });

            messageStackView.listenTo(this, 'clearMessages', function () {
                messageStack.removeAllMessages();
            });


            /*
            this.on('showMessages', function (messages) {

                messageStack.removeAllMessages();
                _.each(messages, function (message) {
                    console.log('showMessages handled', message.message)
                    var messageModel = new MessageStack.Model(message);
                    messageStack.addMessage(messageModel.toJSON());
                });
            });

            this.on('clearMessages', function () {
                console.log('clearMessages handled')
                messageStack.removeAllMessages();
            });

            */
            var errors =  this.model.get('errors');
            if(errors && errors.length > 0){
                this.trigger('showMessages', errors);
            }
        },
        formSubmitHandler: function (e) {
            e.preventDefault();

            this.trigger('clearMessages');

            var dataObj = this.model.getValueObject();

            var actionId = this.model.get('actionId');

            if (this.options.prePostParser) {
                dataObj = this.options.prePostParser(dataObj);
            }

            this.trigger('formSubmit', dataObj);
        },
        addToTypeViewIndex: function (type, View) {
            this.typeViewIndex[type] = View;
        },
        submitSuccessHandler: function () {
            console.log(arguments);
        },
        submitFailureHandler: function (resp, errors) {
            _.each(errors, function (error) {
                error.messageType = 'failure';
                error.expires = 0;
            });
            this.trigger('showMessages', errors);
        },
        setElementValue: function (name, value) {
            var elements = this.model.get('elements');
            elements.get(name).set('value', value);
        },
        resetForm:function(clearMessages){
            var elements = this.model.get('elements');
            elements.each(function(model){
                model.resetValue(true);
            });

            if(clearMessages){
                this.trigger('clearMessages');
            }
        }
    });


    FormView.addToTypeViewIndex = function (type, View) {
        setViewByType(type, View);
    };

    return {
        Model: FormModel,
        View: FormView,
        ElementModel: ElementModel,
        ElementCollection: ElementCollection,
        ElementView: ElementView
    };
});
