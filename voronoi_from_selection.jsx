﻿//  voronoi_from_selection.jsx//  draws voronoi diagrams in illustrator//  using the javascript port from//  gorhill --> https://github.com/gorhill //  you can find the code here://  https://github.com/gorhill/Javascript-Voronoi//  under the same license as this one//  the illustrator usage can be found here://  https://github.com/fabiantheblind/Javascript-Voronoi//  the direct download is here: //  https://github.com/fabiantheblind/Javascript-Voronoi/zipball/master// Copyright (c)  2012 Fabian "fabiantheblind" Morón Zirfas// Permission is hereby granted, free of charge, to any person obtaining a copy of this// software and associated documentation files (the "Software"), to deal in the Software // without restriction, including without limitation the rights to use, copy, modify, // merge, publish, distribute, sublicense, and/or sell copies of the Software, and to // permit persons to whom the Software is furnished to do so, subject to the following // conditions:// The above copyright notice and this permission notice shall be included in all copies // or substantial portions of the Software.// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, // INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A // PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT // HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF // CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE // OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.// see also http://www.opensource.org/licenses/mit-license.php// you need the following file.// get it here: http://tinyurl.com/6oeffsc// if you don't got the package from github.com#include "rhill-voronoi-core.js"// these are some globals for setting optionsvar DEBUG = false;var COLOREDCELLS = false;var HSBCOLORSCELLS = false;// if not it takes random colorsvar STROKEDCELLS = false;var DRAWCELLS = true;var DRAWEDGES = true;var DRAWSITES = true;var ANGLEOFFSET = 180;var ANGLE =  60;var SATURATION = 45;var LIGHTNESS = 70;error0 = "Please open a document\nand add a text, a path, or compound path";error1 = "Please select something\na text, a path, or compound path";main(); // ------------ the main function. evrything happens in here ------------function main(){// check for prerequisites like doc and selectionif ( app.documents.length == 0 ) {  alert(error0);return;}if ( app.activeDocument.selection ==0 ) {  alert(error1);return;}// ------------ the new doc preset ------------var docPreset = new DocumentPreset;docPreset.units = RulerUnits.Pixels;docPreset.width = app.activeDocument.width;docPreset.height = app.activeDocument.height;// ------------ duplicate selection to new doc ------------var newItem;var docSelected = app.activeDocument.selection;var doc =  app.documents.addDocument("newFile",docPreset);// make the new doc// taken from the illustrator_scripting_reference_javascript_cs5.pdf// look for "Duplicating the active document"if ( docSelected.length > 0 ) {for ( i = 0; i < docSelected.length; i++ ) {    docSelected[i].selected = false;    newItem = docSelected[i].duplicate( doc,ElementPlacement.PLACEATEND );    }   } else {  docSelected.selected = false;  newItem = docSelected.parent.duplicate( doc,ElementPlacement.PLACEATEND );  } // ------------ set the ruler origin ------------var rulerPrefVal = app.preferences.getBooleanPreference("isRulerOriginTopLeft");app.preferences.setBooleanPreference ("isRulerOriginTopLeft",true);redraw();// ------------ now make outlines, release all groups and compound paths ------------if(doc.textFrames.length > 0){  create_outlines(doc);}if(doc.groupItems.length > 0){ungroup(doc.layers[0]);}if(doc.compoundPathItems.length > 0){release(doc);}// ------------ get the points and set the bounding box and calc the Voronoi data ------------var sites = get_pathPoints(doc);  // this is the basic example by gorhill  // var sites = [{x:300,y:300}, {x:100,y:100}, {x:200,y:500}, {x:250,y:450}, {x:500,y:150}];  // xl, xr means x left, x right  // yt, yb means y top, y bottom  var bbox = {xl:0, xr:doc.width, yt:0, yb:doc.height};  // pass an object which exhibits xl, xr, yt, yb properties. The bounding  // box will be used to connect unbound edges, and to close open cells    var voronoi = new Voronoi();    result = voronoi.compute(sites, bbox);// ------------ store the original paths in a layer  ------------// rename the orignal paths layer and close it    doc.layers[0].name = "original paths";    doc.layers[0].locked = true;    doc.layers[0].visible = false;// ------------ drawing cells / edges / sites ------------  if(DRAWCELLS)draw_cells (doc, result);  if(DRAWEDGES)draw_edges (doc, result);  var diameter = 3;// for the sites  if(DRAWSITES)draw_sites(doc, diameter, result); // ------------ restore the ruler preferences ------------app.preferences.setBooleanPreference ("isRulerOriginTopLeft",rulerPrefVal);};// ------------ end of main function  ------------    // ------------ Draw the cells ------------// this builds polygons for all cellsfunction draw_cells(doc, result){// var doc = d;// get the working doc  var black = new RGBColor();      black.red = 0;      black.green = 0;      black.blue = 0;var lyr = doc.layers.add(); // make a new layer    lyr.name = "cells";var cells = new Array(); // for holding Voronoi.cell obejctsif((COLOREDCELLS==true) && (HSBCOLORSCELLS==true)){  // build colors based on hsb circle  // goes one time 360 degrees around on hue  var angle =  ANGLE; var sat = SATURATION; var lghtnss = LIGHTNESS; var offset = ANGLEOFFSET;  var cols = colors_builder(result.cells.length, angle , sat, lghtnss, offset);}; // ------------ End of color creation ------------// loop the cellsfor(var i in result.cells){  // ------------ this is taken from gorhills example http://tinyurl.com/3vprrdh ------------  var cell = result.cells[i];// single it out  var halfedges = cell.halfedges;// get the list of halfedges in this object  var nHalfedges = halfedges.length;// the length  if (nHalfedges < 3) {continue;}// this is not enough for drawing a cell      var v = halfedges[0].getStartpoint();// get the first point      var pt = new Array(); // for holding the pathpoints          pt.push(new Array(v.x,v.y));// push the startpoint in      for (var iHalfedge=0; iHalfedge<nHalfedges; iHalfedge++) {            v = halfedges[iHalfedge].getEndpoint();// now just get the endpoint startpoint is the endpoint of the edge before            pt.push(new Array(v.x,v.y));// for the path        }// ------------ end of gorhills code ------------  var path = doc.pathItems.add(); // make a empty pathobject      path.setEntirePath(pt);// build the path      // this is for seeing whats going on      // style it a bit      if(COLOREDCELLS){        if(HSBCOLORSCELLS){          var color = cols[i];// we asume we have as many colors as cells        }else{          // or just make it randomly          var color = new RGBColor();              color.red = Math.random()*255;              color.green = Math.random()*255;              color.blue = Math.random()*255;        };// end of HSBCOLORSCELLS    }else{      // if not colored make them white      var color =  new RGBColor();          color.red = 255;          color.green = 255;          color.blue = 255;    }      path.stroked = true;// see below      path.strokeColor = black;// black only       path.filled = true;      path.fillColor = color;      path.closed = true;// should be closed just to be shure      redraw(); // so you can see what happens      if(!STROKEDCELLS){        // i know. It could be simpler         // but if the cells are white and there is no stroke        // you dont see whats going on ;)         path.stroked = false;         redraw();      }  } } // ------------ draw the sites cirlces only ------------function draw_sites(doc, diam, result){    var lyr = doc.layers.add(); // make a new layer    lyr.name = "sites";for(var l in result.cells){    var top = -result.cells[l].site.y; // needs to be negative     var left = result.cells[l].site.x;    var ell = doc.pathItems.ellipse( -top + diam/2, left -diam/2, diam, diam, true,true );    redraw();// so you can see    }} // ------------ draw the edges  ------------function draw_edges(doc, result){        var lyr = doc.layers.add(); // make a new layer    lyr.name = "edges";// loop thru the edgesfor(var i in result.edges){    var pt = new Array();// for the lines    // get the coordiantes of start and end point    var va = new Array(result.edges[i].va.x, result.edges[i].va.y);    var vb = new Array(result.edges[i].vb.x, result.edges[i].vb.y);    // into an array        pt.push(new Array(va[0],va[1]));        pt.push(new Array(vb[0],vb[1]));    // now build the path    var path = doc.pathItems.add();        path.setEntirePath(pt);        redraw();// so we can see waht happens  }} // ------------ get all the points and return a list of sites ------------ // ------------ how the Voronoi likes it ------------function get_pathPoints(lyr){  var list = new Array();  // all the pathitems  for(var j = 0; j < lyr.pathItems.length;j++){    var path = lyr.pathItems[j]; // isolate them    var points = path.pathPoints;  for (var i = 0; i < points.length; i++) {    // this could be done in one lines    // just to see whats going on line like    // list.push({x:points[i].anchor[0],y:points[i].anchor[1]})    var p = points[i];    var a = p.anchor;    var px = a[0];    var py = a[1];     list.push({x:px,y:py});  };}return list;}// ------------ make outlines from text ------------function create_outlines(doc){  // this can throw erros so catch themwhile(doc.textFrames.length > 0){  try{doc.textFrames[0].createOutline();    redraw();  }catch(e){    if(DEBUG)alert(e);    }  }  }// ------------ release compound Paths ------------// this is coming from here// http://forums.adobe.com/message/2140054function release(doc){// same here. this can throw erros so catch themwhile(doc.compoundPathItems.length > 0){  try{release_compoundPath(doc);}catch(e){if(DEBUG)alert(e);}  }}function release_compoundPath(doc){  redraw();var cp = doc.compoundPathItems[0];var p = cp.pathItems[0];  p.move(doc, ElementPlacement.PLACEATEND);}// ------------ color creation ------------function colors_builder(len, degrees, s, l ,offset){    var cols = new Array();   for(var j = len -1; j >=0 ; j--){             // var s = 66;    // var l = 55;    var hue = (offset + ((degrees/(len +1)) *j))%360;    var rgb = color_hsl2rgb(hue, s, l);    var colRGB  = new RGBColor();        colRGB.red = rgb.r;        colRGB.green = rgb.g;        colRGB.blue = rgb.b;        cols.push(colRGB);  }  return cols;} // ------------ this is some wired stuff i dont realy understand ------------// color converiosn found here// http://www.codingforums.com/showthread.php?t=11156function color_hsl2rgb(h, s, l) {  var m1, m2, hue;  var r, g, b  s /=100;  l /= 100;  if (s == 0)    r = g = b = (l * 255);  else {    if (l <= 0.5)      m2 = l * (s + 1);    else      m2 = l + s - l * s;    m1 = l * 2 - m2;    hue = h / 360;    r = color_HueToRgb(m1, m2, hue + 1/3);    g = color_HueToRgb(m1, m2, hue);    b = color_HueToRgb(m1, m2, hue - 1/3);  }  return {r: r, g: g, b: b};}function color_HueToRgb(m1, m2, hue) {  var v;  if (hue < 0)    hue += 1;  else if (hue > 1)    hue -= 1;  if (6 * hue < 1)    v = m1 + (m2 - m1) * hue * 6;  else if (2 * hue < 1)    v = m2;  else if (3 * hue < 2)    v = m1 + (m2 - m1) * (2/3 - hue) * 6;  else    v = m1;  return 255 * v;}// ------------ insepct properties and methods works with Adobe ExtendScript Toolkit------------// the functions below are// by Peter the Magnificant Kahrel// http://www.kahrel.plus.com/indesign/scriptui.html// look under "Displaying properties and methods"function  util_inspect_properties (f) {$.writeln (f.reflect.name);var props = f.reflect.properties;var array = [];for (var i = 0; i < props.length; i++)try {array.push (props[i].name + ": " + f[props[i].name])} catch (_){} array.sort ();$.writeln (array.join ("\r"));}function util_inspect_methods (m) {var props = m.reflect.methods.sort(); $.writeln ("\rMethods");for (var i = 0; i < props.length; i++)$.writeln (props[i].name);}// ------------ UNGROUP SCRIPT START ------------/** *  all group to ungroup v.1 - CS, CS2,CS3,CS4,CS5 * *  Author: Nokcha (netbluew@gmail.com) *   *  This Script  is Can be easily  ungrouping to all group items in the Document. * * * JS code (c) copyright: Jiwoong Song ( netbluew@nate.com ) * Copyright (c) 2009 netbluew@nate.com * All rights reserved. * * This code is derived from software contributed to or originating on wundes.com * * * Redistribution and use in source and binary forms, with or without * modification, are permitted provided that the following conditions * are met: * 1. Redistributions of source code must retain the above copyright *    notice, this list of conditions and the following disclaimer. * 2. Redistributions in binary form must reproduce the above copyright *    notice, this list of conditions and the following disclaimer in the *    documentation and/or other materials provided with the distribution. * 3. All advertising materials mentioning features or use of this software *    must display the following acknowledgement: *        This product includes software developed by netbluew@nate.com *        and its contributors. * 4. Neither the name of wundes.com nor the names of its *    contributors may be used to endorse or promote products derived *    from this software without specific prior written permission. * * THIS SOFTWARE IS PROVIDED BY WUNDES.COM AND CONTRIBUTORS * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE FOUNDATION OR CONTRIBUTORS * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE * POSSIBILITY OF SUCH DAMAGE. */function getChildAll(obj){  var childsArr = new Array();  for(var i=0;i<obj.pageItems.length;i++)childsArr.push(obj.pageItems[i]);  return childsArr;}function ungroup(obj){  var elements = getChildAll(obj);  if(elements.length<1){    obj.remove();    return;  }else{    for(var i=0;i<elements.length;i++)    {      try{        if(elements[i].parent.typename!="Layer")elements[i].moveBefore(obj);        if(elements[i].typename=="GroupItem")ungroup(elements[i]);      }catch(e){        if (DEBUG) {alert(e)};      }    }  }}// ------------ example script for ungroup ------------// var doc;// var itemKinds = new Array("pathItems","compoundPathItems","textFrames","placedItems","rasterItems","meshItems","pluginItems","graphItems","symbolItems","groupItems");// if(app.activeDocument)// {//  doc = app.activeDocument;//  if(doc.groupItems.length)for(var i=0;i<doc.layers.length;i++)ungroup(doc.layers[i]);// }// ------------ UNGROUP SCRIPT START ------------