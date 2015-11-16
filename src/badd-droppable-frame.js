(function() {
	var editorModule = angular.module('baddEditor');

	var baddDroppableFrameController = function($scope, editorService) {
		$scope.pageTitleChanged = function() {
			editorService.changePageTitle($scope.pageTitle);
		};
	};
	baddDroppableFrameController.$inject = ['$scope', 'editorService'];

	var baddDroppableFrameDirective = function($compile, editorService) {
		return {
			restrict: 'E',
			scope: {
				template: '@'
			},
			replace: true,
			templateUrl: 'badd-droppable-frame.html',
			controller: baddDroppableFrameController,
			link: function (scope, element, attrs) {
				var iframe = element.find('iframe');

				iframe.attr('src', attrs.template);
				iframe.on('load', editorService.initializeFrame(iframe, scope));
			}
		}
	};
	baddDroppableFrameDirective.$inject = ['$compile', 'editorService'];
	editorModule.directive('baddDroppableFrame', baddDroppableFrameDirective);
}());