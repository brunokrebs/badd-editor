(function () {
	var editorModule = angular.module('baddEditor');

	var baddDraggableDirective = function (editorService) {
		return {
			restrict: 'A',
			link: function (scope, element) {
				var iframeOffset = $('iframe.badd-editor-browser').offset();
				// TODO what the heck?
				iframeOffset.left = iframeOffset.left + 62;
				iframeOffset.top = iframeOffset.top + 22;
				element.draggable({
					revert: false,
					helper: 'clone',
					iframeFix: true,
					refreshPositions: true,
					cursorAt: iframeOffset,
					drag: function () {
						$(this).addClass("drag-active");
						$(this).closest(element).addClass("drag-active");
					},
					stop: function (event, ui) {
						$(this).removeClass("drag-active").closest(element).removeClass("drag-active");
						editorService.objectPreview = null;
					}
				});
			}
		}
	};
	baddDraggableDirective.$inject = ['editorService'];

	editorModule.directive('baddDraggable', baddDraggableDirective);
}());