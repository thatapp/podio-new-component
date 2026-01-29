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
        if (typeof item[key] === 'object') {
            if((!_.isEmpty(item[key].value) && _.isUndefined(item[key].type)) &&  _.isUndefined(item[key].currency) && _.isUndefined(item[key].city))
            {
                data[key.toString()] = item[key].value;
            }else if (!_.isEmpty(item[key].value)) {
                data[key.toString()] = item[key];
            }else if(_.isUndefined(item[key].value)){
                data[key.toString()] = item[key];
            }else{
                data[key.toString()] = item[key].value;
            }
        } else {
            var result = (item[key]).toString();
            if(!_.isEmpty(result)){
                if (result.includes(";")) {
                    data[key.toString()] = result.split(";")
                } else {
                    data[key.toString()] = item[key];
                }
            }
        }
    }
    return data;
};

exports.emitData = async (cfg,result,that,end = null) => {
    const {messages} = require('elasticio-node');

    if (cfg.splitResult && Array.isArray(result)) {
        for (const i_item of result) {
            const output = messages.newMessageWithBody(i_item);
            await that.emit('data', output);
        }
    } else {
        that.emit('data', messages.newMessageWithBody(result));
    }
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
                if(field.config.settings.multiple){
                    props.type = 'string';
                }else {
                    props.type = 'string';
                }
                break;
            case 'text':
                props.type = 'string';
                break;

            case 'state':
            case 'image':
            case 'tel':
                props.type = 'string';
                break;
            case 'date':
                props.type = 'object';
                props.properties = {
                    start_date: {
                        type: 'string',
                        required: false,
                        title: field.label + ' (Start Date)',
                        description: 'Date in YYYY-MM-DD format (e.g., 2024-03-15)'
                    },
                    start_time: {
                        type: 'string',
                        required: false,
                        title: field.label + ' (Start Time)',
                        description: 'Time in HH:MM format (e.g., 14:30). Only use if field includes time.'
                    },
                    end_date: {
                        type: 'string',
                        required: false,
                        title: field.label + ' (End Date)',
                        description: 'Date in YYYY-MM-DD format (e.g., 2024-03-16). Only use for date ranges.'
                    },
                    end_time: {
                        type: 'string',
                        required: false,
                        title: field.label + ' (End Time)',
                        description: 'Time in HH:MM format (e.g., 17:00). Only use for date ranges with time.'
                    }
                };
                break;
            case 'location':
                props.type = 'object';
                props.properties = {
                    city: getStrConf('(City)'),
                    map_in_sync: getStrConf('(Map in Sync)'),
                    country: getStrConf('(Country)'),
                    formatted: getStrConf('(Formatted)'),
                    value: getStrConf('(Value)'),
                    state: getStrConf('(State)'),
                    postal_code: getStrConf('(Postal Code)'),
                    lat: getNumConf('(Latitude)'),
                    lng: getNumConf('(Longitude)'),
                    street_address: getStrConf('(Street Address)')
                };
                break;
            case 'tag':
                props.type = 'string';
                break;
            case 'money':
                props.type = 'object';
                props.properties = {
                    currency: getStrConf('(Currency)'),
                    value: getNumConf('(Value)')
                };
                break;
            case 'embed':
                props.type = 'object';
                props.properties = {
                    embed: getStrConf('(Resolved URL)')
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
                if(field.config.settings.multiple){
                    props.properties = {
                        value: getStrConf('Item_id')
                    };
                }else {
                    props.properties = {
                        value: getNumConf('Item_id')
                    };
                }
                break;
            default:
                return undefined;
        }
        return props;
};

exports.getProperties = (fields, helper) => {
    function format(result, field) {
        const properties = helper.getFieldProperties(field,helper);
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

    itemProperties = _.extend(itemProperties, this.getProperties(app.fields,helper));
    console.log(JSON.stringify(itemProperties));
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
