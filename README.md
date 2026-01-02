# Clash Royale Game

## Overview
This project is a mobile browser game inspired by Clash Royale, designed to be played in portrait orientation. The game features a main menu, deck creation, a shop, ranking system, and a battle arena where players can compete against AI opponents.

## Project Structure
The project is organized into several directories and files:

- **index.html**: The main entry point for the game.
- **css/**: Contains stylesheets for different parts of the game.
  - **main.css**: General styles for the game.
  - **menu.css**: Styles for the main menu.
  - **game.css**: Styles for the game interface.
  - **deck.css**: Styles for the deck creation and card upgrading screen.
  - **shop.css**: Styles for the shop interface.
  - **ranking.css**: Styles for the ranking screen.
  
- **js/**: Contains JavaScript files for game logic and UI management.
  - **app.js**: Initializes the game and manages the overall state.
  - **game/**: Contains classes related to game mechanics.
    - **GameEngine.js**: Manages the game loop and interactions.
    - **Tower.js**: Defines the Tower class.
    - **Card.js**: Defines the Card class.
    - **Unit.js**: Defines the Unit class.
    - **Bot.js**: Defines the Bot class for AI opponents.
    - **ElixirManager.js**: Manages the elixir system.
  - **ui/**: Contains classes for managing different UI screens.
    - **MenuManager.js**: Manages the main menu.
    - **DeckManager.js**: Manages the deck creation and upgrading interface.
    - **ShopManager.js**: Manages the shop interface.
    - **RankingManager.js**: Manages the ranking screen.
  - **data/**: Contains data files for cards, leagues, and rewards.
    - **cards.js**: Data for available cards.
    - **leagues.js**: Data for different leagues.
    - **rewards.js**: Data for the rewards system.
  - **utils/**: Contains utility functions.
    - **LocalStorage.js**: Functions for managing local storage.
    - **ChestSystem.js**: Manages the chest system.
    
- **assets/**: Directory for game assets (currently empty).

## Setup Instructions
1. Clone the repository to your local machine.
2. Open `index.html` in a web browser to start the game.
3. Ensure you have a modern browser that supports HTML5 and JavaScript.

## Game Rules
- Players compete against AI opponents in a battle arena.
- Each player has a deck of cards that can be used to summon units and cast spells.
- Players earn trophies for winning battles and can upgrade their cards using points earned from chests.
- The game features a ranking system where players can see their position relative to others.

## Future Improvements
- Implement multiplayer functionality.
- Add more cards and units.
- Enhance AI behavior for more challenging gameplay.
- Improve graphics and animations.

## License
This project is open-source and available for modification and distribution. Please refer to the LICENSE file for more details.