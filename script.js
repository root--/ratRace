//
//  Space mapping :
//  00 10 20 X
//  01 11 21
//  02 12 22
//  Y
// 
// ID of "space" obj is "X Y"
//
// space obj's statuses :
// "default" - free space
// "wall" - wall
// "rat" - rat
// "cheese" - cheese
// css style of the div have same name as a status
//
//direction declaration of the movement :
// 0- up ; 1- down ; 3-left ; 4- right

var speed = 120;

// size
var unitSize = 9;

// field
var xSize = 70;
var ySize = 70;

var wallDencity = 10;
// walls
var spaces = xSize * ySize
var wallNum = +Math.round(( spaces ) / ( wallDencity + ( spaces / 1000 )));
var wallMaxLength = +Math.round((( xSize + ySize) / 20) + 1);
var wallMinLength = 2;
// cheese

var chX = -1;
var chY = -1;
// array to store the field objects
var pt = [];

// actioin init

function init() {
    setStyles();
    fillMap();
    getWalls();
    createRat();
}

function setStyles() {
    document.getElementById('main').style.width = unitSize * xSize;
    document.getElementById('main').style.height = unitSize * ySize;
}

var run;
function runTime() {
    run = setInterval("findStep()", speed);
}

function findStep() {
    if (!r.finish || !r2.finish || !r3.finish) {
        r.move();
        r2.move();
        r3.move();
    }
    else {
        clearInterval(run);
        console.log("Finish \n Rat 1:" + r.steps + " steps \n" + "Rat 2:" + r2.steps + " steps");
    }
}

// quick creation of point id
function id(x, y) {
    return +x + " " + y;
}
// quick creation of rat decision id
function dId(x, y, dir) {
    return +x + " " + y + " " + dir;
}

// map creation
function fillMap() {
    for (var i = 0; i != xSize; i++) {
        for (var k = 0; k != ySize; k++) {
            createItem(k, i);
        }
    }
}

function clearMap() {
    //erase objects
    var pt = {};
    document.getElementById('main').innerHTML = "";
}

function getWalls() {
    for (var i = 0; i < wallNum; i++) {
        // random point 
        var x = +Math.round(Math.random() * (xSize - 1));
        var y = +Math.round(Math.random() * (ySize - 1));
        // direction to build the wall
        // 0- up ; 1- down ; 2-left ; 3- right
        var wallDir = Math.round(Math.random() * 3);
        // wall length	
        var wallLength = Math.round(Math.random() * (wallMaxLength - wallMinLength)) + wallMinLength;
        //console.log(wallLength);
        // build the wall
        for (var j = 0; j < wallLength; j++) {
            // map the wall brick
            var objId = id(x, y);
            pt[objId].change('wall', '');
            if (wallDir == 0 && y != 0)
                y--; //up
            if (wallDir == 1 && y < (ySize - 1))
                y++; //down
            if (wallDir == 2 && x != 0)
                x--; //left
            if (wallDir == 3 && x < (xSize - 1))
                x++; //right
        }
    }
}

function throwCheese(x, y) {
    var objId = id(x, y);
    if (pt[objId].state !== "wall") {
        if (chX >= 0 && chY >= 0)
            pt[id(chX, chY)].change("default");
        pt[objId].change("cheese");
        chX = x;
        chY = y;
    }
    runTime();
}


// rat cretion
function createRat() {
    window.r = new rat_1();
    r.born();

    window.r2 = new rat_2();
    r2.born();

    window.r3 = new rat_2();
    r3.born();

    r2.name = "";
}

// objects class (points of space) factory
function createItem(x, y) {
    var objId = id(x, y);
    pt[objId] = new point();
    pt[objId].x = x;
    pt[objId].y = y;
    pt[objId].id = objId;
    pt[objId].fill();
    pt[objId].change("default");
}

//point object
function point() {
    var x = 0;
    var y = 0;
    var id = "";
    var state = "";
    this.fill = function () {
        document.write("<div id='" + this.id + "' class='' onclick='throwCheese(" + this.x + "," + this.y + ")'></div>");
    };

    this.change = function (state, name) {
        if (name === undefined)
            name = "";
        this.state = state;
        document.getElementById(this.id).className = state;
        document.getElementById(this.id).innerHTML = name;
    };

}
