/**
 * bootstrap
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

		$scope.components = [
			{ title: 'Header 1', label:'h1', element: '<h1>New Header 1</h1>' },
			{ title: 'Header 2', label:'h2', element: '<h2>New Header 2</h2>' },
			{ title: 'Header 3', label:'h3', element: '<h3>New Header 3</h3>' },
			{ title: 'Header 4', label:'h4', element: '<h4>New Header 4</h4>' },
			{ title: 'Button', label:'btn', element: '<button class="btn btn-primary" badd-draggable>New Button</button>' }
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

	var editorService = function() {
		var service = this;

		service.uniqueCounter = 0;
		service.objectPreview = null;
		service.highlightBorder = null;

		service.getNextUniqueClass = function() {
			service.uniqueCounter = service.uniqueCounter + 1;
			return 'badd-editor-unique-' + service.uniqueCounter;
		};

		service.getLastUniqueClass = function() {
			return 'badd-editor-unique-' + service.uniqueCounter;
		};

		service.showHighlightBorder = function(target) {
			if ( ! service.highlightBorder) {
				service.highlightBorder = $('<div class="badd-highlighter" />');

				var body = target.parents('html').find('body');
				body.append(service.highlightBorder);
			}

			service.highlightBorder.css({
				top: target.offset().top,
				left: target.offset().left,
				width: target.outerWidth(),
				height: target.outerHeight(),
				display: 'block'
			});
		};

		service.hideHighlightBorder = function() {
			service.highlightBorder.css({
				display: 'none',
				top: 0,
				left: 0,
				width: 0,
				height: 0
			});
		}
	};
	editorModule.service('editorService', editorService);
}());
