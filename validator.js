//Object `Validator`
function Validator(options) {
    
    var selectorRules = {}   //Variable save rules

    var formElement = document.querySelector(options.form); //Get element of form need validate --> Get Form-1 
    if(formElement) { // --->Check form-1 is selected?
        
        //When Submit form
        formElement.onsubmit = function(e) { 
            e.preventDefault()

            var isFormValid = true;

            //Loop each rules and validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                } 
            })
            
            if(isFormValid) {
                //Case submit with JS
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')  //Nodelist 4 elements
                    //convert Nodelist to Array
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values; 
                    }, {})  
                    
                    options.onSubmit(formValues)
                }
                //Case submit with default actions of browser
                else {
                    formElement.submit(); //default of browser
                    console.log('Error Form!')
                }
            } 
               
        }

        //Loop for each rule and handle(listen event and deal)
       options.rules.forEach(rule => {

            // Save all rules for each input
            if(Array.isArray(selectorRules[rule.selector])) { //Check Array of rules2 or not
                selectorRules[rule.selector].push(rule.test) //method() from 2nd
            } else {
                //if not array: object[key of object]: [validator.method()]
                selectorRules[rule.selector] = [rule.test];  //First method() for each input
            }
            
            var inputElement = formElement.querySelector(rule.selector) //line 14,22... ->Select #fullnam #email #password
            var errorElement = inputElement.closest('.form-group').querySelector(options.errorSelector)

            if (inputElement) {
                //Handle case blur out of input
                inputElement.onblur = function () {
                   validate(inputElement, rule)
                }

                //Hande when user typing input
                inputElement.oninput = function () {
                    inputElement.closest('.form-group').classList.remove('invalid')
                    errorElement.innerText = ''
                }
            }
       })
    }

    //Valide success or error msg
    function validate(inputElement, rule) {
        var errorElement = inputElement.closest('.form-group').querySelector(options.errorSelector)
        var errorMsg = rule.test(inputElement)

        var rules2 = selectorRules[rule.selector] //Get out all rules of selectorRules

        //Loop each rule and check
        //if have errorMsg first => stop check  
        for(let i = 0; i < rules2.length; ++i ) {
        var errorMsg = rules2[i](inputElement)
            if(errorMsg) break;
        }

        if(errorMsg) {
            inputElement.closest('.form-group').classList.add('invalid')
            errorElement.innerText = errorMsg
        } else {
            inputElement.closest('.form-group').classList.remove('invalid')
            inputElement.closest('.form-group').classList.add('success')
            errorElement.innerText = 'Valid ✅'
        }  

        return !errorMsg; //converto Boolean => check success = true
    }
}


//Defined rules (add method() to object `validator`)
//Regulation of rules:
Validator.isRequired = function (selector, msg){
    return {
        selector,
        test: function(input) {
            return input.value.trim() ? undefined : msg || 'Please fill this information!'
        },       
    }    
} 

Validator.isEmail = function (selector){
    return {
        selector,
        test: function(input) {
            let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regexEmail.test(input.value.trim()) ? undefined : 'Invalid Email!'
        }
    }
}

Validator.checkLength = function (selector, min, max){
    return {
        selector,
        test: function(input) {
            if (input.value.trim().length < min) {
                return ` ${input.name} must contain least ${min} characters!`
            }

            if (input.value.trim().length > max) {
                return `${input.name} can not exceed ${max} characters!`
            }
        },
    }
} 

Validator.checkPassword = function(selector) {
    return {
        selector,
        test: function(input) {
            let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_])(?=.{6,20}$)/
            return regexPassword.test(input.value.trim()) ? undefined: 'Password must be between 6 to 20 chars, contains at least one special char/one uppercase/an number!'
        }
    }
}

Validator.isConfirm = function (selector, getConfirm, msg){
    return {
        selector,
        test: function(input) {
            return input.value.trim() == getConfirm() ? undefined : msg || 'Do not match with value above!'
        },
    }
}
