(function() {
	var tinyEditorService = function() {
		var service = this;

		service.TINY = {};

		service.frameWindow = null;
		service.frameDocument = null;
		service.textArea = null;

		function isIE() {
			return service.frameDocument.all ? 1 : 0;
		}

		service.TINY.editor = function() {
			var controls = [];
			var offset = -30;

			// options
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
			controls['print'] = [25, 'Print', 'a', 'print'];

			function edit(name, obj) {
				this.editorName = name;
				this.t = service.textArea;
				this.obj = obj;
				this.xhtml = obj.xhtml;

				var p = service.frameDocument.createElement('div');
				var w = service.frameDocument.createElement('div');
				var h = service.frameDocument.createElement('div');
				var l = obj.controls.length;
				var i = 0;

				this.i=service.frameDocument.createElement('iframe'); this.i.frameBorder=0;
				this.i.width=obj.width||'500'; this.i.height=obj.height||'250'; this.ie=isIE();
				h.className=obj.rowclass||'teheader'; p.className=obj.cssclass||'te'; p.style.maxWidth=this.i.width+'px'; p.appendChild(h);
				for(i;i<l;i++){
					var id=obj.controls[i];
					if(id=='n'){
						h=service.frameDocument.createElement('div'); h.className=obj.rowclass||'teheader'; p.appendChild(h)
					}else if(id=='|'){
						var d=service.frameDocument.createElement('div'); d.className=obj.dividerclass||'tedivider'; h.appendChild(d)
					}else if(id=='font'){
						var sel=service.frameDocument.createElement('select'), fonts=obj.fonts||['Verdana','Arial','Georgia'], fl=fonts.length, x=0;
						sel.className='tefont'; sel.onchange=new Function(this.editorName+'.ddaction(this,"fontname")');
						sel.options[0]=new Option('Font','');
						for(x;x<fl;x++){
							var font=fonts[x];
							sel.options[x+1]=new Option(font,font)
						}
						h.appendChild(sel)
					}else if(id=='size'){
						var sel=service.frameDocument.createElement('select'), sizes=obj.sizes||[1,2,3,4,5,6,7], sl=sizes.length, x=0;
						sel.className='tesize'; sel.onchange=new Function(this.editorName+'.ddaction(this,"fontsize")');
						for(x;x<sl;x++){
							var size=sizes[x];
							sel.options[x]=new Option(size,size)
						}
						h.appendChild(sel)
					}else if(id=='style'){
						var sel=service.frameDocument.createElement('select'),
							styles=obj.styles||[['Style',''],['Paragraph','<p>'],['Header 1','<h1>'],['Header 2','<h2>'],['Header 3','<h3>'],['Header 4','<h4>'],['Header 5','<h5>'],['Header 6','<h6>']],
							sl=styles.length, x=0;
						sel.className='testyle'; sel.onchange=new Function(this.editorName+'.ddaction(this,"formatblock")');
						for(x;x<sl;x++){
							var style=styles[x];
							sel.options[x]=new Option(style[0],style[1])
						}
						h.appendChild(sel)
					}else if(controls[id]){
						var div=service.frameDocument.createElement('div'), x=controls[id], func=x[2], ex, pos=x[0]*offset;
						div.className=obj.controlclass;
						div.style.backgroundPosition='0px '+pos+'px';
						div.title=x[1];
						ex=func=='a'?'.action("'+x[3]+'",0,'+(x[4]||0)+')':'.insert("'+x[4]+'","'+x[5]+'","'+x[3]+'")';
						div.onclick=new Function(this.editorName+(id=='print'?'.print()':ex));
						div.onmouseover=new Function(this.editorName+'.hover(this,'+pos+',1)');
						div.onmouseout=new Function(this.editorName+'.hover(this,'+pos+',0)');
						h.appendChild(div);
						if(this.ie){div.unselectable='on'}
					}
				}
				this.t.parentNode.insertBefore(p,this.t); this.t.style.width=this.i.width+'px';
				w.appendChild(this.t); w.appendChild(this.i); p.appendChild(w); this.t.style.display='none';
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
				this.e=this.i.contentWindow.document; this.e.open();
				var m='<html><head>', bodyid=obj.bodyid?" id=\""+obj.bodyid+"\"":"";

				m += '<link rel="stylesheet" href="tinyeditor.min.css" />'

				m+='</head><body'+bodyid+'>'+(obj.content||this.t.value);
				m+='</body></html>';
				this.e.write(m);
				this.e.close(); this.e.designMode='on'; this.d=1;
				if(this.xhtml){
					try{this.e.execCommand("styleWithCSS",0,0)}
					catch(e){try{this.e.execCommand("useCSS",0,1)}catch(e){}}
				}
			}

			edit.prototype.print = function(){
				this.i.contentWindow.print()
			};

			edit.prototype.hover=function(div,pos,dir){
				div.style.backgroundPosition=(dir?'34px ':'0px ')+(pos)+'px'
			};

			edit.prototype.ddaction=function(dd,a){
				var i=dd.selectedIndex, v=dd.options[i].value;
				this.action(a,v)
			};

			edit.prototype.action=function(cmd,val,ie){
				if(ie&&!this.ie){
					alert('Your browser does not support this function.')
				}else{
					this.e.execCommand(cmd,0,val||null)
				}
			};

			edit.prototype.insert=function(pro,msg,cmd){
				var val=prompt(pro,msg);
				if(val!=null&&val!=''){this.e.execCommand(cmd,0,val)}
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
					var v=this.t.value;
					if(div){div.innerHTML=this.obj.toggle.text||'source'}
					if(this.xhtml&&!this.ie){
						v=v.replace(/<strong>(.*)<\/strong>/gi,'<span style="font-weight: bold;">$1</span>');
						v=v.replace(/<em>(.*)<\/em>/gi,'<span style="font-weight: italic;">$1</span>')
					}
					this.e.body.innerHTML=v;
					this.t.style.display='none'; this.i.style.display='block'; this.d=1
				}else{
					var v=this.e.body.innerHTML;
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
					this.t.value=v;
					if(!post){
						this.t.style.height=this.i.height+'px';
						this.i.style.display='none'; this.t.style.display='block'; this.d=0
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