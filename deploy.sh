#!/bin/bash
templateFile="prd-fbd-game-template.yaml"
stackName="prd-fbd-game"
region="ap-east-1"

aws cloudformation deploy \
  --template-file $templateFile \
  --stack-name $stackName \
  --region $region

outputs=$(aws cloudformation describe-stacks --stack-name $stackName --query "Stacks[0].Outputs" --region $region)
frontendBucket=$(echo $outputs | jq -r '.[] | select(.OutputKey=="S3BucketName") | .OutputValue')
aws s3 cp fdb.cmpapp.top s3://$frontendBucket --recursive