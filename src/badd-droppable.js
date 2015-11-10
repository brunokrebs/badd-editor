(function () {
	var editorModule = angular.module('baddEditor');

	var baddDroppableDirective = function ($compile, editorService) {
		var dir = this;

		dir.entered = null;
		dir.mouseListenerRegistered = false;
		dir.iframeOffsetY = null;
		dir.droppableObject = null;
		dir.droppableTarget = null;
		dir.verticalOrdering = 0;

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

			var body = target.parents('body');
			body.find('.badd-highlighter').remove();
			if (dir.objectPreview) {
				dir.objectPreview.remove();
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
				if (y > $(this).offset().top && !$(this).is(dir.objectPreview)) {
					newVerticalOrdering++;
				}
			});

			if (dir.verticalOrdering === newVerticalOrdering) {
				return;
			}

			removePreview(dir.droppableTarget);

			// add preview
			dir.objectPreview = $(dir.droppableObject.draggable.data('raw'));
			if (updatedClosestTarget) {
				dir.objectPreview.insertBefore(updatedClosestTarget);
			} else {
				dir.droppableTarget.append(dir.objectPreview);
			}
			dir.verticalOrdering = newVerticalOrdering;
		}

		function registerMouseListener() {
			if (dir.mouseListenerRegistered) {
				return;
			}

			updateIframeOffset();

			$('html').mousemove(function(event) {
				if (!dir.droppableTarget || !dir.droppableObject) {
					return;
				}
				updatePreview(event.pageY - dir.iframeOffsetY);

				// draw highlight border
				var position = dir.droppableTarget.offset();
				var width = dir.droppableTarget.outerWidth();
				var height = dir.droppableTarget.outerHeight();

				var body = dir.droppableTarget.parents('body');
				body.append('<div class="badd-highlighter" style="position: fixed; top: ' + position.top +
					'px ; left: ' + position.left +
					'px ; width: ' + width + 'px; height: ' + height + 'px; border: 2px dashed lightskyblue;" />');
			});
			dir.mouseListenerRegistered = true;
		}

		function updateIframeOffset() {
			var iframe = $('html').find('iframe.badd-editor-browser');
			dir.iframeOffsetY = iframe.offset().top;
		}

		dir.objectDropped = function(scope) {
			return function (event) {
				$compile(objectPreview)(scope);

				dir.objectPreview = null;
				dir.droppableObject = null;
				dir.droppableTarget = null;

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
	baddDroppableDirective.$inject = ['$compile', 'editorService'];

	editorModule.directive('baddDroppable', baddDroppableDirective);
}());