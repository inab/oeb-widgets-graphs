# Contributing

Thank you for helping improve OpenEBench Graph Widgets.

## Getting started

Use the Node.js version in `.nvmrc`, then install dependencies and start the
demo:

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open `/src/demo/index.html` to explore the plots and sample data.

## Making changes

1. Open an [issue](https://github.com/inab/oeb-widgets-graphs/issues) to
   discuss a bug or proposed change.
2. Create a branch, make focused changes and update relevant documentation.
3. Run the tests and build:

   ```sh
   node --test tests/*.test.js
   npm run build
   ```

4. Open a pull request describing the change, how it was tested and any
   visual changes. Screenshots are helpful for UI changes.

The build updates `dist/`; review generated changes before including them in
your pull request. Never commit credentials or tokens.
