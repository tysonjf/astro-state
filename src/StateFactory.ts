import { isEqual, cloneDeep } from "lodash";
type TSubscriber<T> = (newState: T, prevState: T, initialState: T) => void;
type TSetter<T> = T | TSetterFunc<T>;
type TSetterFunc<T> = (prev: T, initialState: T) => T;
type TSubscriberOptions = {
  initialCall?: boolean;
};
type TLocalState<T> = {
  state: T;
  initialState: T;
  timeStamp: number;
};
type TMiddleware<T> = (
  newState: T,
  prevState: T,
  initialState: T,
) => T | Promise<T>;

type TConstructorOptions<TState> =
  | {
      callback?: TSubscriber<TState>;
      autoUpdate?: boolean;
      localBackup?: false;
      staleTime?: number;
    }
  | {
      callback?: TSubscriber<TState>;
      autoUpdate?: boolean;
      localBackup: true;
      localkey: string;
      staleTime?: number;
    };

export default class StateFactory<TState> {
  private subscribers: Array<TSubscriber<TState>> = [];
  private state: TState;
  private initState: TState;
  private options: TConstructorOptions<TState> = {
    autoUpdate: true,
    localBackup: false,
  };
  private middleware: TMiddleware<TState>[] = [];
  constructor(state: TState, options?: TConstructorOptions<TState>) {
    this.state = state;
    this.initState = state;
    if (options !== undefined) {
      this.options = { ...this.options, ...options };
      if (options.callback) {
        options.callback(this.state, this.state, this.initState);
      }
      if (options.localBackup) {
        this.getLocal();
      }
    }
  }
  subscribe(
    subscriber: TSubscriber<TState>,
    options: TSubscriberOptions = {
      initialCall: true,
    },
  ) {
    this.subscribers.push(subscriber);
    if (options.initialCall) {
      subscriber(this.state, this.state, this.initState);
    }
    return true;
  }
  unSubscribe(subscriber: TSubscriber<TState>) {
    this.subscribers = this.subscribers.filter((sub) => sub !== subscriber);
    return true;
  }
  addMiddleware(middleware: TMiddleware<TState>) {
    this.middleware.push(middleware);
  }
  setLocal() {
    if (!this.options.localBackup) {
      return console.error("Local backup is not enabled");
    }
    if (!this.options.localkey) {
      console.error("No local key provided to store state");
      return;
    }
    const localState: TLocalState<TState> = {
      state: this.state,
      initialState: this.initState,
      timeStamp: Date.now(),
    };
    localStorage.setItem(this.options.localkey, JSON.stringify(localState));
  }
  getLocal() {
    if (!this.options.localBackup) {
      return console.error("Local backup is not enabled");
    }
    if (!this.options.localkey) {
      console.error("No local key provided to store state");
      return;
    }
    const localState = localStorage.getItem(this.options.localkey);
    if (localState) {
      const localStateObj = JSON.parse(localState) as TLocalState<TState>;
      if (
        this.options.staleTime &&
        Date.now() - localStateObj.timeStamp > this.options.staleTime
      ) {
        this.resetLocal();
        return;
      } else {
        this.initState = localStateObj.initialState;
        this.set(localStateObj.state);
        this.callSubscribers(this.state, this.initState);
      }
    }
  }
  resetLocal() {
    if (!this.options.localBackup) {
      return console.error("Local backup is not enabled");
    }
    if (!this.options.localkey) {
      console.error("No local key provided to store state");
      return;
    }
    const localState = localStorage.getItem(this.options.localkey);
    if (localState) {
      const localStateObj = JSON.parse(localState) as TLocalState<TState>;
      this.state = localStateObj.initialState;
      this.initState = localStateObj.initialState;
      this.callSubscribers(this.state, this.initState);
    }
  }
  clearLocal() {
    if (!this.options.localBackup) {
      return console.error("Local backup is not enabled");
    }
    if (!this.options.localkey) {
      console.error("No local key provided to store state");
      return;
    }
    localStorage.removeItem(this.options.localkey);
  }
  get() {
    return this.state;
  }
  async set(setter: TSetter<TState>) {
    const prevState = cloneDeep(this.state);
    let newState: TState;

    if (typeof setter === "function") {
      newState = (setter as TSetterFunc<TState>)(prevState, this.initState);
    } else {
      newState = setter;
    }

    if (isEqual(prevState, newState)) {
      return [this.state, prevState];
    }

    for (const mw of this.middleware) {
      newState = await mw(newState, prevState, this.initState);
    }

    this.state = newState;

    this.callSubscribers(this.state, prevState);

    if (this.options.localBackup) {
      this.setLocal();
    }

    return [this.state, prevState];
  }
  private callSubscribers(state: TState, prevState: TState) {
    this.subscribers.forEach((cb) => cb(state, prevState, this.initState));
  }
}
