var mdnData = require('./mdnData.json');
var elements = {};
for (var _i = 0, mdnData_1 = mdnData; _i < mdnData_1.length; _i++) {
    var element = mdnData_1[_i];
    elements[element.name] = {
        description: element.description
    };
}
mdnData;
elements;
