define([
        'base/app',
        'base/view',
        'base/model',
        'base/collection',
        'base/util',
        'widgets/table/rowCollection',
        'widgets/table/pagination'
    ],
    function(baseApp, BaseView, BaseModel, BaseCollection, baseUtil, RowCollection, Pagination) {
        'use strict';

        var TableModel = BaseModel.extend({

        });

        var ValueView = BaseView.extend({
            constructor: function() {
                var _this = this;
                BaseView.apply(_this, arguments);
                var rowModel = _this.getOption('rowModel');
                if (!rowModel) {
                    return;
                }
                var key = _this.model.get('key');
                _this.listenTo(rowModel, 'change:' + key, function(model, value) {
                    _this.model.set('value', value);
                });

            },
            tagName: 'td',
            template: '<div class="cell-value" style="text-align: {{align}};">{{#if renderHTML}}{{{value}}}{{else}}{{value}}{{/if}}</div>',
            attributes: function() {
                var obj = this.model.toJSON();
                return {
                    class: obj.classNames,
                    style: 'width:' + obj.width,
                    'data-key': obj.key
                };
            },
            valueChangeHandler: function() {
                this.render();
            },
            valueFunction: function() {
                return this.model.get('value');
            }
        });



        var HeaderCellView = ValueView.extend({
            tagName: 'th',
            template: '<div class="cell-value" style="text-align: {{align}};">{{#if renderHTML}}{{{label}}}{{else}}{{label}}{{/if}}</div>'
        });

        var CheckboxHeaderView = HeaderCellView.extend({
            constructor: function() {
                var _this = this;
                BaseView.apply(_this, arguments);
                var rowCollection = _this.getOption('rowCollection');
                var key = _this.model.get('key');


                var changeHanlder = function() {
                    var processedRecords = rowCollection.getProcessedRecords();
                    var selectedRecords = _.filter(processedRecords, function(model) {
                        return model.get(key) === true;
                    });

                    //console.log(selectedRecords.length, processedRecords.length);

                    if (processedRecords.length === 0) {
                        _this.model.set('value', false);
                        _this.model.set('disabled', true);
                        //_this.$('input').prop('disabled', true);
                    } else {

                        if (selectedRecords.length === processedRecords.length) {
                            _this.model.set('value', true);
                        } else {
                            _this.model.set('value', false);
                        }
                        _this.model.set('disabled', false);
                        //_this.$('input').prop('disabled', false);
                    }

                };

                _this.listenTo(rowCollection, 'change:' + key, changeHanlder);
                changeHanlder();

            },
            template: '<label class="cell-value" style="text-align: {{align}}; display:block;"> <input type="checkbox" /></label>',
            events: {
                'change input': 'updateRowCollection'
            },
            updateRowCollection: function() {
                var key = this.model.get('key');
                var rowCollection = this.getOption('rowCollection');
                var processedRecords = rowCollection.getProcessedRecords();
                var value = this.valueFunction();
                _.each(processedRecords, function(model) {
                    model.set(key, value);
                });
            },
            valueFunction: function() {
                return this.$('input').is(':checked');
            },
            valueChangeHandler: function(value) {
                //console.log('---',value, '----');
                this.$('input').prop('checked', value);
            },
            disabledChangeHandler: function(value) {
                //console.log(value, this.$('input'));
                this.$('input').prop('disabled', value);
            }
        });

        var CheckboxView = ValueView.extend({
            template: '<label class="cell-value" style="text-align: {{align}}; display:block;"> <input type="checkbox" /></label>',
            events: {
                'change input': 'updateRowModel'
            },
            updateRowModel: function() {
                var rowModel = this.getOption('rowModel');
                var key = this.model.get('key');
                rowModel.set(key, this.valueFunction());
            },
            valueFunction: function() {
                return this.$('input').is(':checked');
            },
            valueChangeHandler: function(value) {
                this.$('input').prop('checked', value);
            },
            disabledChangeHandler: function(value) {
                console.log(value, this.$('input'));
                this.$('input').prop('disabled', value);
            }
        });

        var cellTypeIndex = {
            'checkbox': CheckboxView
        };

        var headerCellTypeIndex = {
            'checkbox': CheckboxHeaderView
        };

        var RowView = BaseView.extend({
            tagName: 'tr',
            className: 'table-row',
            postRender: function() {
                var _this = this;
                var dataObj = this.model.toJSON(true);
                var items = dataObj.items;
                var rowModel = this.getOption('rowModel');

                _.each(items, function(item) {
                    var CellView = cellTypeIndex[item.type] || ValueView;
                    var cellView = baseUtil.createView({
                        View: CellView,
                        Model: BaseModel,
                        modelAttributes: item,
                        rowModel: rowModel,
                        parentView: _this
                    });
                    cellView.$el.appendTo(_this.$el);
                });

            },
            useDeepJSON: true
        });

        var HeaderView = RowView.extend({
            className: 'table-heading',
            postRender: function() {
                var _this = this;
                var dataObj = this.model.toJSON(true);
                var items = dataObj.items;
                var rowCollection = this.getOption('rowCollection');

                _.each(items, function(item) {
                    //console.log(item.type);
                    var CellView = headerCellTypeIndex[item.type] || HeaderCellView;
                    var cellView = baseUtil.createView({
                        View: CellView,
                        Model: BaseModel,
                        modelAttributes: item,
                        rowCollection: rowCollection,
                        parentView: _this
                    });
                    cellView.$el.appendTo(_this.$el);
                });

            }
        });

        var NoDataView = BaseView.extend({
            tagName:'tr',
            className:'table-row no-data-row',
            template: '<td colspan="{{colspan}}">{{{value}}}</td>'
        });

        var setupRowRender = function() {
            var _this = this;
            var viewIndex = {};
            var el = this.$el;
            var coll = this.getOption('rowCollection');
            var columns = this.getOption('columns');

            _this.addItem = function(model, index, containerEl) {
                var sortOrder = coll.getConfig('sortOrder');
                var sortKey = coll.getConfig('sortKey');

                var rowValueArray = _.map(columns, function(item) {
                    var classList = ['cell'];
                    if (sortKey === item.key) {
                        classList.push('sorted');
                        classList.push('order-' + sortOrder);

                    }

                    if (index % 2 === 0) {
                        classList.push('even');
                    }

                    var dataObj = model.toJSON();

                    return {
                        key: item.key,
                        type: item.type || 'value',
                        classNames: classList.join(' '),
                        value: baseApp.getFormatted(dataObj[item.key], item.formatter, dataObj),
                        align: item.align || 'left',
                        width: item.width !==undefined ? item.width + 'px' : 'auto',
                        renderHTML: item.renderHTML
                    };

                });

                var rowModel = new BaseModel({
                    items: new BaseCollection(rowValueArray)
                });


                var view = baseUtil.createView({
                    model: rowModel,
                    View: RowView,
                    parentView: _this,
                    rowModel: model
                });
                viewIndex[view.cid] = view;
                //console.log(view.$el.html());
                view.$el.appendTo(containerEl);

            };

            _this.addHeaderItem = function(containerEl) {
                var sortOrder = coll.getConfig('sortOrder');
                var sortKey = coll.getConfig('sortKey');

                var columnsArray = _.map(columns, function(item) {
                    var classList = ['header-cell'];
                    if (item.sortable !== false) {
                        classList.push('sortable');
                    }

                    if (sortKey === item.key) {
                        classList.push('sorted');
                        classList.push('order-' + sortOrder);
                    }

                    return {
                        key: item.key,
                        type: item.type || 'value',
                        classNames: classList.join(' '),
                        label: item.label || baseApp.beautifyId(item.key),
                        align: item.align || 'left',
                        width: item.width ? item.width + 'px' : 'auto'
                    };
                });

                var headerModel = new BaseModel({
                    items: new BaseCollection(columnsArray)
                });

                var headerView = baseUtil.createView({
                    View: HeaderView,
                    model: headerModel,
                    parentEl: containerEl,
                    parentView: _this,
                    rowCollection: coll
                });
                //console.log(coll);
                viewIndex[headerView.cid] = headerView;
            };

            _this.renderNoData = function() {
                var noDataView = baseUtil.createView({
                    View: NoDataView,
                    parentEl: '.row-list',
                    parentView: _this,
                    model: new BaseModel({
                        colspan:columns.length,
                        value:_this.getOption('noDataTemplate') || 'No Records'
                    })
                });
                viewIndex[noDataView.cid] = noDataView;

            };

            _this.removeItem = function(model) {
                var view = _this.getModelViewAt(model.id);
                view.remove();
            };

            _this.removeAllRows = function() {
                _.each(viewIndex, function(view) {
                    view.remove();
                });
            };

            _this.getModelViewAt = function(id) {
                return viewIndex[id];
            };

            _this.removeReferences(function() {
                _this = null;
                viewIndex = null;
                el = null;
                coll = null;
            });


        };



        var View = BaseView.extend({
            template: '<div class="table-header"></div> <table class="row-list"></table><div class="table-footer"></div>',
            className: 'data-table',
            events: {
                'click th.sortable': 'toggleSort'
            },
            constructor: function(options) {
                var _this = this;
                BaseView.call(_this, options);
                _.each([setupRowRender], function(func) {
                    func.call(_this, options);
                });
                var rowCollection = this.getOption('rowCollection');
                _this.listenTo(rowCollection, 'configChange', _this.loadRows);

            },
            redrawTable: function() {
                this.removeAllRows();
                this.renderHeader();
                this.renderRows();
            },
            postRender: function() {
                this.loadRows();
            },
            loadRows: function() {
                var _this = this;
                var eventName = 'loadComplete';
                _this.stopListening(_this, eventName);
                _this.listenToOnce(_this, eventName, _this.redrawTable);

                var coll = this.getOption('rowCollection');
                var collConfig = coll.getConfigs();

                if (collConfig.requestId) {

                    var def = _this.addRequest({
                        id: collConfig.requestId,
                        params: collConfig
                    });

                    def.done(function(resp) {
                        coll.reset(resp.results);
                        coll.setConfig('totalRecords', resp.totalRecords);
                        _this.trigger(eventName, eventName);
                    });
                } else if (coll.url) {
                    var fetchDef = coll.fetch({
                        processData: true,
                        reset: true
                    });
                    fetchDef.done(function(){
                        _this.trigger(eventName);
                    });
                } else {
                    _this.trigger(eventName);
                }
                
            },
            renderRows: function() {
                var _this = this;
                var coll = _this.getOption('rowCollection');
                var arrayOfRecords = coll.getProcessedRecords();
                var rowList = this.$('.row-list');

                if (arrayOfRecords.length === 0) {
                    _this.renderNoData();

                } else {
                    _.each(arrayOfRecords, function(model, index) {
                        _this.addItem(model, index, rowList);
                    });
                }
            },
            /*
            renderNoData: function() {
                var noDataTemplate = this.getOption('noDataTemplate') || 'No Records';
                var rowList = this.$('.row-list');
                var columns = this.getOption('columns');
                

            },
            */
            renderHeader: function() {
                var _this = this;
                var rowList = this.$('.row-list');
                _this.addHeaderItem(rowList);

            },
            loadingHandler: function(isLoading) {
                BaseView.prototype.loadingHandler.call(this, isLoading);
                //console.log(this.el);
            },
            toggleSort: function(e) {
                if(this.$('.no-data-row').length > 0){
                    e.preventDefault();
                    return;
                }
                var target = $(e.currentTarget);
                var colName = target.data('key');
                this.getOption('rowCollection').setSortKey(colName);
            }
        });

        return {
            View: View,
            RowCollection: RowCollection,
            Model: TableModel
        };


    });
