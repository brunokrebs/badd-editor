/**
 * badd editor
 *
 * @author Bruno Krebs
 * @url https://github.com/brunokrebs/badd-editor
 * @license MIT License <http://opensource.org/licenses/mit-license.php>
 */
(function() {
	var editorModule = angular.module('baddEditor', []);

	var editorController = function($scope, $window) {
		// if attr are not set, use default values
		$scope.title = angular.isDefined($scope.title) ? $scope.title : 'Bootstrap visual editor';
		$scope.componentsTitle = angular.isDefined($scope.componentsTitle) ? $scope.componentsTitle : 'Components';
		$scope.propertiesTitle = angular.isDefined($scope.propertiesTitle) ? $scope.propertiesTitle : 'Properties';


		$window.addEventListener('message', function() {
			alert('received something');
		});

		// default draggable components
		$scope.components = [
			{ titleLg: 'Header 1', title: 'H1', label:'h1', element: '<h1>New Header 1</h1>' },
			{ titleLg: 'Header 2', title: 'H2', label:'h2', element: '<h2>New Header 2</h2>' },
			{ titleLg: 'Header 3', title: 'H3', label:'h3', element: '<h3>New Header 3</h3>' },
			{ titleLg: 'Header 4', title: 'H4', label:'h4', element: '<h4>New Header 4</h4>' },
			{ titleLg: 'Button', title: 'BTN', label:'btn', element: '<button class="btn btn-primary" badd-draggable>New Button</button>' }
		];
	};
	editorController.$inject = ['$scope', '$window'];

	var editorDirective = function () {
		return {
			restrict: 'E',
			templateUrl: 'badd-editor.html',
			scope: {
				title: '@',
				componentsTitle: '@',
				propertiesTitle: '@',
				template: '@'
			},
			controller: editorController
		};
	};

	editorModule.directive('baddEditor', editorDirective);

	var editorService = function($compile, $document) {
		var service = this;

		service.initializeFrame = function(frame, scope) {
			return function () {
				service.document = $document[0];

				// set service properties with raw dom html5 element
				service.frame = frame.contents()[0];
				service.frameHtml = service.frame.querySelector('html');
				service.frameHead = service.frame.querySelector('head');
				service.frameBody = service.frame.querySelector('body');

				// create transfer area
				service.transferArea = service.document.createElement('div');
				service.transferArea.className = 'badd-transfer-area';
				service.frameBody.appendChild(service.transferArea);

				// create droppable area highlighter
				service.transferArea.innerHTML = '<svg class="badd-highlighter"></svg>';
				service.highlightBorder = service.transferArea.childNodes[0];
				service.frameBody.appendChild(service.highlightBorder);

				// start baddEditor module
				service.frameHtml.setAttribute('ng-app', 'baddEditor');

				// give editable style to editable page
				service.stylesheet = service.document.createElement('link');
				service.stylesheet.setAttribute('rel', 'stylesheet');
				service.stylesheet.setAttribute('href', 'badd-editor-frame.min.css');
				service.stylesheet.setAttribute('type', 'text/css');
				service.frameHead.appendChild(service.stylesheet);

				// enable controller on body
				service.frameBody.setAttribute('badd-droppable', '');
				service.frameBody.setAttribute('ng-controller', 'baddDroppableFrameController as ctrl');

				// make divs droppable and configurable
				var divs = _.toArray(service.frameBody.querySelectorAll('div'));
				divs.forEach(function(div) {
					if (div.className !== 'badd-highlight' && div.className !== 'badd-transfer-area') {
						div.setAttribute('badd-droppable', '');
						div.setAttribute('ng-click', 'ctrl.sendMessage()');
					}
				});

				$compile(service.frameHtml)(scope);
			};
		};

		service.startDragging = function (event) {
			event.dataTransfer.setData('text', 'firefox needs data');

			service.transferArea.innerHTML = event.target.getAttribute('data-element');
			service.previewElement = service.transferArea.querySelector('*');
		};

		service.stopDragging = function(event) {
			console.log(event.target.className);
			service.transferArea.innerHTML = '';
			if (service.previewElement) {
				service.previewElement.parentNode.removeChild(service.previewElement);
				service.previewElement = null;
			}
			service.hideHighlightBorder();
		};

		service.elementEntering = function(event) {
			if (event.target.getAttribute
				&& event.target !== service.previewElement
				&& event.target.getAttribute('badd-droppable') === '') {

				event.target.appendChild(service.previewElement);

				service.showHighlightBorder(event.target);
			}

			event.stopPropagation();
			event.preventDefault();
		};

		service.elementHovering = function(event) {
			event.stopPropagation();
			event.preventDefault();


		};

		service.elementDropped = function(event) {
			event.stopPropagation();
			event.preventDefault();

			service.previewElement = null;
		};

		service.showHighlightBorder = function(target) {
			var targetPosition = target.getBoundingClientRect();
			service.highlightBorder.style.top = targetPosition.top + 'px';
			service.highlightBorder.style.left = targetPosition.left + 'px';
			service.highlightBorder.style.width = target.offsetWidth + 'px';
			service.highlightBorder.style.height = target.offsetHeight + 'px';
			service.highlightBorder.style.display = 'block';
		};

		service.hideHighlightBorder = function() {
			service.highlightBorder.style.display = 'none';
			service.highlightBorder.style.top = 0;
			service.highlightBorder.style.left = 0;
			service.highlightBorder.style.width = 0;
			service.highlightBorder.style.height = 0;
		};
	};
	editorService.$inject = ['$compile', '$document'];
	editorModule.service('editorService', editorService);
}());
