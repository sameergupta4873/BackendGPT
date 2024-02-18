import google.generativeai as genai
import os
from dotenv import load_dotenv

from utils import postprocess
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])


prompt = f'''


    You are an expert in nodejs and mongodb, you have been asked to provide a function for a specific task.

    You've been provided with the schema of database. 
    The database is already created
    Youve to write exactly one route for the task user has asked for.
    importing of the required modules is already done for you. the schema models are also imported
    You have to write the function for the route.

    The task by user is : 

    write a javasript async function with arguments input, output using function defination provided. 
    function defination will be provided in ('' '') double quotes and all dependancies are already declared in function defination,
    function requirements are provided in (''' ''') tripple quotes and will be based on provided data sources only also ignore instructions like create api, write code, 
    create function etc in function requrements,Also ignore any programming language if mentioned, only focus on functional requirements also say 'provide proper requiremnts if functional requrements are not clear'. 
    dependancies is array of data sources, utility classes ect already defined in function defination provided and their methoda can be directly accessed, dependancies array will be provided with this prompt,data sources are 
    with data schemas,class objects, and their descriptions, class objects initialized in function defination and can be accessed through their class instance provided in dependancies, class methods are also provided 
    with their input areguments and return data type.Select relavent dependancy from array of multiple dependancies like datasource collection or utility type according to requriment given. Function requirements 
    provided input of clientId  get sum of all energy used value since start.


    'async function testFunction1(input, output) {
            try {
                let dependency0 = new MongoCollectionServices('energyConsumption', 'dcClientsEnergyConsumption');
    
            // Write your code here
    
            // your code ends here
            let response = {
                            success: 1,
                        data: output
                    }
            return response;
        } catch (e) {
                let response = {
                                success: 0,
                            message: e.message
                        }
            return response;
                }
            } ''
     Provide only code,including function defination, do not provide any explanation or any additional textthis is the depency array for functional requirements provided 


     [
          {
            "classType": "DATA_SOURCE",
         "classInstanceVariableName": "dependency0",
         "dataSource": {
              "type": "Mongodb",
           "databaseName": "energyConsumption",
           "collectionName": "dcClientsEnergyConsumption",
           "description": "this collection stores energy consumtion records of verious datacenter clients for each month",
           "schema": {
                "recordId": {
                  "type": "String",
               "description":"unique uuid"
             },
             "createdAt": {
                  "type": "Number",
               "description":"13 digit unix timestamp for createdDate"
             },
             "updatedAt": {
                  "type": "Number",
               "description":"13 digit unix timestamp for last updatedDate"
             },
             "client": {
                  "clientId": {
                    "type": "String",
                 "description":"client Id"
               },
               "clientName": {
                    "type": "String",
                 "description":"client Name"
               }
             },
             "site": {
                  "siteId": {
                    "type": "String"
               },
               "siteName": {
                    "type": "String"
               },
               "siteLocation": {
                    "type": "String"
               }
             },
             "month": {
                  "isoDate": {
                    "type": "Date"
               },
               "timestamp": {
                    "type": "Number"
               },
               "month": {
                    "type": "String"
               },
               "year": {
                    "type": "String"
               }
             },
             "energyUsed": {
                  "type": "Number",
               "description":"value of energy used in kvh"
             }
           }
         },
         "methods": [
              {
                "methodName": "getData",
             "description": "this method fetches documents from a mongodb collection",
             "inputArguments": [
                  {
                    "key": "filter",
                 "dataType": "Object",
                 "description": "this key provides find query for mongodb collection"
               },
               {
                    "key": "select",
                 "dataType": "Object",
                 "description": "this key provides document keys to include or exclude in the output"
               },
               {
                    "key": "sort",
                 "dataType": "Object",
                 "description": "this key provides sort condition for output data"
               },
               {
                    "key": "skip",
                 "dataType": "Number",
                 "description": "this key provides number of documents to skip from the outout"
               },
               {
                    "key": "limit",
                 "dataType": "Number",
                 "description": "this key provides the limit number for output"
               }
             ],
             "returnValueType": {
                  "onSuccess": "Array",
               "onFailure": "Array"
             }
           }
         ]
       }
     ]
     
'''

gc=genai.GenerationConfig(
    candidate_count=1,
)

def call_gemini(prompt, schemas, inputJson, outputJson):
    pr = f'''


    You are an expert in nodejs and mongodb, you have been asked to provide the code for a route for a specific task.

    ONLY PROVIDE THE CODE, NO EXPLANATION OR ANY ADDITIONAL TEXT

    You've been provided with the schema of database. 
    The database is already created
    Youve to write exactly one route for the task user has asked for.
    importing of the required modules is already done for you. the schema models are also imported
    You have to write the function for the route.

    Think step by step
    Make sure to handle all the edge cases and provide proper error handling.
    Comment and explain each step

    The task by user is : {prompt}


    The schema of different models given by user is : {schemas}

    DO NOT have any words(like js, javascript) and opening and ending codeblock  ``` in the beginning or in the ending of the function, only the function code is required.
'''
    response = chat.send_message(pr)
    return postprocess(response.text)

# response = model.generate_content("write a nodejs function to create a database schema in mongodb which consists of 3 collections - user_data, purchasses, sale_data ",
#                                   )

# print(response.candidates)


def explain_call(prompt, code):
    pr = f'''
    You are an expert in nodejs and mongodb, and very good at explaining code.

    You provided a code sample to the user, and now you have to explain the code to the user.

    The code you provided is : {code}

    
    The prompt of the user was : {prompt}

    Provide a line by line explanation in simple terms, providing the necessary context whereveer required
    
'''
    response = chat.send_message(pr)
    return postprocess(response.text)


def draft_call(prompt, schemas, code, inputJson, outputJson):
    pr = f'''
    You are an expert in nodejs and mongodb, and very good at drafting code.

    
    You have been asked to provide a route for a specific task.

    You've been provided with the schema of database. 
    The database is already created
    Youve to write exactly one route for the task user has asked for.
    importing of the required modules is already done for you. the schema models are also imported
    You have to write the function for the route.

    The task by user is : {prompt}


    The schema of different models given by user is : {schemas}

    You've previously created a function for the task, however the user is looking for alternatives now.
    Your taks now becomes to write an accurate, optimized alternative code for the task.
    The code you previously provided is : {code}

    Make sure to not have any words(like js, javascript) in the beginning or in the ending of the function, only the function code is required.
   
'''
    response = chat.send_message(pr)

    return postprocess(response.text)

