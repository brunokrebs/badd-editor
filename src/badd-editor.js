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
			'LI'
		];

		service.initializeFrame = function(frame, scope) {
			return function () {
				service.document = $document[0];
				service.iframe = frame[0];

				fixLayout();

				// helper listener
				$window.addEventListener("click", windowClickListener);

				// set service properties with raw dom html5 element
				service.iframePosition = service.iframe.getBoundingClientRect();
				service.iframeDocument = service.iframe.contentDocument;
				service.iframeDocument.addEventListener("scroll", service.updateHighlightBorderPosition);
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

				// create transfer area
				service.transferArea = service.document.createElement('div');
				service.transferArea.className = 'badd-transfer-area';
				service.frameBody.appendChild(service.transferArea);

				// create droppable area highlighter
				service.transferArea.innerHTML = '<svg class="badd-highlighter badd-avoid-dd"></svg>';
				service.highlightBorder = service.transferArea.childNodes[0];
				service.frameBody.appendChild(service.highlightBorder);

				// create selected area highlighter
				service.transferArea.innerHTML = '<svg class="badd-selected-highlighter badd-avoid-dd"></svg>';
				service.selectedHighlightBorder = service.transferArea.childNodes[0];
				service.frameBody.appendChild(service.selectedHighlightBorder);

				// create iframe for editable content
				service.transferArea.innerHTML = '<iframe class="badd-editable-content-iframe badd-avoid-dd"></iframe>';
				service.editableFrame = service.transferArea.childNodes[0];
				service.editableFrame.onload = function() {
					service.editableFrameDocument = service.editableFrame.contentWindow.document;
					enableDesignMode(service.editableFrameDocument);
					service.editableFrameHead = service.editableFrame.contentWindow.document.querySelector('head');
					if (service.editableFrameHead == null) {
						return;
					}
					service.editableFrameStyle = service.editableFrameDocument.createElement('style');
					service.editableFrameStyle.innerHTML = 'html,body{overflow:hidden;margin:0}';
					service.editableFrameHead.appendChild(service.editableFrameStyle);
					service.editableFrameBody = service.editableFrame.contentWindow.document.querySelector('body');
					service.editableFrameBody.innerHTML = '';
				};
				service.frameBody.appendChild(service.editableFrame);

				// start baddEditor module
				service.frameHtml.setAttribute('ng-app', 'baddEditor');

				// give editable style to editable page
				addStylesheet(service.iframeDocument, 'badd-editor-frame.min.css');

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

		function addStylesheet(targetDocument, stylesheet) {
			var stylesheetElement = targetDocument.createElement('link');
			stylesheetElement.setAttribute('rel', 'stylesheet');
			stylesheetElement.setAttribute('href', stylesheet);
			stylesheetElement.setAttribute('type', 'text/css');
			targetDocument.querySelector('head').appendChild(stylesheetElement);
		}

		function configureDirectivesOnElementAndChildren(element) {
			if (!_.contains(element.classList, 'badd-avoid-dd')) {

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
				service.hideSelectedHighlightBorder();
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
				if (!child.getBoundingClientRect
					|| _.contains(event.target.classList, 'badd-avoid-dd')
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
			service.highlightBorder.style.top = targetPosition.top - 3 + 'px';
			service.highlightBorder.style.left = targetPosition.left - 3 + 'px';
			service.highlightBorder.style.width = target.offsetWidth + 6 + 'px';
			service.highlightBorder.style.height = target.offsetHeight + 6 + 'px';
			service.highlightBorder.style.display = 'block';
			service.lastHoveredTarget = target;
		};

		service.showSelectedHighlightBorder = function(target) {
			var targetPosition = target.getBoundingClientRect();
			service.selectedHighlightBorder.style.top = targetPosition.top - 3 + 'px';
			service.selectedHighlightBorder.style.left = targetPosition.left - 3 + 'px';
			service.selectedHighlightBorder.style.width = target.offsetWidth + 6 + 'px';
			service.selectedHighlightBorder.style.height = target.offsetHeight + 6 + 'px';
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

			if (!_.contains(event.target.classList, 'badd-avoid-dd')) {
				service.showHighlightBorder(event.target);
			}
		};

		service.mouseClick = function(event) {
			event.stopPropagation();
			event.preventDefault();

			if (event.target !== service.elementBeingEdited
				&& service.elementBeingEdited) {
				service.elementBeingEdited.addEventListener('dragstart', service.startDragging, false);
				service.elementBeingEdited.setAttribute('draggable', 'true');

				var parent = service.elementBeingEdited.parentNode;
				while (parent.tagName != 'BODY') {
					if (parent.getAttribute('badd-draggable') || parent.getAttribute('draggable')) {
						parent.setAttribute('draggable', 'true');
					}
					parent = parent.parentNode;
				}

				service.selectedHighlightBorder.className = 'badd-selected-highlighter badd-avoid-dd';
				service.transferArea.innerHTML = service.editableFrameBody.innerHTML;
				service.elementBeingEdited.parentNode.replaceChild(service.transferArea.childNodes[0],
																   service.elementBeingEdited);
				service.elementBeingEdited = null;
				hideEditableFrame();
			}
			service.showSelectedHighlightBorder(event.target);
		};

		service.mouseDoubleClick = function(event) {
			event.stopPropagation();
			event.preventDefault();

			if (_.contains(service.editableTags, event.target.tagName)) {
				service.elementBeingEdited = event.target;
				service.elementBeingEdited.removeEventListener('dragstart', service.startDragging, false);
				service.elementBeingEdited.setAttribute('draggable', 'false');

				var parent = service.elementBeingEdited.parentNode;
				while (parent.tagName != 'BODY') {
					if (parent.getAttribute('badd-draggable') || parent.getAttribute('draggable')) {
						parent.setAttribute('draggable', 'false');
					}
					parent = parent.parentNode;
				}
				service.selectedHighlightBorder.className +=' badd-edition-mode';
				showEditableFrame(service.elementBeingEdited);
			}
		};

		function showEditableFrame(target) {
			service.editableFrameBody.appendChild(target.cloneNode(true));

			// no outer margins
			service.editableFrameStyle.innerHTML += 'body>' + target.tagName.toLowerCase()
				+ '{margin:0 !important}';

			// make everything look the same way
			var originalElements = _.toArray(target.querySelectorAll('*'));
			originalElements.unshift(target);
			var elements = _.toArray(service.editableFrameBody.querySelectorAll('*'));
			elements.forEach(function(element, index) {
				var randomClassName = 'badd-random-class-' + (new Date()).getMilliseconds() + '' + index;
				element.classList.add(randomClassName);
				service.editableFrameStyle.innerHTML += ' .' + randomClassName + getComputedCSSText(originalElements[index]);
				element.style.cssText = originalElements[index].cssText;
			});

			var targetPosition = target.getBoundingClientRect();
			service.editableFrame.style.top = targetPosition.top + 'px';
			service.editableFrame.style.left = targetPosition.left + 'px';
			service.editableFrame.style.width = target.offsetWidth + 'px';
			service.editableFrame.style.height = target.offsetHeight + 'px';
			service.editableFrame.style.display = 'block';

			target.style.opacity = '0';

			//var range = service.editableFrameDocument.createRange();
			//range.setStart(service.editableFrameBody.firstElementChild, 0);
			//range.setEnd(service.editableFrameBody.firstElementChild, 0);
			//
			//var selection = service.editableFrameDocument.getSelection();
			//selection.removeAllRanges();
			//selection.addRange(range);
		}

		function getComputedCSSText(target) {
			var computedStyle = '';
			var styles = $window.getComputedStyle(target);
			for (var i = 0; i < styles.length; i++) {
				computedStyle += styles[i] + ':' + styles.getPropertyValue(styles[i]) + ';';
			}
			return '{' + computedStyle + '}';
		}

		function hideEditableFrame() {
			service.editableFrameStyle.innerHTML = 'html,body{overflow:hidden;margin:0}';
			service.editableFrameBody.innerHTML = '';
			if (service.editableFrameBody.firstChild) {
				service.editableFrameBody.removeChild(service.editableFrameBody.firstChild);
			}
			service.editableFrame.style.display = 'none';
			service.editableFrame.style.top = 0;
			service.editableFrame.style.left = 0;
			service.editableFrame.style.width = 0;
			service.editableFrame.style.height = 0;
		}

		function windowClickListener(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideSelectedHighlightBorder();
		}

		function enableDesignMode(target) {
			if (service.isIE10) {
				target.designMode = 'On';
			} else {
				target.designMode = 'on';
			}
		}

		service.isIE10 = function() {
			return service.iframe.all != null;
		};

		service.mouseLeaving = function(event) {
			event.stopPropagation();
			event.preventDefault();

			service.hideHighlightBorder();
		};
	};
	editorService.$inject = ['$compile', '$document', '$window'];
	editorModule.service('editorService', editorService);
}());
