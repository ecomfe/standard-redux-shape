# standard-redux-shape

`standard-redux-shape` is a tiny utility library to help you manage an optimized redux store shape.

## Background

In many applications, developers tends to consider redux store as a simple data structure represnting their views, for example, in a simple todo application, the store may look like:

```javascript
store: {
    todoList: {
        pageNumber: 0,
        pageSize: 10,
        filters: {
            keyword: 'buy',
            startDate: '2017-01-01',
            endDate: '2017-06-30',
            status: 'pending'
        },
        todos: [/* todo objects */]
    }
}
```

This is OK, by listening events and dispatching actions to update `filters` or `todos`, with a `mapStateToProps` function you can receive an array of todo objects and display them on screen:

```javascript
const TodoList = ({todos}) => (
    <ul>
        {todos.map(todo => <li>...</li>)}
    </ul>
);

const mapStateToProps = state => state.todoList.todos;

export default connect(mapStateToProps)(TodoList);
```

This is how many application implements their react-redux application, however it can still introduce issues when `filters` are changed, since `TodoList` only knows `todoList.todos` property, it can receive a wrong list before actions updating `filters` are dispatched and new todo objects are loaded from remote.

In order to prevent wrong data to be displayed, a simple solution is to also receive all current parameters and compare them with those corresponding to the list, so we have to change our store to contain the current and corresponding parameters:

```javascript
store: {
    todoList: {
        currentParams: {
            pageNumber: 0,
            pageSize: 10,
            filters: {
                keyword: 'buy',
                startDate: '2017-01-01',
                endDate: '2017-06-30',
                status: 'pending'
            }
        },
        response: {
            params: {
                pageNumber: 0,
                pageSize: 10,
                filters: {
                    keyword: 'buy',
                    startDate: '2017-01-01',
                    endDate: '2017-06-30',
                    status: 'pending'
                }
            },
            todos: [/* todo obejcts */]
        }
    }
}
```

Then we receive all these properties and compare them to ensure the `todos` property is udpate to date:

```javascript
const mapStateToProps = state => {
    const {currentParams, response: {params, todos}} = state;

    if (shallowEquals(currentParams, params)) {
        return todos;
    }

    return null; // To indicate current response is not returned from remote
};
```

This solves the wrong data issue "perfectly" with some shortcomings:

- We have to manage a more complex store structure case by case.
- The `todos` list is overridden each time `pageNumber`, `pageSize` or `filters` are changed, instant undo is missing on same view.

Having our purpose to solve above issues along with receiving the correct and update to date data each time, the final approach comes with a standardized store shape with three layers.

## Standard shape of store

The `standard-redux-shape` recommends a standard store shape which combines with three concepts:

1. The `entities` is for [store normalization](http://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html), `standard-redux-shape` helps you to create and manage entity tables.
2. The `queries` is an area to store and retrieve query responses with certain params, consider a query response as a special kind of entity, the query params is the key of such entity, `standard-redux-shape` provides functions to serialize params and store responses.
3. The rest of the store should be a minimum state containing current params, `standard-redux-shape` also provides function to retrive responses with params.

### Store normalization

Considering that in most applications entities come from the remote server, `standard-redux-shape` decided to simply binding remote API calls to entity tables, this is archived with 2 functions.

First or all, the `createTableUpdater` creates a function usually called `withTableUpdate` (of type `TableUpdater`), this is a higher order function which has the signature of:

```
type TableUpdaterCreator = ({Store} store) => TableUpdater;
type EntitySelector = ({Object} response) => Obejct;
type TableUpdater = ({string} tableName, {EntitySelector} selectEntites) => APIWrapper;
type APIWrapper = ({Function} api) => Function;
```

Next, the `createTableUpdateReducer` is a function creating a reducer to update the table entities, simply use `combineReducers` to assign a property of store (`entities` recommended) to its return value so that `withTableUpdate` functions can work as expected.

To have a real world example, suppose we have a API called `getTodos` returning a response as:

```javascript
{
    pageNumber: 1,
    pageSize: 10,
    data: [/* todo objects */]
}
```

First we need to create our store, here we need `createTableUpdateReducer` as a sub reducer, and to create and export our `withTableUpdate` function:

```javascript
// store.js

import {createStore, combineReducers} from 'redux';
import {createTableUpdateReducer} from 'standard-redux-shape';
import reducers from 'reducers'

export const store = createStore(
    combineReducers({...reducers, entities: createTableUpdateReducer()}),
    null
);

export const withTableUpdate = createTableUpdater(store);
```

Then we can wrap our `getTodos` API function:

```javascript
// api.js

import {withTableUpdate} from 'store';

const getTodos = params => {
    // ...
};

const selectTodos = ({data}) => data.reduce((todos, todo) => ({...todos: [todo.id]: todo}), {});

export const fetchTodos = withTableUpdate('todosByID', selectTodos)(getTodos);
```

Every thing is done, every time when you call `fetchTodos`, a todo list is fetched from remote and the `entities.todosByID` table is automatically updated.

In order to enjoy the benefits of store normalization, it is highly recommended to map todos array to an array of their id in action creator:

```javascript
// actions.js

import {fetchTodos} from 'api';

export const requestTodos = params => async dispatch => {
    const response = fetchTodos(params);
    const todos = response.data.map(todo => todo.id);

    dispatch({type: 'LOAD_TODOS', todos: todos});
};
```

`withTableUpdate` can also be nested to update multiple entity tables on one API call:

```javascript
const selectTodos = ({todos}) => todos.reduce((todos, todo) => ({...todos: [todo.id]: todo}), {});
const withTodosUpdate = withTableUpdate('todosByID', selectTodos);

const selectMemos = ({memos}) => memos.reduce((memos, memo) => ({...memos: [memo.id]: memo}), {});
const withMemosUpdate = withTableUpdate('memosByID', selectMemos);

export const initializeApplication = selectMemos(selectTodos(loadIntiialData));
```

## Query storage

`standard-redux-shape` provides action creator and reducer helpers. In our standardized shape, any query consists of three stages:

1. The **fetch** stage is when a request is sent but the response is not returned, in this stage we usually recording all pending requests so that we can show a loading indicator or to decide which response is the most fresh one.
2. The **receive** stage is when response is returned, in this stage we can simply put response to store and display it on screen via `mapStateToProps` mappings.
3. The **accept** stage is a special stage when you refuses to immediately accept and display the response, it will be stored temporarily and can be accepted later.

In order to have enough information of the stage of a query and its possible responses (either accepted and pending), we designed a standard shape of query:

```javascript
query: {
    params: {any}, // The params corresponding to this query, can be any type
    pendingMutex: {number}, // A number indicating the count of pending requests
    response: {
        data: {any?}, // A possible object representing the latest success response
        error: {Object?}, // Possible error information for failed request
    },
    nextResponse: { // The latest unaccepted response
        data,
        error
    }
}
```

To update a query structure, we need 2 or 3 actions which matches the fetch, receive and accept stages, `standard-redux-shape` provides several strategies to deal with new responses:

- `acceptLatest({string} fetchActionType, {string} receiveActionType)`: Always accept the latest arrived response, ealier responses will be overridden, this is the mose common case.
- `keepEarliest({string} fetchActionType, {string} receiveActionType, {string} acceptActionType)`: Always use the first arrived response, later responses are discarded automatically, this can be used for some statistic jobs. The latest respones are keep in `nextResponse` so that you can accept it by dispatching `acceptActionType`.
- `keepEarliestSuccess({string} fetchActionType, {string} receiveActionType)`: Quite the same as `keepEarliest` but override earilier error responses.
- `acceptWhenNoPending({string} fetchActionType, {string} receiveActionType)`: Accept the latest arrived response if `pendingMutext` is `0`, this prevents frequent view update when multiple requests may on the fly.

Aside the above, `standard-redux-shape` also provides functions for action creators to create action payloads which can be recognized by reducers, they are:

- `{Object} createQueryPayload({any} params, {any} data)` to create an action payload on success.
- `{Object} createQueryErrorPayload({any} params, {any} data)` to create an action payload on error.

Moreover, `standard-redux-shape` provides selectors to retrieve wanted properties from a query:

- `{Function} createQuerySelector({Function} selectQuery, {Function} selectParams)`: Create a selector to get a query from query set.
- `{Function} createQueryResponseSelector({Function} selectQuery, {Function} selectParams)`: Create a selector to get the `response` property of a query.
- `{Function} createQueryDataSelector({Function} selectQuery, {Function} selectParams)`: Create a selector to get the `response.data` property of q query.
- `{Function} createQueryErrorSelector({Function} selectQuery, {Function} selectParams)`: Create a selector to get the `response.error` property of a query.

By combining these utilities we can create a simple todo list application easily, first we define our action types, each query must have a fetch and a receive type:

```javascript
// actions/type.js

export const FETCH_TODOS = 'FETCH_TODOS';
export const RECEIVE_TODOS = 'RECEIVE_TODOS';
```

Then simply create an action creator which invokes the remote API and dispatches corresponding actions with correct payload:

```javascript
// actions/index.js

import {createQueryPayload, createQueryErrorPayload} from 'standard-redux-shape';
import {fetchTodos} from 'api';
import {FETCH_TODOS, RECEIVE_TODOS} from './type';

export const requestTodos = params => async dispatch => {
    dispatch({type: FETCH_TODOS, payload: params}); // Payload of fetch action must be the params

    try {
        const response = await fetchTodos(params);

        dispatch({type: RECEIVE_TODOS, payload: createQueryPayload(params, response)});
    }
    catch (ex) {
        if (isRequestError(ex)) {
            dispatch({type: RECEIVE_TODOS, payload: createQueryErrorPayload(params, ex)});
        }
        else {
            throw ex;
        }
    }
};
```

The reducers can be super simple:

```javascript
// reducers.js

import {acceptWhenNoPending} from 'standard-redux-shape';
import {combineReducers} from 'redux';
import {FETCH_TODOS, RECEIVE_TODOS} from './type';

const reducers = {
    todoList: acceptWhenNoPending(FETCH_TODOS, RECEIVE_TODOS)
};

export default combineReducers(reducers);
```

In component we can get query state by selectors:

```javascript
// TodoList.js

import {createQuerySelector} from 'standard-redux-shape';
import parseQuery from 'parse-query';
import {withRouter} from 'react-router';

const selectTodoList = createQuerySelector(
    state => state.todoListQuery,
    state => {
        const {pageNumber, startDate, endDate} = parseQuery(props.location.query);
        return {pageNumber, startDate, endDate};
    }
);

const TodoList = props => {
    const query = selectTodoList(props);

    if (query.pendingMutex) {
        return <Loading />;
    }

    if (query.response.error) {
        return <Error error={query.response.error} />
    };

    return (
        <ul>
            {query.response.data.map(todo => <li>...</li>)}
        </ul>
    );
};


const mapStateToProps = state => {
    return {
        todoListQuery: state.todoList.queries // Suppose we combine reducers here
    }
};

export default withRouter(connect(mapStateToProps)(TodoList));
```

### Quick create thunk

The `createThunkFor` function helps you to quick create a simple [thunk function](https://github.com/gaearon/redux-thunk) which just dispatching 2 actions around an API call function:

```javascript
{Function} createThunkFor(
    {Function} api,
    {string} fetchActionType,
    {string} receiveActionType,
    {Object} options
);
```

More options can be passed via `options` parameter:

- `{Function} computeParams({any} ...args)`: To compute the params for `api`.
- `{boolean} once`: If set to `true`, `api` will not be invoked when there is already a response in store.
- `{Function} selectQuerySet({any} state)`: When `once` is set to `true`, `selectQuerySet` must be provided to select the corresponding query set to determine whether response is already in store.

## Example

You can run `npm start` to start a demo, the chart uses `keepEarliest` strategy and a friendly message is displayed to user waiting their action to accept the latest data.
