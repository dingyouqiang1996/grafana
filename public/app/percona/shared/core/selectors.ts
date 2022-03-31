import { StoreState } from 'app/types';

export const getPerconaSettings = (state: StoreState) => state.perconaSettings;
export const getPerconaUser = (state: StoreState) => state.perconaUser;
export const getPerconaServer = (state: StoreState) => state.perconaServer;
