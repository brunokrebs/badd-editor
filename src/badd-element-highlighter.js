(function() {
	var editorModule = angular.module('baddEditor');

	var baddElementHighlighter = function(BADD_EVENTS) {
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

			// create element selector highlighter
			service.highlightBorder = service.iframeDocument.createElement('svg');
			service.highlightBorder.className = 'badd-highlighter';
			service.iframeBody.appendChild(service.highlightBorder);

			// adding listeners to update highlight border
			service.iframeWindow.addEventListener("resize", updateHighlightBorderPosition);
			service.iframeDocument.addEventListener("scroll", updateHighlightBorderPosition);

			// listen to events
			service.scope.$on(BADD_EVENTS.ELEMENT_HOVERED, function(event, state) {
				if (!state.target) {
					return service.hideHighlightBorder();
				}
				service.showHighlightBorder(state.target);
			});
		};

		service.showHighlightBorder = function(target) {
			var targetPosition = target.getBoundingClientRect();
			service.highlightBorder.style.top = targetPosition.top - 3 + 'px';
			service.highlightBorder.style.left = targetPosition.left - 3 + 'px';
			service.highlightBorder.style.width = target.offsetWidth + 6 + 'px';
			service.highlightBorder.style.height = target.offsetHeight + 6 + 'px';
			service.highlightBorder.style.display = 'block';
			service.lastHoveredTarget = target;
		};

		service.hideHighlightBorder = function() {
			service.highlightBorder.style.display = 'none';
			service.highlightBorder.style.top = 0;
			service.highlightBorder.style.left = 0;
			service.highlightBorder.style.width = 0;
			service.highlightBorder.style.height = 0;
		};

		function updateHighlightBorderPosition() {
			if (service.highlightBorder.style.display === 'block' && service.lastHoveredTarget) {
				service.showHighlightBorder(service.lastHoveredTarget);
			}
		}
	};
	baddElementHighlighter.$inject = ['BADD_EVENTS'];
	editorModule.service('baddElementHighlighter', baddElementHighlighter);
}());