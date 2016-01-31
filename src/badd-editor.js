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
			{ label: '', tooltip: 'Bold', icon: 'fa fa-bold', command: 'bold' },
			{ label: '', tooltip: 'Italic', icon: 'fa fa-italic', command: 'italic' },
			{ label: '', tooltip: 'Underline', icon: 'fa fa-underline', command: 'underline', separate: 'btn-separate' },
			{ label: 'F', tooltip: '', icon: 'Font color' },
			{ label: '', tooltip: 'Background color', icon: 'fa fa-square', separate: 'btn-separate' },
			{ label: '', tooltip: 'Align left', icon: 'fa fa-align-left', command: 'justifyLeft' },
			{ label: '', tooltip: 'Align center', icon: 'fa fa-align-center', command: 'justifyCenter' },
			{ label: '', tooltip: 'Align right', icon: 'fa fa-align-right', command: 'justifyRight' },
			{ label: '', tooltip: 'Justify', icon: 'fa fa-align-justify', command: 'justifyFull', separate: 'btn-separate' },
			{ label: '', tooltip: 'Ordered list', icon: 'fa fa-list-ol', command: 'insertOrderedList' },
			{ label: '', tooltip: 'Unordered list', icon: 'fa fa-list-ul', command: 'insertUnorderedList' }
		];

		$scope.execute = function(command) {
			editorService.executeCommand(command);
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

	var editorService = function(baddDragDropService, baddElementHighlighter, baddElementSelector,
								 baddContentEditor, $document, $window) {
		var service = this;

		service.initializeFrame = function(frame, scope) {
			return function () {
				service.document = $document[0];
				service.iframe = frame[0];

				baddElementHighlighter.setup($window, scope);
				baddElementSelector.setup($window, scope);
				baddContentEditor.setup($window, baddElementSelector);
				baddDragDropService.setup($window, scope);

				// set service properties with raw dom html5 element
				service.iframeDocument = service.iframe.contentDocument;

				// give editable style to editable page
				addStylesheet(service.iframeDocument, 'badd-editor-frame.min.css');

				// page title
				service.pageTitle = service.iframeDocument.querySelector('title');
				if (!service.pageTitle) {
					service.pageTitle = service.document.createElement('title');
				} else {
					scope.$apply(function () {
						scope.pageTitle = service.pageTitle.textContent;
					});
				}
			};
		};

		service.changePageTitle = function(newTitle) {
			service.pageTitle.textContent = newTitle;
		};

		service.executeCommand = function(action) {
			baddContentEditor.executeCommand(action);
		};

		function addStylesheet(targetDocument, stylesheet) {
			var stylesheetElement = targetDocument.createElement('link');
			stylesheetElement.setAttribute('rel', 'stylesheet');
			stylesheetElement.setAttribute('href', stylesheet);
			stylesheetElement.setAttribute('type', 'text/css');
			targetDocument.querySelector('head').appendChild(stylesheetElement);
		}
	};
	editorService.$inject = ['baddDragDropService', 'baddElementHighlighter', 'baddElementSelector',
							 'baddContentEditor', '$document', '$window'];
	editorModule.service('editorService', editorService);

	editorModule.constant('BADD_EVENTS', {
		ELEMENT_HOVERED: 'badd-element–hovered',
		ELEMENT_SELECTED: 'badd-element–selected'
	})
}());
