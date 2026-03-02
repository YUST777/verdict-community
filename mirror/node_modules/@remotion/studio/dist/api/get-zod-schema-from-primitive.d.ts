import type { ZodType } from 'zod';
import type { ZodType as ZodNamespace } from '../components/get-zod-if-possible';
export declare function getZodSchemaFromPrimitive(value: unknown, z: ZodNamespace): ZodType;
