import { CRS, LeafletEventHandlerFnMap, LeafletMouseEvent } from 'leaflet';
import {
	HTMLAttributes,
	MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	CircleMarker,
	LayerGroup,
	LayerGroupProps,
	MapContainer,
	Marker,
	Popup,
	Rectangle,
	SVGOverlay,
	TileLayer,
	Tooltip,
	useMap,
	useMapEvent,
} from 'react-leaflet';
import { NaturalCurve } from 'react-svg-curve';
import { useKeyPressEvent } from 'react-use';
import { MapInfo, MapObject } from './types/Map.type';
import React from 'react';

const convertLocationXYToMapCoord = (
	x: number,
	y: number
): [number, number] => [-y - 320, x + 320];

const ZoneLabel = () => {
	return (
		<div>
			<div>名字</div>
			<div>副名字</div>
		</div>
	);
};

const MapObjectLabel = ({
	title,
	subtitle,
	showDot,
	importance = 0,
	...divProps
}: LabelProps) => {
	const [containerClassName, titleClassName, subtitleClassName] =
		useMemo(() => {
			if (importance < 0) {
				return [
					'text-white opacity-70',
					'text-[28px] leading-[20px] scale-x-[.92]',
					'text-[14px] scale-x-[.88]',
				];
			}

			return [
				'text-white',
				'text-[40px] leading-[28px] scale-x-[.92]',
				'text-[20px] scale-x-[.88]',
			];
		}, [importance]);

	return (
		<div
			className={`map-label text-center whitespace-nowrap ${containerClassName}`}
			{...divProps}
		>
			<p className={titleClassName}>{title}</p>
			<p className={subtitleClassName}>{subtitle}</p>
		</div>
	);
};

const TransportLine = ({ points, apCost }: TransportProps) => {
	const pointElementFn = useCallback(
		([x, y]: number[], i: number) => {
			if (i !== 1) {
				return <></>;
			}

			if (apCost <= 0) {
				return <></>;
			}

			return (
				<g>
					<rect
						key={i}
						x={x - 40}
						y={y - 18}
						rx='10'
						ry='10'
						width='80'
						height='30'
						stroke='rgba(52, 217, 235, 0.85)'
						fill='rgba(52, 217, 235, 0.85)'
						stroke-width='5'
					/>
					<text
						x={x}
						y={y}
						alignmentBaseline='middle'
						textAnchor='middle'
						fill='#FFFFFF'
						fontSize={24}
					>
						{apCost} AP
					</text>
				</g>
			);
		},
		[apCost]
	);

	return (
		<div className='absolute top-0 left-0 pointer-events-none font-sans'>
			<svg width='8192' height='5460'>
				<NaturalCurve
					data={points}
					strokeWidth={15}
					stroke='rgba(52, 217, 235, 0.85)'
					pointElement={pointElementFn}
				/>
			</svg>
		</div>
	);
};

const TransportLineWithoutAP = ({ points }: TransportProps) => {
	return (
		<div className='absolute top-0 left-0 pointer-events-none font-sans'>
			<svg width='8192' height='5460'>
				<NaturalCurve
					data={points}
					strokeWidth={4}
					strokeLinecap='round'
					strokeDasharray='1, 8'
					stroke='rgba(255, 255, 255, 1)'
					showPoints={false}
				/>
			</svg>
		</div>
	);
};

type LabelProps = HTMLAttributes<HTMLDivElement> & {
	title: string;
	subtitle?: string;
	showDot?: boolean;
	level: number;
	importance?: number;
};

type WithTooltipProps<T> = T & {
	rectBounds: [[number, number], [number, number]];
	anchorCoord: [number, number];
};

type LeafletMapObject = WithTooltipProps<LabelProps>;

type TransportProps = {
	points: [number, number][];
	apCost: number;
};

type ExtendedLayerGroupProps = LayerGroupProps & {
	level: number;
};

const ExtendedLayerGroup = ({ level, ...props }: ExtendedLayerGroupProps) => {
	const [zoom, setZoom] = useState<number>(0);
	const map = useMapEvent('zoomend', () => {
		setZoom(map.getZoom());
	});

	if (zoom < level || zoom > level + 2) {
		return null;
	}

	return <LayerGroup {...props} />;
};

const MapContainerEventHandler = () => {
	useMapEvent('click', (e) => {
		const latlng = e.latlng;
		console.log(
			`x = ${Math.floor(latlng.lng - 320)}, y = ${Math.floor(
				-latlng.lat - 320
			)}`
		);
	});

	return null;
};

function App() {
	const handleClickMap = (e: React.MouseEvent) => {
		alert(`x: ${Math.floor(e.pageX)}, y: ${Math.floor(e.pageY)},`);
	};

	const [transportLineMode, setTransportLineMode] = useState<number>(0);

	const handleChangeTransportLineMode = useCallback(() => {
		setTransportLineMode((prev) => (prev + 1) % 3);
	}, []);

	useKeyPressEvent('1', handleChangeTransportLineMode);

	const [mapInfo, setMapInfo] = useState<MapInfo>();
	useEffect(() => {
		fetch('/jsons/map.json')
			.then((res) => res.json())
			.then(setMapInfo);
	}, []);

	const [leafletMapObjects, leafletMapObjectEntries] = useMemo<
		[LeafletMapObject[], [string, LeafletMapObject[]][]]
	>(() => {
		if (!mapInfo) {
			return [[], []];
		}

		const refinedMapObjects = mapInfo.data.mapObjects.map(
			(mapObject) =>
				({
					...mapObject,
					rectBounds: [
						convertLocationXYToMapCoord(
							mapObject.coord.areaStartX,
							mapObject.coord.areaStartY
						),
						convertLocationXYToMapCoord(
							mapObject.coord.areaEndX,
							mapObject.coord.areaEndY
						),
					],
					anchorCoord: mapObject.anchorCoord
						? convertLocationXYToMapCoord(
								mapObject.anchorCoord.x,
								mapObject.anchorCoord.y
						  )
						: convertLocationXYToMapCoord(
								Math.floor(
									(mapObject.coord.areaStartX + mapObject.coord.areaEndX) / 2
								),
								Math.floor(
									(mapObject.coord.areaStartY + mapObject.coord.areaEndY) / 2
								)
						  ),
				} as LeafletMapObject)
		);
		const result: Record<number, LeafletMapObject[]> = {};

		for (const mapObject of refinedMapObjects) {
			if (!result[mapObject.level]) {
				result[mapObject.level] = [];
			}
			try {
				result[mapObject.level].push(mapObject);
			} catch (e) {
				console.error(
					`${mapObject.title} (level = ${mapObject.level}) 轉化失敗!`,
					e
				);
			}
		}

		return [refinedMapObjects, Object.entries(result)];
	}, [mapInfo]);

	const handleClickMapObject = useCallback(
		(e: MouseEvent<HTMLDivElement> | LeafletMouseEvent) => {
			try {
				if ((e as LeafletMouseEvent).originalEvent !== undefined) {
					const [, id] = (
						(e as LeafletMouseEvent).originalEvent.target as HTMLElement
					)
						.getAttribute('class')
						?.split(' ')
						.find((className) => className.startsWith('mapObject'))
						?.split('|') as [unknown, string];

					const mapObject = leafletMapObjects.find((item) => item.id === id);

					console.log(mapObject);
				} else {
					(e as MouseEvent<HTMLDivElement>).stopPropagation();

					const id = (
						e as MouseEvent<HTMLDivElement>
					).currentTarget.getAttribute('data-id') as string;

					const mapObject = leafletMapObjects.find((item) => item.id === id);

					console.log(mapObject);
				}
			} catch (e) {
				console.error(e);
			}
		},
		[leafletMapObjects]
	);

	const mapObjectEventFns = useMemo<LeafletEventHandlerFnMap>(
		() => ({
			click: handleClickMapObject,
		}),
		[handleClickMapObject]
	);

	return (
		<MapContainer
			className='w-screen h-screen'
			maxBounds={[
				[-320, 320],
				[-5780, 8512],
			]}
			center={[-3118, 4320]}
			minZoom={-3}
			maxZoom={2}
			zoom={0}
			crs={CRS.Simple}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url='/images/map-tiles/row-{y}-column-{x}.png'
				maxNativeZoom={0}
				minNativeZoom={0}
				minZoom={-99}
				bounds={[
					[-320, 320],
					[-5780, 8512],
				]}
				tileSize={320}
			/>
			{/* <Marker position={[-2000, 4000]}>
				<Popup>Hello world</Popup>
			</Marker> */}

			{leafletMapObjectEntries.map(([level, leafletMapObjects], i) => (
				<ExtendedLayerGroup level={parseInt(level)} key={i}>
					{leafletMapObjects.map(
						({ rectBounds, anchorCoord, id, ...mapObject }) => (
							<React.Fragment key={id}>
								<Rectangle
									bounds={rectBounds}
									pathOptions={{
										color: 'transparent',
										className: `mapObject|${id}`,
									}}
									eventHandlers={mapObjectEventFns}
									interactive
								/>
								<CircleMarker
									radius={0}
									pathOptions={{
										color: 'transparent',
									}}
									center={anchorCoord}
								>
									<Tooltip
										className='map-primary-label'
										direction='center'
										opacity={1.0}
										permanent
										interactive
									>
										<MapObjectLabel
											{...mapObject}
											data-id={id}
											onClick={handleClickMapObject}
										/>
									</Tooltip>
								</CircleMarker>
							</React.Fragment>
						)
					)}
				</ExtendedLayerGroup>
			))}

			<SVGOverlay
				bounds={[
					[-320, 320],
					[-5780, 8512],
				]}
			>
				<svg viewBox='0 0 8192 5460'>
					<NaturalCurve
						data={[
							[3438, 3022],
							[3469, 3089],
							[3513, 3161],
						]}
						strokeWidth={4}
						strokeLinecap='round'
						strokeDasharray='1, 8'
						stroke='rgba(255, 255, 255, 1)'
						showPoints={false}
					/>
				</svg>
			</SVGOverlay>

			<MapContainerEventHandler />
		</MapContainer>
	);
}

export default App;
