class AmbiguityError extends AdvancedError {
    constructor(name) {
        super(`Ambiguity between ${name} names.`);
        this.type = name;
    }
}
class MissingNameError extends AdvancedError {
    constructor(location) {
        console.log(name);
        super(`Missing ${location} name.`);
        this.type = location;
    }
}
let generators = {
    "JS": {
        "blockToolsBuilder": ["", "\n\n", "", (map, shared) => {
                let code = new BlockTools.Code();
                let endings = map.colour != 0 || map.style != "AUTO" ||
                    map.output !== undefined || map.preceding !== undefined ||
                    map.succeeding !== undefined;
                if (shared.blocks == undefined)
                    shared.blocks = [map.name];
                else
                    shared.blocks.push(map.name);
                let blocks = shared.blocks;
                let inputs = [];
                let fields = [];
                console.log(map.content);
                let contentReducer = (prev, cur, skip) => {
                    if (prev.input != undefined)
                        return skip;
                    if (typeof cur == "string" || typeof cur == "undefined") {
                        prev.content = prev.content || [];
                        if (cur != undefined)
                            prev.content.push(cur);
                    }
                    else {
                        if (cur.instance == "input")
                            prev.input = cur;
                        else {
                            prev.content = prev.content || [];
                            prev.content.push(cur);
                        }
                    }
                    return prev;
                };
                let content = map.content.reduceSkip(contentReducer, {});
                console.log(content);
                code.append("new BlockTools.Builder(", [map.name ? `"${map.name.escape()}"` : "", `"built_${map.id}"`], ")");
                for (let piece of content) {
                    code.append("\n\t");
                    if (piece.input && piece.input.type != "dummy") {
                        let style = {
                            "value": "Value",
                            "statement": "Statement"
                        }[piece.input.type];
                        inputs.push(piece.input.name);
                        code.append(`.append${style}Input(`, [piece.input.name ? `"${piece.input.name.escape()}"` : "", `"${inputs.length}${(piece.input.name || "").escape()}"`], ")");
                        if (!piece.input.name)
                            code.pushProblem(new MissingNameError("field"));
                        if (piece.input.check != null)
                            code.append(`.setCheck("${piece.input.check.escape()}")`);
                        if (piece.input.align != "LEFT")
                            code.append(`.setAlign("${piece.input.align}")`);
                    }
                    else {
                        code.append(".appendDummyInput()");
                    }
                    if (piece.content !== undefined) {
                        for (let cont of piece.content) {
                            code.append(".appendField(");
                            if (cont instanceof Object) {
                                let type = {
                                    "text": "BlockTools.Builder.FieldTextInput",
                                    "number": "BlockTools.Builder.FieldNumber"
                                }[cont.type];
                                fields.push(cont.name);
                                code.append(`new ${type}("${(cont.default || "").escape()}"), `, [cont.name ? `"${cont.name.escape()}"` : "", `"${fields.length}${(cont.name || "").escape()}"`]);
                            }
                            else {
                                code.append(`"${cont ? cont.escape() : ""}"`);
                            }
                            code.append(")");
                        }
                        //code.append(`.appendField("${piece.text ? piece.text.escape() : ""}")`);
                    }
                }
                let style = { "INTERNAL": true, "EXTERNAL": false }[map.style];
                if (endings || (content.last && content.last.content))
                    code.append("\n\t");
                if (map.colour != 0)
                    code.append(`.setColour(${map.colour})`);
                if (style != undefined)
                    code.append(`.setInputsInline(${style})`);
                if (map.output !== undefined)
                    code.append(`.setOutput(${map.output ? `"${map.output.escape()}"` : ""})`);
                if (map.preceding !== undefined && map.succeeding === map.preceding)
                    code.append(`.setBothStatements(${map.preceding ? `"${map.preceding.escape()}"` : ""})`);
                if (map.preceding !== undefined && map.succeeding !== map.preceding)
                    code.append(`.setPreviousStatement(${map.preceding ? `"${map.preceding.escape()}"` : ""})`);
                if (map.succeeding !== undefined && map.succeeding !== map.preceding)
                    code.append(`.setNextStatement(${map.succeeding ? `"${map.succeeding.escape()}"` : ""})`);
                if (new Set(blocks).size != blocks.length)
                    code.pushProblem(new AmbiguityError("block"));
                if (new Set(inputs).size != inputs.length)
                    code.pushProblem(new AmbiguityError("input"));
                if (new Set(fields).size != fields.length)
                    code.pushProblem(new AmbiguityError("field"));
                if (!map.name)
                    code.pushProblem(new MissingNameError("block"));
                code.append(".register();");
                return code;
            }]
    }
};
class BlocklyBlockBuilder {
    constructor() { }
    ;
    static onScriptLoad() {
        this.types = new BlockTools.Types();
        this.generator = new BlockTools.CodeGenerator(this.mapper, "builder_entity_block");
        BlocklyBlockBuilder.loadBlocks();
        let pagePinky = new Promise((rs) => BlocklyBlockBuilder.pageResolve = rs);
        let toolboxPinky = new Promise((rs, rj) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", "/data/toolbox.xml", true);
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == 4) {
                    this.toolbox = xhr.responseXML;
                    xhr.status == 200 ? rs() : rj();
                }
            });
            xhr.send();
        });
        this.pinky = Promise.all([toolboxPinky, pagePinky]).then(() => this.onActionsComplete());
    }
    static onPageLoad() {
        this.pageResolve();
    }
    static loadBlocks() {
        let Builder = BlockTools.Builder;
        let FieldAngle = Builder.FieldAngle;
        let FieldDropdown = Builder.FieldDropdown;
        //Entities
        new BlockTools.Builder("builder_entity_block")
            .appendValueInput("name").setCheck("string").setAlign("RIGHT").appendField("Block definition")
            .appendValueInput("style").setCheck("style").setAlign("RIGHT").appendField("Input style")
            .appendValueInput("hue").setCheck("hue").setAlign("RIGHT").appendField("Color")
            .setColour(240).setNextStatement("field").register();
        //Values
        new BlockTools.Builder("builder_value_text")
            .appendDummyInput().appendField("\"").appendField(new BlockTools.Builder.FieldTextInput(""), "value").appendField("\"")
            .setColour(300).setOutput("string").register();
        new Builder("builder_value_style")
            .appendField(new FieldDropdown({ "AUTO": "automatic", "INTERNAL": "internal", "EXTERNAL": "external" }), "value")
            .setColour(300).setOutput("style").register();
        new Builder("builder_value_alignment")
            .appendField(new FieldDropdown({ "LEFT": "left", "CENTRE": "center", "RIGHT": "right" }), "value")
            .setColour(270).setOutput("alignment").register();
        new Builder("builder_value_hue")
            .appendField("hue").appendField(new FieldAngle(0, function (hue) { this.sourceBlock_.setColour(hue); }), "value")
            .setColour(0).setOutput("hue").register();
        //Text (Made In Editor!)
        new BlockTools.Builder("builder_text")
            .appendValueInput("content").setCheck("string").appendField("Text")
            .setColour(180).setBothStatements("field").register();
        new BlockTools.Builder("builder_input_dummy")
            .appendDummyInput().appendField("New line")
            .setColour(180).setBothStatements("field").register();
        //Inputs
        new BlockTools.Builder("builder_input_value")
            .appendValueInput("name").setCheck("string").setAlign("RIGHT").appendField("Input")
            .appendValueInput("type").setCheck("type").setAlign("RIGHT").appendField("accepting")
            .appendValueInput("align").setCheck("alignment").setAlign("RIGHT").appendField("aligned")
            .setColour(180).setInputsInline(true).setBothStatements("field").register();
        new BlockTools.Builder("builder_input_statement")
            .appendValueInput("name").setCheck("string").setAlign("RIGHT").appendField("Statement")
            .appendValueInput("type").setCheck("type").setAlign("RIGHT").appendField("accepting")
            .appendValueInput("align").setCheck("alignment").setAlign("RIGHT").appendField("aligned")
            .setColour(180).setInputsInline(true).setBothStatements("field").register();
        //Fields
        new BlockTools.Builder("builder_field_text")
            .appendValueInput("name").appendField("Text field").setCheck("string")
            .appendValueInput("default").appendField("defaulting to").setCheck("string")
            .setColour(180).setBothStatements("field").setInputsInline(true).register();
        new BlockTools.Builder("builder_field_number")
            .appendValueInput("name").appendField("Number field").setCheck("string")
            .appendValueInput("default").appendField("defaulting to").setCheck("int")
            .setColour(180).setBothStatements("field").setInputsInline(true).register();
        //Type
        new Builder("builder_type")
            .appendField(new FieldDropdown(...this.types.getConstructArgs()), "type")
            .setColour(240).setOutput("type").register();
        //Connections
        new Builder("builder_connection_output")
            .appendValueInput("type").setCheck("type").appendField("Output")
            .setColour(45).setPreviousStatement("field").register();
        new Builder("builder_connection_succeeding")
            .appendValueInput("type").setCheck("type").appendField("Succeeding")
            .setColour(45).setPreviousStatement("field").register();
        new Builder("builder_connection_preceding")
            .appendValueInput("type").setCheck("type").appendField("Preceding")
            .setColour(45).setPreviousStatement("field").register();
        new Builder("builder_connection_both")
            .appendValueInput("preceding").setAlign("RIGHT").setCheck("type")
            .appendField("Preceding")
            .appendValueInput("succeeding").setAlign("RIGHT").setCheck("type")
            .appendField("& Succeeding")
            .setColour(45).setPreviousStatement("field").register();
    }
    static onActionsComplete() {
        let common = {
            "trashcan": true,
            "scrollbars": true,
            "grid": {
                "spacing": 20,
                "length": 5,
                "colour": "#dddddd",
                "snap": true,
            },
            "zoom": {
                "controls": true,
                "wheel": true
            }
        };
        this.blocklyEditor = Blockly.inject("editor-workspace", Object.assign({}, common, { "toolbox": this.toolbox.documentElement }));
        this.blocklyPreview = Blockly.inject("preview-workspace", Object.assign({}, common, { "toolbox": null, "trashcan": false, 
            /*
              Disabled because blocks deleted may be retrieved from the trashcan,
              causing errors and the application to freeze.
            */
            "zoom": {
                "controls": true,
                "wheel": true,
                "startScale": 1.5
            } }));
        this.codePreview = ace.edit("code-output", {
            "mode": "ace/mode/typescript",
            "readOnly": true
        });
        this.types.register(this.blocklyEditor);
        this.blocklyEditor.addChangeListener(this.eventHandler);
        let hov = document.getElementById("logos");
        document.addEventListener("pointermove", ({ clientX, clientY }) => {
            let { left, right, top, bottom } = hov.getBoundingClientRect();
            let condition = left < clientX && clientX < right && top < clientY && clientY < bottom;
            let workspace = this.blocklyPreview;
            let workspaceBounding = workspace.getParentSvg().getBoundingClientRect();
            let intersectionBounding = document.getElementById("logos").getBoundingClientRect();
            let intersection = new goog.math.Rect(intersectionBounding.left, intersectionBounding.top, intersectionBounding.width, intersectionBounding.height);
            let workspaceScrollOffset = new goog.math.Coordinate(workspace.scrollX, workspace.scrollY);
            let workspacePositionOffset = new goog.math.Coordinate(workspaceBounding.left, workspaceBounding.top);
            let blocks = workspace.getAllBlocks();
            condition = blocks.some((block) => {
                let { topLeft: { y: top, x: left }, bottomRight: { y: bottom, x: right } } = block.getBoundingRectangle();
                let bounding = new goog.math.Rect(left * 1.5, top * 1.5, (right - left) * 1.5, (bottom - top) * 1.5);
                bounding.translate(workspaceScrollOffset);
                bounding.translate(workspacePositionOffset);
                //console.log(bounding);
                return intersection.intersects(bounding);
            }) || condition;
            if (condition)
                hov.classList.add("hide");
            else
                hov.classList.remove("hide");
        });
    }
    static generateCode() {
        let form = this.format;
        let lang = this.language;
        let gen = generators[lang][form];
        let code = this.generator.generate(this.blocklyEditor, gen[3]);
        let errors = code.filter((value) => value instanceof AdvancedError);
        let reducer = (pre, cur, ind) => {
            return cur instanceof AdvancedError ? pre : pre.append(ind == 0 ? "" : gen[1], cur);
        };
        let compiled = code.reduce(reducer, new BlockTools.Code().append(gen[0])).append(gen[2]);
        console.log(compiled);
        errors.push(...compiled.getProblems());
        this.updateCode(compiled.getShown(), errors);
        this.updatePreviewWorkspace(compiled.getUsed());
    }
    static updateCode(code, errors) {
        if (code != null || code != "")
            this.codePreview.setValue(code, 1);
        let hud = document.getElementById("code-hud");
        let info = hud.getElementsByClassName("hud-display")[0];
        let name = { "true": "add", "false": "remove" }[(errors.length > 0).toString()];
        hud.classList[name]("shown");
        if (errors.length > 0)
            console.log(errors.toString());
        let content = errors.map((err) => err.name + (err.message ? `: ${err.message}` : ""));
        if (errors.length > 0)
            info.innerHTML = content.join("<br/>");
    }
    static updatePreviewWorkspace(code) {
        let blocks = this.blocklyPreview.getAllBlocks();
        let deleted = Object.keys(Blockly.Blocks).filter((key) => key.startsWith("built_"));
        deleted.forEach((name) => delete Blockly.Blocks[name]);
        eval(code);
        let all = Object.keys(Blockly.Blocks).filter((key) => key.startsWith("built_"));
        let created = all.filter((name) => !deleted.includes(name));
        deleted = deleted.filter((name) => !all.includes(name));
        all = all.filter((name) => !created.includes(name));
        // console.debug("All:", all);
        // console.debug("Deleted:", deleted);
        // console.debug("Created:", created);
        //TODO: Re add preview trashcan and...
        /*
          Option 1. The lame option... Clear any deleted blocks in it by using a
          headless Blockly workspace:
    
          new Blockly.Workspace()
          Blockly.Xml.domToWorkspace(trashContents, workspace)
          workspace.getAllBlocks //Filter & Delete
    
          //Requires definitions to be updated a lot.
        */
        /*
          Option 2. The cool option! Keep old block data intact and detect when a
          block was dragged out from the trash can and revive it on the editor
          workspace.
    
          This would require a lot of extra code scattered around the project...
        */
        blocks.forEach((block) => {
            if (deleted.includes(block.type)) {
                block.dispose(false, true);
            }
        });
        blocks.forEach((block) => {
            if (all.includes(block.type)) {
                block.inputList.forEach((input) => {
                    if (input.connection && input.connection.isConnected())
                        input.connection.disconnect();
                    input.dispose();
                });
                block.nextConnection && block.nextConnection.isConnected() && block.nextConnection.disconnect();
                block.inputList = [];
                Blockly.Blocks[block.type].init.call(block);
            }
        });
        created.forEach((name) => {
            let block = this.blocklyPreview.newBlock(name);
            block.initSvg();
            block.render();
            block.snapToGrid();
        });
    }
    static eventHandler(event) {
        if (!(event instanceof Blockly.Events.Ui)) {
            BlocklyBlockBuilder.generateCode();
        }
    }
}
BlocklyBlockBuilder.getNext = (block) => ({
    "builder_text": "text",
    "builder_input_value": "input",
    "builder_input_statement": "input",
    "builder_input_dummy": "dummy_input",
    "builder_field_text": "field",
    "builder_field_number": "field",
    "builder_connection_output": "connection",
    "builder_connection_succeeding": "connection",
    "builder_connection_preceding": "connection",
    "builder_connection_both": "connection"
})[block.type];
BlocklyBlockBuilder.mapper = {
    "$main": {
        "$lit_content": [],
        "name": "name.value",
        "style": "style.value",
        "colour": "hue.value",
        "id": "$id",
        "$next": BlocklyBlockBuilder.getNext
    },
    "text": {
        "content": "content.value",
        "$next": BlocklyBlockBuilder.getNext
    },
    "input": {
        "content": {
            "$lit_instance": "input",
            "$lit_type": function () {
                return {
                    "builder_input_value": "value",
                    "builder_input_statement": "statement"
                }[this.block.type];
            },
            "$lit_check": function () {
                if (this.block.type == "builder_input_dummy")
                    return;
                return BlocklyBlockBuilder.types.toType(this.getValue("type.type"));
            },
            "name": "name.value",
            "align": "align.value"
        },
        "$next": BlocklyBlockBuilder.getNext
    },
    "dummy_input": {
        "content": {
            "$lit_instance": "input",
            "$lit_type": "dummy"
        },
        "$next": BlocklyBlockBuilder.getNext
    },
    "field": {
        "content": {
            "$lit_instance": "field",
            "$lit_type": function () {
                return {
                    "builder_field_text": "text",
                    "builder_field_number": "number"
                }[this.block.type];
            },
            "name": "name.value",
            "default": "default.value"
        },
        "$next": BlocklyBlockBuilder.getNext
    },
    "connection": {
        "$runme": function () {
            let add = {
                "builder_connection_output": { "output": "type.type" },
                "builder_connection_succeeding": { "succeeding": "type.type" },
                "builder_connection_preceding": { "preceding": "type.type" },
                "builder_connection_both": {
                    "succeeding": "succeeding.type",
                    "preceding": "preceding.type"
                }
            }[this.block.type];
            for (let name in add) {
                this.scope[name] = BlocklyBlockBuilder.types.toType(this.getValue(add[name]));
            }
        },
        "$next": BlocklyBlockBuilder.getNext
    }
};
BlocklyBlockBuilder.language = "JS";
BlocklyBlockBuilder.format = "blockToolsBuilder";
let downloadTools = () => open("/data/tools.zip");
let toGithub = () => open("https://github.com/Daniihh/Daniihh.github.io");
BlocklyBlockBuilder.onScriptLoad();
