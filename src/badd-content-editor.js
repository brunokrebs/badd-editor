(function () {
	var editorModule = angular.module('baddEditor');

	var baddContentEditor = function(baddUtils, BADD_EVENTS) {
		var service = this;

		var editableTags = [
			'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7',
			'P', 'UL', 'OL', 'BUTTON'
		];
		var selectedElement = null;
		var elementBeingEdited = null;

		service.setup = function(window, scope) {
			service.scope = scope;

			// defining shortcuts to editor's window, document and body
			service.mainWindow = window;
			service.mainDocument = service.mainWindow.document;

			service.iframe = service.mainDocument.querySelector('iframe.badd-editor-browser');
			service.iframeWindow = service.iframe.contentWindow;
			service.iframeWindow.addEventListener('dblclick', handleDoubleClick);

			service.iframeDocument = service.iframeWindow.document;

			service.scope.$on(BADD_EVENTS.ELEMENT_SELECTED, function(element) {
				if (elementBeingEdited) {
					elementBeingEdited.removeAttribute('contentEditable');
					elementBeingEdited = null;
				}
				selectedElement = element;
			});

			service.scope.$on(BADD_EVENTS.ELEMENT_DESELECTED, function() {
				if (elementBeingEdited) {
					elementBeingEdited.removeAttribute('contentEditable');
					elementBeingEdited = null;
				}
				selectedElement = null;
			});
		};

		function handleDoubleClick(event) {
			event.stopPropagation();

			if (event.target === elementBeingEdited ||
				baddUtils.belongsTo(event.target, elementBeingEdited)) {
				return;
			}

			event.preventDefault();

			// only a few elements are content editable, e.g. divs are not, text should be placed on p elements
			if (_.contains(editableTags, event.target.tagName)
				&& ! baddUtils.belongsTo(event.target, elementBeingEdited)) {

				elementBeingEdited = event.target;
				selectedElement = event.target;

				// disable dragging during edition
				elementBeingEdited.setAttribute('draggable', 'false');
				var parent = elementBeingEdited.parentNode;
				while (parent.tagName != 'BODY') {
					if (parent.getAttribute('badd-draggable') || parent.getAttribute('draggable')) {
						parent.setAttribute('draggable', 'false');
					}
					parent = parent.parentNode;
				}

				// update highlights
				service.scope.$emit(BADD_EVENTS.ELEMENT_BEING_EDITED, elementBeingEdited);

				// make target editable
				elementBeingEdited.contentEditable = true;

				var selection = service.iframe.contentWindow.getSelection();
				service.iframe.contentWindow.focus();
				selection.collapse(elementBeingEdited, 0);
				elementBeingEdited.focus();
			}
		}

		service.executeCommand = function(command) {
			if (selectedElement == null
					&& elementBeingEdited == null) {
				return;
			}
			enableDesignMode();

			if (elementBeingEdited == null) {
				var selection = service.iframeDocument.defaultView.getSelection();
				var range = service.iframeDocument.createRange();
				range.setStart(selectedElement, 0);
				range.setEnd(selectedElement, 0);
				selection.removeAllRanges();
				selection.addRange(range);
			}

			service.iframeDocument.execCommand(command, false);
			disableDesignMode();
		};

		function enableDesignMode() {
			if (isIE11()) return;
			service.iframeDocument.designMode = 'on';
			service.iframeDocument.execCommand("StyleWithCSS", false, true);
		}

		function disableDesignMode() {
			if (isIE11()) return;
			service.iframeDocument.designMode = 'off';
		}

		function isIE11() {
			if (service.ie11 == null) {
				service.ie11 = !(service.mainWindow.ActiveXObject) && "ActiveXObject" in service.mainWindow;
			}
			return service.ie11;
		}

		function insertHTML(html) {
			var sel = service.iframeWindow.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				var range = sel.getRangeAt(0);
				var elementHolder = service.iframeDocument.createElement("div");
				var fragment = service.iframeDocument.createDocumentFragment();
				var node, lastNode;

				range.deleteContents();
				elementHolder.innerHTML = html;
				while ((node = elementHolder.firstChild)) {
					lastNode = fragment.appendChild(node);
				}
				range.insertNode(fragment);

				// Preserve the selection
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	};
	baddContentEditor.$inject = ['baddUtils', 'BADD_EVENTS'];
	editorModule.service('baddContentEditor', baddContentEditor);
}());