import { Machine } from '../types';
import { OFFICIAL_MACHINERY_CATALOG, USD_TO_DOP_RATE as OFFICIAL_RATE } from './officialCatalogs';

export const USD_TO_DOP_RATE = OFFICIAL_RATE;

// Official Machines Data replacing demo entries
export const MACHINES_DATA: Machine[] = OFFICIAL_MACHINERY_CATALOG;
