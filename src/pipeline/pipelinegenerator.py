

from pipeline_utilities import bit , git ,gitl
import yaml
import sys
import json


inputs=json.loads(sys.argv[len(sys.argv)-1])

def pipelinegenerator(inputs):
    if(inputs["tool"]=="BitBucket"):
        return (bit(inputs))
    elif (inputs["tool"]=="GitHub"):
        return (git(inputs))
    elif (inputs["tool"]=="GitLab"):
        return (gitl(inputs))
    else:
        return "wrong deployment tool"

file1=open(sys.argv[1], 'w')
file1.write(pipelinegenerator(inputs))
