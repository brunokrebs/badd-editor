(function() {
	var editorModule = angular.module('baddEditor');

	var baddDroppableFrameDirective = function($compile) {
		return {
			restrict: 'A',
			link: function (scope, element) {
				if (element.prop('tagName') !== 'IFRAME') {
					return;
				}

				element.ready(function () {
					var ifrBody = element.contents().find('body');
					//alert(ifrBody.attr('id'));
					ifrBody.attr('badd-droppable', '');
					$compile(ifrBody)(scope);
				});
			}
		}
	};
	baddDroppableFrameDirective.$inject = ['$compile'];

	editorModule.directive('baddDroppableFrame', baddDroppableFrameDirective);
}());