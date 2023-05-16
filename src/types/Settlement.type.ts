export type Settlement = {
	mapObjectId?: string;
	name?: string;
	subName?: string;
	description: string;
	imgSrc?: string;
	metadata: {
		position: string;
		country: string;
		type: string;
		population: string;
	};
	landmarks: SettlementLandMark[];
};

export type SettlementLandMark = {
	name: string;
	description: string;
	imgSrc?: string;
	actions?: SettlementLandMarkAction[];
};

export type SettlementLandMarkAction = {
	apCost?: number;
	title: string;
	description: string;
	imgSrc?: string;
};

export type SettlementInfo = {
	version: string;
	data: SettlementInfoData;
};

export type SettlementInfoData = {
	settlements: Settlement[];
};
