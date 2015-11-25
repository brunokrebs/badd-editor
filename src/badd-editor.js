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
			{ title: 'Button', icon:'fa-plus-square', element: '<button class="btn btn-primary">My brand ' +
				'new button</button>' },
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

	var editorService = function(baddDragDropService, baddElementHighlighter, baddElementSelector, $document, $window) {
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

				baddElementHighlighter.setup($window);
				baddElementSelector.setup($window);
				baddDragDropService.setup($window, baddElementHighlighter);

				// helper listener
				$window.addEventListener("click", windowClickListener);

				// set service properties with raw dom html5 element
				service.iframePosition = service.iframe.getBoundingClientRect();
				service.iframeDocument = service.iframe.contentDocument;
				service.iframeDocument.addEventListener("keyup", function() {
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

				// start baddEditor module
				service.frameHtml.setAttribute('ng-app', 'baddEditor');

				// give editable style to editable page
				addStylesheet(service.iframeDocument, 'badd-editor-frame.min.css');

				// enable controller on body
				service.frameBody.setAttribute('badd-droppable', '');
				service.frameBody.setAttribute('badd-configurable', '');

				service.scope = scope;
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

		service.mouseHovering = function(event) {
			event.stopPropagation();
			event.preventDefault();

			if (!_.contains(event.target.classList, 'badd-avoid-dd')
				&& ! belongsTo(event.target, service.elementBeingEdited)) {
				baddElementSelector.showHighlightBorder(event.target);
			}
		};



		function windowClickListener(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideSelectedHighlightBorder();
		}

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
	editorService.$inject = ['baddDragDropService', 'baddElementHighlighter', 'baddElementSelector', '$document', '$window'];
	editorModule.service('editorService', editorService);
}());
