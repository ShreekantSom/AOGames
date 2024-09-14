## Introduction
- AO Games Jam 2024 Participating Project: AO Games Space Shooter
- Registration Platform: hackquest.io @ Vince Lin
- Main Technology Stack:
    - Javascript
    - Phaser.js (a game development framework),
    - @permaweb/aoconnect
    - AOS
- Demo Site: https://arweave.net/DgBkw249jTYOINeOgFpPQyodJdGgANevmp8NKOdfuJ0

## Front End
- Development Language: The front end is written in javascript.
- File Organization: The entry point is index.html. The js files store all the game logic, and the content folder stores all the material files.

    - phaser.js: The resource files of the phaser game framework, including files such as backgrounds, buttons, and sounds.
    - game.js: Instantiates the game object using the phaser framework.
    - Entities.js: Defines the logic of a set of game entities, including the player, enemy ships, enemy - tracking mines, backgrounds, etc.
    - SceneLogin.js: Defines the UI logic of the login interface and the interaction logic with the ArConnect wallet.
        - UI: Imports resource files such as button images, creates the login interface UI, and defines UI interactions and button logic.
        - ArConnect Wallet Interaction: Logs in to the wallet and authorizes the necessary permissions.
    - SceneGame.js: Defines the main page of the game, including the game - interface UI and the main game - control logic.
        - UI:
            - Imports resource files such as players, enemies, bullets, and explosion effects.
            - Creates animation effects for players and enemies as game entities.
        - Game Logic:
            - Player Control: Use the arrow keys or wsad keys to move the player character; use the space bar to fire bullets.
            - Enemy Generation Logic: Automatically adjust the generation speed and the movement speed of enemies according to the player's score and level.
            - Enemy Destruction Logic: When the player's bullet collides with the enemy, the enemy is destroyed, the player's score is increased, and the display is updated synchronously.
            - Player Destruction Logic: When the enemy's bullet or the enemy itself collides with the player, the player is destroyed, and the game ends.
    - SceneGameOver.js: Defines the page when the game ends, including the UI and the logic of interacting with the AO process.
        - UI: Includes buttons, backgrounds, and end - of - game statements.
        - Interaction Functions:
            - When breaking a new record: Use the message function of aoconnect to send the latest record to the ao process.
            - When the restart button is pressed, it will be redirected to the Play page, showing the user's latest record and the latest leaderboard.

## Back End
- Code Hosting: Arweave

- User Data: AOS Process.
    - Data Structure: Lua table
    - Handler:
        - "Action", "UpdateScore"
        - "Action", "QueryScore"
        - "Action", "QueryLeaderboard"

## Declaration
This game is based on a github project and reprogrammed by Vince.