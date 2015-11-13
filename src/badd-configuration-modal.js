(function() {
	var editorModule = angular.module('baddEditor');

	var baddConfigurationController = function(editorService) {
		var ctrl = this;

		ctrl.allowTextEdition = true;
	};
	baddConfigurationController.$inject = ['editorService'];

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