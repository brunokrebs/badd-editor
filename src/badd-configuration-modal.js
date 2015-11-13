(function() {
	var editorModule = angular.module('baddEditor');

	var baddConfigurationController = function($scope, editorService) {
		var ctrl = this;

		ctrl.editorService = editorService;
	};
	baddConfigurationController.$inject = ['$scope', 'editorService'];

	var baddConfigurationModalDirective = function() {
		return {
			restrict: 'E',
			templateUrl: 'badd-configuration-modal.html',
			controller: baddConfigurationController,
			controllerAs: 'ctrl'
		}
	};

	editorModule.directive('baddConfigurationModal', baddConfigurationModalDirective);
}());