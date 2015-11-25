(function() {
	var editorModule = angular.module('baddEditor');

	var baddDragDropService = function() {
		var service = this;
		service.mainWindow = null;

		var droppableElements = ['DIV', 'BODY', 'P'];

		service.setupWindow = function(window) {
			if (service.mainWindow != null) {
				return;
			}

			// defining shortcuts to editor's window, document and body
			service.mainWindow = window;
			service.mainDocument = service.mainWindow.document;
			service.mainBody = service.mainDocument.querySelector('body');

			// defining shortcuts to editor's iframe window and document
			service.iframe = service.mainDocument.querySelector('iframe.badd-editor-browser');
			service.iframeWindow = service.iframe.contentWindow;
			service.iframeDocument = service.iframeWindow.document;
			service.iframeBody = service.iframeDocument.querySelector('body');

			// adding mouse event handlers for both windows (main's and iframe's)
			service.mainWindow.addEventListener('mousedown', startDragging);
			service.mainWindow.addEventListener('mouseup', stopDragging);
			service.mainWindow.addEventListener('mousemove', updateDraggableIcon);
			service.mainWindow.addEventListener('blur', focusLost);
			service.iframeWindow.addEventListener('mousedown', startDragging);
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

		function startDragging(event) {
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

			// otherwise lets create a nice icon to follow the pointer
			service.draggableConteiner.appendChild(draggableElement.querySelector('i').cloneNode(true));
			service.draggableIcon = service.draggableConteiner.childNodes[0];
			service.draggableIcon.style.position = 'fixed';
			service.draggableIcon.style.fontSize = '30px';
			service.draggableIcon.style.backgroundColor = '#2385DC';
			service.draggableIcon.style.border = '1px solid #999';
			service.draggableIcon.style.color = '#fff';
			service.draggableIcon.style.padding = '10px';
			service.draggableIcon.style.left = (event.pageX + 10) + 'px';
			service.draggableIcon.style.top = (event.pageY - 100) + 'px';
			service.draggableIcon.style.zIndex = 16777220;

			// adding preview element to our transfer area
			service.transferArea.innerHTML = draggableElement.getAttribute('data-element');
			service.previewElement = service.transferArea.querySelector('*');
		}

		function stopDragging(event) {
			event.preventDefault();

			// now that the user released the button we can remove our nice icon
			service.draggableConteiner.innerHTML = '';
			service.draggableIcon = null;

			// removing preview
			cleanPreviewElement(event.target);
		}

		function updateDraggableIcon(event) {
			if (!service.draggableIcon) {
				// we are dragging nothing, so stop now
				return;
			}

			// making our nice icon follow the pointer
			service.draggableIcon.style.left = (event.pageX + 10) + 'px';
			service.draggableIcon.style.top = (event.pageY - 60) + 'px';
		}

		function focusLost() {
			// when main window looses focus, we can remove our nice icon
			service.draggableConteiner.innerHTML = '';
			service.draggableIcon = null;
		}

		function updateIframe(event) {
			updateDraggableIcon(event);
			updatePreviewElement(event);
		}

		function updatePreviewElement(event) {
			event.stopPropagation();
			event.preventDefault();

			if (shouldIDrop(event.target) == false) {
				return;
			}

			service.lastHoveredDroppable = event.target;

			// ok, it is a droppable element, lets see where we put the preview element
			var children = _.toArray(event.target.childNodes);
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

			if (nearestSibling) {
				event.target.insertBefore(service.previewElement, nearestSibling);
			} else {
				event.target.appendChild(service.previewElement);
			}
		}

		function cleanPreviewElement(target) {
			if (service.lastHoveredDroppable && shouldIDrop(target) == false) {
				service.lastHoveredDroppable.removeChild(service.previewElement);
			}
			service.transferArea.innerHTML = '';
			service.previewElement = null;
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