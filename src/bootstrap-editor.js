/**
 * bootstrap
 *
 * @author Bruno Krebs
 * @url https://github.com/brunokrebs/bootstrap-editor
 * @license MIT License <http://opensource.org/licenses/mit-license.php>
 */
(function() {
	var editorModule = angular.module('bootstrapEditor', []);

	var editorDirective = function () {
		return {
			restrict: 'E',
			templateUrl: 'bootstrap-editor.html'
		};
	};

	editorModule.directive('bootstrapEditor', editorDirective);
}());
