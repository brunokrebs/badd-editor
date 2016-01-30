(function () {
	var editorModule = angular.module('baddEditor');

	var baddConfigurableService = function() {
		var service = this;

		service.editableTags = [
			'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7',
			'P', 'UL', 'OL', 'BUTTON'
		];

		service.setup = function(window, baddElementSelector) {
			service.baddElementSelector = baddElementSelector;
			service.baddElementSelector.baddConfigurableService = service;

			// defining shortcuts to editor's window, document and body
			service.mainWindow = window;
			service.mainDocument = service.mainWindow.document;

			service.iframe = service.mainDocument.querySelector('iframe.badd-editor-browser');
			service.iframeWindow = service.iframe.contentWindow;

			service.iframeDocument = service.iframeWindow.document;
		};

		service.executeAction = function(action) {
			if (service.baddElementSelector.lastSelectedElement == null
					&& service.baddElementSelector.elementBeingEdited == null) {
				return;
			}
			enableDesignMode();

			if (service.baddElementSelector.elementBeingEdited == null) {
				var selection = service.iframeDocument.defaultView.getSelection();
				var range = service.iframeDocument.createRange();
				range.setStart(service.baddElementSelector.lastSelectedElement, 0);
				range.setEnd(service.baddElementSelector.lastSelectedElement, 0);
				selection.removeAllRanges();
				selection.addRange(range);
			}

			action();
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

		service.alignLeft = function() {
			service.iframeDocument.execCommand('justifyleft', false);
		};

		service.alignRight = function() {
			service.iframeDocument.execCommand('justifyright', false);
		};

		service.alignCenter = function() {
			service.iframeDocument.execCommand('justifyCenter', false);
		};

		service.justify = function() {
			service.iframeDocument.execCommand('justifyfull', false);
		};

		service.bold = function() {
			service.iframeDocument.execCommand('bold', false);
		};

		service.orderedList = function() {
			service.iframeDocument.execCommand('insertOrderedList', false);
		};

		service.unorderedList = function() {
			service.iframeDocument.execCommand('insertUnorderedList', false);
		};
	};

	editorModule.service('baddConfigurableService', baddConfigurableService);
}());