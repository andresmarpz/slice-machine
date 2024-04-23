/**
 * Combine all reducers in this file and export the combined reducers. If we
 * were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers, Reducer } from "redux";
import { modalReducer } from "@src/modules/modal";
import { loadingReducer } from "@src/modules/loading";
import { userContextReducer } from "@src/modules/userContext";
import { environmentReducer } from "@src/modules/environment";
import { availableCustomTypesReducer } from "@src/modules/availableCustomTypes";
import { slicesReducer } from "@src/modules/slices";
import { routerReducer } from "connected-next-router";

/** Creates the main reducer */
const createReducer = (): Reducer =>
  combineReducers({
    modal: modalReducer,
    loading: loadingReducer,
    userContext: userContextReducer,
    environment: environmentReducer,
    availableCustomTypes: availableCustomTypesReducer,
    slices: slicesReducer,
    router: routerReducer,
  });

export default createReducer;
