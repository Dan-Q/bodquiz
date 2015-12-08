<?
  srand(date('Yz')); // <-- random seed, different for each day
  header('Content-Type: application/json');
  $lines = array_slice(file('questions.csv'), 1);
  shuffle($lines);
  $qs = array_map(function($line){
    return str_getcsv($line);
  }, $lines);
  echo json_encode($qs, JSON_PRETTY_PRINT);
?>