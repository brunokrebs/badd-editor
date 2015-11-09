(function () {
	var editorModule = angular.module('baddEditor');

	var baddDroppableDirective = function ($compile) {
		var dir = this;

		dir.objectEntering = function(event, object) {
			// add preview
			dir.objectPreview = $(object.draggable.data('raw'));
			$(this).append(dir.objectPreview);

			// draw highlight border
			var position = $(this).offset();
			var width = $(this).outerWidth();
			var height = $(this).outerHeight();

			var body = $(this).parents('body');
			body.append('<div class="badd-highlighter" style="position: fixed; top: ' + position.top +
				'px ; left: ' + position.left +
				'px ; width: ' + width + 'px; height: ' + height + 'px; border: 2px dashed lightskyblue;" />');
		};

		dir.objectLeaving = function(event) {
			var body = $(event.target).parents('body');
			body.find('.badd-highlighter').remove();
			if (dir.objectPreview) {
				dir.objectPreview.remove();
			}
		};

		dir.objectDropped = function(scope) {
			return function (event, ui) {
				var rawHtml = angular.element(ui.draggable).data('raw');
				var draggedEl = angular.element(ui.draggable);
				var droppedEl = angular.element(this);
				if (rawHtml == undefined) {
					rawHtml = $(draggedEl)[0].outerHTML;
				}
				$compile(rawHtml)(scope).appendTo(droppedEl);

				dir.objectLeaving(event);
			}
		};

		return {
			restrict: 'A',
			link: function (scope, element) {
				element.droppable({
					activeClass: 'drop-active',
					greedy: true,
					hoverClass: 'drop-hover',
					iframeFix: true,
					tolerance: 'intersect',
					over: dir.objectEntering,
					out: dir.objectLeaving,
					drop: dir.objectDropped(scope)
				});
			}
		}
	};
	baddDroppableDirective.$inject = ['$compile'];

	editorModule.directive('baddDroppable', baddDroppableDirective);
}());