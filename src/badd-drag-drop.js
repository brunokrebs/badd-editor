(function() {
	var editorModule = angular.module('baddEditor');

	var baddDragDropService = function(BADD_EVENTS) {
		var dragDropService = this;
		var currentScope, mainWindow, mainDocument, mainBody, iframe, iframeWindow, iframeDocument, iframeBody;
		var iframeLeftOffset, iframeTopOffset, draggableConteiner, transferArea, previewElement,
			lastHoveredDroppable, lastDraggedElement, draggableIcon;

		var droppableElements = ['DIV', 'BODY', 'P'];
		var draggableElements = ['DIV', 'IMG', 'P', 'BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
		var draggableIcons = [
			{ tagName: 'DIV', icon: 'fa fa-square-o' },
			{ tagName: 'IMG', icon: 'fa fa-picture-o' },
			{ tagName: 'P', icon: 'fa fa-align-left' },
			{ tagName: 'BUTTON', icon: 'fa fa-plus-square' },
			{ tagName: 'A', icon: 'fa fa-link' },
			{ tagName: 'H1', icon: 'fa fa-header' },
			{ tagName: 'H2', icon: 'fa fa-header' },
			{ tagName: 'H3', icon: 'fa fa-header' },
			{ tagName: 'H4', icon: 'fa fa-header' },
			{ tagName: 'H5', icon: 'fa fa-header' },
			{ tagName: 'H6', icon: 'fa fa-header' }
		];

		dragDropService.setup = function(window, scope) {
			if (mainWindow != null) {
				return;
			}

			currentScope = scope;

			// defining shortcuts to editor's window, document and body
			mainWindow = window;
			mainDocument = mainWindow.document;
			mainBody = mainDocument.querySelector('body');

			// defining shortcuts to editor's iframe window and document
			iframe = mainDocument.querySelector('iframe.badd-editor-browser');
			iframeWindow = iframe.contentWindow;
			iframeDocument = iframeWindow.document;
			iframeBody = iframeDocument.querySelector('body');
			var boundingRect = iframe.getBoundingClientRect();
			var computedStyle = window.getComputedStyle(iframe);
			iframeLeftOffset = boundingRect.left + parseInt(computedStyle['padding-left']);
			iframeTopOffset = boundingRect.top + parseInt(computedStyle['padding-top']);

			// adding mouse event handlers for both windows (main's and iframe's)
			mainWindow.addEventListener('mousedown', startDraggingComponent);
			mainWindow.addEventListener('mouseup', stopDragging);
			mainWindow.addEventListener('mousemove', updateDraggableIcon);
			mainWindow.addEventListener('blur', focusLost);
			iframeWindow.addEventListener('mousedown', startDraggingElement);
			iframeWindow.addEventListener('mouseup', stopDragging);
			iframeWindow.addEventListener('mousemove', updateIframe);

			// adding conteiner to hold our pointer icon
			draggableConteiner = mainDocument.createElement('svg');
			draggableConteiner.className = 'badd-draggable-conteiner';
			mainBody.appendChild(draggableConteiner);

			// creating transfer area to help on showing preview element
			transferArea = mainDocument.createElement('div');
			transferArea.className = 'badd-transfer-area';
			mainBody.appendChild(transferArea);
		};

		function emitHovering(target, dragging) {
			currentScope.$emit(BADD_EVENTS.ELEMENT_HOVERED, { target: target, dragging: dragging });
		}

		function startDraggingComponent(event) {
			event.preventDefault();

			// trying to find the real draggable element
			var draggableElement = event.target;
			if (draggableElement.getAttribute('badd-draggble-label') != null) {
				while (draggableElement.getAttribute('badd-draggable') == null) {
					draggableElement = draggableElement.parentNode;
				}
			}

			// stop in case it was not found
			if (draggableElement.getAttribute('badd-draggable') == null) {
				return;
			}

			// adding preview element to our transfer area
			transferArea.innerHTML = draggableElement.getAttribute('data-element');
			previewElement = transferArea.childNodes[0];
			previewElement.style.pointerEvents = 'none';

			// lets create a nice icon to follow the pointer
			updateDraggableIcon(event, previewElement.tagName);
		}

		function startDraggingElement(event) {
			if (event.which == 3) {
				return;
			}

			event.preventDefault();

			if (!_.contains(draggableElements, event.target.tagName)) {
				return;
			}

			// setting draggable icon to be equal to the element being dragged
			updateDraggableIcon(event);

			// adding preview element to our transfer area
			transferArea.appendChild(event.target.cloneNode(true));
			previewElement = transferArea.childNodes[0];
			previewElement.style.pointerEvents = 'none';

			lastDraggedElement = event.target;
		}

		function getDraggableIcon(draggableTagName) {
			var icon = 'fa fa-question';
			_.forEach(draggableIcons, function(draggableIcon) {
				if (draggableIcon.tagName === draggableTagName) {
					icon = draggableIcon.icon;
				}
			});
			return icon;
		}

		function stopDragging(event) {
			event.preventDefault();

			if (!previewElement) {
				return;
			}

			// now that the user released the button we can remove our nice icon
			draggableConteiner.innerHTML = '';
			draggableIcon = null;

			if (lastDraggedElement && event.target != iframeDocument) {
				lastDraggedElement.style.removeProperty('pointer-events');
				lastDraggedElement = null;
			}

			var droppableTarget = event.target;
			// lets try to find a droppable parent
			while (droppableTarget && ! _.contains(droppableElements, droppableTarget.tagName)) {
				droppableTarget = droppableTarget.parentNode;
			}

			// removing preview
			cleanPreviewElement(droppableTarget);
		}

		function updateDraggableIcon(event, draggableTagName) {
			if (event.target.ownerDocument == mainDocument) {
				// no target and no draggable since we are hover the main document
				emitHovering();

				if (previewElement && previewElement.parentNode
						&& previewElement.ownerDocument == iframeDocument) {
					previewElement.parentNode.removeChild(previewElement);
				} else if (lastDraggedElement) {
					lastDraggedElement.parentNode.removeChild(lastDraggedElement);
					lastDraggedElement = null;
				}
			}
			if (!draggableIcon && !draggableTagName) {
				// we are dragging nothing, so stop now
				return;
			}

			if (draggableTagName && !draggableIcon) {
				draggableConteiner.innerHTML = '<i class="' + getDraggableIcon(draggableTagName) + '"></i>';
				draggableIcon = draggableConteiner.childNodes[0];
				draggableIcon.style.display = 'block';
				draggableIcon.style.position = 'fixed';
				draggableIcon.style.fontSize = '30px';
				draggableIcon.style.backgroundColor = '#2385DC';
				draggableIcon.style.border = '1px solid #999';
				draggableIcon.style.color = '#fff';
				draggableIcon.style.padding = '10px';
				draggableIcon.style.zIndex = 16777220;
			}

			// making our nice icon follow the pointer
			var leftOffset = 0;
			var topOffset = 0;

			if (event.target.ownerDocument == iframeDocument) {
				leftOffset = iframeLeftOffset;
				topOffset = iframeTopOffset;
			}

			// firefox bug
			if (event.clientX < 0 || event.clientY < 0) {
				leftOffset = iframeLeftOffset;
				topOffset = iframeTopOffset;
			}

			draggableIcon.style.left = (event.clientX + leftOffset) + 'px';
			draggableIcon.style.top = (event.clientY - 55 + topOffset) + 'px';
		}

		function focusLost() {
			// when main window looses focus, we can remove our nice icon
			if (lastDraggedElement) {
				lastDraggedElement.style.removeProperty('pointer-events');
			}
			draggableConteiner.innerHTML = '';
			draggableIcon = null;
			if (previewElement) {
				cleanPreviewElement(lastHoveredDroppable);
			}
		}

		function updateIframe(event) {
			if (event.target == iframeDocument) {
				// firefox work around
				if (lastDraggedElement) {
					lastDraggedElement.parentNode.removeChild(lastDraggedElement);
					lastDraggedElement = null;
				} else if (previewElement && previewElement.parentNode) {
					previewElement.parentNode.removeChild(previewElement);
				}
				updateDraggableIcon(event);
				return;
			}

			if (previewElement == null) {
				emitHovering(event.target, false);
			} else {
				if (lastDraggedElement && lastDraggedElement.style.pointerEvents != 'none') {
					lastDraggedElement.style.pointerEvents = 'none';
					return;
				}

				emitHovering(null, true);
				updateDraggableIcon(event, previewElement.tagName);
				updatePreviewElement(event);
			}
		}

		function updatePreviewElement(event) {
			var droppableTarget = event.target;
			// lets try to find a droppable parent
			while (! _.contains(droppableElements, droppableTarget.tagName)) {
				droppableTarget = droppableTarget.parentNode;
			}

			if (lastDraggedElement) {
				var nextSibling = getNearestSibling(event, droppableTarget);
				if (droppableTarget == lastDraggedElement.parentNode && (
						nextSibling == lastDraggedElement.nextElementSibling || nextSibling == lastDraggedElement)) {
					return;
				} else {
					lastDraggedElement.parentNode.removeChild(lastDraggedElement);
					lastDraggedElement = null;
				}
			}

			if (shouldIDrop(droppableTarget) == false) {
				if (lastHoveredDroppable && droppableTarget !== previewElement
						&& previewElement.parentNode === lastHoveredDroppable) {
					lastHoveredDroppable.removeChild(previewElement);
				}
				return;
			}

			lastHoveredDroppable = droppableTarget;
			emitHovering(droppableTarget, true);

			// ok, it is a droppable element, lets see where we put the preview element
			var nearestSibling = getNearestSibling(event, droppableTarget);

			if (nearestSibling) {
				droppableTarget.insertBefore(previewElement, nearestSibling);
			} else {
				droppableTarget.appendChild(previewElement);
			}
		}

		function getNearestSibling(event, droppableTarget) {
			var children = _.toArray(droppableTarget.childNodes);
			var nearestSibling = null;
			var nearestSiblingPosition = null;
			children.forEach(function(child) {

				if (!child.getBoundingClientRect || child == previewElement) {
					// ignore this element
					return;
				}

				var childPosition = child.getBoundingClientRect();

				var childCenter = {
					X: childPosition.width / 2 + childPosition.left,
					Y: childPosition.height / 2 + childPosition.top
				};

				var belowThreshold = childCenter.Y;
				if (belowThreshold - childPosition.top > 30) {
					// no need to be so greedy
					belowThreshold = childPosition.top + 30;
				}

				var besidesThreshold = childCenter.X;
				if (besidesThreshold - childPosition.left > 30) {
					// no need to be so greedy
					besidesThreshold = childPosition.left + 30;
				}

				if ((event.clientY > belowThreshold && event.clientX > besidesThreshold)
					|| (event.clientY > childPosition.bottom)){
					//this does not break. _.each will run the whole array
					return;
				}

				if (nearestSibling == null) {
					nearestSibling = child;
					nearestSiblingPosition = childPosition;
				} else if (nearestSiblingPosition.left >= childPosition.left
					&& nearestSiblingPosition.top >= childPosition.top) {
					nearestSibling = child;
					nearestSiblingPosition = childPosition;
				}
			});

			return nearestSibling;
		}

		function cleanPreviewElement(target) {
			if (lastHoveredDroppable && shouldIDrop(target) == false && target !== previewElement
					&& previewElement.parentNode === lastHoveredDroppable) {
				lastHoveredDroppable.removeChild(previewElement);
			}

			if (target == null) {
				// firefox work around
				if (lastDraggedElement) {
					lastDraggedElement.parentNode.removeChild(lastDraggedElement);
					lastDraggedElement = null;
				}
				if (previewElement && previewElement.parentNode) {
					previewElement.parentNode.removeChild(previewElement);
				}
			}

			transferArea.innerHTML = '';
			previewElement.style.removeProperty('pointer-events');
			previewElement = null;
			lastHoveredDroppable = null;
		}

		function shouldIDrop(target) {
			if (!target
				|| !target.getAttribute
				|| ! previewElement
				|| target === previewElement
				|| ! _.contains(droppableElements, target.tagName)) {
				return false;
			}
		}
	};
	baddDragDropService.$inject = ['BADD_EVENTS'];
	editorModule.service('baddDragDropService', baddDragDropService);
}());