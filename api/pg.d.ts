declare module 'pg' {
	export class Pool {
		constructor(config?: unknown);
		query(...args: any[]): Promise<any>;
	}
}
