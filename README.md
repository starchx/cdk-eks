# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Required IAM permissions to run cdk deploy (wildcard used):

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "s3:*",
                "ssm:*",
                "iam:*",
                "ec2:*",
                "kms:*",
                "lambda:*",
                "states:*",
                "eks:*",
                "serverlessrepo:*",
                "autoscaling:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## These also required during the process by the dynamically created IAM roles (wildcard used):

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "logs:*",
                "sts:*",
                "ecr:*",
                "elasticloadbalancing.*"
            ],
            "Resource": "*"
        }
    ]
}
```
