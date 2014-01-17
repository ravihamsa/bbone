define(['base/view'], function(BaseView) {
    "use strict";
    var ItemView = BaseView.extend({
        tagName: 'li',
        template: '{{name}}'
    });

    return ItemView;
});
