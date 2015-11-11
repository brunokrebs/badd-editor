(function() {
	var editorModule = angular.module('baddEditor');

	var baddDroppableFrameDirective = function($compile, editorService) {
		return {
			restrict: 'E',
			scope: {
				template: '@'
			},
			replace: true,
			template: '<iframe class="badd-editor-browser"></iframe>',
			link: function (scope, element, attrs) {
				if (element.prop('tagName') !== 'IFRAME') {
					return;
				}

				element.attr('src', attrs.template);
				element.on('load', editorService.initializeFrame(element, scope));
			}
		}
	};
	baddDroppableFrameDirective.$inject = ['$compile', 'editorService'];
	editorModule.directive('baddDroppableFrame', baddDroppableFrameDirective);

	var baddDroppableFrameController = function($window) {
		var ctrl = this;

		ctrl.sendMessage = function() {
			$window.postMessage(ctrl.message, '*');
		};
	};
	baddDroppableFrameController.$inject = ['$window'];
	editorModule.controller('baddDroppableFrameController', baddDroppableFrameController);
}());