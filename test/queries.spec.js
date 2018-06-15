import {createQueryPayload, createQueryErrorPayload} from '../src';

describe('createQueryPayload', () => {
    
    test('createQueryPayload exists', () => {
        expect(createQueryPayload).not.toBeUndefined();
        expect(createQueryPayload).not.toBeNull();
    });

    test('retun correct data', () => {
        const mockParams = {p: 1, q: 2};
        const mockData = {a: 1, b: 2};
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);
        
        const mockResult = {
            arrivedAt: now,
            params: {p: 1, q: 2},
            data: {a: 1, b: 2}
        };
        
        const result = createQueryPayload(mockParams, mockData);
        
        expect(result).toEqual(mockResult);
    });
});

describe('createQueryErrorPayload', () => {
    
    test('createQueryErrorPayload exists', () => {
        expect(createQueryErrorPayload).not.toBeUndefined();
        expect(createQueryErrorPayload).not.toBeNull();
    }); 

    test('retun error data with message', () => {
        const mockParams = {p: 1, q: 2};
        const mockError = {message: 'test message'}
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);

        const mockResult = {
            arrivedAt: now,
            params: {p: 1, q: 2},
            error: {message: 'test message'}
        };

        const result = createQueryErrorPayload(mockParams, mockError);

        expect(result).toEqual(mockResult);
    });

    test('retun error data with message and other properties', () => {
        const mockParams = {p: 1, q: 2};
        const mockError = {message: 'test message', a: 1, b: 2}
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);

        const mockResult = {
            arrivedAt: now,
            params: {p: 1, q: 2},
            error: {message: 'test message', a: 1, b: 2}
        };

        const result = createQueryErrorPayload(mockParams, mockError);

        expect(result).toEqual(mockResult);
    });

    test('retun error data without message property', () => {
        const mockParams = {p: 1, q: 2};
        const mockError = {a: 1, b: 2}
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);
        
        const result = createQueryErrorPayload(mockParams, mockError);
        
        expect(result.message).toBeUndefined(); // is this expected behaviour ?
        expect(result.arrivedAt).toBe(now);
        expect(result.params).toEqual({p: 1, q: 2});
        expect(result.error.a).toBe(1);
        expect(result.error.b).toBe(2);
    });
});
