const _ = require('lodash');

exports.outScheme = () => {
  return {
      refId : {
          type: 'number',
          required: false,
          title: 'Ref ID'
      }
  };
};

exports.fieldTransform = (item, update = false) => {
    const data = {};
    for (const key in item) {
        if(update === true && key.toString() !== "item_id") return null;
        if (typeof item[key] === 'object') {
            if((!_.isEmpty(item[key].value) && _.isUndefined(item[key].type))  &&  _.isUndefined(item[key].currency)){
                data[key.toString()] = parseInt(item[key].value);
            }else if (!_.isEmpty(item[key].value)) {
                data[key.toString()] = item[key];
            }else if(_.isUndefined(item[key].value)){
                data[key.toString()] = item[key];
            }else{
                data[key.toString()] = item[key].value;
            }
        } else {
            data[key.toString()] = item[key];
        }
    }
    return data;
};

/**
 * https://developers.podio.com/doc/items
 * @param field Podio field config
 * @returns {title: *, required: boolean} properties
 */
exports.getFieldProperties = (field) => {
        const props = {
            required: false,
            title: field.label
        };

        function getConf(type, title, required) {
            return {
                type: type,
                required: _.isBoolean(required) ? required : props.required,
                title: field.label + ' ' + title
            };
        }

        const getStrConf = getConf.bind(null, 'string');
        const getNumConf = getConf.bind(null, 'number');

        switch (field.type.toLowerCase()) {
            case 'number':
            case 'member':
            case 'contact':
            case 'progress':
            case 'video':
            case 'duration':
            case 'question':
                props.type = 'number';
                break;
            case 'category':
            case 'text':
            case 'state':
            case 'image':
            case 'tel':
            case 'date':
            case 'location':
            case 'tag':
                props.type = 'string';
                break;
            case 'money':
                props.type = 'object';
                props.properties = {
                    value: getNumConf('(Value)'),
                    currency: getStrConf('(Currency)')
                };
                break;
            case 'embed':
                props.type = 'object';
                props.properties = {
                    embed: getNumConf('(Embed ID)'),
                    file: getNumConf('(File ID)')
                };
                break;
            case 'email':
                props.type = 'object';
                props.properties = {
                    type: getStrConf('(other|home|work)'),
                    value: getStrConf('(Email)')
                };
                break;

            case 'phone':
                props.type = 'object';
                props.properties = {
                    type: getStrConf('(mobile|work|home|main|work_fax|private|fax|other)'),
                    value: getStrConf('(Phone No)')
                };
                break;
            case 'app':
                props.type = 'object';
                props.properties = {
                    value: getStrConf('Item_id')
                };
                break;
            default:
                return undefined;
        }
        return props;
};

exports.getProperties = (fields, helper) => {
    function format(result, field) {
        const properties = helper.getFieldProperties(field);
        if (properties) {
            if(field.status === "active") {
                result[field.external_id] = properties;
            }
        }
    }
    return _(fields).transform(format, {}).value();
};

exports.proccessAll = (app, helper, itemProperties, cb, outScheme) => {
    let schema;
    let outProperties;
    if (!_.isArray(app.fields)) return cb(new Error('No fields found'));

    itemProperties = _.extend(itemProperties, helper.getProperties(app.fields,helper));

    outProperties = _.extend(outScheme, itemProperties);
    schema = {
        'in': {
            type: 'object',
            properties: itemProperties
        },
        'out': {
            type: 'object',
            properties: outProperties
        }
    };

    return cb(null, schema);
};