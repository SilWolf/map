import { useCallback, useState } from 'react';
import { NaturalCurve } from 'react-svg-curve';
import { useKeyPressEvent } from 'react-use';

const ZoneLabel = () => {
	return (
		<div>
			<div>名字</div>
			<div>副名字</div>
		</div>
	);
};

const LocationLabel = ({ x, y, title, subtitle, showDot }: LabelProps) => {
	return (
		<div
			className='location-label pointer-events-none text-center whitespace-nowrap absolute -translate-x-1/2 -translate-y-[20px]'
			style={{ top: y, left: x }}
		>
			<p className='text-[40px] leading-[28px] text-white scale-x-[.92]'>
				{title}
			</p>
			<p className='text-[20px] text-white scale-x-[.88]'>{subtitle}</p>
		</div>
	);
};

const SublocationLabel = ({ x, y, title, subtitle, showDot }: LabelProps) => {
	return (
		<div
			className='location-label pointer-events-none text-center whitespace-nowrap absolute -translate-x-1/2 -translate-y-[4px] opacity-70'
			style={{ top: y, left: x }}
		>
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

type LabelProps = {
	x: number;
	y: number;
	title: string;
	subtitle?: string;
	showDot?: boolean;
};

type TransportProps = {
	points: [number, number][];
	apCost: number;
};

const regions: LabelProps[] = [];

const locations: LabelProps[] = [
	{
		x: 4009,
		y: 2864,
		title: '央城',
		subtitle: '(Asgard of Midgard)',
	},
	{ x: 3392, y: 3027, title: '迦拿', subtitle: '(Cana)' },
	{ x: 3121, y: 2931, title: '輾土城', subtitle: '(City of Wheel)' },
	{ x: 3271, y: 2413, title: '亞爾夫海姆', subtitle: '(Álfheimr)' },
	{ x: 3125, y: 2685, title: '賽吾爾城', subtitle: "(Za' Ura)" },
];

const sublocations: LabelProps[] = [
	{
		x: 3577,
		y: 2744,
		title: '慈特',
		subtitle: '(Zite)',
	},
	{ x: 3166, y: 3015, title: '南嶺農村', subtitle: '', showDot: true },
	{ x: 3305, y: 2945, title: '眠塔', subtitle: '(Grave Tower)' },
	{ x: 3518, y: 3171, title: '礦坑', subtitle: '', showDot: true },
];

const transports: TransportProps[] = [
	{
		points: [
			[3915, 2868],
			[3550, 2834],
			[3180, 2895],
		],
		apCost: 1,
	},
	{
		points: [
			[3128, 2973],
			[3232, 3020],
			[3343, 3018],
		],
		apCost: 0,
	},
	{
		points: [
			[3438, 3022],
			[3469, 3089],
			[3513, 3161],
		],
		apCost: 0,
	},
	{
		points: [
			[3120, 2887],
			[3125, 2809],
			[3128, 2724],
		],
		apCost: 2,
	},
];

function AppForPrint() {
	const handleClickMap = (e: React.MouseEvent) => {
		alert(`x: ${Math.floor(e.pageX)}, y: ${Math.floor(e.pageY)},`);
	};

	const [transportLineMode, setTransportLineMode] = useState<number>(0);

	const handleChangeTransportLineMode = useCallback(() => {
		setTransportLineMode((prev) => (prev + 1) % 3);
	}, []);

	useKeyPressEvent('1', handleChangeTransportLineMode);

	return (
		<div className='relative'>
			<img
				src='./images/map.png'
				className='!max-w-none w-[8192px] h-[5460px]'
				onClick={handleClickMap}
			/>
			{locations.map((location) => (
				<LocationLabel {...location} />
			))}
			{sublocations.map((sublocation) => (
				<SublocationLabel {...sublocation} />
			))}

			{transportLineMode === 0 &&
				transports.map((transport) => <TransportLine {...transport} />)}

			{transportLineMode === 1 &&
				transports.map((transport) => (
					<TransportLineWithoutAP {...transport} />
				))}
		</div>
	);
}

export default AppForPrint;
