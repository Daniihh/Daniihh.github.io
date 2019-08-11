class AmbiguityError extends AdvancedError{constructor(a){super(`Ambiguity between ${a} names.`),this.type=a}}class MissingNameError extends AdvancedError{constructor(a){console.log(name),super(`Missing ${a} name.`),this.type=a}}let generators={JS:{blockToolsBuilder:["","\n\n","",(a,b)=>{let c=new BlockTools.Code,d=0!=a.colour||"AUTO"!=a.style||void 0!==a.output||void 0!==a.preceding||void 0!==a.succeeding;null==b.blocks?b.blocks=[a.name]:b.blocks.push(a.name);let e=b.blocks,f=[],g=[];console.log(a.content);let h=a.content.reduceSkip((a,b,c)=>null==a.input?("string"==typeof b||"undefined"==typeof b?(a.content=a.content||[],null!=b&&a.content.push(b)):"input"==b.instance?a.input=b:(a.content=a.content||[],a.content.push(b)),a):c,{});console.log(h),c.append("new BlockTools.Builder(",[a.name?`"${a.name.escape()}"`:"",`"built_${a.id}"`],")");for(let d of h){if(c.append("\n\t"),d.input&&"dummy"!=d.input.type){let a={value:"Value",statement:"Statement"}[d.input.type];f.push(d.input.name),c.append(`.append${a}Input(`,[d.input.name?`"${d.input.name.escape()}"`:"",`"${f.length}${(d.input.name||"").escape()}"`],")"),d.input.name||c.pushProblem(new MissingNameError("field")),null!=d.input.check&&c.append(`.setCheck("${d.input.check.escape()}")`),"LEFT"!=d.input.align&&c.append(`.setAlign("${d.input.align}")`)}else c.append(".appendDummyInput()");if(void 0!==d.content)for(let a of d.content){if(c.append(".appendField("),a instanceof Object){let b={text:"BlockTools.Builder.FieldTextInput",number:"BlockTools.Builder.FieldNumber"}[a.type];g.push(a.name),c.append(`new ${b}("${(a.default||"").escape()}"), `,[a.name?`"${a.name.escape()}"`:"",`"${g.length}${(a.name||"").escape()}"`])}else c.append(`"${a?a.escape():""}"`);c.append(")")}}let i={INTERNAL:!0,EXTERNAL:!1}[a.style];return(d||h.last&&h.last.content)&&c.append("\n\t"),0!=a.colour&&c.append(`.setColour(${a.colour})`),null!=i&&c.append(`.setInputsInline(${i})`),void 0!==a.output&&c.append(`.setOutput(${a.output?`"${a.output.escape()}"`:""})`),void 0!==a.preceding&&a.succeeding===a.preceding&&c.append(`.setBothStatements(${a.preceding?`"${a.preceding.escape()}"`:""})`),void 0!==a.preceding&&a.succeeding!==a.preceding&&c.append(`.setPreviousStatement(${a.preceding?`"${a.preceding.escape()}"`:""})`),void 0!==a.succeeding&&a.succeeding!==a.preceding&&c.append(`.setNextStatement(${a.succeeding?`"${a.succeeding.escape()}"`:""})`),new Set(e).size!=e.length&&c.pushProblem(new AmbiguityError("block")),new Set(f).size!=f.length&&c.pushProblem(new AmbiguityError("input")),new Set(g).size!=g.length&&c.pushProblem(new AmbiguityError("field")),a.name||c.pushProblem(new MissingNameError("block")),c.append(".register();"),c}]}};class BlocklyBlockBuilder{constructor(){}static onScriptLoad(){this.types=new BlockTools.Types,this.generator=new BlockTools.CodeGenerator(this.mapper,"builder_entity_block"),BlocklyBlockBuilder.loadBlocks();let a=new Promise(a=>BlocklyBlockBuilder.pageResolve=a),b=new Promise((a,b)=>{let c=new XMLHttpRequest;c.open("GET","/data/toolbox.xml",!0),c.addEventListener("readystatechange",()=>{4==c.readyState&&(this.toolbox=c.responseXML,200==c.status?a():b())}),c.send()});this.pinky=Promise.all([b,a]).then(()=>this.onActionsComplete())}static onPageLoad(){this.pageResolve()}static loadBlocks(){let a=BlockTools.Builder,b=a.FieldAngle,c=a.FieldDropdown;new BlockTools.Builder("builder_entity_block").appendValueInput("name").setCheck("string").setAlign("RIGHT").appendField("Block definition").appendValueInput("style").setCheck("style").setAlign("RIGHT").appendField("Input style").appendValueInput("hue").setCheck("hue").setAlign("RIGHT").appendField("Color").setColour(240).setNextStatement("field").register(),new BlockTools.Builder("builder_value_text").appendDummyInput().appendField("\"").appendField(new BlockTools.Builder.FieldTextInput(""),"value").appendField("\"").setColour(300).setOutput("string").register(),new a("builder_value_style").appendField(new c({AUTO:"automatic",INTERNAL:"internal",EXTERNAL:"external"}),"value").setColour(300).setOutput("style").register(),new a("builder_value_alignment").appendField(new c({LEFT:"left",CENTRE:"center",RIGHT:"right"}),"value").setColour(270).setOutput("alignment").register(),new a("builder_value_hue").appendField("hue").appendField(new b(0,function(a){this.sourceBlock_.setColour(a)}),"value").setColour(0).setOutput("hue").register(),new BlockTools.Builder("builder_text").appendValueInput("content").setCheck("string").appendField("Text").setColour(180).setBothStatements("field").register(),new BlockTools.Builder("builder_input_dummy").appendDummyInput().appendField("New line").setColour(180).setBothStatements("field").register(),new BlockTools.Builder("builder_input_value").appendValueInput("name").setCheck("string").setAlign("RIGHT").appendField("Input").appendValueInput("type").setCheck("type").setAlign("RIGHT").appendField("accepting").appendValueInput("align").setCheck("alignment").setAlign("RIGHT").appendField("aligned").setColour(180).setInputsInline(!0).setBothStatements("field").register(),new BlockTools.Builder("builder_input_statement").appendValueInput("name").setCheck("string").setAlign("RIGHT").appendField("Statement").appendValueInput("type").setCheck("type").setAlign("RIGHT").appendField("accepting").appendValueInput("align").setCheck("alignment").setAlign("RIGHT").appendField("aligned").setColour(180).setInputsInline(!0).setBothStatements("field").register(),new BlockTools.Builder("builder_field_text").appendValueInput("name").appendField("Text field").setCheck("string").appendValueInput("default").appendField("defaulting to").setCheck("string").setColour(180).setBothStatements("field").setInputsInline(!0).register(),new BlockTools.Builder("builder_field_number").appendValueInput("name").appendField("Number field").setCheck("string").appendValueInput("default").appendField("defaulting to").setCheck("int").setColour(180).setBothStatements("field").setInputsInline(!0).register(),new a("builder_type").appendField(new c(...this.types.getConstructArgs()),"type").setColour(240).setOutput("type").register(),new a("builder_connection_output").appendValueInput("type").setCheck("type").appendField("Output").setColour(45).setPreviousStatement("field").register(),new a("builder_connection_succeeding").appendValueInput("type").setCheck("type").appendField("Succeeding").setColour(45).setPreviousStatement("field").register(),new a("builder_connection_preceding").appendValueInput("type").setCheck("type").appendField("Preceding").setColour(45).setPreviousStatement("field").register(),new a("builder_connection_both").appendValueInput("preceding").setAlign("RIGHT").setCheck("type").appendField("Preceding").appendValueInput("succeeding").setAlign("RIGHT").setCheck("type").appendField("& Succeeding").setColour(45).setPreviousStatement("field").register()}static onActionsComplete(){let a={trashcan:!0,scrollbars:!0,grid:{spacing:20,length:5,colour:"#dddddd",snap:!0},zoom:{controls:!0,wheel:!0}};this.blocklyEditor=Blockly.inject("editor-workspace",Object.assign({},a,{toolbox:this.toolbox.documentElement})),this.blocklyPreview=Blockly.inject("preview-workspace",Object.assign({},a,{toolbox:null,trashcan:!1,zoom:{controls:!0,wheel:!0,startScale:1.5}})),this.codePreview=ace.edit("code-output",{mode:"ace/mode/typescript",readOnly:!0}),this.types.register(this.blocklyEditor),this.blocklyEditor.addChangeListener(this.eventHandler);let b=document.getElementById("logos");document.addEventListener("pointermove",({clientX:a,clientY:c})=>{let{left:d,right:e,top:f,bottom:g}=b.getBoundingClientRect(),h=d<a&&a<e&&f<c&&c<g,i=this.blocklyPreview,j=i.getParentSvg().getBoundingClientRect(),k=document.getElementById("logos").getBoundingClientRect(),l=new goog.math.Rect(k.left,k.top,k.width,k.height),m=new goog.math.Coordinate(i.scrollX,i.scrollY),n=new goog.math.Coordinate(j.left,j.top),o=i.getAllBlocks();h=o.some(a=>{let{topLeft:{y:b,x:c},bottomRight:{y:d,x:e}}=a.getBoundingRectangle(),f=new goog.math.Rect(1.5*c,1.5*b,1.5*(e-c),1.5*(d-b));return f.translate(m),f.translate(n),l.intersects(f)})||h,h?b.classList.add("hide"):b.classList.remove("hide")})}static generateCode(){let a=this.format,b=this.language,c=generators[b][a],d=this.generator.generate(this.blocklyEditor,c[3]),e=d.filter(a=>a instanceof AdvancedError),f=d.reduce((a,b,d)=>b instanceof AdvancedError?a:a.append(0==d?"":c[1],b),new BlockTools.Code().append(c[0])).append(c[2]);console.log(f),e.push(...f.getProblems()),this.updateCode(f.getShown(),e),this.updatePreviewWorkspace(f.getUsed())}static updateCode(a,b){(null!=a||""!=a)&&this.codePreview.setValue(a,1);let c=document.getElementById("code-hud"),d=c.getElementsByClassName("hud-display")[0],e={true:"add",false:"remove"}[(0<b.length).toString()];c.classList[e]("shown"),0<b.length&&console.log(b.toString());let f=b.map(a=>a.name+(a.message?`: ${a.message}`:""));0<b.length&&(d.innerHTML=f.join("<br/>"))}static updatePreviewWorkspace(code){let blocks=this.blocklyPreview.getAllBlocks(),deleted=Object.keys(Blockly.Blocks).filter(a=>a.startsWith("built_"));deleted.forEach(a=>delete Blockly.Blocks[a]),eval(code);let all=Object.keys(Blockly.Blocks).filter(a=>a.startsWith("built_")),created=all.filter(a=>!deleted.includes(a));deleted=deleted.filter(a=>!all.includes(a)),all=all.filter(a=>!created.includes(a)),blocks.forEach(a=>{deleted.includes(a.type)&&a.dispose(!1,!0)}),blocks.forEach(a=>{all.includes(a.type)&&(a.inputList.forEach(a=>{a.connection&&a.connection.isConnected()&&a.connection.disconnect(),a.dispose()}),a.nextConnection&&a.nextConnection.isConnected()&&a.nextConnection.disconnect(),a.inputList=[],Blockly.Blocks[a.type].init.call(a))}),created.forEach(a=>{let b=this.blocklyPreview.newBlock(a);b.initSvg(),b.render(),b.snapToGrid()})}static eventHandler(a){a instanceof Blockly.Events.Ui||BlocklyBlockBuilder.generateCode()}}BlocklyBlockBuilder.getNext=a=>({builder_text:"text",builder_input_value:"input",builder_input_statement:"input",builder_input_dummy:"dummy_input",builder_field_text:"field",builder_field_number:"field",builder_connection_output:"connection",builder_connection_succeeding:"connection",builder_connection_preceding:"connection",builder_connection_both:"connection"})[a.type],BlocklyBlockBuilder.mapper={$main:{$lit_content:[],name:"name.value",style:"style.value",colour:"hue.value",id:"$id",$next:BlocklyBlockBuilder.getNext},text:{content:"content.value",$next:BlocklyBlockBuilder.getNext},input:{content:{$lit_instance:"input",$lit_type:function(){return{builder_input_value:"value",builder_input_statement:"statement"}[this.block.type]},$lit_check:function(){return"builder_input_dummy"==this.block.type?void 0:BlocklyBlockBuilder.types.toType(this.getValue("type.type"))},name:"name.value",align:"align.value"},$next:BlocklyBlockBuilder.getNext},dummy_input:{content:{$lit_instance:"input",$lit_type:"dummy"},$next:BlocklyBlockBuilder.getNext},field:{content:{$lit_instance:"field",$lit_type:function(){return{builder_field_text:"text",builder_field_number:"number"}[this.block.type]},name:"name.value",default:"default.value"},$next:BlocklyBlockBuilder.getNext},connection:{$runme:function(){let a={builder_connection_output:{output:"type.type"},builder_connection_succeeding:{succeeding:"type.type"},builder_connection_preceding:{preceding:"type.type"},builder_connection_both:{succeeding:"succeeding.type",preceding:"preceding.type"}}[this.block.type];for(let b in a)this.scope[b]=BlocklyBlockBuilder.types.toType(this.getValue(a[b]))},$next:BlocklyBlockBuilder.getNext}},BlocklyBlockBuilder.language="JS",BlocklyBlockBuilder.format="blockToolsBuilder";let downloadTools=()=>open("/data/tools.zip");BlocklyBlockBuilder.onScriptLoad();