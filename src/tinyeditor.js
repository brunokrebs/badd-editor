(function() {
	var tinyEditorService = function() {
		var service = this;

		service.TINY = {};

		service.frameWindow = null;
		service.frameDocument = null;
		service.textArea = null;
		service.ie = isIE();

		var controls = [];
		var offset = -30;

		// controls
		controls['cut'] = [1, 'Cut', 'a', 'cut', 1];
		controls['copy'] = [2, 'Copy', 'a', 'copy', 1];
		controls['paste'] = [3, 'Paste', 'a', 'paste', 1];
		controls['bold'] = [4, 'Bold', 'a', 'bold'];
		controls['italic'] = [5, 'Italic', 'a', 'italic'];
		controls['underline'] = [6, 'Underline', 'a', 'underline'];
		controls['strikethrough'] = [7, 'Strikethrough', 'a', 'strikethrough'];
		controls['subscript'] = [8, 'Subscript', 'a', 'subscript'];
		controls['superscript'] = [9, 'Superscript', 'a', 'superscript'];
		controls['orderedlist'] = [10, 'Insert Ordered List', 'a', 'insertorderedlist'];
		controls['unorderedlist'] = [11, 'Insert Unordered List', 'a', 'insertunorderedlist'];
		controls['outdent'] = [12, 'Outdent', 'a', 'outdent'];
		controls['indent'] = [13, 'Indent', 'a', 'indent'];
		controls['leftalign'] = [14, 'Left Align', 'a', 'justifyleft'];
		controls['centeralign'] = [15, 'Center Align', 'a', 'justifycenter'];
		controls['rightalign'] = [16, 'Right Align', 'a', 'justifyright'];
		controls['blockjustify'] = [17, 'Block Justify', 'a', 'justifyfull'];
		controls['undo'] = [18, 'Undo', 'a', 'undo'];
		controls['redo'] = [19, 'Redo', 'a', 'redo'];
		controls['image'] = [20, 'Insert Image', 'i', 'insertimage', 'Enter Image URL:', 'http://'];
		controls['hr'] = [21, 'Insert Horizontal Rule', 'a', 'inserthorizontalrule'];
		controls['link'] = [22, 'Insert Hyperlink', 'i', 'createlink', 'Enter URL:', 'http://'];
		controls['unlink'] = [23, 'Remove Hyperlink', 'a', 'unlink'];
		controls['unformat'] = [24, 'Remove Formatting', 'a', 'removeformat'];

		function isIE() {
			return service.frameDocument.all ? 1 : 0;
		}

		service.createEditor = function(name, obj) {
			this.editorName = name;
			this.obj = obj;
			this.xhtml = obj.xhtml;

			var p = service.frameDocument.createElement('div');
			var w = service.frameDocument.createElement('div');
			var tinyeditorHeader = service.frameDocument.createElement('div');
			var l = obj.controls.length;
			var i = 0;

			this.i = service.frameDocument.createElement('iframe');
			this.i.frameBorder = 0;
			this.i.width = obj.width || '500';
			this.i.height = obj.height || '250';

			tinyeditorHeader.className = 'teheader';
			p.className=obj.cssclass||'te';
			p.style.maxWidth=this.i.width+'px';
			p.appendChild(tinyeditorHeader);

			for (i; i<l; i++) {
				var id = obj.controls[i];
				if (id === 'n') {
					tinyeditorHeader = service.frameDocument.createElement('div');
					tinyeditorHeader.className = 'teheader';
					p.appendChild(tinyeditorHeader);
				}else if(id=='|'){
					var d=service.frameDocument.createElement('div'); d.className=obj.dividerclass||'tedivider'; tinyeditorHeader.appendChild(d)
				}else if(id=='font'){
					var sel=service.frameDocument.createElement('select'), fonts=obj.fonts||['Verdana','Arial','Georgia'], fl=fonts.length, x=0;
					sel.className='tefont'; sel.onchange=new Function(this.editorName+'.ddaction(this,"fontname")');
					sel.options[0]=new Option('Font','');
					for(x;x<fl;x++){
						var font=fonts[x];
						sel.options[x+1]=new Option(font,font)
					}
					tinyeditorHeader.appendChild(sel);
				}else if(id=='size'){
					var sel=service.frameDocument.createElement('select'), sizes=obj.sizes||[1,2,3,4,5,6,7], sl=sizes.length, x=0;
					sel.className='tesize'; sel.onchange=new Function(this.editorName+'.ddaction(this,"fontsize")');
					for(x;x<sl;x++){
						var size=sizes[x];
						sel.options[x]=new Option(size,size)
					}
					tinyeditorHeader.appendChild(sel);
				}else if(id=='style'){
					var sel=service.frameDocument.createElement('select'),
						styles=obj.styles||[['Style',''],['Paragraph','<p>'],['Header 1','<h1>'],['Header 2','<h2>'],['Header 3','<h3>'],['Header 4','<h4>'],['Header 5','<h5>'],['Header 6','<h6>']],
						sl=styles.length, x=0;
					sel.className='testyle'; sel.onchange=new Function(this.editorName+'.ddaction(this,"formatblock")');
					for(x;x<sl;x++){
						var style=styles[x];
						sel.options[x]=new Option(style[0],style[1])
					}
					tinyeditorHeader.appendChild(sel);
				} else if(controls[id]) {
					var div=service.frameDocument.createElement('div');
					var x = controls[id];
					var func = x[2];
					var ex;
					var pos = x[0] * offset;

					div.className=obj.controlclass;
					div.style.backgroundPosition='0px '+pos+'px';
					div.title=x[1];

					if (func === 'a') {
						ex = service.action(x[3], 0, (x[4] || 0 ));
					} else {
						ex = '.insert("' + x[4] + '", "' + x[5] + '", "' + x[3] + '")';
					}
					div.onclick = ex;
					div.onmouseover = new Function(service.hover(div,pos, 1));
					div.onmouseout = new Function(service.hover(div,pos, 0));
					tinyeditorHeader.appendChild(div);
					if (service.ie) {
						div.unselectable = 'on'
					}
				}
			}
			service.textArea.parentNode.insertBefore(p,service.textArea); service.textArea.style.width=this.i.width+'px';
			w.appendChild(service.textArea); w.appendChild(this.i); p.appendChild(w); service.textArea.style.display='none';
			if(obj.footer){
				var f=service.frameDocument.createElement('div'); f.className=obj.footerclass||'tefooter';
				if(obj.toggle){
					var to=obj.toggle, ts=service.frameDocument.createElement('div');
					ts.className=to.cssclass||'toggle'; ts.innerHTML=to.text||'source';
					ts.onclick=new Function(this.editorName+'.toggle(0,this);return false');
					f.appendChild(ts)
				}
				if(obj.resize){
					var ro=obj.resize, rs=service.frameDocument.createElement('div'); rs.className=ro.cssclass||'resize';
					rs.onmousedown=new Function('event',this.editorName+'.resize(event);return false');
					rs.onselectstart=function(){return false};
					f.appendChild(rs)
				}
				p.appendChild(f)
			}
			service.inlineFrameDocument = this.i.contentWindow.document;
			service.inlineFrameDocument.open();
			var m='<html><head>', bodyid=obj.bodyid?" id=\""+obj.bodyid+"\"":"";

			m += '<link rel="stylesheet" href="tinyeditor.min.css" />'

			m+='</head><body'+bodyid+'>'+(obj.content||service.textArea.value);
			m+='</body></html>';
			service.inlineFrameDocument.write(m);
			service.inlineFrameDocument.close(); service.inlineFrameDocument.designMode='on'; this.d=1;
			if(this.xhtml){
				try{service.inlineFrameDocument.execCommand("styleWithCSS",0,0)}
				catch(e){try{service.inlineFrameDocument.execCommand("useCSS",0,1)}catch(e){}}
			}
		};

		service.hover = function(div, pos, dir) {
			div.style.backgroundPosition = (dir ? '34px ' : '0px ') + (pos) + 'px';
		};

		service.action = function(cmd, val, ie) {
			if (ie && !service.ie) {
				alert('Your browser does not support this function.');
			} else {
				return function() {
					service.inlineFrameDocument.execCommand(cmd, 0, val || null);
				}
			}
		};

		service.TINY.editor = function() {
			function edit(name, obj) {

			}

			edit.prototype.print = function(){
				this.i.contentWindow.print()
			};

			edit.prototype.ddaction=function(dd,a){
				var i=dd.selectedIndex, v=dd.options[i].value;
				this.action(a,v)
			};



			edit.prototype.insert=function(pro,msg,cmd){
				var val=prompt(pro,msg);
				if(val!=null&&val!=''){service.inlineFrameDocument.execCommand(cmd,0,val)}
			};

			edit.prototype.setfont=function(){
				execCommand('formatblock',0,hType)
			};

			edit.prototype.resize=function(e){
				if(this.mv){this.freeze()}
				this.i.bcs=service.TINY.cursor.top(e);
				this.mv=new Function('event',this.editorName+'.move(event)');
				this.sr=new Function(this.editorName+'.freeze()');
				if(this.ie){
					service.frameDocument.attachEvent('onmousemove',this.mv); service.frameDocument.attachEvent('onmouseup',this.sr)
				}else{
					service.frameDocument.addEventListener('mousemove',this.mv,1); service.frameDocument.addEventListener('mouseup',this.sr,1)
				}
			};

			edit.prototype.move=function(e){
				var pos=service.TINY.cursor.top(e);
				this.i.height=parseInt(this.i.height)+pos-this.i.bcs;
				this.i.bcs=pos
			};

			edit.prototype.freeze=function(){
				if(this.ie){
					service.frameDocument.detachEvent('onmousemove',this.mv); service.frameDocument.detachEvent('onmouseup',this.sr)
				}else{
					service.frameDocument.removeEventListener('mousemove',this.mv,1); service.frameDocument.removeEventListener('mouseup',this.sr,1)
				}
			};

			edit.prototype.toggle=function(post,div){
				if(!this.d){
					var v=service.textArea.value;
					if(div){div.innerHTML=this.obj.toggle.text||'source'}
					if(this.xhtml&&!this.ie){
						v=v.replace(/<strong>(.*)<\/strong>/gi,'<span style="font-weight: bold;">$1</span>');
						v=v.replace(/<em>(.*)<\/em>/gi,'<span style="font-weight: italic;">$1</span>')
					}
					service.inlineFrameDocument.body.innerHTML=v;
					service.textArea.style.display='none'; this.i.style.display='block'; this.d=1
				}else{
					var v=service.inlineFrameDocument.body.innerHTML;
					if(this.xhtml){
						v=v.replace(/<span class="apple-style-span">(.*)<\/span>/gi,'$1');
						v=v.replace(/ class="apple-style-span"/gi,'');
						v=v.replace(/<span style="">/gi,'');
						v=v.replace(/<br>/gi,'<br />');
						v=v.replace(/<br ?\/?>$/gi,'');
						v=v.replace(/^<br ?\/?>/gi,'');
						v=v.replace(/(<img [^>]+[^\/])>/gi,'$1 />');
						v=v.replace(/<b\b[^>]*>(.*?)<\/b[^>]*>/gi,'<strong>$1</strong>');
						v=v.replace(/<i\b[^>]*>(.*?)<\/i[^>]*>/gi,'<em>$1</em>');
						v=v.replace(/<u\b[^>]*>(.*?)<\/u[^>]*>/gi,'<span style="text-decoration:underline">$1</span>');
						v=v.replace(/<(b|strong|em|i|u) style="font-weight: normal;?">(.*)<\/(b|strong|em|i|u)>/gi,'$2');
						v=v.replace(/<(b|strong|em|i|u) style="(.*)">(.*)<\/(b|strong|em|i|u)>/gi,'<span style="$2"><$4>$3</$4></span>');
						v=v.replace(/<span style="font-weight: normal;?">(.*)<\/span>/gi,'$1');
						v=v.replace(/<span style="font-weight: bold;?">(.*)<\/span>/gi,'<strong>$1</strong>');
						v=v.replace(/<span style="font-style: italic;?">(.*)<\/span>/gi,'<em>$1</em>');
						v=v.replace(/<span style="font-weight: bold;?">(.*)<\/span>|<b\b[^>]*>(.*?)<\/b[^>]*>/gi,'<strong>$1</strong>')
					}
					if(div){div.innerHTML=this.obj.toggle.activetext||'wysiwyg'}
					service.textArea.value=v;
					if(!post){
						service.textArea.style.height=this.i.height+'px';
						this.i.style.display='none'; service.textArea.style.display='block'; this.d=0
					}
				}
			};

			edit.prototype.post=function(){
				if(this.d){this.toggle(1)}
			};

			return {
				edit:edit
			}
		}();

		service.TINY.cursor=function(){
			return {
				top: function(event){
					if (isIE()) {
						return service.window.event.clientY + service.frameDocument.documentElement.scrollTop
							+ service.frameDocument.body.scrollTop;
					} else {
						return event.clientY + service.window.scrollY;
					}
				}
			}
		}();
	};
	angular.module('baddEditor').service('tinyEditorService', tinyEditorService);
}());