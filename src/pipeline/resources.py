after=["synth","build","deploy"]
npminstall="npm i"
cdksynth="cdk synth"
pythonlang="python:3.8"
nodelang="node:12"
sam_deploy_replacements={
    "}":"",
    "{":"",
    " ":"",
    ":":"=",
    ",":" "
    }
sam_deploy_params={
    "stackname":"",
    "deploymentbucket":"--s3-bucket",
    "deploymentregion":"--region",
    "deploymentparameters":"--parameter-overrides"
    }
def steps(framework,tool):
    steps={
        "GitHub":{
            "cdk":{
                "python":{
                    "install":{
                        "run": "python -m pip3 install --upgrade pip3\npip3 install flake8 pytest\nif [ -f requirements.txt ]; then pip3 install -r requirements.txt; fi\n"
                    },
                    "language_setup":{
                                    "uses": "actions/setup-python@v2",             
                    }
                },
                "js":{
                    "install":{
                                "run": npminstall
                    },
                    "language_setup":{
                                    "uses": "actions/setup-node@v2",
                                    "with": {
                                        "node-version": "14"
                                    }
                    }
                },
                "synth":{
                    "name": "Synth stack",
                    "run": cdksynth
                    },
                "deploy":{
                    "name": "Deploy stack",
                    "run": "cdk deploy  --require-approval never"
                    }
            },
            "sam":{
                "python":{
                    "install":{
                        "name": "install dependencies",
                        "run": "python -m pip install --upgrade pip\npip install flake8 pytest\nif [ -f requirements.txt ]; then pip install -r requirements.txt; fi\n"
                    },
                    "language_setup":{
                                    "uses": "actions/setup-python@v2",
                                    
                    }
                },
                "js":{
                    "install":{
                                "name": "install dependencies",
                                "run": npminstall
                    },
                    "language_setup":{
                                    "uses": "actions/setup-node@v2",
                                    "with": {
                                        "node-version": "14"
                                    }
                    }
                },
                "build":{
                    "name": "build deployment file",
                    "run": "sam build --use-container"
                    },
                "deploy":{
                    "name": "Deploy stack",
                    "run": "sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name stackname --s3-bucket deploymentbucket --capabilities CAPABILITY_NAMED_IAM CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --region deploymentregion --parameter-overrides deploymentparameters"
                    }
            }
        },
        "BitBucket":{
            "cdk":{
                "python":{
                    "install": "python -m pip3 install --upgrade pip3\npip install flake8 pytest\nif [ -f requirements.txt ]; then pip3 install -r requirements.txt; fi\n",
                    "language_setup":nodelang
                },
                "js":{
                    "install":npminstall,
                    "language_setup":pythonlang
                },
                "synth":cdksynth,
                "deploy":"cdk deploy stackname --require-approval never"        
            },
            "sam":{
                "python":{
                    "install": "python -m pip install --upgrade pip\npip install flake8 pytest\nif [ -f requirements.txt ]; then pip install -r requirements.txt; fi\n",
                    "language_setup":pythonlang

                },
                "js":{
                    "install":npminstall,
                     "language_setup":nodelang
                    
                },
                "build":"sam build",
                "deploy": "sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name stackname --s3-bucket deploymentbucket --capabilities CAPABILITY_IAM --region deploymentregion --parameter-overrides deploymentparameters"                
            }
        },
        "GitLab":{
            "sam":{
                "python":{
                    "install": "python -m pip3 install --upgrade pip\npip3 install flake8 pytest\n pip3 install awscli --upgrade\n pip3 install aws-sam-cli --upgrade \n if [ -f requirements.txt ]; then pip install -r requirements.txt; fi\n",
                     "language_setup":pythonlang
                    

                },
                "js":{
                    "install":npminstall,
                    "language_setup":nodelang

                    
                },
                "build":"sam build",
                "deploy": "sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name stackname --s3-bucket deploymentbucket --capabilities CAPABILITY_IAM --region deploymentregion --parameter-overrides deploymentparameters"

            },
            "cdk":{
                "python":{
                    "install": "python -m pip3 install --upgrade pip3\npip install flake8 pytest\nif [ -f requirements.txt ]; then pip3 install -r requirements.txt; fi\n",
                     "language_setup":pythonlang
                },
                "js":{
                    "install":npminstall,
                    "language_setup":nodelang
                   
                },
                "synth":cdksynth,
                "deploy":"cdk deploy stackname --require-approval never"  

            }
        }
    }
    return steps[tool][framework]

def env(inputs):
    env={
    "GitHub": {
        "runs-on": "ubuntu-latest",
        "environment": "dev",
        "steps": [
            {
            "name": "Git clone the repository",
            "uses": "actions/checkout@v1"
            },
            {
            "name": "Configure aws credentials",
            "uses": "aws-actions/configure-aws-credentials@master",
            "with": {
                "aws-access-key-id": "${{ secrets.AWS_ACCESS_KEY_ID }}",
                "aws-secret-access-key": "${{ secrets.AWS_SECRET_ACCESS_KEY }}",
                "aws-region": "${{ secrets.AWS_REGION }}"
            }
            }  
        ]
    },
    "BitBucket":{
          "step": {
            "name": "Build and Package",
            "deployment": "PROD",
            "script": []
          }
    },
    "GitLab":{
            "stage": "deploy",
            "before_script": [
     
            ],
            "script": [],
            "environment": "production"
    }
    }
    
    return env[inputs]

def base(tool):
    base={
    "GitHub":{
            "name": "AWS CDK Pipeline",
            "on": {
                    "push": {"branches": ["main"]}
            },
            "jobs": {
    
            }
    },
    "BitBucket":{
            "image": nodelang,
            "pipelines": {
            "branches": {
                    "main": []
            }
            }
    },
    "GitLab":{
            "image": pythonlang,
            "stages": [],
    }
    }
    
    return base[tool]
