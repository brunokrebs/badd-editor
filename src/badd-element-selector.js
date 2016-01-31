(function() {
	var editorModule = angular.module('baddEditor');

	var baddElementSelector = function(BADD_EVENTS, baddUtils) {
		var service = this;

		service.setup = function (window, scope) {
			if (service.mainWindow != null) {
				return;
			}

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
			service.iframeWindow.addEventListener("resize", updateSelectedHighlightBorderPosition);

			service.iframeDocument.addEventListener("scroll", updateSelectedHighlightBorderPosition);
			service.iframeDocument.addEventListener("keyup", updateSelectedHighlightBorderPosition);

			// listening to events
			service.scope.$on(BADD_EVENTS.ELEMENT_HOVERED, function(event, state) {
				if (state.dragging) {
					service.hideSelectedHighlightBorder();
				}
			});

			service.scope.$on(BADD_EVENTS.ELEMENT_BEING_EDITED, function(event, element) {
				service.selectedHighlightBorder.setAttribute('class', 'badd-selected-highlighter ' +
					'badd-avoid-dd badd-edition-mode');
				service.elementBeingEdited = element;
			})
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
			if (service.elementBeingEdited && (baddUtils.belongsTo(event.target, service.elementBeingEdited) ||
				service.elementBeingEdited == event.target)) {
				return;
			}

			event.preventDefault();

			if (event.target == service.iframeDocument) {
				// firefox work around
				return;
			}

			if (event.target === service.lastSelectedElement && service.elementBeingEdited == null) {
				service.hideSelectedHighlightBorder();
				event.stopPropagation();
				service.scope.$emit(BADD_EVENTS.ELEMENT_DESELECTED);
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
	};
	baddElementSelector.$inject = ['BADD_EVENTS', 'baddUtils'];
	editorModule.service('baddElementSelector', baddElementSelector);
}());