$(function(){
  $.getJSON('questions.php', function(questions){ 
    var fire = new Firebase("https://bodquiz.firebaseio.com/");

    /* Constants */
    var top_players_limit = 12;
    var time_question_shown_for = 30;
    var time_answer_shown_for = 10;
    var start_question = 0;
    var sad_emoji = [ // emoji used to prefix or suffix berating statements
      '😐', '😩', '😨', '😢', '💤', '💩'
    ];
    var berating_statements = [ // shown when people answer a question but nobody gets it right
      "Nobody got that one right! Let's try something easier...",
      "Got the wrong answer? Don't worry about it: everybody else got the wrong answer too.",
      "I thought that one was pretty easy, but apparently it wasn't.",
      "Okay, I admit that question was a bit tough.",
      "If this was Who Wants To Be A Millionaire, you'd all be going home empty-handed right now.",
      "Time to hit the books! None of you got that one right!",
      "I thought you'd get that one, {name}! Never mind: you'll do better next time.",
      "You are the weakest link, {name}.",
      "Too hard? Let's try an easier one...",
      "Come on! You weren't even trying!"
    ];
    var happy_emoji = [ // emoji used to prefix or suffix congratulatory statements
      '😀', '😁', '😃', '😉', '😊', '👍', '❤️‍', '👑', '🎓', '🏆', '💡', '✴️'
    ];
    var congratulating_statements = [ // shown when at least one person gets the right answer
      "Well done, {name}! You're my star pupil.",
      "Please direct your praise to {name}, who got this one right.",
      "{name}: you get an A+ for that one.",
      "Was that a lucky guess, {name}? 🎲 Or did you know the right answer?",
      "You can be on my pub quiz team any day, {name}! 🍻",
      "Quick off the mark with the right answer, there, {name}! Nice one!",
      "Introducing {name}, whose specialist subject is... well, this!",
      "You're going on my 'good list', {name}. 🎅",
      "Some excellent answers, this round: but it's {name} to whom I tip my hat.",
      "You got the right answer, {name}!",
      "Well done, {name}! But let's see how you handle this next one...",
      "A round of applause for {name}, for getting that one right in double-quick time.",
      "You didn't seem confident when you pressed the button, {name}, but your instincts were right: well done!"
    ];

    var question;
    var current_question = start_question - 1;
    var time_left = (0 - time_answer_shown_for);
    var time_left_whole;
    var status;
    var state;
    var correct_answer;

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    };

    function shuffle(a,b,c,d){ // b, c, and d are placeholder to save from having to var them; a is the array; Fisher-Yates + optimisations
     c=a.length;while(c)b=Math.random()*(--c+1)|0,d=a[c],a[c]=a[b],a[b]=d
    }

    function update_scoreboard_then(func){
      fire.child('users').once('value', function(users){
        var users_and_scores = [];
        var result_html = '';
        users.forEach(function(user){
          var right = parseInt(user.child('score').child('right').val() || 0);
          var wrong = parseInt(user.child('score').child('wrong').val() || 0);
          users_and_scores.push([user.child('identity').val(), (right * 3) - wrong, right, wrong]);
        });
        users_and_scores.sort(function(a, b){
          return b[1] - a[1];
        });
        for(var i = 0; i < top_players_limit && i < users_and_scores.length; i++) {
          result_html += '<li><span class="identity">' + escapeHtml(users_and_scores[i][0]) + '</span><span class="right">' + users_and_scores[i][2] + '</span><span class="wrong">' + users_and_scores[i][3] + '</span></li>'
        }
        $('#high-scores').html(result_html);
        fire.child('scoreboard-html').set(result_html);
        if(func) func();
      });
    }

    function drawTimer(){
      if(time_left <= 0){
        $('#timer').html('');
      } else {
        var percent = time_left / time_question_shown_for * 100;
        var deg = 360/100*percent;
        $('#timer').html('<div class="timer-value"></div><div id="slice"'+(percent > 50?' class="gt50"':'')+'><div class="pie"></div>'+(percent > 50?'<div class="pie fill"></div>':'')+'</div>');
        $('#slice .pie').css('transform', 'rotate('+deg+'deg)');
        $('#timer .timer-value').text(time_left_whole);
      }
    }

    function showNextQuestion(){
      if(status != 'showing-question'){
        // clear last answers if stuck
        fire.child('users').once('value', function(users){
          users.forEach(function(user){
            fire.child('users').child(user.key()).child('answer').set(null);
          });
          // update scoreboard if showing
          if($('body').hasClass('scores')) update_scoreboard_then();
          // reset time and find next question
          time_left = time_question_shown_for;
          current_question = (current_question + 1) % questions.length;
          question = questions[current_question];
          var possible_answers = question.slice(1,5);
          shuffle(possible_answers);
          if(question[1] == possible_answers[0]) correct_answer = 'A';
          if(question[1] == possible_answers[1]) correct_answer = 'B';
          if(question[1] == possible_answers[2]) correct_answer = 'C';
          if(question[1] == possible_answers[3]) correct_answer = 'D';
          $('#question').html('<p class="q" style="display: none;">' + question[0] + '</p><ul class="as"><li class="a" data-letter="A" style="display: none;">' + possible_answers[0] + '</li><li class="a" data-letter="B" style="display: none;">' + possible_answers[1] + '</li><li class="a" data-letter="C" style="display: none;">' + possible_answers[2] + '</li><li class="a" data-letter="D" style="display: none;">' + possible_answers[3] + '</li></ul><div class="explanation" style="display: none;"></div>');
          $('#question .q').fadeIn('fast', function(){
            $($('#question .as .a')[0]).fadeIn('fast', function(){
              $($('#question .as .a')[1]).fadeIn('fast', function(){
                $($('#question .as .a')[2]).fadeIn('fast', function(){
                  $($('#question .as .a')[3]).fadeIn('fast');
                });
              });
            });
          });
          fire.child('question').set([
            question[0],
            possible_answers[0],
            possible_answers[1],
            possible_answers[2],
            possible_answers[3]
          ]);
        });
        status = 'showing-question';
      }
    }

    function showAnswer(){
      if(status != 'showing-answer'){
        // show right answer and push it out
        fire.child('question').child('answer').set(correct_answer);
        $("#question .as .a[data-letter='" + correct_answer + "']").addClass('correct');
        $("#question .as .a:not([data-letter='" + correct_answer + "'])").addClass('incorrect');
        // find who got it right and decide what to do with that information
        var right_answer_users = [];
        var wrong_answer_users = [];
        var num_answering_users = 0;
        fire.child('users').once('value', function(users){
          users.forEach(function(user){
            if(user.child('answer').exists()){
              num_answering_users++;
              if(user.child('answer').val() == correct_answer) {
                right_answer_users.push(user.child('identity').val());
              } else {
                wrong_answer_users.push(user.child('identity').val());
              }
            }
          });

          if(question[5] != ''){
            $('#question .explanation').html(question[5]).fadeIn();
          } else if(num_answering_users > 0) {
            if(right_answer_users.length == 0) {
              shuffle(wrong_answer_users);
              var wrong_answer_name = wrong_answer_users[Math.floor(Math.random()*wrong_answer_users.length)];
              var statement = berating_statements[Math.floor(Math.random()*berating_statements.length)].replace('{name}', escapeHtml(wrong_answer_name));
              if(Math.random() < 0.5) {
                if(Math.random() < 0.5) {
                  // add an emoji to the back
                  statement = statement + ' ' + sad_emoji[Math.floor(Math.random()*sad_emoji.length)];
                } else {
                  // add an emoji to the front
                  statement = sad_emoji[Math.floor(Math.random()*sad_emoji.length)] + ' ' + statement;
                }
              }
              $('#question .explanation').html(statement).fadeIn();
            } else {
              shuffle(right_answer_users);
              var right_answer_name = right_answer_users[Math.floor(Math.random()*right_answer_users.length)];
              var statement = congratulating_statements[Math.floor(Math.random()*congratulating_statements.length)].replace('{name}', escapeHtml(right_answer_name));
              if(Math.random() < 0.5) {
                if(Math.random() < 0.5) {
                  // add an emoji to the back
                  statement = statement + ' ' + happy_emoji[Math.floor(Math.random()*happy_emoji.length)];
                } else {
                  // add an emoji to the front
                  statement = happy_emoji[Math.floor(Math.random()*happy_emoji.length)] + ' ' + statement;
                }
              }
              $('#question .explanation').html(statement).fadeIn();
            }
          }
        });
        // update status so we don't hit this code again
        status = 'showing-answer';
      }
    }

    setInterval(function(){
      if(state == 'play'){
        time_left = time_left - 0.1;
        var new_time_left_whole = Math.ceil(time_left);
        if(time_left_whole != new_time_left_whole){
          time_left_whole = new_time_left_whole;
          fire.child('time_left').set(time_left_whole);
        }
        if(time_left < (0 - time_answer_shown_for)){
          showNextQuestion();
        } else if (time_left <= 0) {
          showAnswer();
        }
        drawTimer();
      } else if (state == 'advert') {
        // When advert shown, RESET clock on current phase
        if(time_left > 0) {
          time_left = time_question_shown_for;
        } else {
          time_left = 0;
        }
      }
    }, 100);

    fire.child('command').on('value', function(commandSnapshot){
      command = commandSnapshot.val();
      if(command == 'next-question'){
        status = '';
        showNextQuestion();
      }
      fire.child('command').set(null);
    });
    fire.child('state').on('value', function(stateSnapshot){
      state = stateSnapshot.val();
      if(state == 'advert'){
        $('body').addClass('advert');
      } else {
        $('body').removeClass('advert');
      }
    });
    fire.child('sidebar').on('value', function(sidebarSnapshot){
      sidebar = sidebarSnapshot.val();
      if(sidebar == 'scores'){
        update_scoreboard_then(function(){
          $('body').addClass('scores');
        });
      } else {
        $('body').removeClass('scores');
      }
    });

    showNextQuestion();
    drawTimer();
  });
});
