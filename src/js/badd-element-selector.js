(function() {
	var editorModule = angular.module('baddEditor');

	var baddElementSelector = function(BADD_EVENTS, baddUtils) {
		var selectorService = this;
		var currentScope, mainWindow, mainDocument, iframe, iframeWindow, iframeDocument, iframeBody;
		var selectedHighlightBorder, elementBeingEdited, lastSelectedElement;

		selectorService.setup = function (window, scope) {
			if (mainWindow != null) {
				return;
			}

			currentScope = scope;

			// defining shortcuts to editor's window, document and body
			mainWindow = window;
			mainDocument = mainWindow.document;

			iframe = mainDocument.querySelector('iframe.badd-editor-browser');
			iframeWindow = iframe.contentWindow;

			iframeDocument = iframeWindow.document;
			iframeBody = iframeDocument.querySelector('body');

			// create selected area highlighter
			selectedHighlightBorder = iframeDocument.createElement('svg');
			selectedHighlightBorder.className = 'badd-selected-highlighter badd-avoid-dd';
			iframeBody.appendChild(selectedHighlightBorder);


			// adding listeners to update selected highlight border
			window.addEventListener("click", hideSelectedHighlightBorder);

			iframeWindow.addEventListener('click', mouseClick);
			iframeWindow.addEventListener("resize", updateSelectedHighlightBorderPosition);

			iframeDocument.addEventListener("scroll", updateSelectedHighlightBorderPosition);
			iframeDocument.addEventListener("keyup", updateSelectedHighlightBorderPosition);

			// listening to events
			currentScope.$on(BADD_EVENTS.ELEMENT_HOVERED, function(event, state) {
				if (state.dragging) {
					hideSelectedHighlightBorder();
				}
			});

			currentScope.$on(BADD_EVENTS.ELEMENT_BEING_EDITED, function(event, element) {
				selectedHighlightBorder.setAttribute('class', 'badd-selected-highlighter ' +
					'badd-avoid-dd badd-edition-mode');
				elementBeingEdited = element;
			})
		};

		function showSelectedHighlightBorder(target) {
			lastSelectedElement = target;
			var targetPosition = target.getBoundingClientRect();
			selectedHighlightBorder.style.top = targetPosition.top - 3 + 'px';
			selectedHighlightBorder.style.left = targetPosition.left - 3 + 'px';
			selectedHighlightBorder.style.width = target.offsetWidth + 6 + 'px';
			selectedHighlightBorder.style.height = target.offsetHeight + 6 + 'px';
			selectedHighlightBorder.style.display = 'block';
		}

		function hideSelectedHighlightBorder() {
			lastSelectedElement = null;
			selectedHighlightBorder.style.display = 'none';
			selectedHighlightBorder.style.top = 0;
			selectedHighlightBorder.style.left = 0;
			selectedHighlightBorder.style.width = 0;
			selectedHighlightBorder.style.height = 0;
		}

		function updateSelectedHighlightBorderPosition() {
			if (lastSelectedElement) {
				showSelectedHighlightBorder(lastSelectedElement);
			}
		}

		function mouseClick(event) {
			if (elementBeingEdited && (baddUtils.belongsTo(event.target, elementBeingEdited) ||
				elementBeingEdited == event.target)) {
				return;
			}

			event.preventDefault();

			if (event.target == iframeDocument) {
				// firefox work around
				return;
			}

			if (event.target === lastSelectedElement && elementBeingEdited == null) {
				hideSelectedHighlightBorder();
				event.stopPropagation();
				currentScope.$emit(BADD_EVENTS.ELEMENT_DESELECTED);
				return;
			}

			event.stopPropagation();

			if (elementBeingEdited && elementBeingEdited !== event.target) {
				var parent = elementBeingEdited.parentNode;
				while (parent.tagName != 'BODY') {
					if (parent.getAttribute('badd-draggable') || parent.getAttribute('draggable')) {
						parent.setAttribute('draggable', 'true');
					}
					parent = parent.parentNode;
				}

				selectedHighlightBorder.setAttribute('class', 'badd-selected-highlighter badd-avoid-dd');
				elementBeingEdited.removeAttribute('contentEditable');
				elementBeingEdited = null;
			}
			showSelectedHighlightBorder(event.target);
		}
	};
	baddElementSelector.$inject = ['BADD_EVENTS', 'baddUtils'];
	editorModule.service('baddElementSelector', baddElementSelector);
}());