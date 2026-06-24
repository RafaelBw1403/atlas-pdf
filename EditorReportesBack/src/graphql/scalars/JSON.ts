export const JSONScalar = {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => {
        switch (ast.kind) {
            case 'StringValue':
                return JSON.parse(ast.value);
            case 'ObjectValue':
                return ast.fields.reduce((obj: any, field: any) => {
                    obj[field.name.value] = field.value.value;
                    return obj;
                }, {});
            default:
                return null;
        }
    },
};