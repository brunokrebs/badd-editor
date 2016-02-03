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

		var boldButton = {
			tooltip: 'Bold',
			icon: 'fa fa-bold',
			command: function(target) {
				var currentFontWeight = target.style.fontWeight;
				target.style.fontWeight = 'bold';

				return function() {
					target.style.fontWeight = currentFontWeight;
				};
			}
		};

		var undoButton = {
			tooltip: 'Undo',
			icon: 'fa fa-undo',
			command: editorService.undo
		};

		$scope.buttons = [ boldButton, undoButton ];

		$scope.execute = function(button) {
			editorService.executeCommand(button);
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
				baddContentEditor.setup($window, scope);
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

		service.undo = baddContentEditor.undo;

		function addStylesheet(targetDocument, stylesheet) {
			var scriptName = 'badd-editor.min.js';
			var scriptTag = service.document.querySelector('script[src*="' + scriptName + '"]');
			var scriptLocation = scriptTag.getAttribute('src').replace(scriptName, '');

			var stylesheetElement = targetDocument.createElement('link');
			stylesheetElement.setAttribute('rel', 'stylesheet');
			stylesheetElement.setAttribute('href', scriptLocation + stylesheet);
			stylesheetElement.setAttribute('type', 'text/css');
			targetDocument.querySelector('head').appendChild(stylesheetElement);
		}
	};
	editorService.$inject = ['baddDragDropService', 'baddElementHighlighter', 'baddElementSelector',
							 'baddContentEditor', '$document', '$window'];
	editorModule.service('editorService', editorService);

	editorModule.constant('BADD_EVENTS', {
		ELEMENT_HOVERED: 'badd-element–hovered',
		ELEMENT_SELECTED: 'badd-element–selected',
		ELEMENT_DESELECTED: 'badd-element–deselected',
		ELEMENT_BEING_EDITED: 'badd-element–being-edited'
	})
}());
