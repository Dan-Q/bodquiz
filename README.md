# BodQuiz

A [Firebase](https://www.firebase.com/)-powered quiz game displayed on a 'big screen' and playable on
mobile phones/tablets at the [Bodleian Libraries](http://www.bodleian.ox.ac.uk/) Staff Christmas Party
in December 2015.

Conceived of less than one working day before the event, this was developed mostly as a proof-of-concept.
As a result, it's *very* rough around the edges, with hard-coded "magic numbers" and absolutely no
effort made to secure the Firebase database (it would have been pretty easy for a tech-savvy user to
change the scores of themselves or anybody else).
[A large video wall](https://content-eu.drive.amazonaws.com/cdproxy/templink/n4PXYAcnrDg7maV1YM1IhofGukPUi2ALKFQawBYOeNAE0Xnc3?viewBox=1623) showed the questions as well as play instructions (the latter was echoed on
smaller screens throughout the space); participants using their mobile devices could answer the
questions in exchange for points, which improved their rankings on a real-time live scoreboard.

## How to use

To use this tool yourself, you're likely to have to make significant code changes to fit it to
your own screens. As far as web browsers are concerned, we used Chrome in Kiosk Mode to fill
the screens nicely. You'll also need to set up a Firebase database of your own and put the
relevant keys into each .js file.

We used Bergamo Standard as our brand font: this has not been included in this repository.
We've also not included our logo (which is copyright Bodleian Libraries).

A small PHP script converts the questions from CSV format to JSON and shuffles them. They are
collected and interpreted by the 'server.html' page, which is run on the large screen - this
page is also responsible for timing each question, showing the right answer, and showing the
scoreboards. The 'index.html' page is used by participants on their mobile devices: we tested
it on a variety of Android and iOS devices, including at least one tablet, during the party.
'iboard.html' provides a secondary scoreboard (powered by output from 'server.html'). 
'iboard2.html' shows play instructions. Finally, 'control.html' is used on the "host's"
mobile phone to play and pause the game, show/hide a "holding page" and/or the scoreboard,
wipe the scoreboard, and skip questions if necessary.
