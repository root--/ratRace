//point object

function Point(viewId) {
    this.x = 0;
    this.y = 0;
    this.id = '';
    this.state = 'default';
    this.fill = function () {
        document.getElementById(viewId).insertAdjacentHTML(
            'beforeend',
            '<div id="' + this.id + '" class="' + this.state + '"></div>'
        );
    };

    this.change = function (state) {
        this.state = state;
        document.getElementById(this.id).className = state;
    };

}