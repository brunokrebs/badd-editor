(function() {
	var editorModule = angular.module('baddEditor');

	var baddElementHighlighter = function(BADD_EVENTS) {
		var highlighterService = this;
		var currentScope, mainWindow, mainDocument, iframe, iframeWindow, iframeDocument, iframeBody;
		var highlightBorder, lastHoveredTarget;

		highlighterService.setup = function (window, scope) {
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

			// create element selector highlighter
			highlightBorder = iframeDocument.createElement('svg');
			highlightBorder.className = 'badd-highlighter';
			iframeBody.appendChild(highlightBorder);

			// adding listeners to update highlight border
			iframeWindow.addEventListener("resize", updateHighlightBorderPosition);
			iframeDocument.addEventListener("scroll", updateHighlightBorderPosition);

			// listen to events
			currentScope.$on(BADD_EVENTS.ELEMENT_HOVERED, function(event, state) {
				if (!state.target) {
					return hideHighlightBorder();
				}
				showHighlightBorder(state.target);
			});

			currentScope.$on(BADD_EVENTS.ELEMENT_BEING_EDITED, hideHighlightBorder);
		};

		function showHighlightBorder(target) {
			var targetPosition = target.getBoundingClientRect();
			highlightBorder.style.top = targetPosition.top - 3 + 'px';
			highlightBorder.style.left = targetPosition.left - 3 + 'px';
			highlightBorder.style.width = target.offsetWidth + 6 + 'px';
			highlightBorder.style.height = target.offsetHeight + 6 + 'px';
			highlightBorder.style.display = 'block';
			lastHoveredTarget = target;
		}

		function hideHighlightBorder() {
			highlightBorder.style.display = 'none';
			highlightBorder.style.top = 0;
			highlightBorder.style.left = 0;
			highlightBorder.style.width = 0;
			highlightBorder.style.height = 0;
		}

		function updateHighlightBorderPosition() {
			if (highlightBorder.style.display === 'block' && lastHoveredTarget) {
				showHighlightBorder(lastHoveredTarget);
			}
		}
	};
	baddElementHighlighter.$inject = ['BADD_EVENTS'];
	editorModule.service('baddElementHighlighter', baddElementHighlighter);
}());