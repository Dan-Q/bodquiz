$(function(){
  var pseudonyms = [
    ["Shakespeare's",    "Tolkein's",      "Golding's",       "Bodley's",
     "Hardy's",          "Huxley's",       "Blackwell's",     "Lewis's",
     "Locke's",          "Pullman's",      "Shelley's",       "Wilde's",
     "Printer's",        "Humphrey's",     "Librarian's",     "Cataloguer's",
     "Archivist's",      "Reader's",       "Student's",       "Santa's",
     "Celebrant's",      "Selden's",       "Radcliffe's",     "Lamson's",
     "Stationer's",      "Gutenberg's",    "Vernon's"],
    ["Friend",           "Buddy",          "Pal",             "Teacher",
     "Cataloguer",       "Archivist",      "Assistant",       "Bodyguard",
     "Champion",         "Promoter",       "Mentor",          "Admirer",
     "Legacy",           "Helper",         "Elf",             "Workshop",
     "Sister",           "Brother",        "Master",          "Servant",
     "Reindeer",         "Tutor",          "Depositor",       "Digitizer",
     "Biographer",       "Translator",     "Student",         "Secret Santa"]
  ]

  var fire = new Firebase("https://bodquiz.firebaseio.com/");
  var pseudonym = pseudonyms[0][Math.floor(Math.random()*pseudonyms[0].length)] + ' ' + pseudonyms[1][Math.floor(Math.random()*pseudonyms[1].length)];
  var scored_this_question = false;
  var auth;
  var time_left;

  fire.authAnonymously(function(error, authData) {
    if (error) {
      $('body').text("Something didn't work. " + error);
    } else {
      auth = authData;
      auth.identity = pseudonym;
      auth.score = { right: 0, wrong: 0, skipped: 0 }
      $('#identity input:text').val(pseudonym);
      fire.child('users').child(auth.uid).set(auth);
      $('body').addClass('js');

      fire.child('question').on('value', function(question){
        $('#post-click-instructions').text('');
        $('#question').html(question.child('0').val());
        for(var i = 1; i <= 4; i++){
          $('#play a[data-number='+i+']').html(question.child(i).val());
        }
        if(question.child('answer').exists()) {
          // we're in the answer phase
          $('body').removeClass('play').addClass('show-answer');
          $('#play a.selected').addClass('btn-danger'); // highlight current as "wrong"
          $('#play a[data-letter='+question.child('answer').val()+']').removeClass('btn-danger').addClass('btn-success'); // highlight correct as "right", overriding "wrong"
          if(!scored_this_question){
            // score this question
            if($('#play a.selected').is('.btn-danger')){
              // wrong answer
              auth.score.wrong++;
            } else if($('#play a.selected').is('.btn-success')){
              // right answer
              auth.score.right++;
            } else {
              // skipped
              auth.score.skipped++;
            }
            fire.child('users').child(auth.uid).child('score').set(auth.score);
            $('#score-right').text(auth.score.right);
            $('#score-wrong').text(auth.score.wrong);
            $('#score-skipped').text(auth.score.skipped);
            scored_this_question = true;
          }
          $('#post-click-instructions').html('The next question is coming up in <span class="time_left">' + time_left + '</span> seconds...');
        } else {
          // we're in the question phase
          scored_this_question = false;
          fire.child('users').child(auth.uid).child('answer').remove();
          $('#play a').removeClass('selected').removeClass('btn-danger').removeClass('btn-success');
          $('body').removeClass('show-answer').addClass('play');
        }
      });

      var deleteMyAuthOnDisconnect = fire.child('users').child(auth.uid);
      deleteMyAuthOnDisconnect.onDisconnect(function(){
        deleteMyAuthOnDisconnect.remove();
      });

      fire.child('users').on('child_removed', function(user){
        if(user.key() == auth.uid){
          // I've been forcibly disconnected
          auth = null;
          //fire.goOffline()
          $('body').text("You have been disconnected from the quiz game. Reload the page to connect again.")          
        }
      });

      fire.child('state').on('value', function(stateSnapshot){
        var state = stateSnapshot.val();
        if(state == 'pause' || state == 'advert'){
          $('body').addClass('paused');
        } else {
          $('body').removeClass('paused');
        }
      });

      fire.child('time_left').on('value', function(timeSnapshot){
        var new_time_left = timeSnapshot.val();
        if(new_time_left < 0) {
          time_left = (10 + new_time_left);
        } else {
          time_left = new_time_left;
        }
        $('.time_left').text(time_left);
      });

      $('#play a').on('click', function(){
        if($('body').hasClass('play')){
          if($(this).hasClass('selected')){
            // unselecting all
            $('#play a').removeClass('selected');
            $('#post-click-instructions').text('');
            fire.child('users').child(auth.uid).child('answer').remove();
          } else {
            $('#play a').removeClass('selected');
            $(this).addClass('selected');
            $('#post-click-instructions').html('Wait <span class="time_left">' + time_left + '</span> seconds for the answer to be announced...');
            fire.child('users').child(auth.uid).child('answer').set($(this).data('letter'));
          }
        }
        return false;
      });

      $('#identity input:text').on('change', function(){
        if($(this).val().trim().length > 2) {
          $(this).css('border-color', '');
          fire.child('users').child(auth.uid).child('identity').set($(this).val());
        } else {
          $(this).css('border-color', 'red');
        }
      });
    }
  });
});