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
}());
