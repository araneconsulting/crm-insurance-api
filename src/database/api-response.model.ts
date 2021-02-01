import { Document, Schema, SchemaTypes } from 'mongoose';

interface ApiResponse {
  message: string,
  data: any,
  meta: any
}

export { ApiResponse }
