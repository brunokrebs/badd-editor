(function () {
	var editorModule = angular.module('baddEditor');

	var baddDroppableDirective = function ($compile, editorService) {
		var dir = this;

		dir.entered = null;
		dir.mouseListenerRegistered = false;
		dir.droppableObject = null;
		dir.droppableTarget = null;
		dir.verticalOrdering = 0;
		editorService.updateIframeOffset();

		dir.objectEntering = function(event, object) {
			registerMouseListener();
			checkObjectLeavingIssue($(this).parents());

			if (dir.entered) {
				return;
			}

			dir.entered = editorService.getNextUniqueClass();
			$(this).addClass(dir.entered);

			dir.droppableObject = object;
			dir.droppableTarget = $(this);
			dir.verticalOrdering = null;
		};

		dir.objectLeaving = function() {
			if (! dir.entered || ! $(this).hasClass(dir.entered)) {
				return;
			}

			dir.droppableTarget = null;
			dir.verticalOrdering = null;
			removePreview($(this));
		};

		function checkObjectLeavingIssue(parents) {
			// when a parent has no margin and no padding, out event is not triggered, therefore...
			parents.each(function() {
				if ($(this).hasClass(dir.entered)) {
					removePreview($(this));
					return;
				}
			});
		}

		function removePreview(target) {
			target.removeClass(dir.entered);
			dir.entered = null;

			if (editorService.objectPreview) {
				editorService.objectPreview.remove();
				editorService.hideHighlightBorder();
			}
		}

		function updatePreview(y) {
			if (y < 0) {
				return;
			}

			var updatedClosestTarget = null;
			var closestY = 10000000;
			var newVerticalOrdering = 0;
			dir.droppableTarget.children().each(function () {
				if (y <= $(this).offset().top && $(this).offset().top < closestY) {
					updatedClosestTarget = $(this);
					closestY = $(this).offset().top;
				}
				if (y > $(this).offset().top && !$(this).is(editorService.objectPreview)) {
					newVerticalOrdering++;
				}
			});

			if (dir.verticalOrdering === newVerticalOrdering) {
				return;
			}

			// add preview
			if (! editorService.objectPreview) {
				editorService.objectPreview = $(dir.droppableObject.draggable.data('raw'));
			}
			if (updatedClosestTarget) {
				editorService.objectPreview.insertBefore(updatedClosestTarget);
			} else {
				editorService.objectPreview.appendTo(dir.droppableTarget);
			}
			dir.verticalOrdering = newVerticalOrdering;

			editorService.showHighlightBorder(dir.droppableTarget);
		}

		function registerMouseListener() {
			if (dir.mouseListenerRegistered) {
				return;
			}

			$('html').mousemove(function(event) {
				if (!dir.droppableTarget || !dir.droppableObject) {
					return;
				}

				updatePreview(event.pageY - editorService.iframeOffsetY);
			});
			dir.mouseListenerRegistered = true;
		}

		dir.objectDropped = function(scope) {
			return function () {
				var body = dir.droppableTarget.parents('body');

				editorService.hideHighlightBorder();
				body.find(dir.entered).removeClass(dir.entered);
				dir.entered = null;

				$compile(editorService.objectPreview)(scope);

				editorService.objectPreview = null;
				dir.droppableObject = null;
				dir.droppableTarget = null;
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
	baddDroppableDirective.$inject = ['$compile', 'editorService'];

	editorModule.directive('baddDroppable', baddDroppableDirective);
}());