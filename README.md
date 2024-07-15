````markdown
# Astro State

Astro State is a TypeScript utility for managing application state in Astro projects. It provides subscription capabilities, middleware support, and optional local storage backup.

## Features

- 🚀 Designed for Astro projects
- 🔄 State management with getter and setter methods
- 📡 Subscription system for state changes
- 🔗 Middleware support for intercepting and modifying state updates
- 💾 Optional local storage backup with stale time checks
- 🔒 TypeScript generics for type-safe state handling

## Installation

Since this package is only published on GitHub, you can install it directly from the repository:

```bash
pnpm add github:tysonjf/astro-state

npm install github:tysonjf/astro-state
```
````

## Usage

### Importing the State class

```typescript
import { State } from "astro-state";

const initialState = { count: 0 };
const state = new State(initialState, {
  autoUpdate: true,
  localBackup: true,
  localkey: "myAstroState",
  // 5 * 60 * 1000 = 5 minutes
  staleTime: 5 * 60 * 1000,
});
```

### Subscribing to state changes

```typescript
const countElement = document.getElementById("count");

state.subscribe((newState, prevState, initialState) => {
  // Update the UI
  countElement.textContent = newState.count.toString();

  console.log("State updated:", newState);
});
```

### Updating state

```typescript
// valid
state.set((prevState) => ({ count: prevState.count + 1 }));
state.set({ count: 10 });

// invalid
state.set((prevState) => ({ count: prevState.count++ }));
```

### Adding middleware

```typescript
state.addMiddleware((newState, prevState, initialState) => {
  // Modify or validate state here
  if (newState.count < 0) {
    return { count: 0 };
  }

  if (newState.count > 10) {
    return initialState;
  }

  return newState;
});
```

### Local storage operations

```typescript
state.getLocal(); // Load state from local storage
state.resetLocal(); // Reset state to initial local storage value
state.clearLocal(); // Clear state from local storage
```

## API Reference

### `constructor(state: TState, options?: TConstructorOptions<TState>)`

Creates a new State instance.

### `subscribe(subscriber: TSubscriber<TState>, options?: TSubscriberOptions): boolean`

Adds a subscriber to the state changes.

### `unSubscribe(subscriber: TSubscriber<TState>): boolean`

Removes a subscriber.

### `addMiddleware(middleware: TMiddleware<TState>): void`

Adds a middleware function to intercept state updates.

### `get(): TState`

Returns the current state.

### `set(setter: TSetter<TState>): Promise<[TState, TState]>`

Updates the state and returns a promise with the new and previous states.

### `setLocal(): void`

Saves the current state to local storage.

### `getLocal(): void`

Loads the state from local storage.

### `resetLocal(): void`

Resets the state to the initial value stored in local storage.

### `clearLocal(): void`

Removes the state from local storage.

## Types

```typescript
type TSubscriber<T> = (newState: T, prevState: T, initialState: T) => void;
type TSetter<T> = T | TSetterFunc<T>;
type TSetterFunc<T> = (prev: T, initialState: T) => T;
type TMiddleware<T> = (
  newState: T,
  prevState: T,
  initialState: T,
) => T | Promise<T>;

type TConstructorOptions<TState> = {
  callback?: TSubscriber<TState>;
  autoUpdate?: boolean;
  localBackup?: boolean;
  localkey?: string;
  staleTime?: number;
};
```

## Development

To start the development server:

```bash
npm run dev
```

To build the project:

```bash
npm run build
```

To preview the build:

```bash
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[https://github.com/tysonjf/astro-state](https://github.com/tysonjf/astro-state)

## Version

1.0.0

## Dependencies

- @astrojs/check: ^0.8.1
- astro: ^4.11.5
- lodash: ^4.17.21
- typescript: ^5.5.3

## Dev Dependencies

- @types/lodash: ^4.17.6

```

This README now:
1. Uses "State" instead of "StateFactory" in the examples.
2. Shows how to import the `State` class from the package.
3. Provides instructions for installing the package directly from GitHub instead of npm.

Is there anything else you'd like me to adjust in this README?
```
