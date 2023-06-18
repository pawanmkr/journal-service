import dotenv from 'dotenv';
import path from 'path';
import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';

dotenv.config({
  path: path.join(process.cwd(), '../../../../', '.env')
});

const connStr = process.env.AZURE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

export async function uploadAttachment(file) {
  const containerName = 'journal-attachments-for-toddle';
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const exists = await containerClient.exists();
  if (!exists) {
    console.log('Container does not exist. Creating a new container...');
    await containerClient.create();
    console.log(`Container was created successfully.\n`);
  } else {
    console.log('Container already exists.');
  }

  // const fileName = file.originalname.replace(/\.[^.]+$/, '');
  const blobName = file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const fileData = fs.readFileSync(file.path);

  await blockBlobClient.uploadData(fileData);
  return blockBlobClient;
}
