(function () {
	var editorModule = angular.module('baddEditor');

	var baddConfigurableDirective = function ($compile, editorService) {
		return {
			restrict: 'A',
			link: function (scope, element) {
				var configurableDom = element[0];
				configurableDom.addEventListener("mouseover", editorService.mouseHovering);
				configurableDom.addEventListener("click", editorService.mouseClick);
				configurableDom.addEventListener("dblclick", editorService.mouseDoubleClick);
				configurableDom.addEventListener("mouseout", editorService.mouseLeaving);
			}
		}
	};
	baddConfigurableDirective.$inject = ['$compile', 'editorService'];

	editorModule.directive('baddConfigurable', baddConfigurableDirective);
}());