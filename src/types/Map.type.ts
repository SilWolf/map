export type MapInfoObjectCategory =
	| 'majorLandmarks'
	| 'minorLandmarks'
	| 'majorZones';

export type MapObjectCoord = {
	areaStartX: number;
	areaStartY: number;
	areaEndX: number;
	areaEndY: number;
};

export type MapObject = {
	coord: MapObjectCoord;
	title: string;
	subtitle?: string;
};

export type MapInfoMetadata = {
	width: number;
	height: number;
};

export type MapInfoObject = Record<MapInfoObjectCategory, MapObject[]>;

export type MapInfoData = {
	metadata: MapInfoMetadata;
	mapObject: MapInfoObject;
};

export type MapInfo = {
	version: string;
	data: MapInfoData;
};
