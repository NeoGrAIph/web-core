export type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function deepMerge<TTarget, TSource>(target: TTarget, source: TSource): TTarget & TSource {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return source as TTarget & TSource
  }

  const output: PlainObject = { ...(target as PlainObject) }

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = (target as PlainObject)[key]

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      output[key] = deepMerge(targetValue, sourceValue)
      continue
    }

    output[key] = sourceValue
  }

  return output as TTarget & TSource
}

