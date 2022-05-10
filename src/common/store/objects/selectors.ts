import { Normalized } from '@types';
import { createSelector } from 'reselect';
// eslint-disable-next-line import/no-cycle
import { StoreState } from '..';
import { ObjectGroup, ObjectState, ObjectTypes, PlaylistTypes } from './types';

export const getPlaylistsObjects = (state: StoreState) => state.objects[ObjectTypes.PLAYLISTS] || {};
export const getCommentsObjects = (state: StoreState) => state.objects[ObjectTypes.COMMENTS] || {};

export const getPlaylistObjectSelector = (playlistId: string) =>
  createSelector<StoreState, ObjectGroup, ObjectState<Normalized.NormalizedResult> | null>(
    [getPlaylistsObjects],
    playlists => (playlistId in playlists ? playlists[playlistId] : null)
  );

export const getCommentObject = (trackId: string) =>
  createSelector<StoreState, ObjectGroup, ObjectState<Normalized.NormalizedResult> | null>(
    [getCommentsObjects],
    comments => (trackId in comments ? comments[trackId] : null)
  );

export const getPlaylistName = (id: string, playlistType: PlaylistTypes) => [id, playlistType].join('|');

export const getPlaylistType = (objectId: string): PlaylistTypes | null => {
  if (!objectId || typeof objectId !== 'string') {
    return null;
  }

  if (objectId in PlaylistTypes) {
    return objectId as PlaylistTypes;
  }

  const split = objectId.split('|');

  if (split.length !== 2) {
    return null;
  }

  return objectId.split('|')[1] as PlaylistTypes;
};

export const getRelatedTracksPlaylistObject = (trackId: string) =>
  getPlaylistObjectSelector(getPlaylistName(trackId, PlaylistTypes.RELATED));

export const getArtistLikesPlaylistObject = (artistId: string) =>
  getPlaylistObjectSelector(getPlaylistName(artistId, PlaylistTypes.ARTIST_LIKES));
export const getArtistTracksPlaylistObject = (artistId: string) =>
  getPlaylistObjectSelector(getPlaylistName(artistId, PlaylistTypes.ARTIST_TRACKS));
