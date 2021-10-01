/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class ToolMenu extends Layerable {
    constructor (editor, menuItems) {
        super();
        this.editor = editor;
        this.menuItems = menuItems;
        
        this.layer = new Konva.Layer();
        this.buttonGroup = new ButtonGroup(menuItems, 0, 0);
        this.layer.add(this.buttonGroup.getGroup());
        
        this.setActiveTool(0);
    }
    
    getLayer () {
        return this.layer;
    }
    
    getActiveTool () {
        return this.buttonGroup.getActive();      
    }
    
    getActiveToolName () {
        return this.buttonGroup.getActiveName();
    }
    
    setActiveTool (index) {
        for (var i = 0; i < this.buttonGroup.length; i++) {
            if (i === index) {
                this.buttonGroup.buttons[i].buttonBox.fill("#abb5ff");
            } else {
                this.buttonGroup.buttons[i].buttonBox.fill("white");
            }
        }
        
        this.layer.draw();
        this.activeBox = index;
    }
}

class DefaultToolMenu extends ToolMenu {
    constructor (editor) {
        super(editor, DefaultToolMenu.createButtons());
    }
    
    static createButtons () {
        var toolMenuItems = [
            new Button("Heightmap", 100, 50, {}),
            new Button("Roads", 100, 50, {}),
            new Button("Forests", 100, 50, {}),
            new Button("Settlements", 100, 50, {})
        ];
        
        return toolMenuItems;
    }
}
