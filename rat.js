function rat(race, memorySize, persistance) {
    this.name = '';
    this.x = 0;
    this.y = 0;
    this.preX = 0;
    this.preY = 0;
    this.curId = 0;
    this.finish = 0;
    this.die = 0;
    this.movements = 0;
    this.steps = 0;
    this.priDir1 = -1;// priority direction1
    this.priDir2 = -1;// priority direction2
    this.view = {};//current view around of the rat
    this.des = [];//all decisions of rat movement [x y dir]
    this.memorySize = 120;
    this.persistance = 200;

    // born of the rat
    this.born = function () {
        while (!birth) {
            this.preX = +Math.round(Math.random() * (race.xSize - 1));
            this.preY = +Math.round(Math.random() * (race.ySize - 1));
            if (this.checkMap(this.preX, this.preY)) {
                this.x = this.preX;
                this.y = this.preY;
                this.curId = race.id(this.x, this.y);
                var birth = true;
            }
        }
        race.pt[this.curId].change('rat');
    }

    // iterate each step
    this.move = function () {
        if (this.finish || this.die ) {
            return;
        }
        this.look(this.x, this.y);
        this.dirPriority();
        this.movements++;
        // rat find the cheese !

        // // if no selected direction ( rat find the cheese )
        if (this.priDir1 < 0 && this.priDir2 < 0) {
            this.finish = true;
            return;
        }

        // first priority direction
        var moving = this.tryShift(this.priDir1, true);
        // try to move another priority direction
        if (!moving) {
            moving = this.tryShift(this.priDir2, true);
        }
        //try to change direction and move
        if (!moving) {
            for (var i = 0; i < this.persistance; i++) {
                // new , non-stamped ,random decision is a key concept of creative thinking
                var randDir = Math.round(Math.random() * 3);
                if (moving = this.tryShift(randDir, false))
                    break;// another direction
            }
        }
        if (!moving) {
            this.die = true;// die without cheese :(
            race.pt[race.id(this.x, this.y)].change('rat_died');
            l(this.name+' died on:'+this.steps);
        }
    }

    //  rat decision id formatter
    this.dId = function (x, y, dir) {
        return +x + ' ' + y + ' ' + dir;
    }

    //checking the map point for move thru it
    this.checkMap = function (x, y) {
        var objId = race.id(x, y);
        var state = race.pt[objId].state;
        if (state != 'wall')
            return true;
        return false;
    }

    //compute direction for move
    this.dirPriority = function () {
        var prepare_priDir1 = -1;
        var prepare_priDir2 = -1;
        // find up or down
        var xDif = race.chX - this.x;
        var yDif = race.chY - this.y;
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

        // wee got it !
        if (xDif == 0 && yDif == 0) {
            this.priDir1 = -1;
            this.priDir2 = -1;
            this.finish = true;
            l(this.name+' finished on:'+this.steps);
        }
    }

    // try to shift to priority direction
    this.tryShift = function (direction, directMovement) {
        var move = false;
        if (this.view[direction]) {
            var desId = this.dId(this.x, this.y, direction);
            //  activate decision counter;
            if (this.des[desId] === undefined)
                this.des[desId] = 0;

            // is it totally wrong way or we can try to move on it ?
            var tryThatWay = this.tryThatWay(desId);
            if (!tryThatWay) {
                return false;
            }
            // shift rat in selected direction
            switch (direction) {
                case 0:
                    this.shift(this.x, this.y - 1);//up
                    break;
                case 1:
                    this.shift(this.x, this.y + 1);//down
                    break;
                case 2:
                    this.shift(this.x - 1, this.y);//left
                    break;
                case 3:
                    this.shift(this.x + 1, this.y);//right
                    break;
            }
            if (directMovement)
                this.des[desId] = this.steps; //save step number of decision
            move = true;
        }
        return move;
    }

    // try to move that way ( direction from current the point )
    // can be override in different instances of rat .
    // here - move that way if previous decision out of rat limit size or it is a new way
    this.tryThatWay = function (desId) {
        return ((this.steps - this.des[desId] > this.memorySize) || this.des[desId] == 0);
    }

    // shifting to next point
    this.shift = function (newX, newY) {
        race.pt[race.id(this.x, this.y)].change('track');
        race.pt[race.id(newX, newY)].change('rat');
        this.x = newX;
        this.y = newY;
        this.steps++;
    }

    // looking around for walls and create this.view image of space around
    // check map border and walls on all directions
    this.look = function (x, y) {
        this.view = {0: false, 1: false, 2: false, 3: false};
        if (y > 0) { //look up;
            if (race.pt[race.id(x, y - 1)].state != 'wall')
                this.view[0] = true;
        }
        if (y < (race.ySize - 1)) { // down
            if (race.pt[race.id(x, y + 1)].state != 'wall')
                this.view[1] = true;
        }
        if (x > 0) { //left
            if (race.pt[race.id(x - 1, y)].state != 'wall')
                this.view[2] = true;
        }
        if (x < (race.xSize - 1)) { //right
            if (race.pt[race.id(x + 1, y)].state != 'wall')
                this.view[3] = true;
        }
    }
}
