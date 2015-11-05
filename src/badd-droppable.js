(function () {
	var editorModule = angular.module('baddEditor');

	var baddDroppableDirective = function ($compile) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var greedy = attrs.greedy;
				if (greedy == undefined) {
					greedy = true;
				}
				element.droppable({
					activeClass: "drop-active",
					greedy: greedy,
					hoverClass: "drop-hover",
					iframeFix: true,
					tolerance: "intersect",
					drop: function (event, ui) {
						var rawHtml = angular.element(ui.draggable).data('raw');
						var draggedEl = angular.element(ui.draggable);
						var droppedEl = angular.element(this);
						if (rawHtml == undefined) {
							rawHtml = $(draggedEl)[0].outerHTML;
						}
						$compile(rawHtml)(scope).appendTo(droppedEl);
						if (angular.element(ui.draggable).data('helper') == undefined) {
							$(draggedEl).remove();
						}
					}
				});
			}
		}
	};
	baddDroppableDirective.$inject = ['$compile'];

	editorModule.directive('baddDroppable', baddDroppableDirective);
}());