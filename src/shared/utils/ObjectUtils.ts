export class ObjectUtils {
	static isNull(v: unknown): boolean {
		return v === undefined || v === null
	}

	static cleanNullables<T extends Record<string | number | symbol, unknown>>(obj: T): T {
		return Object.keys(obj).reduce((a, b) => (ObjectUtils.isNull(obj[b]) ? a : { ...a, [b]: obj[b] }), {} as T)
	}
}
