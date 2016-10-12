function rat_1(race) {
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
            this.preX = +Math.round(Math.random() * (race.xSize - 1));
            this.preY = +Math.round(Math.random() * (race.ySize - 1));
            var check = this.checkMap(this.preX, this.preY);
            if (check) {
                this.x = this.preX;
                this.y = this.preY;
                this.curId = race.id(this.x, this.y);
                var birth = true;
            }
        }

        race.pt[this.curId].change('rat');
    }

    //  rat decision id formatter
    this.dId = function (x, y, dir) {
        return +x + " " + y + " " + dir;
    }

    this.checkMap = function (x, y) {
        var objId = race.id(x, y);
        var state = race.pt[objId].state;
        if (state != 'wall')
            return true;
        return false;
    }

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
        }
    }

    this.move = function () {
        var moving = false;
        this.look(this.x, this.y);
        this.dirPriority();
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
            var desId = this.dId(this.x, this.y, direction);
            //activate desicion counter;
            if (this.des[desId] === undefined)
                this.des[desId] = 0;
            if (direction == 0 && this.des[desId] < this.maxComeBack) { // direction and no max come back
                this.shift(this.x, this.y - 1); // shift rat
                if (mark)
                    this.des[desId]++; //increase decision counter
                move = true;
            }

            if (direction == 1 && this.des[desId] < this.maxComeBack) {
                this.shift(this.x, this.y + 1);
                if (mark)
                    this.des[desId]++;
                move = true;
            }

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
        race.pt[race.id(this.x, this.y)].change("track", "");
        race.pt[race.id(newX, newY)].change("rat", this.name);
        this.x = newX;
        this.y = newY;
        this.steps++;
    }

    this.look = function (x, y) {
        this.view = {0: false, 1: false, 2: false, 3: false};
        if (y > 0) { //look up;
            if (race.pt[race.id(x, y - 1)].state != "wall")
                this.view[0] = true;
        }
        if (y < (race.ySize - 1)) { // down
            if (race.pt[race.id(x, y + 1)].state != "wall")
                this.view[1] = true;
        }
        if (x > 0) { //left
            if (race.pt[race.id(x - 1, y)].state != "wall")
                this.view[2] = true;
        }
        if (x < (race.xSize - 1)) { //right
            if (race.pt[race.id(x + 1, y)].state != "wall")
                this.view[3] = true;
        }
    }

}
