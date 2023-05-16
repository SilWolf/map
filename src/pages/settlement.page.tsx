import { useCallback, useEffect, useMemo, useState } from 'react';
import { Settlement, SettlementInfo } from '../types/Settlement.type';
import { MapInfo } from '../types/Map.type';

export type SettlementDTO = Settlement & {
	name: string;
	subName: string;
	connections: SettlementDTOConnection[];
};

export type SettlementDTOConnection = {
	name: string;
	apCost: number;
	imgSrc?: string;
	remarks?: string;
};

const SettlementsPage = () => {
	const [settlements, setSettlements] = useState<SettlementDTO[]>();
	useEffect(() => {
		Promise.all([
			fetch('/jsons/map.json').then((res) => res.json() as Promise<MapInfo>),
			fetch('/jsons/settlement.json').then(
				(res) => res.json() as Promise<SettlementInfo>
			),
		])
			.then(([mapInfo, settlementInfo]) => {
				const mapObjects = mapInfo.data.mapObjects;
				const mapConnections = mapInfo.data.mapConnections;

				const settlements = settlementInfo.data.settlements.map(
					(settlement) => {
						let name = settlement.name ?? '';
						let subName = settlement.subName ?? '';
						const connections: SettlementDTOConnection[] = [];

						if (settlement.mapObjectId) {
							const foundMapObject = mapObjects.find(
								({ id }) => id === settlement.mapObjectId
							);
							if (foundMapObject) {
								name = foundMapObject.title;
								subName = foundMapObject.subtitle ?? '';

								for (const mc of mapConnections) {
									if (mc.startPoint === foundMapObject.id) {
										const foundAnotherMapObject = mapObjects.find(
											({ id }) => id === mc.endPoint
										);
										if (foundAnotherMapObject) {
											connections.push({
												name: foundAnotherMapObject.title,
												apCost: mc.cost ?? 0,
											});
										}
									} else if (mc.endPoint === foundMapObject.id) {
										const foundAnotherMapObject = mapObjects.find(
											({ id }) => id === mc.startPoint
										);
										if (foundAnotherMapObject) {
											connections.push({
												name: foundAnotherMapObject.title,
												apCost: mc.cost ?? 0,
											});
										}
									}
								}
							}
						}

						return {
							...settlement,
							name,
							subName,
							connections,
						};
					}
				);

				return settlements;
			})
			.then(setSettlements);
	}, []);

	const minified = useMemo(() => {
		return (
			settlements
				?.map(
					(s) =>
						`
		[div]
		[table width=756 cellspacing=0 cellpadding=0 border=0]
		[tr]
		[td align=center valign=top width=300 rowspan=2][img=${
			s.imgSrc ?? 'https://placehold.co/300x225.png'
		}][/td]
		[td align=center valign=top colspan=2 height=28][size=5][color=#2897a6][b]${
			s.name
		}[/b][/color][/size][/td]
		[/tr]
		[tr]
		[td align=left valign=top]
		${s.description
			.split('\n')
			.map((line) => `[div][size=3]${line}[/size][/div]`)
			.join('[div]　[/div]')}
		[/td]
		[/tr]
		[tr]
		[td align=left valign=top colspan=2]
		[/td]
		[/tr]
		[tr]
		[td align=center valign=top colspan=2]
		[table align=center cellspacing=0 cellpadding=0 border=0]
		[tr]
		[td align=center][size=2]位置: ${s.metadata.position}[/size][/td]
		[td align=center][size=2]．[/size][/td]
		[td align=center][size=2]隸屬: ${s.metadata.country}[/size][/td]
		[td align=center][size=2]．[/size][/td]
		[td align=center][size=2]類型: ${s.metadata.type}[/size][/td]
		[td align=center][size=2]．[/size][/td]
		[td align=center][size=2]人口: ${s.metadata.population}[/size][/td]
		[/tr]
		[/table]
		[/td]
		[/tr]
		[tr]
		[td align=left valign=top colspan=2]
		[/td]
		[/tr]
		[tr]
		[td align=left valign=top colspan=2]
		${s.landmarks
			.map(
				(landmark) => `
		[table width=100% cellspacing=0 cellpadding=0 border=1]
		[tr]
		[td bgcolor=#2897a6 valign=center]
		[table width=100% cellspacing=0 cellpadding=0 border=0]
		[tr]
		[td align=left]
		[div][size=4][color=#ffffff][b]${landmark.name}[/b][/color][/size][/div]
		[div][size=1][color=#ffffff]${landmark.description}[/color][/size][/div]
		[/td]
		[td align=right]
		[img=${landmark.imgSrc ?? 'https://placehold.co/200x75.png'}]
		[/td]
		[/tr]
		[/table]
		[/td]
		[/tr]
		${landmark.actions?.map(
			(action) => `
		[tr]
		[td valign=top]
		[table width=100% cellspacing=0 cellpadding=0 border=0]
		[tr]
		[td align=left valign=center]
		[div][size=3]└ [b][color=#eb3434]${
			action.apCost ? `&#91;${action.apCost}AP&#93;` : ''
		}[/color][/b] ${action.title}[/size][/div]
		[div][size=1]　　　　　${action.description}[/size][/div]
		[/td]
		[td align=right valign=center]
		[img=${action.imgSrc ?? 'https://placehold.co/200x50.png'}]
		[/td]
		[/tr]
		[/table]
		[/td]
		[/tr]
		`
		)}
		[/table]
		`
			)
			.join('\n')}
		[/td]
		[/tr]
		[tr]
		[td align=left valign=top colspan=2]
		[table width=100% cellspacing=0 cellpadding=0 border=1]
		[tr]
		[td bgcolor=#8a6f5b valign=center]
		[table width=100% cellspacing=0 cellpadding=0 border=0]
		[tr]
		[td align=left]
		[div][size=4][color=#ffffff][b]移動[/b][/color][/size][/div]
		[/td]
		[td align=right]
		[/td]
		[/tr]
		[/table]
		[/td]
		[/tr]
		${s.connections
			?.map(
				(connection) => `
		[tr]
		[td valign=top]
		[table width=100% cellspacing=0 cellpadding=0 border=0]
		[tr]
		[td align=left valign=center]
		[div][size=3]→ [b][color=#eb3434]${
			connection.apCost ? `&#91;${connection.apCost}AP&#93;` : ''
		}[/color][/b] 前往 [b]${connection.name}[/b][/size][/div]
		${
			connection.remarks
				? `[div][size=1]　　　　　${connection.remarks}[/size][/div]`
				: ''
		}
		[/td]
		[/tr]
		[/table]
		[/td]
		[/tr]
		`
			)
			.join('\n')}
		[/table]
		[/td]
		[/tr]
		[/table]
		[/div]
		`
				)
				.join('[div]　　[/div]') ?? ''
		).replace(/[\t\n]/g, '');
	}, [settlements]);

	console.log(settlements, minified);

	const handleClickCopy = useCallback(() => {
		window.navigator.clipboard.writeText(minified);
	}, [minified]);

	return (
		<div className='container mx-auto'>
			<div>
				<button
					onClick={handleClickCopy}
					className='w-full bg-blue-300 py-8 text-center rounded'
				>
					Copy
				</button>
			</div>
			<div className='mt-8'>
				<code className='mt-16 text-sm'>{minified}</code>
			</div>
		</div>
	);
};

export default SettlementsPage;