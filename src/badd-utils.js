(function() {
	var editorModule = angular.module('baddEditor');

	var baddUtils = function() {
		var utils = this;

		utils.belongsTo = function(child, parent) {
			if (child == null || parent == null || child === parent) {
				return false;
			}
			var nextParent = child.parentNode;
			while (nextParent != null) {
				if (nextParent === parent) {
					return true;
				}
				nextParent = nextParent.parentNode;
			}
			return false;
		}
	};
	editorModule.service('baddUtils', baddUtils);
}());