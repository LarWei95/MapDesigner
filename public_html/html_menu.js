/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const _INDEX_ARRAY = [
    "heightmap",
    "roads",
    "forests",
    "settlements",
    "spawnpoints"
];

class Indexable {
    getIndex () {
        throw new Error("Not implemented yet.");
    }
}

class SingleSelectHTMLMenu extends Indexable {
    constructor (menuDivId, updateFunction=null) {
        super();
        this._updateFunction = updateFunction;
        this._menuDivId = menuDivId;
        this._buttons = this._initializeButtons(menuDivId);
        this._index = -1;
        this.__initialSetIndex(0);
    }
    
    getIndex () {
        return this._index;
    }
    
    _initializeButtons (menuDivId) {
        let buttons = $("#"+menuDivId).children("button");
        let button;
        let func;
        
        for (let i = 0; i < buttons.length; i++) {
            button = buttons[i];
            $(button).addClass("toolinactive");
            
            func = this.__getClickFunction(i);            
            $(button).click(func);
        }
        
        return buttons;
    }
    
    clear () {
        for (var i = 0; i < this._buttons.length; i++) {
            $(this._buttons[i]).remove();
        }
        
        this._buttons = [];
        this._index = -1;
    }
    
    setButtonsByDict (dicts) {
        var texts = [];
        var attrDicts = [];
        
        var dict;
        
        for (var i = 0; i < dicts.length; i++) {
            dict = dicts[i];
            texts.push(dict.text);
            
            if (dict.attrDict !== undefined && dict.attrDict !== null) {
                attrDicts.push(dict.attrDict);
            } else {
                attrDicts.push(null);
            }
        }
        
        this.setButtons(texts, attrDicts);
    } 
    
    setButtons (texts, attrDicts=null) {
        let oldIndex = this._index;
        this.clear();
        
        let hasDicts = attrDicts !== null;
        
        for (var i = 0; i < texts.length; i++) {
            if (hasDicts) {
                if (attrDicts[i] !== null) {
                    this.addButton(texts[i], attrDicts[i]);
                } else {
                    this.addButton(texts[i], null);
                }
                
            } else {
                this.addButton(texts[i], null);
            }
        }
        
        this._setIndex(oldIndex % this._buttons.length);        
    }
    
    
    __getClickFunction (targetIndex) {
        const thisRef = this;
        var func;
        
        if (this._updateFunction !== null) {
            func = function () {
                let target = targetIndex;
                thisRef._setIndex(target);
                thisRef._updateFunction();
            };
        } else {
            func = function () {
                let target = targetIndex;
                thisRef._setIndex(target);
            };
        }
        
        return func;
    }
    
    addButton (text, attrDict=null) {
        let newIndex = this._buttons.length;
        let newButton = $("<button></button>")
                .text(text);
                
        if (attrDict !== null) {
            let attributes = Object.keys(attrDict);
            
            for (var i = 0; i < attributes.length; i++) {
                newButton = newButton.attr(attributes[i], attrDict[attributes[i]]);
            }
        }
        $(newButton).addClass("toolinactive");
        $(newButton).click(this.__getClickFunction(newIndex));
        $("#"+this._menuDivId).append(newButton);
        this._buttons.push(newButton);
        return newIndex;
    }
    
    removeButton (index) {
        let type = typeof index;
        let indexCopy = index;
        var button;
        
        if (type === "string") {
            
            var found = false;
            
            for (var i = 0; i < this._buttons.length; i++) {
                button = this._buttons[i];
                
                if ($(button).text() === index) {
                    index = i;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                i = -1;
            }
        } else if (type === "number") {
            
        } else {
            throw new Error("No accepted type for button index: "+type);
        }
        
        if (i !== -1) {
            button = this._buttons[index];
            $(button).remove();
            
            this._buttons.splice(index, 1);
            
            for (let i = index; i < this._buttons.length; i++) {
                button = this._buttons[i];
                $(button).unbind();
                $(button).click(this.__getClickFunction(i));
            }
            
            if (index === this._index) {
                this._setIndex((index - 1) % this._buttons.length);
            }
        } else {
            throw new Error("The searched button was not found: "+indexCopy);
        }
    }
    
    _setButtonInactive (toolIndex) {
        $(this._buttons[toolIndex]).removeClass("toolactive");
        $(this._buttons[toolIndex]).addClass("toolinactive");
    }
    
    _setButtonActive (toolIndex) {
        $(this._buttons[toolIndex]).removeClass("toolinactive");
        $(this._buttons[toolIndex]).addClass("toolactive");
    }
    
    __initialSetIndex (buttonIndex) {
        if (this._index !== buttonIndex) {
            this._setButtonInactive(this._index);
            this._index = buttonIndex;
            this._setButtonActive(this._index);
        }
    }
    
    _setIndex (buttonIndex) {
        if (this._index !== buttonIndex) {
            this._setButtonInactive(this._index);
            this._index = buttonIndex;
            this._setButtonActive(this._index);
        }
    }
    
    setIndex (buttonIndex) {
        if (this._buttons.length > buttonIndex && buttonIndex >= 0) {
            this._setIndex(buttonIndex);
        } else {
            throw new Error("Index out of range: "+buttonIndex+" "+this._buttons.length);
        }
    }
}

class TargetedSingleSelectHTMLMenu extends SingleSelectHTMLMenu {
    constructor (menuDivId, indexArray, updateFunction=null) {
        super(menuDivId, updateFunction);
        this._indexArray = indexArray;
        this._targetIndex = -1;
        this.__initializeTargetIndex();
    }
    
    _indexToTargetIndex () {
        var dataTarget = $(this._buttons[this._index]).attr("data-target");
        dataTarget = this._indexArray.indexOf(dataTarget);
        return dataTarget;
    }
    
    __initializeTargetIndex () {
        var dataTarget = this._indexToTargetIndex();
        
        if (dataTarget !== -1) {
            this._targetIndex = dataTarget;
        } else {
            throw new Error("The initial target index could not be determined.");
        }
    }
    
    _setIndex (buttonIndex) {
        super._setIndex(buttonIndex);
        var dataTarget = this._indexToTargetIndex();
        
        if (dataTarget !== -1) {
            this._targetIndex = dataTarget;
        } else {
            throw new Error("The target index could not be determined.");
        }
    }
    
    getIndex () {
        return this._targetIndex;
    }
}

class AddSubHTMLMenu {
    constructor (divId, addFunction=null, subFunction=null) {
        this._divId = divId;
        this.__initialize(divId, addFunction, subFunction);
    }
    
    __initialize (divId, addFunction, subFunction) {
        let divElem = $("#"+divId);
        
        let addButton = $("<button></button>")
                .text("+")
                .attr("id", divId+"-add-button");
        let subButton = $("<button></button>")
                .text("-")
                .attr("id", divId+"-sub-button");
        
        $(divElem).append(addButton, subButton);
        
        this._addButton = addButton;
        this._subtractButton = subButton;
        
        this.setAddFunction (addFunction);
        this.setSubtractFunction(subFunction);
    }
    
    setAddFunction (func=null) {
        $(this._addButton).unbind();
        
        if (func !== null) {
            $(this._addButton).click(func);
        }
    }
    
    setSubtractFunction (func=null) {
        $(this._subtractButton).unbind();
        
        if (func !== null) {
            $(this._subtractButton).click(func);
        }
    }
    
    showAdd () {
        $(this._addButton).show();
    }
    
    showSubtract () {
        $(this._subtractButton).show();
    }
    
    hideAdd () {
        $(this._addButton).hide();
    }
    
    hideSubtract () {
        $(this._subtractButton).hide();
    }
    
    show () {
        this.showAdd();
        this.showSubtract();
    }
    
    hide () {
        this.hideAdd();
        this.hideSubtract();
    }
}

class HTMLMainToolMenu extends TargetedSingleSelectHTMLMenu {
    constructor (menuDivId, htmlManager, indexArray=_INDEX_ARRAY) {
        super(menuDivId, indexArray, function () {
            htmlManager.updateMainTool();
        });
    }
}

class HTMLObjectSelectionMenu extends SingleSelectHTMLMenu {
    constructor (menuDivId, htmlManager) {
        super(menuDivId, function() {
           htmlManager.updateObjectSelection(); 
        });
    }
}