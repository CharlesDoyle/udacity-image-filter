import fs from 'fs';
import Jimp = require('jimp'); // JS Image Manipulation Program
// import { reject } from 'bluebird';
//import Jimp from 'jimp';


// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
export function filterImageFromURL(inputURL: string): Promise<string>{
    return new Promise( async (resolve, reject) => {
        try{
            const photo = await Jimp.read(inputURL); // a Jimp object
            //console.log('photo', photo);
            const relpath = '/tmp/filtered.'+Math.floor(Math.random() * 2000)+'.jpg';
            const outpath = __dirname + relpath // __dirname is full path of current dir
            //__dirname is the current directory, which is .../image-filter/src/util
            // __dirname must be used in outpath because its value
            // will exist on the EB environment in the cloud, unlike hardcoding a full path.
            // filter the image by resizing, setting JPEG quality, grayscale
            //console.log('w h:', photo.bitmap.width, photo.bitmap.height); // width and height
            photo
            .resize(256, 256)
            .quality(60) 
            .greyscale() 
            .write(outpath, () => {
                resolve(outpath) // resolve() the promise and send payload back to await call
            })
            //resolve(__dirname+outpath);
            // image.write(path, callback)
        } catch(e){
            console.log('error:', e)
            reject(e) // send error msg to the server.ts catch block
        }
    });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files:Array<string>){
    for( let file of files) {
        fs.unlinkSync(file);
    }
}