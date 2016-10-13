// short name for debug l();
var l = console.log;

// create racing object.
// id of div view and instance name.
var race = new Race('main','race');
race.init();

// handle of cheese throw event
// jquery using only here and can be removed
$('.default').click(function(){
    race.throwCheese(this.id);
})