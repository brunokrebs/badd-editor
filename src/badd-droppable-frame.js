(function() {
	var editorModule = angular.module('baddEditor');

	var baddDroppableFrameDirective = function($compile) {
		return {
			restrict: 'E',
			scope: {
				template: '@'
			},
			replace: true,
			template: '<iframe class="browser"></iframe>',
			link: function (scope, element, attrs) {
				if (element.prop('tagName') !== 'IFRAME') {
					return;
				}

				element.attr('src', attrs.template);
				element.load(function () {
					// start baddEditor module
					var pageHtml = element.contents().find('html');
					pageHtml.attr('ng-app', 'baddEditor');

					// give editable style to editable page
					var pageHead = pageHtml.find('head');
					pageHead.append('<link rel="stylesheet" href="badd-editor-frame.min.css" type="text/css" />');

					// enable controller on body
					var pageBody = pageHtml.find('body');
					pageBody.attr('badd-droppable', '');
					pageBody.attr('ng-controller', 'editablePageController as ctrl');

					// make divs droppable and configurable
					var pageDivs = pageBody.find('div');
					pageDivs.attr('badd-droppable', '');
					pageDivs.attr('ng-click', 'ctrl.sendMessage()');

					$compile(pageHtml)(scope);
				});
			}
		}
	};
	baddDroppableFrameDirective.$inject = ['$compile'];

	editorModule.directive('baddDroppableFrame', baddDroppableFrameDirective);

	var editablePageController = function($window) {
		var ctrl = this;

		ctrl.message = 'Hello darling';

		ctrl.sendMessage = function() {
			$window.postMessage(ctrl.message, '*');
		};
	};
	editablePageController.$inject = ['$window'];
	editorModule.controller('editablePageController', editablePageController);
}());