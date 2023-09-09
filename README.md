# FaBCM

## Description

A simple Flesh and Blood Collection Manager

## How to Start the Application

### Backend

To run the backend, follow these steps:

1. Navigate to the `backend` directory in your terminal.
2. Execute the following command:

    ```bash
    python backend/app.py
    ```

### Frontend

To open the frontend:

1. Locate the `index.html` file in the project folder.
2. Open `index.html` in your preferred web browser.

## CSV Upload Format

To upload your card collection, make sure your CSV file has the following headers:

- `collection`: The specific physical collection where the card is stored.
- `number`: The quantity of this particular card you own within the collection.
- `name`: The name of the card.
- `pitch`: The pitch value of the card.
- `card_type`: The classification of the card (e.g., Attack, Equipment, etc.).
- `language`: The language in which the card's text is printed.

The CSV should look something like this:

```csv
collection,number,name,pitch,card_type,language
HP1,2,Lightning Strike,1,Generic Attack,EN
Arcane Rising,5,Fervent Forerunner,3,Generic Defense,ES
```

## Deck Import

Import compatibility with fabrary.net.

Example:
```
Deck built with ❤️ at the FaBrary

Kano Blitz Deck

Class: Wizard
Hero: Kano
Weapons: Crucible of Aetherweave
Equipment: Mage Master Boots, Nullrune Gloves, Robe of Rapture, Talismanic Lens

(2) Aether Flare (red)
(2) Aether Spindle (red)
(2) Reverberate (red)
(2) Scalding Rain (red)
(2) Timekeeper's Whim (red)
(2) Voltic Bolt (red)
(2) Zap (red)
(2) Scalding Rain (yellow)
(2) Voltic Bolt (yellow)
(2) Zap (yellow)
(2) Aether Flare (blue)
(2) Emeritus Scolding (blue)
(1) Energy Potion (blue)
(1) Potion of Deja Vu (blue)
(2) Pry (blue)
(2) Reverberate (blue)
(2) Scalding Rain (blue)
(2) Timekeeper's Whim (blue)
(2) Voltic Bolt (blue)
(2) Whisper of the Oracle (blue)
(2) Zap (blue)


See the full deck @ https://fabrary.net/decks/01H12D3R0W4D1BFNQKRAE0F5VQ
```