"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var packagesRoot = path.join(__dirname, '..', 'packages');
var packages = fs.readdirSync(packagesRoot).filter(function (item) { return (fs.lstatSync(path.join(packagesRoot, item)).isDirectory()); });
packages.forEach(function (packageName) {
    var packageJSONPath = path.join(packagesRoot, packageName, 'package.json');
    // const tsconfigPath = path.join(packagesRoot, packageName, 'tsconfig.json');
    var packageJSONData = JSON.parse(fs.readFileSync(packageJSONPath).toString());
    delete packageJSONData.scripts;
    packageJSONData.main = './lib/index.js';
    packageJSONData.types = './lib/index.d.ts';
    packageJSONData.files = ['lib', 'src'];
    packageJSONData.scripts = {
        'build': 'tsc -b ./tsconfig.package.json',
        'prepublish': 'npm run build'
    };
    packageJSONData.publishConfig = {
        access: 'public'
    };
    fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSONData, null, '  '));
});
