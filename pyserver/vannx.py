# import vanna
# from vanna.remote import VannaDefault


# vn = VannaDefault(model='thelook', api_key='9b808b7dda444331939667cf888a8856')
# vn.connect_to_postgres(host='localhost', dbname='labxyz', user='postgres', password='labib7z', port='5432')

# df_information_schema = vn.run_sql("SELECT * FROM INFORMATION_SCHEMA.COLUMNS")

# # This will break up the information schema into bite-sized chunks that can be referenced by the LLM
# plan = vn.get_training_plan_generic(df_information_schema)
# # print(plan)







# # from vanna.flask import VannaFlaskApp
# # VannaFlaskApp(vn).run()


import vanna
from vanna.remote import VannaDefault
import pathlib
import textwrap

import google.generativeai as genai


# Connect gemini using api call

genai.configure(api_key='AIzaSyD72ptTa49b8mk80Hs_AyagW6-FDNNMly0')
model = genai.GenerativeModel('gemini-pro')

# Connect vanna

vn = VannaDefault(model='chinook', api_key='9b808b7dda444331939667cf888a8856')
vn.connect_to_sqlite('https://vanna.ai/Chinook.sqlite')


# Prompt from user
promt="list countries with more than 10 invoices."

# Pass to vanna
try:
    query= vn.ask(promt)


    from vanna.flask import VannaFlaskApp
    VannaFlaskApp(vn).run()

    default_prompt="Write a javascript function that uses the following query: "
    response = model.generate_content(default_prompt+query[0])
    print(response.text)
except:
    response = model.generate_content(promt)
    print(response.text)
