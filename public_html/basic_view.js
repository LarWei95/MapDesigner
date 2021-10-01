/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class Drawable {
    draw () {
        throw new Error("Not implemented.");
    }
}

class Groupable extends Drawable {
    getGroup () {
        throw new Error("Not implemented.");
    }
    
    getSize () {
        return {
            width: undefined,
            height: undefined
        };
    }
    
    static applyEventDict (obj, eventDict) {
        var evtStrs = Object.keys(eventDict);
        var evtStr;
        var evts;
        for (var i = 0; i < evtStrs.length; i++) {
            evtStr = evtStrs[i];
            evts = eventDict[evtStr];
            
            obj.on(evtStr, function() {
                let funcs = evts;
                let func;
                for (var j = 0; j < funcs.length; j++) {
                    func = funcs[j];
                    func();
                }
            });
        }
    }
    
    draw () {
        var grp = this.getGroup();
        
        if (grp.getParent() !== null) {
            grp.draw();
        }
    }
}

class Layerable extends Drawable {
    getLayer () {
        throw new Error("Not implemented.");
    }
    
    draw () {
        var layer = this.getLayer();
        
        if (layer.getParent() !== null) {
            layer.draw();
        }
    }
}

class Button extends Groupable{
    constructor (text, width, height, eventDict) {
        super();
        this.text = text;
        this.eventDict = eventDict;
        
        this.width = width;
        this.height = height;
        
        this.buttonText = null;
        this.buttonBox = null;
        this.group = null;
    }
    
    getSize () {
        return {
            width: this.width,
            height: this.height
        };
    }
    
    getGroup () {
        return this.group;
    }
    
    initializeKonva () {
        var txt = this._createText();
        var txtHeight = txt.height();
        var txtWidth = txt.width();
        var txtX = this.width / 2 - txtWidth / 2;
        var txtY = this.height / 2 - txtHeight / 2;
        txt.x(txtX);
        txt.y(txtY);

        var obj = this._createBox();      
        
        this.buttonText = txt;
        this.buttonBox = obj;
        
        this.group = new Konva.Group({});
        
        this.group.add(obj);
        this.group.add(txt);
    }
    
    _createText () {
        var text = new Konva.Text({
            text: this.text
        });
        
        return text;
    }
    
    _createBox () {
        var obj = new Konva.Rect({
            width: this.width,
            height: this.height,
            fill: "white",
            stroke: "black",
            strokeWidth: 2
        });

        return obj;
    }
    
    _addEvents (events, obj) {
        var keys = Object.keys(events);
        var key;
        
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            obj.on(key, events[key]);
        }
    }
}

class ButtonList extends Groupable {
    constructor (buttons, x, y) {
        // Buttons: List of Button instances!
        super();
        this.x = x;
        this.y = y;
        
        this.buttons = buttons;
        this.group = null;
        this._createGroup();
    }
    
    getSize () {
        var width = 0;
        var height = 0;
        
        var size;
        
        for (var i = 0; i < this.buttons.length; i++) {
            size = this.buttons[i].getSize();
            
            width = (size.width > width) ? size.width : width;
            height += size.height;
        }
        
        
        return {
            width: width,
            height: height
        };
    }
    
    getGroup () {
        return this.group;
    }
    
    _createUpdateGroup () {
        if (this.group === null) {
            this.group = new Konva.Group({
                x: this.x,
                y: this.y
            });
        } else {
            this.group.destroyChildren();
        }
    }
    
    _createGroup () {
        var item;
        var buttonGroup;
        
        var y = 0;
        
        this._createUpdateGroup();
        
        for (let i = 0; i < this.buttons.length; i++) {
            item = this.buttons[i];
            item.initializeKonva();
            buttonGroup = item.getGroup();
            
            Groupable.applyEventDict(buttonGroup, item.eventDict);
            
            buttonGroup.y(y);
            
            this.group.add(buttonGroup);
            y += item.height;
        }
        
        this.draw();
    }
    
    setButtons (buttons) {
        this.buttons = buttons;
        this._createGroup();
    }
}

class ButtonGroup extends ButtonList {
    constructor (buttons, x, y) {
        // Buttons: List of Button instances!
        super(buttons, x, y);
        this.setActive(0, false);
    }
    
    _createGroup () {
        var item;
        var func;
        var buttonGroup;
        
        var y = 0;
        
        this._createUpdateGroup();
        var thisRef = this;
        
        for (let i = 0; i < this.buttons.length; i++) {
            item = this.buttons[i];
            
            func = function () {
                const indx = i;
                thisRef.setActive(indx);
            };
            
            if ("mousedown" in item.eventDict) {
                item.eventDict["mousedown"].push(func);
            } else {
                item.eventDict["mousedown"] = [func];
            }
            item.initializeKonva();
            buttonGroup = item.getGroup();
            
            Groupable.applyEventDict(buttonGroup, item.eventDict);
            
            buttonGroup.y(y);
            
            this.group.add(buttonGroup);
            y += item.height;
        }
        
        this.draw();
    }
    
    setActive (index, draw=true) {
        for (var i = 0; i < this.buttons.length; i++) {
            if (i === index) {
                this.buttons[i].buttonBox.fill("#abb5ff");
            } else {
                this.buttons[i].buttonBox.fill("white");
            }
        }
        
        if (draw) {
            this.group.draw();
        }
        
        this.activeIndex = index;
    }
    
    getActive () {
        return this.activeIndex;
    }
    
    getActiveText () {
        return this.buttons[this.activeIndex].text;
    }
}

