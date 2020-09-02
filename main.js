console.clear();

const INITIAL_GRID_WIDTH = 5;
const INITIAL_GRID_HEIGHT = 5;
const UPPER_BOUND = 10;
const LOWER_BOUND = 3;

const { useState, useRef } = React;
const { DndProvider, useDrag, useDrop } = ReactDnD;
const { default: HTML5Backend } = ReactDnDHTML5Backend;

const Pipe = {
	T: "t",
	TTop: "t-top",
	TLeft: "t-left",
	TBottom: "t-bottom",
	Cross: "cross",
	Empty: "empty",
	EmptyPipe: "empty-pipe",
	Vertical: "veritcal",
	Horizontal: "horizontal",
	ElbowTopLeft: "elbow-top-left",
	ElbowTopRight: "elbow-top-right",
	ElbowBottomLeft: "elbow-bottom-left",
	ElbowBottomRight: "elbow-bottom-right"
};

const getEmptyBoard = (gridWidth, gridHeight) => {
	const board = [];

	//local mutation ok
	for (let x = 0; x < gridWidth; x++) {
		const column = [];
		board.push(column);
		for (let y = 0; y < gridHeight; y++) {
			column.push(Pipe.Empty);
		}
	}
	return board;
};

const App = () => {
	return (
		<DndProvider backend={HTML5Backend}>
			<Board />
		</DndProvider>
	);
};

const Board = () => {
	[board, setBoard] = useState(() =>
		getEmptyBoard(INITIAL_GRID_WIDTH, INITIAL_GRID_HEIGHT)
	);

	const gridWidth = board.length;
	const gridHeight = board[0].length;

	function reinitializeBoard(width, height) {
		setBoard(getEmptyBoard(width, height));
	}

	function updateBoardCell(x, y, newPipe) {
		console.log(x, y, newPipe);
		setBoard(
			board.map((column, i) => {
				if (i !== x) {
					return column;
				}
				return column.map((item, ii) => {
					if (ii !== y) {
						return item;
					}
					return newPipe;
				});
			})
		);
	}

	return (
		<div className="board">
			<div className="touch-display">
				React DND 11.1.3 does not support touch events.
			</div>
			<div className="board-grid-wrap">
				<GridConfigForm
					gridWidth={gridWidth}
					gridHeight={gridHeight}
					reinitializeBoard={reinitializeBoard}
				/>
				<Grid board={board} updateBoardCell={updateBoardCell} />
			</div>
			<Options
				reinitializeBoard={reinitializeBoard}
				updateBoardCell={updateBoardCell}
				gridWidth={gridWidth}
				gridHeight={gridHeight}
			/>
		</div>
	);
};

const GridConfigForm = ({ gridWidth, gridHeight, reinitializeBoard }) => {
	const [widthStr, setWidthStr] = useState(String(gridWidth));
	const [heightStr, setHeightStr] = useState(String(gridHeight));

	const handleSubmit = (evt) => {
		evt.preventDefault();
		if (!errorMessage) {
			reinitializeBoard(widthNum, heightNum);
		}
	};

	let errorMessage;
	const widthNum = parseInt(widthStr, 10);
	const heightNum = parseInt(heightStr, 10);
	if (isNaN(widthNum) || isNaN(heightNum)) {
		errorMessage = "Values must be integers.";
	} else if (
		widthNum < LOWER_BOUND ||
		widthNum > UPPER_BOUND ||
		heightNum < LOWER_BOUND ||
		heightNum > UPPER_BOUND
	) {
		errorMessage = `Values must be between ${LOWER_BOUND} and ${UPPER_BOUND}.`;
	}

	return (
		<form className="grid-config-form" method="POST" onSubmit={handleSubmit}>
			<div className="grid-config-fields">
				<div className="grid-config-field">
					Rows:{" "}
					<input
						type="text"
						value={heightStr}
						onInput={(evt) => setHeightStr(evt.target.value)}
					/>
				</div>
				<div className="grid-config-field">
					Columns:{" "}
					<input
						type="text"
						value={widthStr}
						onInput={(evt) => setWidthStr(evt.target.value)}
					/>
				</div>
				<button type="submit" disabled={!!errorMessage}>
					Update
				</button>
			</div>
			{errorMessage && <div className="grid-config-error">{errorMessage}</div>}
		</form>
	);
};

const Grid = ({ board, updateBoardCell }) => {
	return (
		<div className="grid">
			{board.map((column, x) => (
				<div className="column">
					{column.map((row, y) => {
						const PipeComponent = PipeComponents[board[x][y]];
						return (
							<GridCell
								x={x}
								y={y}
								board={board}
								componentChildName={PipeComponents[board[x][y]]}
							>
								<PipeComponent
									className="cell-dropped"
									updateBoardCell={updateBoardCell}
								/>
							</GridCell>
						);
					})}
				</div>
			))}
		</div>
	);
};

const Options = ({ updateBoardCell }) => {
	return (
		<div className="grid-picker">
			<div className="column-picker">
				<EmptyPipe className={"cell-picker"} updateBoardCell={updateBoardCell} />
				<ElbowTopLeft className={"cell-picker"} updateBoardCell={updateBoardCell} />
				<T
					className={"cell-picker"}
					name={Pipe.T}
					updateBoardCell={updateBoardCell}
				/>
			</div>
			<div className="column-picker">
				<Vertical className={"cell-picker"} updateBoardCell={updateBoardCell} />
				<ElbowTopRight
					className={"cell-picker"}
					updateBoardCell={updateBoardCell}
				/>
				<TLeft className={"cell-picker"} updateBoardCell={updateBoardCell} />
			</div>
			<div className="column-picker">
				<Horizontal className={"cell-picker"} updateBoardCell={updateBoardCell} />
				<ElbowBottomRight
					className={"cell-picker"}
					updateBoardCell={updateBoardCell}
				/>
				<TBottom className={"cell-picker"} updateBoardCell={updateBoardCell} />
			</div>
			<div className="column-picker">
				<Cross className={"cell-picker"} updateBoardCell={updateBoardCell} />
				<ElbowBottomLeft
					className={"cell-picker"}
					updateBoardCell={updateBoardCell}
				/>
				<TTop className={"cell-picker"} updateBoardCell={updateBoardCell} />
			</div>
		</div>
	);
};

const GridCell = ({ x, y, board, children, componentChildName }) => {
	const [{ canDrop, isOver }, dropRef] = useDrop({
		accept: "pipe",
		drop: () => ({
			name: `${x} ${y}`,
			x: x,
			y: y,
			dropEffect: "move"
		}),
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop()
		})
	});
	return (
		<div
			ref={dropRef}
			className={componentChildName === "Empty" ? "cell" : "cell-dropped"}
		>
			{children}
		</div>
	);
};

// const Input = ({ name }) => {
// 	return <input type="text" name={name}
// }

const GridPickerCell = () => {
	return <div className="cell-picker"></div>;
};

const GridPickerSpacerCell = ({ children }) => {
	return <div className="cell-spacer">{children}</div>;
};

const EmptyCell = ({ dropRef }) => {
	return <div ref={dropRef} className="cell" />;
};

const EmptyPipe = ({ updateBoardCell, className }) => {
	const [{ isDragging }, dragRef] = useDrag({
		item: { type: "pipe", name: Pipe.EmptyPipe },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			console.log("dropResult:" + JSON.stringify(dropResult), item);

			if (item && dropResult) {
				updateBoardCell(dropResult.x, dropResult.y, item.name);
			}
		}
	});
	return (
		<div
			ref={dragRef}
			style={{
				opacity: isDragging ? 0.3 : 1
			}}
		>
			<div className={`${className}`}>
				<div className="pipe-set"></div>
			</div>
		</div>
	);
};

const LongPipe = ({ name, rotationClass, updateBoardCell, className }) => {
	const [{ isDragging }, dragRef] = useDrag({
		item: { type: "pipe", name },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			console.log("dropResult:" + JSON.stringify(dropResult), item);

			if (item && dropResult) {
				updateBoardCell(dropResult.x, dropResult.y, item.name);
			}
		}
	});
	return (
		<div
			ref={dragRef}
			style={{
				opacity: isDragging ? 0.3 : 1
			}}
		>
			<div className={`${className} ${rotationClass}`}>
				<div className="pipe-set">
					<div className="pipe color-1" />
					<div className="pipe-ring pipe-ring-bottom" />
					<div className="pipe-ring pipe-ring-top" />
				</div>
			</div>
		</div>
	);
};

const T = ({ name, updateBoardCell, rotationClass, className }) => {
	const [{ isDragging }, dragRef] = useDrag({
		item: { type: "pipe", name: name ? name : Pipe.T },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			console.log("dropResult:" + JSON.stringify(dropResult), item);

			if (item && dropResult) {
				updateBoardCell(dropResult.x, dropResult.y, item.name);
			}
		}
	});
	return (
		<div
			ref={dragRef}
			style={{
				opacity: isDragging ? 0.3 : 1
			}}
		>
			<div className={`${className} ${rotationClass}`}>
				<div className="pipe-set">
					<div className="pipe color-1" />
					<div className="pipe-ring pipe-ring-bottom" />
					<div className="pipe-ring pipe-ring-top" />
				</div>
				<div className="pipe-set-horizontal-t">
					<div className="pipe-short-right-horizontal color-1" />
					<div className="pipe-ring-short-horizontal pipe-ring-short-left-horizontal" />
					<div className="pipe-ring-short-horizontal pipe-ring-horizontal-right" />
				</div>
			</div>
		</div>
	);
};

const Cross = ({ updateBoardCell, className }) => {
	const [{ isDragging }, dragRef] = useDrag({
		item: { type: "pipe", name: Pipe.Cross },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			console.log("dropResult:" + JSON.stringify(dropResult), item);

			if (item && dropResult) {
				updateBoardCell(dropResult.x, dropResult.y, item.name);
			}
		}
	});
	return (
		<div
			ref={dragRef}
			style={{
				opacity: isDragging ? 0.3 : 1
			}}
		>
			<div className={className}>
				<div className="pipe-set-horizontal rotate180Right pipe-set-left">
					<div className="pipe-short-right-horizontal color-1" />
					<div className="pipe-ring-short-horizontal pipe-ring-short-left-horizontal" />
					<div className="pipe-ring-short-horizontal pipe-ring-horizontal-right" />
				</div>
				<div className="pipe-set">
					<div className="pipe color-1" />
					<div className="pipe-ring pipe-ring-bottom" />
					<div className="pipe-ring pipe-ring-top" />
				</div>
				<div className="pipe-set-horizontal">
					<div className="pipe-short-right-horizontal color-1" />
					<div className="pipe-ring-short-horizontal pipe-ring-short-left-horizontal" />
					<div className="pipe-ring-short-horizontal pipe-ring-horizontal-right" />
				</div>
			</div>
		</div>
	);
};

const Vertical = ({ rotationClass, updateBoardCell, className }) => {
	return (
		<LongPipe
			className={className}
			name={Pipe.Vertical}
			updateBoardCell={updateBoardCell}
		/>
	);
};

const Horizontal = ({ updateBoardCell, className }) => {
	return (
		<LongPipe
			className={className}
			name={Pipe.Horizontal}
			rotationClass="rotate90Left"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const Elbow = ({ name, rotationClass, updateBoardCell, className }) => {
	const [{ isDragging }, dragRef] = useDrag({
		item: { type: "pipe", name },
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			console.log("dropResult:" + JSON.stringify(dropResult), item);

			if (item && dropResult) {
				updateBoardCell(dropResult.x, dropResult.y, item.name);
			}
		}
	});

	return (
		<div
			ref={dragRef}
			style={{
				opacity: isDragging ? 0.3 : 1
			}}
		>
			<div className={`${className} ${rotationClass}`}>
				<div className="pipe-set">
					<div className="pipe-short color-1" />
					<div className="pipe-ring-short pipe-ring-bottom" />
					<div className="pipe-ring-short pipe-ring-top" />
					<div className="elbow-pipe elbow-right">
						<div className="pipe elbow color-1" />
					</div>
				</div>
				<div className="pipe-set-horizontal">
					<div className="pipe-short-right-horizontal color-1" />
					<div className="pipe-ring-short-horizontal pipe-ring-short-horizontal-left" />
					<div className="pipe-ring-short-horizontal pipe-ring-horizontal-right" />
				</div>
			</div>
		</div>
	);
};

const ElbowTopRight = ({ updateBoardCell, className }) => {
	return (
		<Elbow
			className={className}
			name={Pipe.ElbowTopRight}
			updateBoardCell={updateBoardCell}
		/>
	);
};

const ElbowTopLeft = ({ updateBoardCell, className }) => {
	return (
		<Elbow
			className={className}
			name={Pipe.ElbowTopLeft}
			rotationClass="rotate90Left"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const ElbowBottomRight = ({ updateBoardCell, className }) => {
	return (
		<Elbow
			className={className}
			name={Pipe.ElbowBottomRight}
			rotationClass="rotate180Right"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const ElbowBottomLeft = ({ updateBoardCell, className }) => {
	return (
		<Elbow
			className={className}
			name={Pipe.ElbowBottomLeft}
			rotationClass="rotate270Left"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const TBottom = ({ updateBoardCell, className }) => {
	return (
		<T
			name={Pipe.TBottom}
			className={className}
			rotationClass="rotate90Right"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const TLeft = ({ updateBoardCell, className }) => {
	return (
		<T
			name={Pipe.TLeft}
			className={className}
			rotationClass="rotate180Right"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const TTop = ({ updateBoardCell, className }) => {
	return (
		<T
			name={Pipe.TTop}
			className={className}
			rotationClass="rotate90Left"
			updateBoardCell={updateBoardCell}
		/>
	);
};

const PipeComponents = {
	[Pipe.T]: T,
	[Pipe.TTop]: TTop,
	[Pipe.TLeft]: TLeft,
	[Pipe.TBottom]: TBottom,
	[Pipe.Cross]: Cross,
	[Pipe.Empty]: EmptyCell,
	[Pipe.EmptyPipe]: EmptyPipe,
	[Pipe.Vertical]: Vertical,
	[Pipe.Horizontal]: Horizontal,
	[Pipe.ElbowTopLeft]: ElbowTopLeft,
	[Pipe.ElbowTopRight]: ElbowTopRight,
	[Pipe.ElbowBottomLeft]: ElbowBottomLeft,
	[Pipe.ElbowBottomRight]: ElbowBottomRight
};

ReactDOM.render(<App />, document.getElementById("app"));
