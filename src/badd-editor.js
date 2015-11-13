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
		$scope.draggables = [
			{ titleLg: 'Row', title: 'ROW', label:'row', element: '<div class="row"><div class="col-xs-12"><p>A simple row with a single column</p></div></div>' },
			{ titleLg: 'Column', title: 'COL', label:'col', element: '<div class="col-xs-12"><p>You can make me a smaller column</p></div>' },
			{ titleLg: 'Header 1', title: 'H1', label:'h1', element: '<h1>An important title</h1>' },
			{ titleLg: 'Header 2', title: 'H2', label:'h2', element: '<h2>A secondary title</h2>' },
			{ titleLg: 'Header 3', title: 'H3', label:'h3', element: '<h3>A third level title</h3>' },
			{ titleLg: 'Header 4', title: 'H4', label:'h4', element: '<h4>A fourth level title</h4>' },
			{ titleLg: 'Paragraph', title: 'P', label:'p', element: '<p>Write something useful here</p>' },
			{ titleLg: 'Button', title: 'BTN', label:'btn', element: '<button class="btn btn-primary">My brand new button</button>' },
			{ titleLg: 'Jumbotron', title: 'JMB', label:'jmb', element: '<div class="jumbotron"><h1>Hello, world!</h1><p>My name is Jumbotron</p></div>' },
			{ titleLg: 'Panel', title: 'PNL', label:'pnl', element: '<div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title">Panel title</h3></div><div class="panel-body">Panel content</div></div>' },
			{ titleLg: 'Well', title: 'WLL', label:'wll', element: '<div class="well">Look, I\'m in a well.</div>' },
			{ titleLg: 'Image', title: 'IMG', label:'img', element: '<img src="http://www.avjobs.com/images/v_png_v5/v_collection_png/256x256/shadow/airplane2.png" alt="airplane">' }
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
				service.iframe = frame[0];
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
				service.frameBody.setAttribute('badd-configurable', '');

				// make divs droppable
				var divs = _.toArray(service.frameBody.querySelectorAll('div'));
				divs.forEach(function(div) {
					if (div.className !== 'badd-highlight' && div.className !== 'badd-transfer-area') {
						div.setAttribute('badd-droppable', '');
					}
				});

				// make everything else draggable and configurable
				var elements = _.toArray(service.frameBody.querySelectorAll('*'));
				elements.forEach(function(element) {
					if (element.className !== 'badd-highlight' && element.className !== 'badd-transfer-area') {
						element.setAttribute('badd-draggable', '');
						element.setAttribute('badd-configurable', '');
					}
				});

				$compile(service.frameHtml)(scope);
			};
		};

		service.startDragging = function (event) {
			event.dataTransfer.setData('text', 'firefox needs data');

			if (event.target.getAttribute('badd-configurable') === '') {
				service.previewElement = event.target;
			} else {
				service.transferArea.innerHTML = event.target.getAttribute('data-element');
				service.previewElement = service.transferArea.querySelector('*');
			}
		};

		service.stopDragging = function(event) {
			service.transferArea.innerHTML = '';
			if (service.previewElement && service.previewElement.parentNode) {
				service.previewElement.parentNode.removeChild(service.previewElement);
				service.previewElement = null;
			}
			service.hideHighlightBorder();
		};

		service.elementEntering = function(event) {
			service.previewElement.classList.remove('badd-hidden-preview-element');

			event.stopPropagation();
			event.preventDefault();
		};

		service.elementLeaving = function (event) {
			var iframePosition = service.iframe.getBoundingClientRect();
			var elementBeingHovered = service.document.elementFromPoint(event.clientX + iframePosition.left,
																		event.clientY + iframePosition.top);
			if (elementBeingHovered == null || elementBeingHovered.tagName !== 'IFRAME' ||
				! _.contains(elementBeingHovered.classList, 'badd-editor-browser')) {

				service.previewElement.classList.add('badd-hidden-preview-element');
				service.hideHighlightBorder();
			}
		};

		service.elementHovering = function(event) {
			event.stopPropagation();
			event.preventDefault();

			if (!event.target.getAttribute
				|| event.target === service.previewElement
				|| event.target.getAttribute('badd-droppable') !== '') {

				return;
			}

			var children = _.toArray(event.target.childNodes);
			var nearestSibling = null;
			var nearestSiblingPosition = null;
			children.forEach(function(child) {
				if (!child.getBoundingClientRect || child.className == 'badd-transfer-area'
					|| child.className == 'badd-highlighter'
					|| child == service.previewElement) {

					//this does not break. _.each will run the whole array
					return;
				}

				var childPosition = child.getBoundingClientRect();

				var childCenter = {
					X: childPosition.width / 2 + childPosition.left,
					Y: childPosition.height / 2 + childPosition.top
				};

				var belowThreshold = childCenter.Y;
				if (belowThreshold - childPosition.top > 30) {
					// no need to be so greedy
					belowThreshold = childPosition.top + 30;
				}

				var besidesThreshold = childCenter.X;
				if (besidesThreshold - childPosition.left > 30) {
					// no need to be so greedy
					besidesThreshold = childPosition.left + 30;
				}

				if ((event.clientY > belowThreshold && event.clientX > besidesThreshold)
					|| (event.clientY > childPosition.bottom)){
					//this does not break. _.each will run the whole array
					return;
				}

				if (nearestSibling == null) {
					nearestSibling = child;
					nearestSiblingPosition = childPosition;
				} else if (nearestSiblingPosition.left >= childPosition.left
							&& nearestSiblingPosition.top >= childPosition.top) {
					nearestSibling = child;
					nearestSiblingPosition = childPosition;
				}
			});

			if (nearestSibling) {
				event.target.insertBefore(service.previewElement, nearestSibling);
			} else {
				event.target.appendChild(service.previewElement);
			}
			service.showHighlightBorder(event.target);
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

		service.mouseHovering = function(event) {
			event.stopPropagation();
			event.preventDefault();

			service.showHighlightBorder(event.target);
		};

		service.mouseClick = function(event) {
			event.stopPropagation();
			event.preventDefault();

			console.log('mouseClick - ' + event.target.className);
		};

		service.mouseLeaving = function(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideHighlightBorder();
		}
	};
	editorService.$inject = ['$compile', '$document'];
	editorModule.service('editorService', editorService);
}());
