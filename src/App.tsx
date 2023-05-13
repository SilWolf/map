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
	MapContainer,
	Marker,
	Popup,
	Rectangle,
	TileLayer,
	Tooltip,
	useMapEvent,
} from 'react-leaflet';
import { NaturalCurve } from 'react-svg-curve';
import { useKeyPressEvent } from 'react-use';
import { MapInfo, MapInfoObjectCategory } from './types/Map.type';

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

const LocationLabel = ({
	title,
	subtitle,
	showDot,
	...divProps
}: LabelProps) => {
	return (
		<div className='map-label text-center whitespace-nowrap' {...divProps}>
			<p className='text-[40px] leading-[28px] text-white scale-x-[.92]'>
				{title}
			</p>
			<p className='text-[20px] text-white scale-x-[.88]'>{subtitle}</p>
		</div>
	);
};

const SublocationLabel = ({ title, subtitle, showDot }: LabelProps) => {
	return (
		<div className='map-label text-center whitespace-nowrap opacity-70'>
			{showDot && (
				<div className='w-3 h-3 rounded-full bg-white border-2 border-black mx-auto mb-2'></div>
			)}
			<p className='text-[28px] leading-[20px] text-white scale-x-[.92]'>
				{title}
			</p>
			<p className='text-[14px] text-white scale-x-[.88]'>{subtitle}</p>
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
};

type WithTooltipProps<T> = T & {
	rectBounds: [[number, number], [number, number]];
	tooltipOffset: [number, number];
};

type LeafletMapObject = WithTooltipProps<LabelProps>;

type TransportProps = {
	points: [number, number][];
	apCost: number;
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

	const { majorLandmarks } = useMemo<{
		majorLandmarks: LeafletMapObject[];
	}>(() => {
		if (!mapInfo) {
			return {
				majorLandmarks: [],
			};
		}

		try {
			return {
				majorLandmarks: mapInfo.data.mapObject.majorLandmarks.map(
					({ coord, ...item }) => ({
						...item,
						rectBounds: [
							convertLocationXYToMapCoord(coord.areaStartX, coord.areaStartY),
							convertLocationXYToMapCoord(coord.areaEndX, coord.areaEndY),
						],
						tooltipOffset: [
							0,
							Math.max(
								-14,
								Math.floor(((coord.areaEndY - coord.areaStartY) / 2) * 0.8)
							),
						],
					})
				),
			};
		} catch (e) {
			console.log(e);
			console.error('發生了問題！請通知月月修復處理！');
		}

		return {
			majorLandmarks: [],
		};
	}, [mapInfo]);

	const handleClickMapObject = useCallback(
		(e: MouseEvent<HTMLDivElement> | LeafletMouseEvent) => {
			try {
				if ((e as LeafletMouseEvent).originalEvent !== undefined) {
					const [, category, index] = (
						(e as LeafletMouseEvent).originalEvent.target as HTMLElement
					)
						.getAttribute('class')
						?.split(' ')
						.find((className) => className.startsWith('mapObject'))
						?.split('-') as [unknown, MapInfoObjectCategory, string];

					const mapObject = mapInfo?.data.mapObject[category][parseInt(index)];

					console.log(mapObject);
				} else {
					(e as MouseEvent<HTMLDivElement>).stopPropagation();

					const category = (
						e as MouseEvent<HTMLDivElement>
					).currentTarget.getAttribute(
						'data-category'
					) as MapInfoObjectCategory;
					const index = (
						e as MouseEvent<HTMLDivElement>
					).currentTarget.getAttribute('data-index') as string;

					const mapObject = mapInfo?.data.mapObject[category][parseInt(index)];

					console.log(mapObject);
				}
			} catch (e) {
				console.error(e);
			}
		},
		[mapInfo]
	);

	const mapObjectEventFns = useMemo<LeafletEventHandlerFnMap>(
		() => ({
			click: handleClickMapObject,
		}),
		[handleClickMapObject]
	);

	return (
		// <div className='relative'>
		// 	<img
		// 		src='./images/map.png'
		// 		className='!max-w-none w-[8192px] h-[5460px]'
		// 		onClick={handleClickMap}
		// 	/>
		// 	{locations.map((location) => (【
		// 		<LocationLabel {...location} />
		// 	))}
		// 	{sublocations.map((sublocation) => (
		// 		<SublocationLabel {...sublocation} />
		// 	))}

		// 	{transportLineMode === 0 &&
		// 		transports.map((transport) => <TransportLine {...transport} />)}

		// 	{transportLineMode === 1 &&
		// 		transports.map((transport) => (
		// 			<TransportLineWithoutAP {...transport} />
		// 		))}
		// </div>

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
			scrollWheelZoom={false}
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

			{majorLandmarks.map(({ rectBounds, tooltipOffset, ...location }, i) => (
				<Rectangle
					key={i}
					bounds={rectBounds}
					pathOptions={{
						color: 'black',
						className: `mapObject-majorLandmarks-${i}`,
					}}
					eventHandlers={mapObjectEventFns}
					interactive
				>
					<Tooltip
						direction='bottom'
						offset={tooltipOffset}
						className={`map-primary-label mapObject-majorLandmarks-${i}`}
						opacity={1.0}
						permanent
						interactive
					>
						<LocationLabel
							{...location}
							data-category='majorLandmarks'
							data-index={i}
							onClick={handleClickMapObject}
						/>
					</Tooltip>
				</Rectangle>
			))}

			<MapContainerEventHandler />
		</MapContainer>
	);
}

export default App;
