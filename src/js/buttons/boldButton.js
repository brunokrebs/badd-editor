(function() {
	var editorModule = angular.module('baddEditor');

	editorModule.constant('BOLD_BUTTON', {
		tooltip: 'Bold',
		icon: 'fa fa-bold',
		command: function(elements, doc) {
			var i, element, range, strong, startOffset, endOffset;
			var surround = false;

			// we only surround the content if there are non strong elements selected
			for (i = 0; i < elements.length; i++) {
				element = elements[i];
				if (element.node.nodeType == 1) {
					continue;
				}
				surround = element.node.parentNode.tagName != 'STRONG';
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
	});
}());