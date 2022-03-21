@echo off
for /f %%i in ('aws configure get region') do set region=%%i

echo =========== 
echo Deploying cloudformation...
aws cloudformation deploy --template-file template.yml --stack-name team80-map
echo Deploying cloudformation complete 

:: Getting bucket name
for /f %%i in ('aws cloudformation describe-stacks --stack-name team80-map --query "Stacks[0].Outputs[?OutputKey==`AppBucket`].OutputValue" --output text') do set bucketName=%%i

echo.
echo =========== 
echo Uploading to s3 bucket...
call ng build --progress --aot
aws s3 sync dist/team80-map s3://%bucketName% --exclude `"*.js`" --delete
aws s3 sync dist/team80-map s3://%bucketName% --exclude `"*`" --include `"*.js`" --content-type application/javascript
echo Uploading to s3 bucket complete...

echo.
echo =========== 
echo hostname: http://%bucketName%.s3-website-%region%.amazonaws.com/

pause