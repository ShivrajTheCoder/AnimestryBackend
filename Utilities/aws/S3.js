const S3=require("aws-sdk/clients/s3")
require("dotenv").config();
const fs = require("fs");
const bucketName= process.env.AWS_BUCKET_NAME
const region= process.env.AWS_BUCKET_REGION
const access_key=process.env.AWS_ACCESSS_KEY
const secret_key=process.env.AWS_SCERET_KEY

const s3=new S3({
    region,
    access_key,
    secret_key
})

// upload

function uploadImage(file,name) {
    // Read the file from the local filesystem
    console.log(name,"form", bucketName, access_key, secret_key,region)
    const fileContent = fs.readFileSync(file.path);
  
    // Specify S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: name, // The key is the name of the file in the S3 bucket
      Body: fileContent,
      ACL: 'public-read', // Adjust the ACL based on your requirements
      ContentType: 'image/jpeg', // Adjust the content type based on your file type
    };
  
    return s3.upload(params).promise();
  }

  exports.uploadImage=uploadImage;
//download