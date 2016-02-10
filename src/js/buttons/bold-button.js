(function() {
	var editorModule = angular.module('baddEditor');

	var boldButton = function(baddUtils) {
		var boldButtonService = this;

		function isStrong(element) {
			if (!baddUtils.isInline(element)) {
				return false;
			} else if (element.tagName == 'STRONG') {
				return true;
			} else {
				return isStrong(element.parentNode);
			}
		}

		function command(elements, doc) {
			var i, element, range, strong, startOffset, endOffset;
			var surround = false;

			// we only surround the content if there are non strong elements selected
			for (i = 0; i < elements.length; i++) {
				surround = !isStrong(elements[i].node);
				if (surround) {
					break;
				}
			}

			// now we can process each selected element to surround/release it
			for (i = 0; i < elements.length; i++) {
				element = elements[i];
				strong = doc.createElement('strong');
				range = doc.createRange();
				startOffset = element.node.nodeType == 1 ? 0 : element.startOffset;
				endOffset = element.node.nodeType == 1 ? 1 : element.endOffset;
				range.setStart(element.node, startOffset);
				range.setEnd(element.node, endOffset);
				range.surroundContents(strong);
			}
		}

		boldButtonService.getButton = function() {
			return {
				tooltip: 'Bold',
				icon: 'fa fa-bold',
				command: command
			}
		}
	};
	boldButton.$inject = ['baddUtils'];
	editorModule.service('boldButton', boldButton);
}());