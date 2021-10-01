/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class SubManager {
    constructor (editor, htmlManager) {
        this._editor = editor;
        this._htmlManager = htmlManager;
        this._lastObjectIndex = 0;
        this._lastToolIndex = 0;
    }
    
    showObjectList () {
        var ret = this._getObjects();
        
        this._htmlManager.objectMenu.setButtons(ret.texts, ret.attrDicts);
        ret = ret.objIndex;
        
        if (ret !== undefined && ret !== null && ret >= 0) {
            this._htmlManager.objectMenu.setIndex(ret);
        }
    }
    
    showSubTools () {
        var subToolDict = this._getSubTools();
        this._htmlManager.subToolMenu.setButtonsByDict(subToolDict.subTools);
        subToolDict = subToolDict.toolIndex;
        
        if (subToolDict !== undefined && subToolDict !== null && subToolDict >= 0) {
            this._htmlManager.subToolMenu.setIndex(subToolDict);
        }
        
    }
    
    _getObjects () {
        throw new Error("Not implemented.");
    }
    
    _getSubTools () {
        throw new Error("Not implemented.");
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        throw new Error("Not implemented.");
    }
    
    add () {
        throw new Error("Not implemented.");
    }
    
    remove () {
        throw new Error("Not implemented.");
    }
    
    needsSubAdd () {
        throw new Error("Not implemented.");
    }
    
    updateObjectSelection () {
        throw new Error("Not implemented.");
    }
    
    updateToolSelection () {
        let index = this._htmlManager.getActiveSubTool();
        this._lastToolIndex = index;
    }
}

class EmptySubManager extends SubManager {
    constructor (editor, htmlManager) {
        super(editor, htmlManager);
    }
    
    _getObjects () {
        return {
            texts: [],
            attrDicts: null,
            objIndex: null
        };
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        console.log("Area press!");
    }
    
    add () {
        console.log("Add!");
    }
    
    remove () {
        console.log("Remove!");
    }
    
    needsSubAdd () {
        return false;
    }
    
    updateObjectSelection () {
        console.log("Updating object selection!");
    }
    
    _getSubTools () {
        return {
          toolIndex: 0,
          subTools: [
              {
                  text: "Test",
                  attrDict: null
              }
          ]
        };
    }
}

class RoadSubManager extends SubManager {
    constructor (editor, htmlManager) {
        super(editor, htmlManager);
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        switch (this._lastToolIndex) {
            case 0:
                this._editor.addRoadPoint(gridX, gridY);
                this.showObjectList();
                break;
            case 1:
                var intersect = this._editor.roadDisplay.getIntersection({
                    x: rawX,
                    y: rawY
                });
                
                if (intersect.line === this._editor.roadManager.getActiveIndex()) {
                    this._editor.roadManager.removePoint(intersect.line, intersect.point);
                    this._editor.roadDisplay.updateAll();
                }
                
                break;
            default:
                break;
        }
    }
    
    _getObjects () {
        var roads = this._editor.roadManager.objects;
        var texts = [];
        
        for (var i = 0; i < roads.length; i++) {
            texts.push(i.toString());
        }
        
        return {
            texts: texts,
            attrDicts: null,
            objIndex: this._lastObjectIndex
        };
    }
    
    add () {
        this._editor.addRoad();
        this.showObjectList();
        
        let activeIndex = this._editor.roadManager.getActiveIndex();
        
        this._htmlManager.setActiveObject(activeIndex);
        this._lastObjectIndex = activeIndex;
    }
    
    remove () {
        this._editor.removeRoad();
        let activeIndex = this._editor.roadManager.getActiveIndex();
        this._lastObjectIndex = activeIndex;
        this.showObjectList();
        
        this._htmlManager.setActiveObject(activeIndex);
    }
    
    needsSubAdd () {
        return true;
    }
    
    updateObjectSelection () {
        let index = this._htmlManager.getActiveObject();
        this._lastObjectIndex = index;
        this._editor.roadManager.setActiveIndex(index);
        this._editor.roadDisplay.updateAll();
    }
    
    _getSubTools () {
        return {
          toolIndex: this._lastToolIndex,
          subTools: [
              {
                  text: "Add point",
                  attrDict: null
              },
              {
                  text: "Remove point",
                  attrDict: null
              },
              {
                  text: "Add joint point",
                  attrDict: null
              }
          ]
        };
    }
}

class SpawnpointSubManager extends SubManager {
    constructor (editor, htmlManager) {
        super(editor, htmlManager);
    }
    
    _getObjects () {
        var points = this._editor.spawnpointManager.objects;
        var texts = [];
        
        for (var i = 0; i < points.length; i++) {
            texts.push(i.toString());
        }
        
        return {
            texts: texts,
            attrDicts: null,
            objIndex: this._lastObjectIndex
        };
    }
    
    _getSubTools () {
        return {
          toolIndex: this._lastToolIndex,
          subTools: [
              {
                  text: "Add point",
                  attrDict: null
              },
              {
                  text: "Remove point",
                  attrDict: null
              }
          ]
        };
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        let activeIndex;
        
        switch (this._lastToolIndex) {
            case 0:
                this._editor.addSpawnpoint(gridX, gridY);
                this.showObjectList();
        
                activeIndex = this._editor.spawnpointManager.getActiveIndex();

                this._htmlManager.setActiveObject(activeIndex);
                this._lastObjectIndex = activeIndex;
                
                break;
            case 1:
                var intersect = this._editor.spawnpointDisplay.getIntersection({
                    x: rawX,
                    y: rawY
                });
                
                if (intersect !== -1) {
                    this._editor.spawnpointManager.removePoint(intersect);
                    this._editor.spawnpointDisplay.updateAll();

                    activeIndex = this._editor.spawnpointManager.getActiveIndex();
                    this._lastObjectIndex = activeIndex;
                    this.showObjectList();

                    this._htmlManager.setActiveObject(activeIndex);
                }
                
                break;
            default:
                break;
        }
    }
    
    needsSubAdd () {
        return false;
    }
    
    updateObjectSelection () {
        let index = this._htmlManager.getActiveObject();
        this._lastObjectIndex = index;
        this._editor.spawnpointManager.setActiveIndex(index);
        this._editor.spawnpointDisplay.updateAll();
    }
}

class ForestSubManager extends SubManager {
    constructor (editor, htmlManager) {
        super(editor, htmlManager);
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        switch (this._lastToolIndex) {
            case 0:
                this._editor.addForestPoint(gridX, gridY);
                this.showObjectList();
                break;
            case 1:
                var intersect = this._editor.forestDisplay.getIntersection({
                    x: rawX,
                    y: rawY
                });
                
                if (intersect.area === this._editor.forestManager.getActiveIndex()) {
                    this._editor.forestManager.removePoint(intersect.area, intersect.point);
                    this._editor.forestDisplay.updateAll();
                }
                
                break;
            default:
                break;
        }
    }
    
    _getObjects () {
        var forests = this._editor.forestManager.objects;
        var texts = [];
        
        for (var i = 0; i < forests.length; i++) {
            texts.push(i.toString());
        }
        
        return {
            texts: texts,
            attrDicts: null,
            objIndex: this._lastObjectIndex
        };
    }
    
    add () {
        this._editor.addForest();
        this.showObjectList();
        
        let activeIndex = this._editor.forestManager.getActiveIndex();
        
        this._htmlManager.setActiveObject(activeIndex);
        this._lastObjectIndex = activeIndex;
    }
    
    remove () {
        this._editor.removeForest();
        let activeIndex = this._editor.forestManager.getActiveIndex();
        this._lastObjectIndex = activeIndex;
        this.showObjectList();
        
        this._htmlManager.setActiveObject(activeIndex);
    }
    
    needsSubAdd () {
        return true;
    }
    
    updateObjectSelection () {
        let index = this._htmlManager.getActiveObject();
        this._lastObjectIndex = index;
        this._editor.forestManager.setActiveIndex(index);
        this._editor.forestDisplay.updateAll();
    }
    
    _getSubTools () {
        return {
          toolIndex: this._lastToolIndex,
          subTools: [
              {
                  text: "Add point",
                  attrDict: null
              },
              {
                  text: "Remove point",
                  attrDict: null
              }
          ]
        };
    }
}

class SettlementSubManager extends SubManager {
    constructor (editor, htmlManager) {
        super(editor, htmlManager);
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        switch (this._lastToolIndex) {
            case 0:
                this._editor.addSettlementPoint(gridX, gridY);
                this.showObjectList();
                break;
            case 1:
                var intersect = this._editor.settlementDisplay.getIntersection({
                    x: rawX,
                    y: rawY
                });
                
                if (intersect.area === this._editor.settlementManager.getActiveIndex()) {
                    this._editor.settlementManager.removePoint(intersect.area, intersect.point);
                    this._editor.settlementDisplay.updateAll();
                }
                
                break;
            default:
                break;
        }
    }
    
    _getObjects () {
        var forests = this._editor.settlementManager.objects;
        var texts = [];
        
        for (var i = 0; i < forests.length; i++) {
            texts.push(i.toString());
        }
        
        return {
            texts: texts,
            attrDicts: null,
            objIndex: this._lastObjectIndex
        };
    }
    
    add () {
        this._editor.addSettlement();
        this.showObjectList();
        
        let activeIndex = this._editor.settlementManager.getActiveIndex();
        
        this._htmlManager.setActiveObject(activeIndex);
        this._lastObjectIndex = activeIndex;
    }
    
    remove () {
        this._editor.removeSettlement();
        let activeIndex = this._editor.settlementManager.getActiveIndex();
        this._lastObjectIndex = activeIndex;
        this.showObjectList();
        
        this._htmlManager.setActiveObject(activeIndex);
    }
    
    needsSubAdd () {
        return true;
    }
    
    updateObjectSelection () {
        let index = this._htmlManager.getActiveObject();
        this._lastObjectIndex = index;
        this._editor.settlementManager.setActiveIndex(index);
        this._editor.settlementDisplay.updateAll();
    }
    
    _getSubTools () {
        return {
          toolIndex: this._lastToolIndex,
          subTools: [
              {
                  text: "Add point",
                  attrDict: null
              },
              {
                  text: "Remove point",
                  attrDict: null
              }
          ]
        };
    }
}