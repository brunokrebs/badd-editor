(function () {
	var editorModule = angular.module('baddEditor');

	var baddDroppableDirective = function ($compile, editorService) {
		return {
			restrict: 'A',
			link: function (scope, element) {
				var droppableDom = element[0];
				droppableDom.addEventListener('dragenter', editorService.elementEntering);
				droppableDom.addEventListener('dragleave', editorService.elementLeaving);
				droppableDom.addEventListener('dragover', editorService.elementHovering);
				droppableDom.addEventListener('drop', editorService.elementDropped);
			}
		}
	};
	baddDroppableDirective.$inject = ['$compile', 'editorService'];

	editorModule.directive('baddDroppable', baddDroppableDirective);
}());