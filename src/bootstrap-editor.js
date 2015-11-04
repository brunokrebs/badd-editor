/**
 * bootstrap
 *
 * @author Bruno Krebs
 * @url https://github.com/brunokrebs/bootstrap-editor
 * @license MIT License <http://opensource.org/licenses/mit-license.php>
 */
(function() {
	var editorModule = angular.module('bootstrapEditor', []);

	var editorController = function($scope) {
		// if attr are not set, use default values
		$scope.title = angular.isDefined($scope.title) ? $scope.title : 'Bootstrap visual editor';
		$scope.componentsTitle = angular.isDefined($scope.componentsTitle) ? $scope.componentsTitle : 'Components';
		$scope.propertiesTitle = angular.isDefined($scope.propertiesTitle) ? $scope.propertiesTitle : 'Properties';
	};
	editorController.$inject = ['$scope'];

	var editorDirective = function () {
		return {
			restrict: 'E',
			templateUrl: 'bootstrap-editor.html',
			scope: {
				title: '@',
				componentsTitle: '@',
				propertiesTitle: '@'
			},
			controller: editorController
		};
	};

	editorModule.directive('bootstrapEditor', editorDirective);
}());
