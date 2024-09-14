# AO Game Space Shooter

## Introduction
- This project is a web game participating in AO Games Jam 2024.
- Language: JavaScript, game framework: Phaser
- AOS Interaction SDK: @permaweb/aoconnect
- Project Github URL: https://github.com/VinceLin136/AOGames.git
- Arweave URL: [Click to play](https://arweave.net/DgBkw249jTYOINeOgFpPQyodJdGgANevmp8NKOdfuJ0) 

## Front End
- Development Language: javascript
- File Organization: 
    - entry point： index.html
    - js file: main.js
    - resource files: content/
- Game Scene Pages:
    - Login Scene:
        - Click the arconnect button to connect the wallet, and automatically jump to the play interface after logging in.
        - Users must log in and authorize using the arconnect wallet plug - in before starting the game.
    - Play Scene:
        - Display the abbreviated user address; display the user's highest score record; display the leaderboard of the highest scores of all players.
        - Click the play button to jump to the game interface and start the game.
    - Game Scene:
        - Display the abbreviated user address; display the user's score in this game; display the user's level in this game;
        - Players control the spaceship, fire bullets, destroy enemies, get scores, and the level increases as the score increases;
        - Enemies are randomly generated, including enemy spaceships that fire bullets, self - exploding spaceships that track players, and enemy spaceships that do not fire bullets;
        - The generation speed of enemies gradually increases as the player's level increases, and the game difficulty gradually increases;
        - If the player is hit by an enemy bullet or an enemy spaceship, the game ends and automatically jumps to the game over interface.
    - GameOver Scene:
        - If the player breaks the record, 'Congratulations' is displayed and the latest score is uploaded.
        - If the player does not break the record, the latest score is not uploaded.
        - Click the restart button to jump to the play interface.
- Main classes and functions:
    - Entities: 
        - Defines the logic of a set of game entities, including the player, enemy ships, enemy - tracking mines, backgrounds, etc.
    - SceneLogin: 
        - Defines the UI logic of the login interface and the interaction logic with the ArConnect wallet.
        - UI: Imports resource files such as button images, creates the login interface UI, and defines UI interactions and button logic.
        - ArConnect Wallet Interaction: Logs in to the wallet and authorizes the necessary permissions.
    - SceneGame: 
        - Defines the main page of the game, including the game - interface UI and the main game - control logic.
        - UI:
            - Imports resource files such as players, enemies, bullets, and explosion effects.
            - Creates animation effects for players and enemies as game entities.
        - Game Logic:
            - Player Control: Use the arrow keys or wsad keys to move the player character; use the space bar to fire bullets.
            - Enemy Generation Logic: Automatically adjust the generation speed and the movement speed of enemies according to the player's score and level.
            - Enemy Destruction Logic: When the player's bullet collides with the enemy, the enemy is destroyed, the player's score is increased, and the display is updated synchronously.
            - Player Destruction Logic: When the enemy's bullet or the enemy itself collides with the player, the player is destroyed, and the game ends.
    - SceneGameOver: 
        - Defines the page when the game ends, including the UI and the logic of interacting with the AO process.
        - UI: Includes buttons, backgrounds, and game over statements.
        - Interaction Functions:
            - When breaking a new record: Use the message function of aoconnect to send the latest record to the ao process.
            - When the restart button is pressed, it will be redirected to the Play page, showing the user's latest record and the latest leaderboard.

## Dapp Deployment: 
- Deployed on Arweave
- Use manifest.json to index various static files

## Data storage: 
- AOS process  
- Data Structure: Lua table
- Handlers:
    - "Action", "UpdateScore"
    - "Action", "QueryScore"
    - "Action", "QueryLeaderboard"

## Planned improved functions:
### Tokenization: 
- Create tokens for the dapp
- Players can obtain a certain amount of tokens when they score
- Provide a prize pool for players at the top of the leaderboard
### Event planning: 
- Weekly challenges. Provide a prize pool for participating players and provide grand prizes for the top ten players
### Deepen gameplay: 
- Add multiple game levels
- Add bosses
- Add randomly dropped enhancement items

### Mobile support: 
- Mobile support to enable playing games on mobile phones
