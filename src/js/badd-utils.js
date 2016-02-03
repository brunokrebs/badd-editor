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
		};

		utils.contains = function(array, value) {
			var length = array ? array.length : 0;
			var index = -1,
				isReflexive = value === value;

			while (++index < length) {
				var other = array[index];
				if ((isReflexive ? other === value : other !== other)) {
					return true;
				}
			}
			return false;
		};

		utils.toArray = function(value) {
			var array = [];
			var length = value ? value.length : 0;
			for (var i = 0; i < length; i++) {
				array[i] = value[i];
			}
			return array;
		};
	};
	editorModule.service('baddUtils', baddUtils);
}());