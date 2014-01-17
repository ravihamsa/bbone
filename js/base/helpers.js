define(['base/app'], function (app) {
    "use strict";
    Handlebars.registerHelper('elementLabel', function (element) {
        return element.label || element.name;
    });

    var monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


    Handlebars.registerHelper('string', function (str) {
        return app.getString(str);
    });

 Handlebars.registerHelper('monthName', function(month) {
        return monthArr[month];
    });

    Handlebars.registerHelper('stringify', function (obj) {
        return JSON.stringify(obj);
    });

    Handlebars.registerHelper('toString', function (obj) {
        return obj.toString();
    });


    Handlebars.registerHelper('formLabel', function (str) {
        return app.getString('form.label.'+str);
    });
    Handlebars.registerHelper('toggleClass', function (attributeName) {

        if (this[attributeName]) {
            return attributeName;
        }
    });

    Handlebars.registerHelper('ifEqual', function (val1, val2, obj) {

        if (val1 === val2) {
            return obj.fn(this);
        }
        else if (obj.inverse) {
            return obj.inverse(this);
        }
    });
Handlebars.registerHelper('isTrue', function(val1, obj) {

        if (val1 === true) {
            return obj.fn(this);
        }
        else if (obj.inverse) {
            return obj.inverse(this);
        }
    });



    Handlebars.registerHelper('buttonType', function () {
        if (this.isPrimary) {
            return 'submit';
        } else {
            return 'button';
        }

    });
    Handlebars.registerHelper('buttonClass', function () {
        if (this.isPrimary) {
            return 'btn-primary-cta';
        } else if (this.isSecondary) {
            return 'btn-secondary-cta';
        } else {
            return 'btn-regular';
        }

    });



});
