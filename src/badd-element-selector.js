(function() {
	var editorModule = angular.module('baddEditor');

	var baddElementSelector = function(BADD_EVENTS) {
		var service = this;

		service.setup = function (window, baddElementHighlighter, scope) {
			if (service.mainWindow != null) {
				return;
			}

			service.baddElementHighlighter = baddElementHighlighter;
			service.scope = scope;

			// defining shortcuts to editor's window, document and body
			service.mainWindow = window;
			service.mainDocument = service.mainWindow.document;

			service.iframe = service.mainDocument.querySelector('iframe.badd-editor-browser');
			service.iframeWindow = service.iframe.contentWindow;

			service.iframeDocument = service.iframeWindow.document;
			service.iframeBody = service.iframeDocument.querySelector('body');

			// create selected area highlighter
			service.selectedHighlightBorder = service.iframeDocument.createElement('svg');
			service.selectedHighlightBorder.className = 'badd-selected-highlighter badd-avoid-dd';
			service.iframeBody.appendChild(service.selectedHighlightBorder);


			// adding listeners to update selected highlight border
			window.addEventListener("click", service.hideSelectedHighlightBorder);

			service.iframeWindow.addEventListener('click', mouseClick);
			service.iframeWindow.addEventListener('dblclick', mouseDoubleClick);
			service.iframeWindow.addEventListener("resize", updateSelectedHighlightBorderPosition);

			service.iframeDocument.addEventListener("scroll", updateSelectedHighlightBorderPosition);
			service.iframeDocument.addEventListener("keyup", updateSelectedHighlightBorderPosition);

			// listening to events
			service.scope.$on(BADD_EVENTS.ELEMENT_HOVERED, function(event, state) {
				if (state.dragging) {
					service.hideSelectedHighlightBorder();
				}
			});
		};

		service.showSelectedHighlightBorder = function(target) {
			service.lastSelectedElement = target;
			var targetPosition = target.getBoundingClientRect();
			service.selectedHighlightBorder.style.top = targetPosition.top - 3 + 'px';
			service.selectedHighlightBorder.style.left = targetPosition.left - 3 + 'px';
			service.selectedHighlightBorder.style.width = target.offsetWidth + 6 + 'px';
			service.selectedHighlightBorder.style.height = target.offsetHeight + 6 + 'px';
			service.selectedHighlightBorder.style.display = 'block';
		};

		service.hideSelectedHighlightBorder = function() {
			service.lastSelectedElement = null;
			service.selectedHighlightBorder.style.display = 'none';
			service.selectedHighlightBorder.style.top = 0;
			service.selectedHighlightBorder.style.left = 0;
			service.selectedHighlightBorder.style.width = 0;
			service.selectedHighlightBorder.style.height = 0;
		};

		function updateSelectedHighlightBorderPosition() {
			if (service.lastSelectedElement) {
				service.showSelectedHighlightBorder(service.lastSelectedElement);
			}
		}

		function mouseClick(event) {
			event.preventDefault();

			if (event.target == service.iframeDocument) {
				// firefox work around
				return;
			}

			if (event.target === service.lastSelectedElement && service.elementBeingEdited == null) {
				service.hideSelectedHighlightBorder();
				event.stopPropagation();
				return;
			}

			if (belongsTo(event.target, service.elementBeingEdited) || service.elementBeingEdited == event.target) {
				return;
			}

			event.stopPropagation();

			if (service.elementBeingEdited && service.elementBeingEdited !== event.target) {
				var parent = service.elementBeingEdited.parentNode;
				while (parent.tagName != 'BODY') {
					if (parent.getAttribute('badd-draggable') || parent.getAttribute('draggable')) {
						parent.setAttribute('draggable', 'true');
					}
					parent = parent.parentNode;
				}

				service.selectedHighlightBorder.setAttribute('class', 'badd-selected-highlighter badd-avoid-dd');
				service.elementBeingEdited.removeAttribute('contentEditable');
				service.elementBeingEdited = null;
			}
			service.showSelectedHighlightBorder(event.target);
		}

		function mouseDoubleClick(event) {
			event.stopPropagation();

			if (event.target === service.elementBeingEdited || belongsTo(event.target, service.elementBeingEdited)) {
				return;
			}

			event.preventDefault();

			// only a few elements are content editable, e.g. divs are not, text should be placed on p elements
			if (_.contains(service.baddContentEditor.editableTags, event.target.tagName)
				&& ! belongsTo(event.target, service.elementBeingEdited)) {

				service.elementBeingEdited = event.target;

				// disable dragging during edition
				service.elementBeingEdited.setAttribute('draggable', 'false');
				var parent = service.elementBeingEdited.parentNode;
				while (parent.tagName != 'BODY') {
					if (parent.getAttribute('badd-draggable') || parent.getAttribute('draggable')) {
						parent.setAttribute('draggable', 'false');
					}
					parent = parent.parentNode;
				}

				// update highlights
				service.baddElementHighlighter.hideHighlightBorder();
				service.showSelectedHighlightBorder(service.elementBeingEdited);
				service.selectedHighlightBorder.setAttribute('class', 'badd-selected-highlighter ' +
					'badd-avoid-dd badd-edition-mode');

				// make target editable
				service.elementBeingEdited.contentEditable = true;

				var selection = service.iframe.contentWindow.getSelection();
				service.iframe.contentWindow.focus();
				selection.collapse(service.elementBeingEdited, 0);
				service.elementBeingEdited.focus();
			}
		}

		function belongsTo(child, parent) {
			if (child == null || parent == null || child === parent) {
				return false;
			}
			var nextParent = child.parentNode;
			while (nextParent != null) {
				if (nextParent === parent) {
					return true;
				}
				nextParent = nextParent.parentNode;
			}
			return false;
		}
	};
	baddElementSelector.$inject = ['BADD_EVENTS'];
	editorModule.service('baddElementSelector', baddElementSelector);
}());