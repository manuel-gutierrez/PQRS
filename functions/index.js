const functions = require('firebase-functions');
const axios = require('axios');


// /**
//  * Responds to any HTTP request that can provide a "message" field in the body.
//  *
//  * @param {Object} req Cloud Function request context.
//  * @param {Object} res Cloud Function response context.
//  */
exports.processForm = functions.https.onRequest((request, response) => {
    let form = request.body.form_response
    response.send(getAnswers(form))
});


/**
 * Get a typeform response definition object and output an array with the ID
 * @param   {Object} formResponse Typeform form response object
 * @returns {Array} Answers a parsed array of objects with id, title, type, answer 
**/

function getAnswers(formResponse) {
    
    const fields = formResponse.definition.fields
    const answers = formResponse.answers
    
    //Parse fields into the resulting array.
    let data= fields.reduce((previous,field) => {
        console.log(field)
        previous.push({
            id : field.id,
            title:field.title,
            type:"",
            ans:"",
            }
        )
        return previous
    },[])
   
    // Parse Answers
   data.forEach(field => {
      let ans =  answers.find(answer => {
           return answer.field.id === field.id 
       })
       field.type = ans.type
       field.ans = ans[ans.type]
   });
   
   return data
}


