(function () {
	var editorModule = angular.module('baddEditor');

	var baddContentEditor = function(baddUtils, BADD_EVENTS) {
		var contentEditorService = this;
		var currentScope, mainWindow, mainDocument, iframe, iframeWindow, iframeDocument, iframeBody;
		var selectedElement, elementBeingEdited, ie11;

		var editableTags = [
			'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7',
			'P', 'UL', 'OL', 'BUTTON'
		];

		contentEditorService.setup = function(window, scope) {
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

			// listen to events
			iframeWindow.addEventListener('dblclick', handleDoubleClick);

			currentScope.$on(BADD_EVENTS.ELEMENT_SELECTED, function(element) {
				if (elementBeingEdited) {
					elementBeingEdited.removeAttribute('contentEditable');
					elementBeingEdited = null;
				}
				selectedElement = element;
			});

			currentScope.$on(BADD_EVENTS.ELEMENT_DESELECTED, function() {
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
				currentScope.$emit(BADD_EVENTS.ELEMENT_BEING_EDITED, elementBeingEdited);

				// make target editable
				elementBeingEdited.contentEditable = true;

				var selection = iframe.contentWindow.getSelection();
				iframe.contentWindow.focus();
				selection.collapse(elementBeingEdited, 0);
				elementBeingEdited.focus();
			}
		}

		baddContentEditor.executeCommand = function(command) {
			if (selectedElement == null
					&& elementBeingEdited == null) {
				return;
			}
			enableDesignMode();

			if (elementBeingEdited == null) {
				var selection = iframeDocument.defaultView.getSelection();
				var range = iframeDocument.createRange();
				range.setStart(selectedElement, 0);
				range.setEnd(selectedElement, 0);
				selection.removeAllRanges();
				selection.addRange(range);
			}

			iframeDocument.execCommand(command, false);
			disableDesignMode();
		};

		function enableDesignMode() {
			if (isIE11()) return;
			iframeDocument.designMode = 'on';
			iframeDocument.execCommand("StyleWithCSS", false, true);
		}

		function disableDesignMode() {
			if (isIE11()) return;
			iframeDocument.designMode = 'off';
		}

		function isIE11() {
			if (ie11 == null) {
				ie11 = !(mainWindow.ActiveXObject) && "ActiveXObject" in mainWindow;
			}
			return ie11;
		}

		function insertHTML(html) {
			var sel = iframeWindow.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				var range = sel.getRangeAt(0);
				var elementHolder = iframeDocument.createElement("div");
				var fragment = iframeDocument.createDocumentFragment();
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