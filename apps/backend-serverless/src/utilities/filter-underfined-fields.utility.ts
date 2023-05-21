export const filterUndefinedFields = <T extends object>(obj: T): Partial<T> => {
    const filteredObj: Partial<T> = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value !== undefined) {
                filteredObj[key] = value;
            }
        }
    }

    return filteredObj;
};
