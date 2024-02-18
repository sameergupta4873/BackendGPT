def postprocess(code):
    if(code[:3]=="```") :
            if code[3:5]=="js" : 
                code=code[5:-3]

            elif code[3:12]=="javascript" : 
                code=code[12:-3]
            else :
                code=code[3:-3]
            
    else : 
            code=code
    return code