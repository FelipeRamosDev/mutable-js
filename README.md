# MutableJS
This works based on two things, mutables and bridges:
A mutable is like variable to store values, but mutables have a update method to change the value of it, so everytime that a mutable is updated, all data rendered in the DOM are updated as well.
A bridge works between the data input and the data output, so it can be used to treat the value by doing a calculation for example, or call data from an API, or just run a action for a button using the click event in a button.

# Documentation

## Setting MutableJS class
## Setting mutables

## Setting bridges

### Special HTML attributes
- `[mutable]` -> It's the name of the mutable. If you set this attribute, a mutable with the name provided will be created and initialized.
- `[mutable-type]` -> This attribute changes the way how mutable data will be treated. Currently, the available types are: **'string'**, **'number'** and **'button'**. In the next versions we will have: **'object'**, **'array'**, **'date'**, **'html'** and **'component'**. Please check following on this documentation, more about the mutable types
- `[mutable-value]` -> It's the first attribute that the mutable try to use when it's initializing, if it's empty or not declared it will try to use the value traditional value attribute and if nothing return it will use the innerHTML. But this depends on what type of HTML tag is and what type of mutable is but the priority order is basicly this: `mutable-value -> value -> innerHTML`
- `[mutable-listen]` -> You can set any event on the HTML tag to run the bridge and update the mutable and the event is triggered. The available events are the same as on HTML, for example, `<INPUT>` tag have keyup, change, etc. To set multiple events, separate them with **","**, for example: **"keyup,click,change,focus"**.
- `[mutable-dependencies]` -> You can set dependencies to a mutable, so if the dependency was updated, the mutable which have it's as a dependency will be updated as well.

### Mutable types
- `'string'` -> 
- `'number'` -> 
- `'string'` -> 
