interface ISortable {
	destroy(): void;
	option(name: string, value?: any): any;
}

interface SortableOptions {
	group?: string;
	handle?: string;
	ghostClass?: string;
	draggable?: string;
	animation?: number;
	onSort?: Function;
	filter?: string;
	disabled?: boolean;
	onStart?: () => void;
	onEnd?: (e: { item: any; newINdex: number; oldIndex: number; }) => void;
}

interface SortableStatic {
    create(el: HTMLElement | Node, options?: SortableOptions): ISortable;
}

declare var Sortable: SortableStatic;