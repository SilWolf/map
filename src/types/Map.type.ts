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
	anchorCoord?: { x: number; y: number };
	title: string;
	subtitle?: string;
	level: number;
	importance: number;
};

export type MapInfoMetadata = {
	width: number;
	height: number;
};

export type MapInfoObject = Record<MapInfoObjectCategory, MapObject[]>;

export type MapInfoData = {
	metadata: MapInfoMetadata;
	mapObjects: MapObject[];
};

export type MapInfo = {
	version: string;
	data: MapInfoData;
};
