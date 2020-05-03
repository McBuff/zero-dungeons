# Zero-Dungeons
Zero-dungeons is a set of tools used to play DnD.
- Diceroller

## Installation / Running example
Installation: `git clone https://github.com/McBuff/zero-dungeons.git`
run a nodejs server in root folder: `node index.js`
This will start a server that can be reached through localhost:8080  (default port).
Port can be reassigned by changing the PORT global variable in index.js

When you open the page in your browser, it should display. 'index.js, this is merely a placeholder for an eventual menu.
You can open the diceroller by navigating to:

    http://localhost:8080/diceroller/


## Diceroller
### Todo:
- Seperate dicelogs -> room
- Get a database going
- Show room identifier in room
- join room through link
- Better PW implementation ( timed retries  + encryption + salting  + anything else required these days).
