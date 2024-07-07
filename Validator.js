class Validator {
    #schema={};
    #rules={};
    #messages={};
    #isError = false;
    #errors = {};

    constructor(schema,rules,messages) {
        this.#schema = schema;
        this.#rules = rules;
        this.#messages = messages;
        this.validate();
    }
    

    validate = () => {
        for (let field in this.#rules) {
            this.#rules[field].forEach(element => {
                const recent_error = this.#ValidationCheck(element, field);
                if (recent_error !== false) {
                    this.#errors[`${field}_${element.split(':', 2)[0]}`] = this.#messages[`${field}_${element.split(':', 2)[0]}`] || recent_error;
                    this.#isError = true;
                }
            });
        }
    }
    #ValidationCheck=(raw_key,field) => {
        const value=this.#schema[field];
        const key=raw_key.split(':',2)[0];
        let target=null;
        switch(key){
            case 'required':
                return (!this.#isNotNull(value)|| value==='')
                ?`${field} field is required`:false;
            case 'number': 
                return (this.#isNotNull(value) && typeof value!=='number')
                ?`${field} field must be type number`:false;
            case 'string':
                return (this.#isNotNull(value) && typeof value!=='string')
                ?`${field} field must be type string`:false;
            case 'boolean': 
                return (this.#isNotNull(value) && typeof value!=='boolean')
                ?`${field} field must be type boolean`:false;
            case 'array': 
                return (this.#isNotNull(value) && !Array.isArray(value))
                ?`${field} field must be an array`:false;
            case 'object':
                return (this.#isNotNull(value) && typeof value!=='object')
                ?`${field} field must be type object`:false;
            case 'url': 
                const urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
                return this.#isNotNull(value) && !(urlRegex.test(value))?`${field} field must be a valid email`:false ;
            case 'email': 
                const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return !(emailRegex.test(value))?`${field} field must be a valid email`:false ;
            case 'min':
                if(this.#isNotNull(value) && typeof value!=='number') return `${field} must be type of number to support min validator`;
                target=Number(raw_key.split(':',2)[1]);
                if(isNaN(target)) this.#errorGenerator(`${raw_key.split(':',2)[1]} is not compareable as number`);
                return this.#isNotNull(value) && (value < target) ?`${field} field must be greater than or equal to ${target}`:false;
            case 'max':
                if(this.#isNotNull(value) && typeof value!=='number') return `${field} must be type of number to support max validator`;
                target=Number(raw_key.split(':',2)[1]);
                if(isNaN(target)) this.#errorGenerator(`${raw_key.split(':',2)[1]} is not compareable as number`);
                return this.#isNotNull(value) && (value > target) ?`${field} field must be less than or equal to ${target}`:false;
            case 'minlength':
                if(this.#isNotNull(value) && !['string','array'].includes(typeof value)) return `${field} must be type of string/array to support length validator`;
                target=Number(raw_key.split(':',2)[1]);
                if(isNaN(target)) this.#errorGenerator(`${raw_key.split(':',2)[1]} is not compareable as number`);
                return (typeof value==='string' && value.length<target)?`${field} field length must be greater than or equal to ${target}`:false;      
            case 'maxlength':
                if(this.#isNotNull(value) && !['string','array'].includes(typeof value)) return `${field} must be type of string/array to support length validator`;
                target=Number(raw_key.split(':',2)[1]);
                if(isNaN(target)) this.#errorGenerator(`${raw_key.split(':',2)[1]} is not compareable as number`);
                return (typeof value==='string' && value.length>target)?`${field} field length must be less than or equal to ${target}`:false;
            case 'regex':
                if(this.#isNotNull(value) && typeof value!=='string') return `${field} must be type of string to support min validator`;
                target=raw_key.split(':').slice(1).join(':','');
                const regex_splited=target.replace('/','').split('/');
                const regex=regex_splited[0];
                const option=regex_splited[1];
                return !(new RegExp(regex,option).test(value))?`${field} field must match proper pattern`:false;
            case 'in':
                if(this.#isNotNull(value) && !['string','number','boolean'].includes(typeof value)) return `${field} must be type of string/number/boolean to support min validator`;
                target=raw_key.split(':')[1].split(',');
                let success=false;
                target.forEach(element => {
                    if(element==value) success=true;
                });
                return (!success && this.#isNotNull(value))?`${field} field must be one of ${target}`:false;
            case 'confirm':
                if(this.#isNotNull(value) && typeof value!=='string') return `${field} must be type of string to support min validator`;
                return  this.#schema[`${key}_confirm`]!==value ? `${field} field must match ${key}_confirm`:false;
            default:
                throw new Error(`${key} validation rules is not supported`);
        }
       
    };
    #isNotNull(value) {
        return value !== undefined && value !== null;
    }
    #errorGenerator(error) {
        throw new Error(error);
    }
    failed() {
        return this.#isError;
    }
    error(){
        return Object.values(this.#errors)[0];
    }
    errors() {
        return this.#errors;
    }
    getData(){
        return this.#schema;
    }
}

module.exports= Validator;