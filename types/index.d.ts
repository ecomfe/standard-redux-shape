import {Action, Dispatch, AnyAction, Store} from 'redux';

export declare type JSONLike = string | number | object | any[];

export declare interface BasicObject {[key: string]: unknown}

export interface ErrorType {
    message: string;
    [key: string]: unknown;
}

export interface TableActionPayload {
    tableName: string;
    entities: {[key: string]: BasicObject};
}

export interface StandardAction<Payload = unknown> extends Action {
    payload: Payload;
}

export declare type TableActionShape = StandardAction<TableActionPayload>;

export declare type TableUpdatorDispatch = Dispatch<TableActionShape>;

export declare type UpdateTableActionCreator = (tableName: string, entities: {[key: string]: any}) => TableActionShape;

export interface QueryResponseShape<DataShape = unknown> {
    arrivedAt: number;
    data: DataShape;
    error: ErrorType;
}

export interface QueryResultShape<DataShape = unknown> {
    pendingMutex: number;
    response: QueryResponseShape<DataShape> | null;
    nextResponse: QueryResponseShape<DataShape> | null;
}

export interface BasicPayload<ParamsType = any> {
    arrivedAt?: number;
    params?: ParamsType;
}

export interface QueryPayload<DataType = unknown> extends BasicPayload {
    data?: DataType;
}

export interface ErrorPayload extends BasicPayload {
    error?: ErrorType;
}

export declare type UnionPayload = BasicPayload & ErrorPayload;

export declare type BasicPayloadType = string | number | unknown[] | object;

export declare type SetOfEntity<EntitiesShapeCollection> = {
    [K in keyof EntitiesShapeCollection]: EntitiesShapeCollection[K]
};

export declare type EntitySelectType<
    PayloadType = BasicPayloadType,
    ResponseType = unknown,
    SelectedShape = unknown
> = (responseData: ResponseType, payload: PayloadType) => SelectedShape;

export declare type AsyncStoreResolver<S = any, A extends Action<any> = AnyAction> = () => Promise<Store<S, A>>;

export declare type FetchProcessor<PayloadType, ResponseType> = (
    fetchFunction: (payload: PayloadType) => Promise<ResponseType>
) => (payload: PayloadType, extraArgument?: never) => Promise<ResponseType>;

declare type Merger = <MergedTable = any>(
    tableName: string,
    table: BasicObject,
    entities: BasicObject,
    defaultMerger: () => MergedTable
) => MergedTable;
