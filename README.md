# MutableJS
This works based on two things, mutables and bridges:
A mutable is like variable to store values, but mutables have a update method to change the value of it, so everytime that a mutable is updated, all data rendered in the DOM are updated as well.
A bridge works between the data input and the data output, so it can be used to treat the value by doing a calculation for example, or call data from an API, or just run a action for a button using the click event in a button.

# Documentation

## Special HTML tags
- `[mutable]` -> The mutable name, if you want to run a bridge in the middle in order to treat the data or get some data, use the same name and store inte the mutables/bridges.js
- `[mutable-type]` -> It can be 'string' | 'number' | 'object' | 'array' | 'button | 'html' | 'component'. The default one is 'string' but I'll explain more about them below.
- `[mutable-listen]` -> It can be any event appliable for the current tag. For example 'click' | 'keyup'. Or it can be multiples events as well like 'keyup,change,focus'.
- `[mutable-dependencies]` -> Here you can add the dependencies that you wants to be updated every time that the mutable was updated.
