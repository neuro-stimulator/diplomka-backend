export type DataContainers = Record<string, DataContainer[]>;

export interface DataContainer {
  entityName: string;
  entities: Record<string, unknown>[];
  order?: number;
}
