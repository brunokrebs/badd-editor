(function () {
	var editorModule = angular.module('baddEditor');

	var baddDraggableDirective = function () {
		return {
			restrict: 'A',
			link: function (scope, element) {
				element.draggable({
					revert: false,
					helper: 'clone',
					iframeFix: true,
					drag: function () {
						$(this).addClass("drag-active");
						$(this).closest(element).addClass("drag-active");
					},
					stop: function (event, ui) {
						$(this).removeClass("drag-active").closest(element).removeClass("drag-active");
						var droppedEl = angular.element(ui.droppable);
					}
				});
			}
		}
	};

	editorModule.directive('baddDraggable', baddDraggableDirective);
}());