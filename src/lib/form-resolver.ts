import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";

export interface SchemaLike<T> {
  safeParseAsync: (
    data: unknown,
  ) => Promise<
    | { success: true; data: T }
    | {
        success: false;
        error: {
          issues: ReadonlyArray<{
            path?: ReadonlyArray<PropertyKey>;
            message?: string;
            code?: string;
          }>;
        };
      }
  >;
}

/**
 * Lightweight, native Zod resolver for React Hook Form.
 * Directly adapts any Zod schema to React Hook Form's resolver contract
 * without requiring the `@hookform/resolvers` dependency.
 */
export function zodResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: SchemaLike<TFieldValues>,
): Resolver<TFieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data as TFieldValues,
        errors: {},
      };
    }

    const errors: FieldErrors<TFieldValues> = {};

    for (const issue of result.error.issues) {
      const segments = issue.path;
      if (!segments || !segments.length) continue;

      let current = errors as Record<string, unknown>;
      for (let i = 0; i < segments.length; i++) {
        const seg = String(segments[i]);
        if (i === segments.length - 1) {
          if (!current[seg]) {
            current[seg] = {
              type: issue.code ?? "validation",
              message: issue.message ?? "Invalid value",
            };
          }
        } else {
          if (!current[seg]) {
            current[seg] = typeof segments[i + 1] === "number" ? [] : {};
          }
          current = current[seg] as Record<string, unknown>;
        }
      }
    }

    return {
      values: {} as Record<string, never>,
      errors,
    };
  };
}
