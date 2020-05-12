The [Koschei Society](https://www.koscheisociety.org/) webchat service from the puzzle adventure game [The Emerald Flame](https://www.getpostcurious.com/emeraldflame).

#### dialog.json
This file determines the various routes the conversion with the bot will take.

An example of the schema / language:
```javascript
{
  // Values are groups of text responses representing a valid match to triggers a bot response 
  values: {
    $january: ['january', 'jan', '1', '01']
  },
  bot: {
    // How long to wait in seconds before and after each text response
    sleepBefore: 1,
    sleepAfter: 1,
    responses: {
      incorrect: 
    }
  },
  // The conversation events, beginning to end
  dialogue: [
    // Represents a single dialogue event
    {
      sleepBefore: 0,
      text: 'Hello! Please enter the month.',
      wait: {
        responses: [

        ]
      }
    }
  ]
}
```