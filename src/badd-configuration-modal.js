(function() {
	var editorModule = angular.module('baddEditor');

	var baddConfigurationModalDirective = function() {
		return {
			restrict: 'E',
			templateUrl: 'badd-configuration-modal.html',
			controllerAs: 'ctrl'
		}
	};

	editorModule.directive('baddConfigurationModal', baddConfigurationModalDirective);
}());