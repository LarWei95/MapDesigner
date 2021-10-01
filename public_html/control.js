/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class Editor {
    constructor (containerName, gridSize, heightmapSize) {
        this.container = document.getElementById(containerName);
        this.stage = this._createStage(containerName);
        this._fullInit(gridSize, heightmapSize);
    }
    
    getJSONable () {
        var d = {
            version: 1,
            type: "beamngmap",
            roads: this.roadManager.getJSONable(),
            spawnpoints: this.spawnpointManager.getJSONable(),
            heightmap: this.heightmapManager.getJSONable(),
            grid: this.grid.getJSONable(),
            settlements: this.settlementManager.getJSONable(),
            forests: this.forestManager.getJSONable()
        };
        
        return d;
    }
    
    loadJSONable (jsonable) {
        jsonable = JSON.parse(jsonable);
        
        var roads = jsonable.roads;
        var spawnpoints = jsonable.spawnpoints;
        var heightmap = jsonable.heightmap;
        var grid = jsonable.grid;
        var settlements = jsonable.settlements;
        var forests = jsonable.forests;
        
        this.roadManager.ofJSONable(roads);
        this.spawnpointManager.ofJSONable(spawnpoints);
        this.heightmapManager.ofJSONable(heightmap);
        this.grid.ofJSONable(grid);
        this.settlementManager.ofJSONable(settlements);
        this.forestManager.ofJSONable(forests);
        
        this.roadDisplay.updateAll(
                this.areaManager.areaObject.x(),
                this.areaManager.areaObject.y()
        );
        this.spawnpointDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
        this.forestDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
        this.settlementDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    _createStage (containerName) {
        var stage = new Konva.Stage({
           container: containerName,
           width: 1400,
           height: 700
        });
        
        const thisRef = this;
        
        
        stage.on("mousedown", function(){
            thisRef.issueAreaPress();
        });
        
        return stage;
    }
    
    _fullInit (gridSize, heightmapSize) {
        this._initializeManagers(gridSize, heightmapSize);
        this._initializeDisplays();
        this._initializeToolMenu();
        
        this._addDisplayLayersToStage();
    }
    
    _initializeManagers (gridSize, heightmapSize) {
        // 1024
        var hmX = heightmapSize;
        var hmY = heightmapSize;
        
        // 8192
        var gridX = gridSize;
        var gridY = gridSize;
        
        var x = 100;
        var y = 0;
        var width = this.stage.width() - x;
        var height = this.stage.height() - y;
        
        width = Math.min(width, height);
        
        this.areaManager = new AreaManager(this, x, y, width, width);
        this.heightmapManager = new HeightmapManager(hmY, hmX);
        this.grid = new Grid(gridX, gridY, this.areaManager);
        
        this.roadManager = new PointArrayManager(this.grid);
        this.forestManager = new PointArrayManager(this.grid);
        this.spawnpointManager = new PointManager(this.grid);
        this.settlementManager = new PointArrayManager(this.grid);
    }
    
    _initializeDisplays() {
        this.roadDisplay = new LineDisplay(this.roadManager, 
                "red", 
                "black");
        this.forestDisplay = new AreaDisplay(this.forestManager,
                "red",
                null,
                "rgba(0, 255, 0, 0.175)");
        this.spawnpointDisplay = new PointDisplay(this.spawnpointManager,
                "yellow",
                "yellow");
        this.settlementDisplay = new AreaDisplay (this.settlementManager,
                "red",
                null,
                "rgba(0, 0, 255, 0.175)");
    }
    
    _initializeToolMenu () {
        this.htmlManager = new HTMLManager(this);
    }
    
    _addDisplayLayersToStage () {
        this.stage.add(this.areaManager.getLayer());
        this.stage.add(this.settlementDisplay.getLayer());
        this.stage.add(this.forestDisplay.getLayer());
        
        this.stage.add(this.roadDisplay.getLayer());
        this.stage.add(this.spawnpointDisplay.getLayer());
    }
    
    issueAreaPress () {
        let mousePos = this.stage.getPointerPosition();
        
        let rawX = mousePos.x;
        let rawY = mousePos.y;
        
        let areaX = rawX - this.areaManager.areaObject.x();
        let areaY = rawY - this.areaManager.areaObject.y();
        
        mousePos = this.grid.translateOntoGrid(areaX, areaY);
        
        let gridX = mousePos.x;
        let gridY = mousePos.y;
        
        if (this.grid.inGrid(gridX, gridY)) {
            this.htmlManager.issueAreaPress(rawX, rawY, areaX, areaY, gridX, gridY);
        }
    }
    
    addRoadPoint (x, y) {
        this.roadManager.addGridPoint(x, y);
        this.roadDisplay.updateAll(
                this.areaManager.areaObject.x(),
                this.areaManager.areaObject.y()
        );
    }
    
    addRoad () {
        this.roadManager.add();
        this.roadDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    removeRoad () {
        this.roadManager.remove();
        this.roadDisplay.updateAll();
    }
    
    addSpawnpoint (gridX, gridY) {
        this.spawnpointManager.addPoint(gridX, gridY);
        this.spawnpointDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    addForestPoint (x, y) {
        this.forestManager.addGridPoint(x, y);
        this.forestDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    addForest () {
        this.forestManager.add();
        this.forestDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    removeForest() {
        this.forestManager.remove();
        this.forestDisplay.updateAll();
    }
    
    addSettlementPoint (x, y) {
        this.settlementManager.addGridPoint(x, y);
        this.settlementDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    addSettlement () {
        this.settlementManager.add();
        this.settlementDisplay.updateAll(
            this.areaManager.areaObject.x(),
            this.areaManager.areaObject.y()
        );
    }
    
    removeSettlement () {
        this.settlementManager.remove();
        this.settlementDisplay.updateAll();
    }
}

class AreaManager extends Layerable {
    constructor (editor, x, y, width, height) {
        super();
        this.editor = editor;
        this.layer = this._initializeAreaLayer(x, y, width, height);
    }
    
    getLayer () {
        return this.layer;
    }
    
    _initializeAreaLayer (x, y, width, height) {
        this.areaObject = new Konva.Rect({
            x: x,
            y: y,
            width : width,
            height: height,
            fill: "grey"
        });
        
        var layer = new Konva.Layer();
        layer.add(this.areaObject);
        return layer;
    }
}

class HTMLManager {
    constructor (editor) {
        this._editor = editor;
        this.subManagers = [
            new EmptySubManager(editor, this),
            new RoadSubManager(editor, this),
            new ForestSubManager(editor, this),
            new SettlementSubManager(editor, this),
            new SpawnpointSubManager(editor, this)
        ];
        this.initialize();
    }
    
    initialize () {
        this.toolMenu = new HTMLMainToolMenu("main-tools-buttonbox", this);
        const thisRef = this;
        
        this.subAddMenu = new AddSubHTMLMenu("add-sub-buttonbox",
            function () {
                thisRef.add();
            },
            function () {
                thisRef.remove();
            });
            
        this.objectMenu = new HTMLObjectSelectionMenu("objects-listbox", this);
        this.subToolMenu = new SingleSelectHTMLMenu("subtools-buttonbox", function () {
           thisRef.updateSubToolSelection(); 
        });
        
        this.updateMainTool();
    }
    
    getActiveTool () {
        return this.toolMenu.getIndex();
    }
    
    getActiveObject () {
        return this.objectMenu.getIndex();
    }
    
    getActiveSubTool () {
        return this.subToolMenu.getIndex();
    }
    
    setActiveObject (index) {
        this.objectMenu.setIndex(index);
    }
    
    add () {
        this.subManagers[this.getActiveTool()].add();
    }
    
    issueAreaPress (rawX, rawY, areaX, areaY, gridX, gridY) {
        let activeIndex = this.getActiveTool();
        
        this.subManagers[activeIndex].issueAreaPress(rawX, rawY, areaX, areaY, gridX, gridY);
    }
    
    remove () {
        this.subManagers[this.getActiveTool()].remove();
    }
    
    updateMainTool() {
        let toolIndex = this.getActiveTool();
        this.subAddMenu.hide();
        
        this.subManagers[toolIndex].showObjectList();
        this.subManagers[toolIndex].showSubTools();
        
        if (this.subManagers[toolIndex].needsSubAdd()) {
            this.subAddMenu.show();
        }
    }
    
    updateObjectSelection () {
        this.subManagers[this.getActiveTool()].updateObjectSelection();
    }
    
    updateSubToolSelection () {
        this.subManagers[this.getActiveTool()].updateToolSelection();
    }
}



