$(function(){
  var fire = new Firebase("https://bodquiz.firebaseio.com/");
  fire.child('state').on('value', function(state){
    $('#state').text(state.val());
  });
  fire.child('sidebar').on('value', function(sidebar){
    $('#sidebar').text(sidebar.val());
  });

  $('a[data-state]').on('click', function(){
    fire.child('state').set($(this).data('state'));
    return false;
  });
  $('a[data-sidebar]').on('click', function(){
    fire.child('sidebar').set($(this).data('sidebar'));
    return false;
  });
  $('a[data-command]').on('click', function(){
    fire.child('command').set($(this).data('command'));
    return false;
  });
  $("a[data-operation='kill-all-users'").on('click', function(){
    fire.child('users').remove();
    return false;
  });

  $('body').removeClass('no-js').addClass('js');
});