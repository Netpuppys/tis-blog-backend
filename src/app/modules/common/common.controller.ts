import { v4 } from 'uuid';
import config from '../../../config';
import { s3 } from '../../../helpers/aws';
import catchAsync from '../../../shared/catchAsync';

const uploadFile = catchAsync(async (req, res) => {
  const { key } = req.body;

  const response = await s3
    .upload({
      Bucket: config.aws.bucketName as string,
      Key: key
        .split('/')
        .map((k: string, i: number) => {
          if (i === k.split('/').length) return k.split('.').join(`-${v4()}.`);
          return k;
        })
        .join('/'),
      Body: req.file?.buffer,
    })
    .promise();

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: response.Location,
  });
});

export const commonController = { uploadFile };
