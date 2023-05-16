export type MapObjectCoord = {
	areaStartX: number;
	areaStartY: number;
	areaEndX: number;
	areaEndY: number;
};

export type MapObject = {
	id: string;
	coord: MapObjectCoord;
	anchorCoord?: { x: number; y: number };
	title: string;
	subtitle?: string;
	level: number;
	importance: number;
};

export type MapConnectionPoint = string | [number, number];

export type MapConnection = {
	points?: MapConnectionPoint[];
	startPoint: MapConnectionPoint;
	endPoint: MapConnectionPoint;
	level: number;
	cost?: number;
};

export type MapInfoMetadata = {
	width: number;
	height: number;
};

export type MapInfoData = {
	metadata: MapInfoMetadata;
	mapObjects: MapObject[];
	mapConnections: MapConnection[];
};

export type MapInfo = {
	version: string;
	data: MapInfoData;
};
