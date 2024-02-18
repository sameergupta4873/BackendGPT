import vanna
from vanna.remote import VannaDefault
import pathlib
import textwrap

import google.generativeai as genai
from utils import postprocess


# Connect gemini using api call

genai.configure(api_key='AIzaSyD72ptTa49b8mk80Hs_AyagW6-FDNNMly0')
model = genai.GenerativeModel('gemini-pro')

# Connect vanna

vn = VannaDefault(model='chinook', api_key='9b808b7dda444331939667cf888a8856')
vn.connect_to_sqlite('https://vanna.ai/Chinook.sqlite')


# Prompt from user
# promt="list countries with more than 10 invoices."

# Pass to vanna




def handle_vann(prompt) : 
    try:
        query= vn.ask(prompt)

        default_prompt='''You are an expert in nodejs and postgresql, you have been asked to provide the code for a route for a specific task.

        ONLY PROVIDE THE CODE, NO EXPLANATION OR ANY ADDITIONAL TEXT
        

        The database is already created
        Youve to write exactly one route for the task user has asked for.
        importing of the required modules is already done for you. 
        You have to write the function for the route in nodejs using appropriate library for using postgresql.

        Think step by step
        Make sure to handle all the edge cases and provide proper error handling.
        Comment and explain each step

        The task by user is : {prompt}



        DO NOT have any words(like js, javascript) and opening and ending codeblock  ``` in the beginning or in the ending of the function, only the function code is required.

        '''


        response = model.generate_content(default_prompt+query[0])

        
        return postprocess(response.text), query[1].to_dict()
    
    except:
        print("error")
        response = model.generate_content(prompt)
        return postprocess(response.text)
    

#handle_vann("list countries with more than 10 invoices.")
    
