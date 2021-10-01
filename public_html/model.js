/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global math */

class HeightmapManager {
    constructor (height, width) {
        this.height = height;
        this.width = width;
        this.heightmap = math.zeros(this.height, this.width);
    }
    
    getJSONable () {
        return {
            size: [this.width, this.height],
            heights: this.heightmap
        }
    }
    
    ofJSONable (datalist) {
        
    }
}

class ObjectManager {
    constructor (grid) {
        this.grid = grid;
        this.objects = [];
        this.extraInfos = [];
        
        this.activeIndex = 0;
        this.activeObject = this._getDefaultInitialObject();
        this.activeExtraInfos = this._getDefaultInitialExtraInfo();
        
        this.objects.push(this.activeObject);
        this.extraInfos.push(this.activeExtraInfos);
    }
    
    add () {
        this.objects.push(this._getDefaultInitialObject());
        this.extraInfos.push(this._getDefaultInitialExtraInfo());
        
        this.setActiveIndex(this.objects.length - 1);
    }
    
    remove () {
        if (this.objects.length > 1) {
            this.objects.splice(this.activeIndex, 1);
            
            var indx = (this.activeIndex - 1) % this.objects.length;
            
            if (indx < 0) {
                indx = 0;
            }
            
            this.setActiveIndex(indx);
        } else {
            this.clear();
        }
    }
    
    clear () {
        throw new Error("Not implemented.");
    }
    
    _getDefaultInitialObject () {
        throw new Error("Not implemented.");
    }
    
    _getDefaultInitialExtraInfo () {
        throw new Error("Not implemented.");
    }
    
    getActiveIndex () {
        return this.activeIndex;
    }
    
    setActiveIndex (index) {
        this.activeObject = this.objects[index];
        this.activeExtraInfos = this.extraInfos[index];
        this.activeIndex = index;
    }
    
    getJSONable () {
        var d = [];
        var subd;
        
        for (var i = 0; i < this.extraInfos.length; i++) {
            if (this.objects[i] !== null && this.objects[i] !== undefined) {
                subd = {
                    obj: this.objects[i],
                    extraInfo: this.extraInfos[i]
                };
                d.push(subd);
            }
        }
        
        return d;
    }
    
    ofJSONable (datalist) {
        var count = datalist.length;
        
        this.objects = [];
        this.extraInfos = [];
        
        if (count !== 0) {
            var cObj;
            var cEI;
            
            for (var i = 0; i < count; i++) {
                cObj = datalist[i].obj;
                cEI = datalist[i].extraInfo;
                
                if (cObj !== null && typeof cObj !== 'undefined') {
                    this.objects.push(cObj);
                    this.extraInfos.push(cEI);
                }
            }
            
            if (this.objects.length !== 0) {
                this.setActiveIndex(0);
            } else {
                this.add();
            }
        } else {
            this.add();
        }
    }
}

class PointManager extends ObjectManager {
    constructor (grid) {
        super(grid);
    }
    
    _getDefaultInitialObject () {
        return null;
    }
    
    _getDefaultInitialExtraInfo () {
        return {};
    }
    
    addPoint (x, y) {
        this.activeObject = [x, y];
        this.objects[this.activeIndex] = this.activeObject;
        this.add();
    }
    
    clear () {
        this.activeObject = this._getDefaultInitialObject();
        this.activeExtraInfos = this._getDefaultInitialExtraInfo();
        
        this.objects[this.activeIndex] = this.activeObject;
        this.extraInfos[this.activeIndex] = this.activeExtraInfos;
    }
    
    removePoint (pointIndex) {
        if (this.objects.length > 1) {
            this.objects.splice(pointIndex, 1);

            var indx = (this.activeIndex - 1) % this.objects.length;

            if (indx < 0) {
                indx = 0;
            }

            this.setActiveIndex(indx);
        } else {
            this.clear();
        }
    }
}

class PointArrayManager extends ObjectManager{
    constructor (grid) {
        super(grid);
    }
    
    _getDefaultInitialObject () {
        return [];
    }
    
    _getDefaultInitialExtraInfo () {
        return {};
    }
    
    addGridPoint (x, y) {
        this.activeObject.push([x, y]);
    }
    
    clear () {
        this.activeObject = this._getDefaultInitialObject();
        this.activeExtraInfos = this._getDefaultInitialExtraInfo();
        
        this.objects[this.activeIndex] = this.activeObject;
        this.extraInfos[this.activeIndex] = this.activeExtraInfos;
    }
    
    removePoint (objIndex, pointIndex) {
        this.objects[objIndex].splice(pointIndex, 1);
    }
}


class Grid {
    constructor (width, height, areaManager, scale=1) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.areaManager = areaManager;
    }
    
    getJSONable () {
        return {
            size: [this.width, this.height],
            scale: this.scale
        };
    }
    
    ofJSONable (datalist) {
        this.width = datalist.size[0];
        this.height = datalist.size[1];
        this.scale = datalist.scale;
    }
    
    inGrid (x, y) {
        return (x >= 0 && x <= this.width) && (y >= 0 && y <= this.height);
    }
    
    translateOntoGrid (areaX, areaY) {
        let areaWidth = this.areaManager.areaObject.width();
        let areaHeight = this.areaManager.areaObject.height();
        
        let x = this.width / areaWidth * areaX;
        let y = this.height / areaHeight * areaY;
        return {
            x: x,
            y: y
        };
    }
    
    translateOffGrid (gridX, gridY) {
        let areaWidth = this.areaManager.areaObject.width();
        let areaHeight = this.areaManager.areaObject.height();
        
        let x = areaWidth / this.width * gridX;
        let y = areaHeight / this.height * gridY;
        return {
            x: x,
            y: y
        };
    }
}