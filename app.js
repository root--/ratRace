// short name for debug l();
var l = console.log;


var race = new Race('main','race');
race.init();

$('.default').click(function(){
    race.throwCheese(this.id);
})