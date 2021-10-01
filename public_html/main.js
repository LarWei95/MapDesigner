/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global Konva */
var editor;

function initialize(gridSize, heightmapSize) {
    editor = new Editor("container", gridSize, heightmapSize);
}

function exportMap () {
    var json = JSON.stringify(editor.getJSONable(), null, 3);
    // var json = JSON.stringify(editor.getJSONable());
    
    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:application/json;charset=utf-8,"+encodeURI(json);
    hiddenElement.target = "_blank";
    hiddenElement.download = "map.json";
    hiddenElement.click();
}

function importMap (json) {
    editor.loadJSONable(json);
}