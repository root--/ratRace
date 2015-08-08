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
var wallNum = +Math.round(( spaces ) / ( wallDencity + ( spaces/1000 )));
var wallMaxLength = +Math.round((( xSize + ySize)/20) + 1) ;
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

function setStyles(){
    document.getElementById('main').style.width = unitSize * xSize;
    document.getElementById('main').style.height = unitSize * ySize;
}


var run;
function runTime() {
    run = setInterval("findStep()", speed);
}

function findStep() {
    if (!r.finish || !r2.finish) {
        r.move();
        r2.move();
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
            pt[objId].change('wall','');
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
    window.r = new rat();
    r.born();

    window.r2 = new rat_emproved();
    r2.born();
    r2.name = "";
}

//rat v.2

function rat() {
    this.name = "";
    this.x = 0;
    this.y = 0;
    this.preX = 0;
    this.preY = 0;
    this.curId = 0;
    this.direction = 0;
    this.predDirection = 0;
    this.finish = 0;
    this.movements = 0;
    this.steps = 0;
    this.priDir1 = -1;// priority direction1
    this.priDir2 = -1;// priority direction2
    this.view = [];//current view around of the rat
    this.des = [];//all decisions of rat movement [x y dir]
    this.maxComeBack = 1;

    this.born = function () {
        while (!birth) {
            this.preX = +Math.round(Math.random() * (xSize - 1));
            this.preY = +Math.round(Math.random() * (ySize - 1));
            var check = this.checkMap(this.preX, this.preY);
            if (check) {
                this.x = this.preX;
                this.y = this.preY;
                this.curId = this.x + " " + this.y;
                var birth = true;
            }
        }

        pt[this.curId].change('rat');
    }

    this.checkMap = function (x, y) {
        var objId = id(x, y);
        var state = pt[objId].state;
        if (state != 'wall')
            return true;
        return false;
    }

    this.dirPriority = function () {

        var prepare_priDir1 = -1;
        var prepare_priDir2 = -1;
        // find up or down
        var xDif = chX - this.x;
        var yDif = chY - this.y;
        // vertical detection
        if (yDif > 0)
            prepare_priDir1 = 1;
        else if (yDif < 0)
            prepare_priDir1 = 0;
        // horizontal
        if (xDif > 0)
            prepare_priDir2 = 3;
        else if (xDif < 0)
            prepare_priDir2 = 2;

        // whos bigger  - vertical or horizontal 
        if (Math.abs(yDif) >= Math.abs(xDif)) {
            this.priDir1 = prepare_priDir1;
            this.priDir2 = prepare_priDir2;
        }
        else {
            this.priDir1 = prepare_priDir2;
            this.priDir2 = prepare_priDir1;
        }

        //priDir=this.priDir1;
        if (xDif == 0 && yDif == 0) {
            this.priDir1 = -1;
            this.priDir2 = -1;
        }
    }

    this.move = function () {
        var moving = false;
        this.look(this.x, this.y);
        var dirPri = this.dirPriority();
        this.movements++;
        // if no selected direction ( rat find the cheese )
        if (this.priDir1 < 0 && this.priDir2 < 0) {
            this.finish = true;
            return;
        }

        moving = this.tryShift(this.priDir1, 1);// first priority direction
        if (!moving) {
            moving = this.tryShift(this.priDir2, 1);
        }//second direction
        //try to change direction
        if (!moving) {
            for (var i = 0; i < 100; i++) {
                var randDir = Math.round(Math.random() * 3);
                if (moving = this.tryShift(randDir, 0))
                    break;// another direction
            }
        }
        if (!moving)
            this.finish = true;// die without cheese :(
    }

    this.tryShift = function (direction, mark) {
        if (mark === undefined)
            mark = false;

        var move = false;
        if (this.view[direction]) {
            var desId = dId(this.x, this.y, direction);
            //activate desicion counter;
            if (this.des[desId] === undefined)
                this.des[desId] = 0;
            if (direction == 0 && this.des[desId] < this.maxComeBack) { // direction and no max come back
                this.shift(this.x, this.y - 1); // shift rat
                if (mark)
                    this.des[desId]++; //increase decision counter
                move = true;
            }
            ;
            if (direction == 1 && this.des[desId] < this.maxComeBack) {
                this.shift(this.x, this.y + 1);
                if (mark)
                    this.des[desId]++;
                move = true;
            }
            ;
            if (direction == 2 && this.des[desId] < this.maxComeBack) {
                this.shift(this.x - 1, this.y);
                if (mark)
                    this.des[desId]++;
                move = true;
            }
            if (direction == 3 && this.des[desId] < this.maxComeBack) {
                this.shift(this.x + 1, this.y);
                if (mark)
                    this.des[desId]++;
                move = true;
            }
        }
        return move;
    }

    this.shift = function (newX, newY) {
        pt[id(this.x, this.y)].change("track", "");
        pt[id(newX, newY)].change("rat", this.name);
        this.x = newX;
        this.y = newY;
        this.steps++;
    }



    this.look = function (x, y) {
        this.view = {0: false, 1: false, 2: false, 3: false};
        if (y > 0) { //look up;
            if (pt[id(x, y - 1)].state != "wall")
                this.view[0] = true;
        }
        if (y < (ySize - 1)) { // down
            if (pt[id(x, y + 1)].state != "wall")
                this.view[1] = true;
        }
        if (x > 0) { //left
            if (pt[id(x - 1, y)].state != "wall")
                this.view[2] = true;
        }
        if (x < (xSize - 1)) { //right
            if (pt[id(x + 1, y)].state != "wall")
                this.view[3] = true;
        }
    }





}

function rat_emproved() {
    this.name = "";
    this.x = 0;
    this.y = 0;
    this.preX = 0;
    this.preY = 0;
    this.curId = 0;
    this.direction = 0;
    this.predDirection = 0;
    this.finish = 0;
    this.movements = 0;
    this.steps = 0;
    this.priDir1 = -1;// priority direction1
    this.priDir2 = -1;// priority direction2
    this.view = [];//current view around of the rat
    this.des = [];//all decisions of rat movement [x y dir]
    this.maxComeBack = 390;

    this.born = function () {
        while (!birth) {
            this.preX = +Math.round(Math.random() * (xSize - 1));
            this.preY = +Math.round(Math.random() * (ySize - 1));
            var check = this.checkMap(this.preX, this.preY);
            if (check) {
                this.x = this.preX;
                this.y = this.preY;
                this.curId = this.x + " " + this.y;
                var birth = true;
            }
        }

        pt[this.curId].change('rat');
    }

    this.checkMap = function (x, y) {
        var objId = id(x, y);
        var state = pt[objId].state;
        if (state != 'wall')
            return true;
        return false;
    }

    this.dirPriority = function () {

        var prepare_priDir1 = -1;
        var prepare_priDir2 = -1;
        // find up or down
        var xDif = chX - this.x;
        var yDif = chY - this.y;
        // vertical detection
        if (yDif > 0)
            prepare_priDir1 = 1;
        else if (yDif < 0)
            prepare_priDir1 = 0;
        // horizontal
        if (xDif > 0)
            prepare_priDir2 = 3;
        else if (xDif < 0)
            prepare_priDir2 = 2;

        // whos bigger  - vertical or horizontal 
        if (Math.abs(yDif) >= Math.abs(xDif)) {
            this.priDir1 = prepare_priDir1;
            this.priDir2 = prepare_priDir2;
        }
        else {
            this.priDir1 = prepare_priDir2;
            this.priDir2 = prepare_priDir1;
        }

        //priDir=this.priDir1;
        if (xDif == 0 && yDif == 0) {
            this.priDir1 = -1;
            this.priDir2 = -1;
        }
    }

    this.move = function () {
        var moving = false;
        this.look(this.x, this.y);
        var dirPri = this.dirPriority();
        this.movements++;
        // if no selected direction ( rat find the cheese )
        if (this.priDir1 < 0 && this.priDir2 < 0) {
            this.finish = true;
            return;
        }

        moving = this.tryShift(this.priDir1, 1);// first priority direction
        if (!moving) {
            moving = this.tryShift(this.priDir2, 1);
        }//second direction
        //try to change direction
        if (!moving) {
            for (var i = 0; i < 410; i++) {
                var randDir = Math.round(Math.random() * 3);
                if (moving = this.tryShift(randDir, 0))
                    break;// another direction
                //if (this.steps>0)this.steps--;
                this.steps++;
            }
        }
        if (!moving)
            this.finish = true;// die without cheese :(
    }

    this.tryShift = function (direction, mark) {
        if (mark === undefined)
            mark = false;

        var move = false;
        if (this.view[direction]) {
            var desId = dId(this.x, this.y, direction);
            //activate desicion counter;
            if (this.des[desId] === undefined)
                this.des[desId] = 0;
            if (direction == 0 && ((this.steps - this.des[desId] > this.maxComeBack) || this.des[desId] == 0)) { // direction and no max come back
                this.shift(this.x, this.y - 1); // shift rat
                if (mark)
                    this.des[desId] = this.steps; //increase decision counter
                move = true;
            }
            ;
            if (direction == 1 && ((this.steps - this.des[desId] > this.maxComeBack) || this.des[desId] == 0)) {
                this.shift(this.x, this.y + 1);
                if (mark)
                    this.des[desId] = this.steps;
                move = true;
            }
            ;
            if (direction == 2 && ((this.steps - this.des[desId] > this.maxComeBack) || this.des[desId] == 0)) {
                this.shift(this.x - 1, this.y);
                if (mark)
                    this.des[desId] = this.steps;
                move = true;
            }
            if (direction == 3 && ((this.steps - this.des[desId] > this.maxComeBack) || this.des[desId] == 0)) {
                this.shift(this.x + 1, this.y);
                if (mark)
                    this.des[desId] = this.steps;
                move = true;
            }
        }
        return move;
    }

    this.shift = function (newX, newY) {
        pt[id(this.x, this.y)].change("track", "");
        pt[id(newX, newY)].change("rat", this.name);
        this.x = newX;
        this.y = newY;
        this.steps++;
    }

    this.look = function (x, y) {
        this.view = {0: false, 1: false, 2: false, 3: false};
        if (y > 0) { //look up;
            if (pt[id(x, y - 1)].state != "wall")
                this.view[0] = true;
        }
        if (y < (ySize - 1)) { // down
            if (pt[id(x, y + 1)].state != "wall")
                this.view[1] = true;
        }
        if (x > 0) { //left
            if (pt[id(x - 1, y)].state != "wall")
                this.view[2] = true;
        }
        if (x < (xSize - 1)) { //right
            if (pt[id(x + 1, y)].state != "wall")
                this.view[3] = true;
        }
    }


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
    //return pt[objId]; 
}

function point() {
    var x = 0;
    var y = 0;
    var id = "";
    var state = "";
    this.fill = function () {
        document.write("<div id='" + this.id + "' class='' onclick='throwCheese(" + this.x + "," + this.y + ")'></div>");
    }

    this.change = function (state, name) {
        if (name === undefined)
            name = "";
        this.state = state;
        document.getElementById(this.id).className = state;
        document.getElementById(this.id).innerHTML = name;
    }

}
