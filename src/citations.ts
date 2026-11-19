export function hasValidCitations(
  sourceIds: unknown,
  messages: readonly { id: string }[],
): sourceIds is string[] {
  return Array.isArray(sourceIds) && sourceIds.length > 0 &&
    sourceIds.every((id: unknown) => messages.some((message) => message.id === id));
}
