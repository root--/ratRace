//
//  Space mapping :
//  00 10 20 X
//  01 11 21
//  02 12 22
//  Y
//
// ID of "space" obj is "X,Y"
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

function Race(viewId, name) {

    this.viewId = viewId;
    this.name = name;
    this.speed = 120;

    // size
    this.unitSize = 9;

    // field
    this.xSize = 70;
    this.ySize = 70;

    // walls
    this.wallDencity = 10;
    this.spaces = this.xSize * this.ySize
    this.wallNum = +Math.round(( this.spaces ) / ( this.wallDencity + ( this.spaces / 1000 )));
    this.wallMaxLength = +Math.round((( this.xSize + this.ySize) / 20) + 1);
    this.wallMinLength = 2;

    // cheese
    this.chX = -1;
    this.chY = -1;

    // array to store the field objects
    this.pt = [];

    // actioin init
    this.init = function () {
        this.setStyles();
        this.fillMap();
        this.getWalls();
        this.createRat();
    }

    this.setStyles = function () {
        document.getElementById('main').style.width = this.unitSize * this.xSize;
        document.getElementById('main').style.height = this.unitSize * this.ySize;
    }

    // runtime
    this.run;
    this.runTime = function () {
        this.run = setInterval(this.name + '.findStep()', this.speed);
    }

    // race iteration step
    this.findStep = function () {
        if (!r.finish || !r2.finish) {
            r.move();
            r2.move();
        }
        else {
            clearInterval(this.run);
            console.log("Finish \n Rat 1:" + r.steps + " steps \n" + "Rat 2:" + r2.steps + " steps");
        }
    }

    //  point id formatter
    this.id = function (x, y) {
        return +x + "," + y;
    }
    // point id parser
    this.parseId = function (id) {
        return id.split(',');
    }

    // map creation
    this.fillMap = function () {
        for (var i = 0; i != this.xSize; i++) {
            for (var k = 0; k != this.ySize; k++) {
                this.createItem(k, i);
            }
        }
    }

    // buld the walls on map
    this.getWalls = function () {
        for (var i = 0; i < this.wallNum; i++) {
            // random point
            var x = +Math.round(Math.random() * (this.xSize - 1));
            var y = +Math.round(Math.random() * (this.ySize - 1));
            // direction to build the wall
            // 0- up ; 1- down ; 2-left ; 3- right
            var wallDir = Math.round(Math.random() * 3);
            // wall length
            this.wallLength = Math.round(Math.random() * (this.wallMaxLength - this.wallMinLength)) + this.wallMinLength;
            //console.log(wallLength);
            // build the wall
            for (var j = 0; j < this.wallLength; j++) {
                // map the wall brick
                var objId = this.id(x, y);
                this.pt[objId].change('wall', '');
                if (this.wallDir == 0 && y != 0)
                    y--; //up
                if (wallDir == 1 && y < (this.ySize - 1))
                    y++; //down
                if (wallDir == 2 && x != 0)
                    x--; //left
                if (wallDir == 3 && x < (this.xSize - 1))
                    x++; //right
            }
        }
    }

    // throw cheese and start the race !
    this.throwCheese = function (objId) {
        if (this.pt[objId].state !== "wall") {
            if (this.chX >= 0 && this.chY >= 0)
                this.pt[id(this.chX, this.chY)].change("default");
            this.pt[objId].change("cheese");
            var coord = this.parseId(objId);
            this.chX = coord[0];
            this.chY = coord[1];
        }
        this.runTime();
    }


// rat creation
    this.createRat = function () {
        window.r = new rat(this, 1, 100);
        r.born();

        window.r2 = new rat(this, 390, 410);
        r2.born();
    }

// objects class (points of space) factory
    this.createItem = function (x, y) {
        var objId = this.id(x, y);
        this.pt[objId] = new Point(this.viewId);
        this.pt[objId].x = x;
        this.pt[objId].y = y;
        this.pt[objId].id = objId;
        this.pt[objId].fill();
    }

}
