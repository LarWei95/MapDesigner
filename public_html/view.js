/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class HeightmapDisplay {
    constructor (heightmapManager, gridWidth, gridHeight) {
        this.heightmapManager = heightmapManager;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        
        this.initializeGrid();
    };
    
    initializeGrid () {
        var layer = new Konva.Layer();
        
        var grid = [];
        
        for (var height = 0; height < this.gridHeight; height++) {
            var heightArray = [];
            
            for (var width = 0; width < this.gridWidth; width++) {
                var obj = new Konva.Rect({
                    x: width,
                    y: height,
                    width: 1,
                    height: 1,
                    fill: "blue"
                    
                });
                heightArray.push(obj);
                layer.add(obj);
            }
            
            grid.push(heightArray);
        }
        
        this.gridLayer = layer;
        this.grid = grid;
    };
    
    fitTo (displayWidth, displayHeight) {
        var xPerUnit = displayWidth / this.gridWidth;
        var yPerUnit = displayHeight / this.gridHeight;
        
        for (var height = 0; height < this.gridHeight; height++) {
            for (var width = 0; width < this.gridWidth; width++) {
                var obj = this.grid[height][width];
                obj.x(width * xPerUnit);
                obj.y(height * yPerUnit);
                obj.width(xPerUnit);
                obj.height(yPerUnit);
            }
        }
    };
}

class Display extends Layerable {
    constructor (manager, activeColor, inactiveColor) {
        super();
        this._manager = manager;
        this._layer = new Konva.Layer();
        this._nodes = [];
        this.setOffsets (0, 0);
        this._activeColor = activeColor;
        this._inactiveColor = inactiveColor;
    }
    
    getIntersection (pos) {
        throw new Error("Not implemented.");
    }
    
    getLayer () {
        return this._layer;
    }
    
    setOffsets (xOffset, yOffset) {
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }
    
    updateAll (xOffset=null, yOffset=null) {
        this.clear();
        
        if (xOffset !== null) {
            this.xOffset = xOffset;
        }
        
        if (yOffset !== null) {
            this.yOffset = yOffset;
        }
        
        this.updateLayer(xOffset, yOffset);
    }
    
    updateLayer () {
        throw new Error("Not implemented.");
    }
    
    clear () {
        this._layer.destroyChildren();
        
        this._nodes = [];
    }
}

class LineDisplay extends Display {
    constructor (roadManager, activeColor, inactiveColor) {
        super(roadManager, activeColor, inactiveColor);
    }
    
    getIntersection (pos) {
        var intersectionObj = this._layer.getIntersection(pos);
        
        if (intersectionObj !== null) {
            var indx;
            
            var road = -1;
            var segment = -1;
            
            for (var i = 0; i < this._nodes.length; i++) {
                indx = this._nodes[i].indexOf(intersectionObj);
                
                if (indx !== -1) {
                    road = i;
                    segment = indx;
                    break;
                }
            }
            
            if (road !== -1) {
                if (intersectionObj.points !== undefined) {
                    var points = intersectionObj.points();
                    
                    var p1 = [points[0] - pos.x, 
                        points[1] - pos.y];
                    var p2 = [points[2] - pos.x, 
                        points[3] - pos.y];
                    
                    p1 = Math.sqrt((p1[0] * p1[0]) + (p1[1] * p1[1]));
                    p2 = Math.sqrt((p2[0] * p2[0]) + (p2[1] * p2[1]));
                    
                    if (p2 < p1) {
                        segment += 1;
                    }
                }
            }
            
            return {
                line: road,
                point: segment
            }
        } else {
            return {
              line: -1,
              point: -1
            };
        }
    }
    
    updateLayer () {
        var lines = this._getStageLines(this.xOffset, this.yOffset);
        var active = this._manager.activeIndex;
        var line;
        var color;
        var extraInfo;
        var points;
        var subNodes;
        var lastPoint;
        var currentPoint;
        var obj;
        
        for (var i = 0; i < lines.length; i++) {
            line = lines[i];
            color = (i === active) ? this._activeColor : this._inactiveColor;
            extraInfo = line.extraInfo;
            points = line.points;
            lastPoint = null;
            subNodes = [];
            
            if (points.length > 1) {
                for (var j = 0; j < points.length; j++) {
                    currentPoint = points[j];
                    
                    if (lastPoint === null) {
                        lastPoint = currentPoint;
                    } else {
                        obj = new Konva.Line({
                            points: [lastPoint[0], lastPoint[1], currentPoint[0], currentPoint[1]],
                            stroke: color,
                            strokeWidth: 10,
                            lineCap: "round",
                            lineJoin: "round"
                        });
                        
                        subNodes.push(obj);
                        this._layer.add(obj);
                        
                        lastPoint = currentPoint;
                    }
                    
                }
            } else if (points.length === 1) {
                currentPoint = points[0];
                
                obj = new Konva.Circle({
                    x: currentPoint[0],
                    y: currentPoint[1],
                    radius: 5,
                    fill: color
                });
                
                subNodes = [obj];
                this._layer.add(obj);
            }
            
            this._nodes.push(subNodes);
        }
        
        this.draw();
    }
    
    _getStageLines (xOffset, yOffset) {
        var stageLines = [];
        var stageLine;
        var line;
        
        var points;
        var extraInfos;
        
        var projection;
        var newX;
        var newY;
        
        // console.log(this._manager.objects);
        
        for (var i = 0; i < this._manager.objects.length; i++) {
            line = this._manager.objects[i];
            extraInfos = this._manager.extraInfos[i];
            
            points = [];
            
            for (var j = 0; j < line.length; j++) {
                newX = line[j][0];
                newY = line[j][1];
                
                projection = this._manager.grid.translateOffGrid(newX, newY);
                
                newX = xOffset + projection.x;
                newY = yOffset + projection.y;
                
                points.push([newX, newY]);
            }
            
            stageLine = {
                points: points,
                extraInfo: extraInfos
            };
            
            stageLines.push(stageLine);
        }
        
        return stageLines;
    }
}

class PointDisplay extends Display {
    constructor (spawnpointManager, activeColor, inactiveColor) {
        super(spawnpointManager, activeColor, inactiveColor);
    }
    
    getIntersection (pos) {
        var intersectionObj = this._layer.getIntersection(pos);
        
        if (intersectionObj !== null) {
            intersectionObj = this._nodes.indexOf(intersectionObj);
            return intersectionObj;
        } else {
            return -1;
        }
    }
    
    updateLayer () {
        var points = this._getPoints(this.xOffset, this.yOffset);
        var color = this._inactiveColor;
        var extraInfo;
        var point;
        var obj;
        
        for (var i = 0; i < points.length; i++) {
            point = points[i];
            extraInfo = point.extraInfo;
            point = point.point;
            
            obj = new Konva.Circle({
                x: point[0],
                y: point[1],
                radius: 3,
                fill: color
            });
            
            this._layer.add(obj);
            this._nodes.push(obj);
        }
        
        this.draw();
    }
    
    _getPoints (xOffset, yOffset) {
        var points = [];
        var point;
        var extraInfos;
        var projection;
        var newX;
        var newY;
        
        for (var i = 0; i < this._manager.objects.length; i++) {
            point = this._manager.objects[i];
            extraInfos = this._manager.extraInfos[i];
            
            if (point !== null) {
                newX = point[0];
                newY = point[1];
                
                projection = this._manager.grid.translateOffGrid(newX, newY);
                newX = xOffset + projection.x;
                newY = yOffset + projection.y;
                point = {
                    point: [newX, newY],
                    extraInfo: extraInfos
                };
                
                points.push(point);
            }
        }
        
        return points;
    }
}

class AreaDisplay extends Display {
    constructor (forestManager, activeColor, inactiveColor, fill) {
        super(forestManager, activeColor, inactiveColor);
        this._fill = fill;
    }
    
    getIntersection (pos) {
        var intersectionObj = this._layer.getIntersection(pos);
        
        if (intersectionObj !== null) {
            var area = this._nodes.indexOf(intersectionObj);
            var segment = -1;
            
            if (area !== -1) {
                var areaPoints = intersectionObj.points();
                var x;
                var y;
                
                var dist = null;
                var cDist;
                
                for (var i = 0; i < areaPoints.length; i+=2) {
                    x = areaPoints[i] - pos.x;
                    y = areaPoints[i+1] - pos.y;
                    
                    cDist = Math.sqrt((x * x) + (y * y));
                    
                    if (dist === null) {
                        dist = cDist;
                        segment = i / 2;
                    } else {
                        if (cDist < dist) {
                            dist = cDist;
                            segment = i / 2;
                        }
                    }
                }
            }
            
            return {
                area: area,
                point: segment
            }
        } else {
            return {
              area: -1,
              point: -1
            };
        }
    }
    
    updateLayer () {
        var areas = this._getStageAreas(this.xOffset, this.yOffset);
        var active = this._manager.activeIndex;
        var area;
        var color;
        var extraInfo;
        var points;
        var lastPoint;
        var obj;
        
        for (var i = 0; i < areas.length; i++) {
            area = areas[i];
            color = (i === active) ? this._activeColor : this._inactiveColor;
            extraInfo = area.extraInfo;
            points = area.points;
            lastPoint = null;
            
            if (points.length / 2 > 1) {
                obj = new Konva.Line({
                    points: points,
                    fill: "green",
                    stroke: color,
                    strokeWidth: 3,
                    closed: true
                });
                obj.fill(this._fill);
                
                this._layer.add(obj);
                this._nodes.push(obj);
            } else if (points.length === 2) {
                color = (i === active) ? "red" : "green";
                obj = new Konva.Circle({
                    x: points[0],
                    y: points[1],
                    radius: 5,
                    fill: color
                });
                
                this._layer.add(obj);
                this._nodes.push(obj);
            }
        }
        
        this.draw();
    }
    
    _getStageAreas (xOffset, yOffset) {
        var stageAreas = [];
        var stageArea;
        var area;
        
        var points;
        var extraInfos;
        
        var projection;
        var newX;
        var newY;
        
        for (var i = 0; i < this._manager.objects.length; i++) {
            area = this._manager.objects[i];
            extraInfos = this._manager.extraInfos[i];
            
            points = [];
            
            for (var j = 0; j < area.length; j++) {
                newX = area[j][0];
                newY = area[j][1];
                
                projection = this._manager.grid.translateOffGrid(newX, newY);
                
                newX = xOffset + projection.x;
                newY = yOffset + projection.y;
                
                points.push(newX);
                points.push(newY);
            }
            
            stageArea = {
                points: points,
                extraInfo: extraInfos
            };
            
            stageAreas.push(stageArea);
        }
        
        return stageAreas;
    }
}