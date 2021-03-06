'use strict';

import 'angular/angular-csp.css';
import 'angular-ui-select/select.min.css';  

import jQuery from 'jquery';
import 'tinymce';
import 'tinymce/themes/modern/theme';
import 'tinymce/plugins/colorpicker/plugin.js';
import 'tinymce/plugins/code/plugin.js';
import 'tinymce/plugins/image/plugin.js';
import 'tinymce/plugins/textcolor/plugin.js';
import 'angular';
import 'angular-ui-select/select';
import 'angular-mocks';
import 'angular-cookies';
import 'angular-resource';
import 'angular-sanitize';
import 'angular-ui-router';
import 'angular-jwt';
import 'angular-aria';
import 'angular-animate';
//import 'angular-material';
import 'angular-materialize';
import 'angular-loading-bar';
import 'ng-file-upload';
import 'angular-ui-sortable';
import 'angular-ui-tinymce';
import 'angular-dragdrop/src/angular-dragdrop';
import 'angular-socket-io/dist/socket.io';
import 'angular-socket-io';
import 'ngmap';
import 'angucomplete-alt'; 
import 'materialize-clockpicker';
import 'moment';
import 'angular-moment';

window.$ = jQuery;

angular.element(document).ready(function () {
  // Fixing facebook bug with redirect
  if (window.location.hash === '#_=_') {
    window.location.hash = '#!';
  }

  // Then init the app
  angular.bootstrap(document, ['mean']);
});

function processModules (modules) {
  var packageModules = ['ngCookies', 'ngResource', 'ui.router', 'ui.select', 'ngSanitize','ngFileUpload','ui.sortable','ui.materialize','angularMoment'];
  var m;
  var mn;
  for (var index in modules) {
    m = modules[index];
    mn = 'mean.' + m.name;
    angular.module(mn, m.angularDependencies || []);
    packageModules.push(mn);
  }

  var req = require.context('./packages', true, /\/public\/(?!tests|assets|views)(.*)\.js$/);
  req.keys().map(req);
  req = require.context('./node_modules', true, /\/meanio-(.*)\/public\/(?!tests|assets|views)(.*)\.js$/);
  req.keys().map(req);
  angular.module('mean', packageModules);
}

jQuery.ajax('/_getModules', {
  dataType: 'json',
  async: false,
  success: processModules
});
