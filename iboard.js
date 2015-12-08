$(function(){
  $.getJSON('questions.php', function(questions){ 
    var fire = new Firebase("https://bodquiz.firebaseio.com/");

    /* Constants */
    var top_players_limit = 12;

    fire.child('scoreboard-html').on('value', function(snapshot){
      $('#high-scores').html(snapshot.val());
    });
  });
});
