import AWS from 'aws-sdk';
import config from '../config';
AWS.config.update({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

export const s3 = new AWS.S3();
