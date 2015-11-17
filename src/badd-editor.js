(function() {
	var editorModule = angular.module('baddEditor', []);

	var editorController = function($scope) {
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
	};
	editorController.$inject = ['$scope'];

	var editorDirective = function () {
		return {
			restrict: 'E',
			templateUrl: 'badd-editor.html',
			scope: {
				title: '@',
				componentsTitle: '@',
				template: '@'
			},
			controller: editorController
		};
	};

	editorModule.directive('baddEditor', editorDirective);

	var editorService = function($compile, $document, $window) {
		var service = this;

		service.initializeFrame = function(frame, scope) {
			return function () {
				service.document = $document[0];
				service.iframe = frame[0];

				fixLayout();

				// helper listener
				$window.addEventListener("click", windowClickListener);

				// set service properties with raw dom html5 element
				service.iframePosition = service.iframe.getBoundingClientRect();
				service.frame = frame.contents()[0];
				service.frame.addEventListener("scroll", service.updateHighlightBorderPosition);
				service.frameHtml = service.frame.querySelector('html');
				service.frameHead = service.frame.querySelector('head');
				service.frameBody = service.frame.querySelector('body');

				// page title
				service.pageTitle = service.frame.querySelector('title');
				if (!service.pageTitle) {
					service.pageTitle = service.document.createElement('title');
				} else {
					scope.$apply(function () {
						scope.pageTitle = service.pageTitle.textContent;
					});
				}

				// create transfer area
				service.transferArea = service.document.createElement('div');
				service.transferArea.className = 'badd-transfer-area';
				service.frameBody.appendChild(service.transferArea);

				// create droppable area highlighter
				service.transferArea.innerHTML = '<svg class="badd-highlighter"></svg>';
				service.highlightBorder = service.transferArea.childNodes[0];
				service.frameBody.appendChild(service.highlightBorder);

				// create selected area highlighter
				service.transferArea.innerHTML = '<svg class="badd-selected-highlighter"></svg>';
				service.selectedHighlightBorder = service.transferArea.childNodes[0];
				service.frameBody.appendChild(service.selectedHighlightBorder);

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

				// make everything draggable and configurable, divs are also droppable
				var elements = _.toArray(service.frameBody.querySelectorAll('*'));
				elements.forEach(configureDirectivesOnElementAndChildren);

				service.scope = scope;
				$compile(service.frameHtml)(scope);
			};
		};

		service.changePageTitle = function(newTitle) {
			service.pageTitle.textContent = newTitle;
		};

		function configureDirectivesOnElementAndChildren(element) {
			if (element.className !== 'badd-highlight'
				&& element.className !== 'badd-transfer-area') {

				if (element.tagName === 'DIV' && element.getAttribute('badd-droppable') !== '') {
					element.setAttribute('badd-droppable', '');
				}

				if (element.getAttribute('badd-draggable') !== '') {
					element.setAttribute('badd-draggable', '');
					element.setAttribute('badd-configurable', '');
				}

				var elements = _.toArray(element.querySelectorAll('*'));
				elements.forEach(configureDirectivesOnElementAndChildren);
			}
		}

		function fixLayout() {
			// fulfill height
			var browserColumn = service.document.querySelector('td.badd-editor-components');
			var browserDiv = service.document.querySelector('div.badd-editor-browser-frame');
			browserDiv.style.height = (browserColumn.getBoundingClientRect().height - 1) + 'px';
			service.iframe.style.height = (browserColumn.getBoundingClientRect().height - 140) + 'px';

			var addressDiv = service.document.querySelector('div.badd-editor-browser-address');
			var addressPageTitleDiv = addressDiv.querySelector('div.badd-editor-browser-address-page-title');
			addressPageTitleDiv.style.width = (addressDiv.getBoundingClientRect().width - 75) + 'px';
		}

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
			var elementBeingHovered = service.document.elementFromPoint(event.clientX + service.iframePosition.left,
																		event.clientY + service.iframePosition.top);
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

			configureDirectivesOnElementAndChildren(service.previewElement);
			$compile(service.previewElement)(service.scope);

			service.previewElement = null;
		};

		service.updateHighlightBorderPosition = function() {
			if (service.highlightBorder.style.display === 'block' && service.lastHoveredTarget) {
				service.showHighlightBorder(service.lastHoveredTarget);
			}
		};

		service.showHighlightBorder = function(target) {
			var targetPosition = target.getBoundingClientRect();
			service.highlightBorder.style.top = targetPosition.top + 'px';
			service.highlightBorder.style.left = targetPosition.left + 'px';
			service.highlightBorder.style.width = target.offsetWidth + 'px';
			service.highlightBorder.style.height = target.offsetHeight + 'px';
			service.highlightBorder.style.display = 'block';
			service.lastHoveredTarget = target;
		};

		service.showSelectedHighlightBorder = function(target) {
			var targetPosition = target.getBoundingClientRect();
			service.selectedHighlightBorder.style.top = targetPosition.top + 'px';
			service.selectedHighlightBorder.style.left = targetPosition.left + 'px';
			service.selectedHighlightBorder.style.width = target.offsetWidth + 'px';
			service.selectedHighlightBorder.style.height = target.offsetHeight + 'px';
			service.selectedHighlightBorder.style.display = 'block';
		};

		service.hideSelectedHighlightBorder = function() {
			service.selectedHighlightBorder.style.display = 'none';
			service.selectedHighlightBorder.style.top = 0;
			service.selectedHighlightBorder.style.left = 0;
			service.selectedHighlightBorder.style.width = 0;
			service.selectedHighlightBorder.style.height = 0;
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

			service.showSelectedHighlightBorder(event.target);
		};

		function windowClickListener(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideSelectedHighlightBorder();
		}

		service.mouseLeaving = function(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideHighlightBorder();
		};
	};
	editorService.$inject = ['$compile', '$document', '$window'];
	editorModule.service('editorService', editorService);
}());
