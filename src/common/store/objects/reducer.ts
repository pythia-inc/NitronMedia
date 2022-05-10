import { Normalized } from '@types';
import _ from 'lodash';
import { Reducer } from 'redux';
import { isLoading, onError, onSuccess } from '../../utils/reduxUtils';
import { AppActionTypes } from '../app/types';
import { AuthActionTypes } from '../auth/types';
import { ObjectGroup, ObjectsActionTypes, ObjectsState, ObjectState, ObjectTypes, PlaylistTypes } from './types';

const initialObjectsState = {
  isFetching: false,
  error: null,
  meta: {},
  items: [],
  futureUrl: null,
  nextUrl: null,
  fetchedItems: 0
};

const objectState: Reducer<ObjectState<any>> = (state = initialObjectsState, action) => {
  const { type, payload } = action;

  let newItems;
  let result;
  let items;

  switch (type) {
    case isLoading(ObjectsActionTypes.SET):
      return {
        ...state,
        isFetching: true,
        nextUrl: null
      };
    case onError(ObjectsActionTypes.SET):
      return {
        ...state,
        isFetching: false,
        error: payload
      };
    case isLoading(ObjectsActionTypes.SET_TRACKS):
      return {
        ...state,
        isFetching: true
      };
    case ObjectsActionTypes.SET:
    case onSuccess(ObjectsActionTypes.SET):
      result = payload.result || [];
      items = state.items || [];

      newItems = _.uniqWith([...(payload.refresh ? [] : items), ...result], _.isEqual);

      return {
        ...state,
        isFetching: false,
        meta: payload.meta || {},
        items: newItems,
        futureUrl: payload.futureUrl,
        nextUrl: payload.nextUrl,
        fetchedItems: payload.fetchedItems
      };
    case onSuccess(ObjectsActionTypes.UPDATE_ITEMS):
      return {
        ...state,
        items: [...payload.items]
      };
    case onSuccess(ObjectsActionTypes.SET_TRACKS):
      // eslint-disable-next-line no-case-declarations
      const unableToFetch = _.difference(
        payload.shouldFetchedIds.map((t: Normalized.NormalizedResult) => t.id),
        payload.fetchedIds.map((t: Normalized.NormalizedResult) => t.id)
      );

      // eslint-disable-next-line no-case-declarations
      const filtered = state.items.filter(t => unableToFetch.indexOf(t.id) === -1);

      return {
        ...state,
        isFetching: false,
        items: [...filtered],
        fetchedItems: state.fetchedItems + payload.fetchedIds.length
      };
    case onSuccess(AuthActionTypes.SET_LIKE):
      if (payload.liked) {
        return {
          ...state,
          // because of the denormalization process, every item needs a schema
          items: [{ id: payload.trackId, schema: payload.playlist ? 'playlists' : 'tracks' }, ...state.items]
        };
      }

      return {
        ...state,
        items: state.items.filter(item => payload.trackId !== item.id)
      };
    case ObjectsActionTypes.UNSET_TRACK:
      return {
        ...state,
        items: state.items.filter(item => payload.trackId !== item.id)
      };
    case ObjectsActionTypes.UNSET:
      return initialObjectsState;
    default:
  }

  return state;
};

const initialObjectGroupState = {};

const objectGroup: Reducer<ObjectGroup> = (state = initialObjectGroupState, action) => {
  const { type, payload } = action;

  const playlistName = payload.playlist ? PlaylistTypes.PLAYLISTS : PlaylistTypes.LIKES;

  switch (type) {
    case isLoading(ObjectsActionTypes.SET):
    case onSuccess(ObjectsActionTypes.SET):
    case onSuccess(ObjectsActionTypes.UPDATE_ITEMS):
    case onError(ObjectsActionTypes.SET):
    case ObjectsActionTypes.SET:
    case ObjectsActionTypes.UNSET:
    case onSuccess(ObjectsActionTypes.SET_TRACKS):
    case isLoading(ObjectsActionTypes.SET_TRACKS):
    case ObjectsActionTypes.UNSET_TRACK:
      if (!payload.objectId) {
        return state;
      }

      return {
        ...state,
        [String(payload.objectId)]: objectState(state[String(payload.objectId)], action)
      };
    case onSuccess(AuthActionTypes.SET_LIKE):
      if (!payload.playlist) {
        return state;
      }

      return {
        ...state,
        [playlistName]: objectState(state[playlistName], action)
      };
    default:
  }

  return state;
};

const initialState = {
  [ObjectTypes.PLAYLISTS]: {},
  [ObjectTypes.COMMENTS]: {}
};

export const objectsReducer: Reducer<ObjectsState> = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case isLoading(ObjectsActionTypes.SET):
    case onSuccess(ObjectsActionTypes.SET):
    case onSuccess(ObjectsActionTypes.UPDATE_ITEMS):
    case onError(ObjectsActionTypes.SET):
    case ObjectsActionTypes.SET:
    case ObjectsActionTypes.UNSET:
      return {
        ...state,
        [payload.objectType]: objectGroup(state[payload.objectType], action)
      };
    case onSuccess(AuthActionTypes.SET_LIKE):
    case onSuccess(ObjectsActionTypes.SET_TRACKS):
    case isLoading(ObjectsActionTypes.SET_TRACKS):
    case ObjectsActionTypes.UNSET_TRACK:
      return {
        ...state,
        [ObjectTypes.PLAYLISTS]: objectGroup(state[ObjectTypes.PLAYLISTS], action)
      };
    case AppActionTypes.RESET_STORE:
      return initialState;
    default:
      return state;
  }
};
