(function() {
	var editorModule = angular.module('baddEditor');

	var baddDragDropService = function() {
		var service = this;
		service.mainWindow = null;
		service.baddElementHighlighter = null;

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

		service.setup = function(window, baddElementHighlighter, baddElementSelector) {
			if (service.mainWindow != null) {
				return;
			}

			service.baddElementHighlighter = baddElementHighlighter;
			service.baddElementSelector = baddElementSelector;

			// defining shortcuts to editor's window, document and body
			service.mainWindow = window;
			service.mainDocument = service.mainWindow.document;
			service.mainBody = service.mainDocument.querySelector('body');

			// defining shortcuts to editor's iframe window and document
			service.iframe = service.mainDocument.querySelector('iframe.badd-editor-browser');
			service.iframeWindow = service.iframe.contentWindow;
			service.iframeDocument = service.iframeWindow.document;
			service.iframeBody = service.iframeDocument.querySelector('body');
			var boundingRect = service.iframe.getBoundingClientRect();
			var computedStyle = window.getComputedStyle(service.iframe);
			service.iframeLeftOffset = boundingRect.left + parseInt(computedStyle['padding-left']);
			service.iframeTopOffset = boundingRect.top + parseInt(computedStyle['padding-top']);

			// adding mouse event handlers for both windows (main's and iframe's)
			service.mainWindow.addEventListener('mousedown', startDraggingComponent);
			service.mainWindow.addEventListener('mouseup', stopDragging);
			service.mainWindow.addEventListener('mousemove', updateDraggableIcon);
			service.mainWindow.addEventListener('blur', focusLost);
			service.iframeWindow.addEventListener('mousedown', startDraggingElement);
			service.iframeWindow.addEventListener('mouseup', stopDragging);
			service.iframeWindow.addEventListener('mousemove', updateIframe);

			// adding conteiner to hold our pointer icon
			service.draggableConteiner = service.mainDocument.createElement('svg');
			service.draggableConteiner.className = 'badd-draggable-conteiner';
			service.mainBody.appendChild(service.draggableConteiner);

			// creating transfer area to help on showing preview element
			service.transferArea = service.mainDocument.createElement('div');
			service.transferArea.className = 'badd-transfer-area';
			service.mainBody.appendChild(service.transferArea);
		};

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
			service.transferArea.innerHTML = draggableElement.getAttribute('data-element');
			service.previewElement = service.transferArea.childNodes[0];
			service.previewElement.style.pointerEvents = 'none';

			// lets create a nice icon to follow the pointer
			updateDraggableIcon(event, service.previewElement.tagName);
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
			service.transferArea.appendChild(event.target.cloneNode(true));
			service.previewElement = service.transferArea.childNodes[0];
			service.previewElement.style.pointerEvents = 'none';

			service.lastDraggedElement = event.target;
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

			if (!service.previewElement) {
				return;
			}

			// now that the user released the button we can remove our nice icon
			service.draggableConteiner.innerHTML = '';
			service.draggableIcon = null;
			service.removeElement = null;

			if (service.lastDraggedElement) {
				service.lastDraggedElement.style.removeProperty('pointer-events');
				service.lastDraggedElement = null;
			}

			var droppableTarget = event.target;
			// lets try to find a droppable parent
			while (! _.contains(droppableElements, droppableTarget.tagName)) {
				droppableTarget = droppableTarget.parentNode;
			}

			// removing preview
			cleanPreviewElement(droppableTarget);
		}

		function updateDraggableIcon(event, draggableTagName) {
			if (event.target.ownerDocument == service.mainDocument) {
				service.baddElementHighlighter.hideHighlightBorder();

				if (service.previewElement && service.previewElement.parentNode
						&& service.previewElement.ownerDocument == service.iframeDocument) {
					service.previewElement.parentNode.removeChild(service.previewElement);
				} else if (service.lastDraggedElement) {
					service.lastDraggedElement.parentNode.removeChild(service.lastDraggedElement);
					service.lastDraggedElement = null;
				}
			}
			if (!service.draggableIcon && !draggableTagName) {
				// we are dragging nothing, so stop now
				return;
			}

			if (draggableTagName && !service.draggableIcon) {
				service.draggableConteiner.innerHTML = '<i class="' + getDraggableIcon(draggableTagName) + '"></i>';
				service.draggableIcon = service.draggableConteiner.childNodes[0];
				service.draggableIcon.style.display = 'block';
				service.draggableIcon.style.position = 'fixed';
				service.draggableIcon.style.fontSize = '30px';
				service.draggableIcon.style.backgroundColor = '#2385DC';
				service.draggableIcon.style.border = '1px solid #999';
				service.draggableIcon.style.color = '#fff';
				service.draggableIcon.style.padding = '10px';
				service.draggableIcon.style.zIndex = 16777220;
			}

			// making our nice icon follow the pointer
			var leftOffset = 0;
			var topOffset = 0;

			if (event.target.ownerDocument == service.iframeDocument) {
				leftOffset = service.iframeLeftOffset;
				topOffset = service.iframeTopOffset;
			}
			service.draggableIcon.style.left = (event.clientX + leftOffset) + 'px';
			service.draggableIcon.style.top = (event.clientY - 55 + topOffset) + 'px';
		}

		function focusLost() {
			// when main window looses focus, we can remove our nice icon
			if (service.lastDraggedElement) {
				service.lastDraggedElement.style.removeProperty('pointer-events');
			}
			service.draggableConteiner.innerHTML = '';
			service.draggableIcon = null;
			if (service.previewElement) {
				cleanPreviewElement(service.lastHoveredDroppable);
			}
		}

		function updateIframe(event) {
			if (service.previewElement == null) {
				service.baddElementHighlighter.showHighlightBorder(event.target);
			} else {
				if (service.lastDraggedElement && service.lastDraggedElement.style.pointerEvents != 'none') {
					service.lastDraggedElement.style.pointerEvents = 'none';
					return;
				}

				service.baddElementHighlighter.hideHighlightBorder();
				service.baddElementSelector.hideSelectedHighlightBorder();
				updateDraggableIcon(event, service.previewElement.tagName);
				updatePreviewElement(event);
			}
		}

		function updatePreviewElement(event) {
			var droppableTarget = event.target;
			// lets try to find a droppable parent
			while (! _.contains(droppableElements, droppableTarget.tagName)) {
				droppableTarget = droppableTarget.parentNode;
			}

			if (service.lastDraggedElement) {
				var nextSibling = getNearestSibling(event, droppableTarget);
				if (droppableTarget == service.lastDraggedElement.parentNode && (
						nextSibling == service.lastDraggedElement.nextElementSibling || nextSibling == service.lastDraggedElement)) {
					return;
				} else {
					service.lastDraggedElement.parentNode.removeChild(service.lastDraggedElement);
					service.lastDraggedElement = null;
				}
			}

			if (shouldIDrop(droppableTarget) == false) {
				if (service.lastHoveredDroppable && droppableTarget !== service.previewElement
						&& service.previewElement.parentNode === service.lastHoveredDroppable) {
					service.lastHoveredDroppable.removeChild(service.previewElement);
				}
				return;
			}

			service.lastHoveredDroppable = droppableTarget;
			service.baddElementHighlighter.showHighlightBorder(droppableTarget);

			// ok, it is a droppable element, lets see where we put the preview element
			var nearestSibling = getNearestSibling(event, droppableTarget);

			if (nearestSibling) {
				droppableTarget.insertBefore(service.previewElement, nearestSibling);
			} else {
				droppableTarget.appendChild(service.previewElement);
			}
		}

		function getNearestSibling(event, droppableTarget) {
			var children = _.toArray(droppableTarget.childNodes);
			var nearestSibling = null;
			var nearestSiblingPosition = null;
			children.forEach(function(child) {

				if (!child.getBoundingClientRect || child == service.previewElement) {
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
			if (service.lastHoveredDroppable && shouldIDrop(target) == false && target !== service.previewElement
					&& service.previewElement.parentNode === service.lastHoveredDroppable) {
				service.lastHoveredDroppable.removeChild(service.previewElement);
			}

			service.transferArea.innerHTML = '';
			service.previewElement.style.removeProperty('pointer-events');
			service.previewElement = null;
			service.lastHoveredDroppable = null;
		}

		function shouldIDrop(target) {
			if (!target.getAttribute
				|| ! service.previewElement
				|| target === service.previewElement
				|| ! _.contains(droppableElements, target.tagName)) {
				return false;
			}
		}
	};
	editorModule.service('baddDragDropService', baddDragDropService);
}());