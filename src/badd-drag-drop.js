(function() {
	var editorModule = angular.module('baddEditor');

	var baddDragDropService = function() {
		var service = this;
		service.mainWindow = null;

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

			// adding mouse event handlers for both windows (main's and iframe's)
			service.mainWindow.addEventListener('mousedown', startDragging);
			service.mainWindow.addEventListener('mouseup', stopDragging);
			service.mainWindow.addEventListener('mousemove', updateDraggableIcon);
			service.mainWindow.addEventListener('blur', focusLost);
			service.iframeWindow.addEventListener('mousedown', startDragging);
			service.iframeWindow.addEventListener('mouseup', stopDragging);
			service.iframeWindow.addEventListener('mousemove', updateDraggableIcon);

			// adding conteiner to hold our pointer icon
			service.draggableConteiner = service.mainDocument.createElement('svg');
			service.draggableConteiner.className = 'badd-draggable-conteiner';
			service.mainBody.appendChild(service.draggableConteiner);
		};

		function startDragging(event) {
			event.preventDefault();

			var draggableElement = event.target;
			if (draggableElement.getAttribute('badd-draggble-label') != null) {
				while (draggableElement.getAttribute('badd-draggable') == null) {
					draggableElement = draggableElement.parentNode;
				}
			}

			if (draggableElement.getAttribute('badd-draggable') == null) {
				return;
			}

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
		}

		function stopDragging(event) {
			event.preventDefault();
			//service.draggableConteiner.innerHTML = '';
			//service.draggableIcon = null;
		}

		function updateDraggableIcon(event) {
			if (!service.draggableIcon) {
				return;
			}

			service.draggableIcon.style.left = (event.pageX + 10) + 'px';
			service.draggableIcon.style.top = (event.pageY - 60) + 'px';
		}

		function focusLost() {
			event.preventDefault();
		}

		function gotFocus() {
			event.preventDefault();
		}
	};
	editorModule.service('baddDragDropService', baddDragDropService);
}());