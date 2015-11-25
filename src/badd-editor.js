(function() {
	var editorModule = angular.module('baddEditor', []);

	var editorController = function($scope, editorService) {
		$scope.pageTitleChanged = function() {
			editorService.changePageTitle($scope.pageTitle);
		};

		// if attr are not set, use default values
		$scope.componentsTitle = angular.isDefined($scope.componentsTitle) ? $scope.componentsTitle : 'Components';

		// default draggable components
		$scope.draggables = [
			{ title: 'Container', icon:'fa-square-o', element: '<div class="container"><div class="row">' +
				'<div class="col-xs-12"><p>A simple row with a single column</p></div></div></div>' },
			{ title: 'Row', icon:'fa-align-justify', element: '<div class="row"><div class="col-xs-12">' +
				'<p>A simple row with a single column</p></div></div>' },
			{ title: 'Column', icon:'fa-columns', element: '<div class="col-xs-12">' +
				'<p>You can make me a smaller column</p></div>' },
			{ title: 'Header 1', icon:'fa-header', element: '<h1>An important title</h1>' },
			{ title: 'Paragraph', icon:'fa-align-left', element: '<p>Write something useful here</p>' },
			{ title: 'Button', icon:'fa-plus-square', element: '<btn class="btn btn-primary">My brand ' +
				'new button</btn>' },
			{ title: 'Image', icon:'fa-picture-o', element: '<img ' +
				'src="http://www.avjobs.com/images/v_png_v5/v_collection_png/256x256/shadow/airplane2.png"' +
				'alt="airplane">' }
		];

		$scope.buttons = [
			{ label: 'Arial', tooltip: 'Font', icon: 'caret' },
			{ label: '11', tooltip: 'Font size', icon: 'fa fa-caret-down', separate: 'btn-separate' },
			{ label: '', tooltip: 'Bold', icon: 'fa fa-bold', action: editorService.bold },
			{ label: '', tooltip: 'Italic', icon: 'fa fa-italic' },
			{ label: '', tooltip: 'Underline', icon: 'fa fa-underline', separate: 'btn-separate' },
			{ label: 'F', tooltip: '', icon: 'Font color' },
			{ label: '', tooltip: 'Background color', icon: 'fa fa-square', separate: 'btn-separate' },
			{ label: '', tooltip: 'Align left', icon: 'fa fa-align-left', action: editorService.alignLeft },
			{ label: '', tooltip: 'Align center', icon: 'fa fa-align-center', action: editorService.alignCenter },
			{ label: '', tooltip: 'Align right', icon: 'fa fa-align-right', action: editorService.alignRight },
			{ label: '', tooltip: 'Justify', icon: 'fa fa-align-justify', separate: 'btn-separate', action: editorService.justify },
			{ label: '', tooltip: 'Ordered list', icon: 'fa fa-list-ol', action: editorService.orderedList },
			{ label: '', tooltip: 'Unordered list', icon: 'fa fa-list-ul', action: editorService.unorderedList }
		];

		$scope.execute = function(action) {
			editorService.executeAction(action);
		}
	};
	editorController.$inject = ['$scope', 'editorService'];

	var editorDirective = function (editorService) {
		return {
			restrict: 'E',
			templateUrl: 'badd-editor.html',
			scope: {
				title: '@',
				componentsTitle: '@',
				template: '@'
			},
			controller: editorController,
			link: function (scope, element, attrs) {
				var iframe = element.find('iframe');

				iframe.attr('src', attrs.template);
				iframe.on('load', editorService.initializeFrame(iframe, scope));
			}
		};
	};
	editorDirective.$inject = ['editorService'];
	editorModule.directive('baddEditor', editorDirective);

	var editorService = function(baddDragDropService, $compile, $document, $window) {
		var service = this;

		service.editableTags = [
			'H1',
			'H2',
			'H3',
			'H4',
			'H5',
			'H6',
			'H7',
			'P',
			'B',
			'A',
			'UL',
			'OL',
			'LI',
			'BTN'
		];

		service.initializeFrame = function(frame, scope) {
			return function () {
				service.document = $document[0];
				service.iframe = frame[0];

				baddDragDropService.setupWindow($window);

				// helper listener
				$window.addEventListener("click", windowClickListener);

				// set service properties with raw dom html5 element
				service.iframePosition = service.iframe.getBoundingClientRect();
				service.iframeDocument = service.iframe.contentDocument;
				service.iframeDocument.addEventListener("keyup", function() {
					service.hideHighlightBorder();
					service.updateSelectedHighlightBorderPosition();
				});
				service.iframeDocument.addEventListener("scroll", function() {
					service.updateHighlightBorderPosition();
					service.updateSelectedHighlightBorderPosition();
				});
				service.frameHtml = service.iframeDocument.querySelector('html');
				service.frameHead = service.iframeDocument.querySelector('head');
				service.frameBody = service.iframeDocument.querySelector('body');

				// page title
				service.pageTitle = service.iframeDocument.querySelector('title');
				if (!service.pageTitle) {
					service.pageTitle = service.document.createElement('title');
				} else {
					scope.$apply(function () {
						scope.pageTitle = service.pageTitle.textContent;
					});
				}

				// create droppable area highlighter
				service.highlightBorder = service.iframeDocument.createElement('svg');
				service.highlightBorder.className = 'badd-highlighter badd-avoid-dd';
				service.frameBody.appendChild(service.highlightBorder);

				// create selected area highlighter
				service.selectedHighlightBorder = service.iframeDocument.createElement('svg');
				service.selectedHighlightBorder.className = 'badd-selected-highlighter badd-avoid-dd';
				service.frameBody.appendChild(service.selectedHighlightBorder);

				// start baddEditor module
				service.frameHtml.setAttribute('ng-app', 'baddEditor');

				// give editable style to editable page
				addStylesheet(service.iframeDocument, 'badd-editor-frame.min.css');

				// enable controller on body
				service.frameBody.setAttribute('badd-droppable', '');
				service.frameBody.setAttribute('badd-configurable', '');

				service.scope = scope;
				$compile(service.frameHtml)(scope);
			};
		};

		service.changePageTitle = function(newTitle) {
			service.pageTitle.textContent = newTitle;
		};

		function addStylesheet(targetDocument, stylesheet) {
			var stylesheetElement = targetDocument.createElement('link');
			stylesheetElement.setAttribute('rel', 'stylesheet');
			stylesheetElement.setAttribute('href', stylesheet);
			stylesheetElement.setAttribute('type', 'text/css');
			targetDocument.querySelector('head').appendChild(stylesheetElement);
		}

		service.updateHighlightBorderPosition = function() {
			if (service.highlightBorder.style.display === 'block' && service.lastHoveredTarget) {
				service.showHighlightBorder(service.lastHoveredTarget);
			}
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

		service.updateSelectedHighlightBorderPosition = function() {
			if (service.lastSelectedElement) {
				service.showSelectedHighlightBorder(service.lastSelectedElement);
			}
		};

		service.hideHighlightBorder = function() {
			service.highlightBorder.style.display = 'none';
			service.highlightBorder.style.top = 0;
			service.highlightBorder.style.left = 0;
			service.highlightBorder.style.width = 0;
			service.highlightBorder.style.height = 0;
		};

		service.mouseHovering = function(event) {
			event.stopPropagation();
			event.preventDefault();

			if (!_.contains(event.target.classList, 'badd-avoid-dd')
				&& ! belongsTo(event.target, service.elementBeingEdited)) {
				service.showHighlightBorder(event.target);
			}
		};

		service.mouseClick = function(event) {
			event.preventDefault();

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
		};

		service.mouseDoubleClick = function(event) {
			event.stopPropagation();

			if (event.target === service.elementBeingEdited || belongsTo(event.target, service.elementBeingEdited)) {
				return;
			}

			event.preventDefault();

			// only a few elements are content editable, e.g. divs are not, text should be placed on p elements
			if (_.contains(service.editableTags, event.target.tagName)
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
				service.hideHighlightBorder();
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
		};

		function windowClickListener(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideSelectedHighlightBorder();
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

		service.mouseLeaving = function(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideHighlightBorder();
		};

		service.executeAction = function(action) {
			if (service.lastSelectedElement == null && service.elementBeingEdited == null) {
				return;
			}
			enableDesignMode();

			if (service.elementBeingEdited == null) {
				var selection = service.iframeDocument.defaultView.getSelection();
				var range = service.iframeDocument.createRange();
				range.setStart(service.lastSelectedElement, 0);
				range.setEnd(service.lastSelectedElement, 0);
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
				service.ie11 = !(window.ActiveXObject) && "ActiveXObject" in window;
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
	editorService.$inject = ['baddDragDropService', '$compile', '$document', '$window'];
	editorModule.service('editorService', editorService);
}());
