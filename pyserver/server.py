# FASTAPI requirements
from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated, List
import json

#other stuff
from dotenv import load_dotenv
import os
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")


# ML requirements
from test import call_gemini
from test import explain_call
from test import draft_call
from vann import handle_vann


#init APP
app = FastAPI()
origins = [
    "*"
]
#handle cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)







class ReqMod(BaseModel):
    prompt: str
    schemas: str
    inputJson: str
    outputJson: str







@app.post("/plain_gemini")
def plain_gemini(prompt: Annotated[str, Form()],
                 schemas: Annotated[str, Form()],
                 inputJson: Annotated[str, Form()] = None,
                 outputJson: Annotated[str, Form()]= None):

    #print(request)

    #prepocessing
    '''
    1. database interaction
    2. if no -> 
    
    '''

    #prompt engineering



    #postprocessing
    #print(prompt,schemas,inputJson,outputJson)
    code = call_gemini(prompt, schemas, inputJson, outputJson)
    #code = code[3:-3]

    print(code)

    return {"code" : code}

@app.post("/explain")
async def explain(prompt: Annotated[str, Form()],
                 code: Annotated[str, Form()]) : 
    explanation = explain_call(prompt, code)
    print(explanation)
    return {"explanation" : explanation}


@app.post("/drafts")
async def drafts(prompt: Annotated[str, Form()],
                 schemas: Annotated[str, Form()],
                 code : Annotated[str, Form()],
                 inputJson: Annotated[str, Form()] = None,
                 outputJson: Annotated[str, Form()] = None) : 
    

    d1 = draft_call(prompt,schemas, code, inputJson, outputJson)
    d2 = draft_call(prompt,schemas, code, inputJson, outputJson)
    
    return [d1,d2]


@app.post("/vanna")
async def vanna(prompt: Annotated[str, Form()]) : 

    response = handle_vann(prompt)
    if len(response) == 1:
        return {"code" : response[0]}
    
    return {"code" : response[0], "result" : response[1]}