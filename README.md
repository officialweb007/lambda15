# Testing lambda locally and automatic deployment through github

## prerequisites
> Creating an AWS account.
> Configuring AWS Identity and Access Management (IAM) permissions.
> Installing Docker. Note: Docker is a prerequisite only for testing your application locally.
> Installing Homebrew. Note: Homebrew is a prerequisite only for Linux and macOS.
> Installing the AWS SAM command line interface (CLI).

## Installation

> Note: `Installation is for linux`

Install aws-sdk
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

Configure aws
https://docs.aws.amazon.com/rekognition/latest/dg/setup-awscli-sdk.html

Install homebrew 
https://docs.brew.sh/Homebrew-on-Linux

Install aws sam cli
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-linux.html

Install docker
https://docs.docker.com/engine/install/ubuntu/

## Testing lambda locally

create template.yaml file in project directory (this file is required to run lambda locally)
```sh
sam init
```

Example of template.yaml
```sh
# This is the SAM template that represents the architecture of your serverless application
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-template-basics.html

# The AWSTemplateFormatVersion identifies the capabilities of the template
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/format-version-structure.html
AWSTemplateFormatVersion: 2010-09-09
Description: >-
  getting-list-users-to-send-on-boarding-notifications

# Transform section specifies one or more macros that AWS CloudFormation uses to process your template
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html
Transform:
- AWS::Serverless-2016-10-31

# Resources declares the AWS resources that you want to include in the stack
# https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html
Resources:
  # Each Lambda function is defined by properties:
  # https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction

  # This is a Lambda function config associated with the source code: hello-from-lambda.js
  LambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs14.x
      Architectures:
        - x86_64
      MemorySize: 128
      Timeout: 100
      Description: A Lambda function that returns a static string.
```

Invoking function with event file (function_name is same as declared in template.yaml file as a lambda function)
 ```sh
$ sam local invoke <function_name> -e event.json
```