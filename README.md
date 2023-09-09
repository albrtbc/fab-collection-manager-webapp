# FaBCM

## Description

Flesh and Blood Collection Manager

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
