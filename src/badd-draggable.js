(function () {
	var editorModule = angular.module('baddEditor');

	var baddDraggableDirective = function (editorService) {
		return {
			restrict: 'A',
			link: function (scope, element) {
				var draggableDom = element[0];
				draggableDom.setAttribute('draggable', 'true');
				draggableDom.addEventListener('dragstart', editorService.startDragging, false);
				draggableDom.addEventListener('dragend', editorService.stopDragging, false);
			}
		}
	};
	baddDraggableDirective.$inject = ['editorService'];

	editorModule.directive('baddDraggable', baddDraggableDirective);
}());