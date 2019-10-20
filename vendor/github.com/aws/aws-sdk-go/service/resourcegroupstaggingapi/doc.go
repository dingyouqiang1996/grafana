// Code generated by private/model/cli/gen-api/main.go. DO NOT EDIT.

// Package resourcegroupstaggingapi provides the client and types for making API
// requests to AWS Resource Groups Tagging API.
//
// This guide describes the API operations for the resource groups tagging.
//
// A tag is a label that you assign to an AWS resource. A tag consists of a
// key and a value, both of which you define. For example, if you have two Amazon
// EC2 instances, you might assign both a tag key of "Stack." But the value
// of "Stack" might be "Testing" for one and "Production" for the other.
//
// Tagging can help you organize your resources and enables you to simplify
// resource management, access management and cost allocation.
//
// You can use the resource groups tagging API operations to complete the following
// tasks:
//
//    * Tag and untag supported resources located in the specified region for
//    the AWS account
//
//    * Use tag-based filters to search for resources located in the specified
//    region for the AWS account
//
//    * List all existing tag keys in the specified region for the AWS account
//
//    * List all existing values for the specified key in the specified region
//    for the AWS account
//
// To use resource groups tagging API operations, you must add the following
// permissions to your IAM policy:
//
//    * tag:GetResources
//
//    * tag:TagResources
//
//    * tag:UntagResources
//
//    * tag:GetTagKeys
//
//    * tag:GetTagValues
//
// You'll also need permissions to access the resources of individual services
// so that you can tag and untag those resources.
//
// For more information on IAM policies, see Managing IAM Policies (http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage.html)
// in the IAM User Guide.
//
// You can use the Resource Groups Tagging API to tag resources for the following
// AWS services.
//
//    * Alexa for Business (a4b)
//
//    * API Gateway
//
//    * AWS AppStream
//
//    * AWS AppSync
//
//    * AWS App Mesh
//
//    * Amazon Athena
//
//    * Amazon Aurora
//
//    * AWS Backup
//
//    * AWS Certificate Manager
//
//    * AWS Certificate Manager Private CA
//
//    * Amazon Cloud Directory
//
//    * AWS CloudFormation
//
//    * Amazon CloudFront
//
//    * AWS CloudHSM
//
//    * AWS CloudTrail
//
//    * Amazon CloudWatch (alarms only)
//
//    * Amazon CloudWatch Events
//
//    * Amazon CloudWatch Logs
//
//    * AWS CodeBuild
//
//    * AWS CodeCommit
//
//    * AWS CodePipeline
//
//    * AWS CodeStar
//
//    * Amazon Cognito Identity
//
//    * Amazon Cognito User Pools
//
//    * Amazon Comprehend
//
//    * AWS Config
//
//    * AWS Data Pipeline
//
//    * AWS Database Migration Service
//
//    * AWS Datasync
//
//    * AWS Direct Connect
//
//    * AWS Directory Service
//
//    * Amazon DynamoDB
//
//    * Amazon EBS
//
//    * Amazon EC2
//
//    * Amazon ECR
//
//    * Amazon ECS
//
//    * AWS Elastic Beanstalk
//
//    * Amazon Elastic File System
//
//    * Elastic Load Balancing
//
//    * Amazon ElastiCache
//
//    * Amazon Elasticsearch Service
//
//    * AWS Elemental MediaLive
//
//    * AWS Elemental MediaPackage
//
//    * AWS Elemental MediaTailor
//
//    * Amazon EMR
//
//    * Amazon FSx
//
//    * Amazon Glacier
//
//    * AWS Glue
//
//    * Amazon Inspector
//
//    * AWS IoT Analytics
//
//    * AWS IoT Core
//
//    * AWS IoT Device Defender
//
//    * AWS IoT Device Management
//
//    * AWS IoT Greengrass
//
//    * AWS Key Management Service
//
//    * Amazon Kinesis
//
//    * Amazon Kinesis Data Analytics
//
//    * Amazon Kinesis Data Firehose
//
//    * AWS Lambda
//
//    * AWS License Manager
//
//    * Amazon Machine Learning
//
//    * Amazon MQ
//
//    * Amazon MSK
//
//    * Amazon Neptune
//
//    * AWS OpsWorks
//
//    * Amazon RDS
//
//    * Amazon Redshift
//
//    * AWS Resource Access Manager
//
//    * AWS Resource Groups
//
//    * AWS RoboMaker
//
//    * Amazon Route 53
//
//    * Amazon Route 53 Resolver
//
//    * Amazon S3 (buckets only)
//
//    * Amazon SageMaker
//
//    * AWS Secrets Manager
//
//    * AWS Service Catalog
//
//    * Amazon Simple Notification Service (SNS)
//
//    * Amazon Simple Queue Service (SQS)
//
//    * AWS Simple System Manager (SSM)
//
//    * AWS Step Functions
//
//    * AWS Storage Gateway
//
//    * AWS Transfer for SFTP
//
//    * Amazon VPC
//
//    * Amazon WorkSpaces
//
// See https://docs.aws.amazon.com/goto/WebAPI/resourcegroupstaggingapi-2017-01-26 for more information on this service.
//
// See resourcegroupstaggingapi package documentation for more information.
// https://docs.aws.amazon.com/sdk-for-go/api/service/resourcegroupstaggingapi/
//
// Using the Client
//
// To contact AWS Resource Groups Tagging API with the SDK use the New function to create
// a new service client. With that client you can make API requests to the service.
// These clients are safe to use concurrently.
//
// See the SDK's documentation for more information on how to use the SDK.
// https://docs.aws.amazon.com/sdk-for-go/api/
//
// See aws.Config documentation for more information on configuring SDK clients.
// https://docs.aws.amazon.com/sdk-for-go/api/aws/#Config
//
// See the AWS Resource Groups Tagging API client ResourceGroupsTaggingAPI for more
// information on creating client for this service.
// https://docs.aws.amazon.com/sdk-for-go/api/service/resourcegroupstaggingapi/#New
package resourcegroupstaggingapi
