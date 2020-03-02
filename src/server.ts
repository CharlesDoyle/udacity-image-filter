import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, requireAuth} from './util/util';
//import { runInNewContext } from 'vm';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // a helper function I wrote to validate a url. This function checks if
  // the url has 'http://' or 'https://' at the beginning of the string.
  function validateUrl(url: string): boolean{
    const re = /https?:\/\/.+/   // test for http(s)://
    const reObj = RegExp(re)
    return reObj.test(url)
  }

  // ** Should I create new directories and modules for a new restful endpoint?
  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  //! END @TODO1

  // req.query.image_url
  app.get("/filteredimage", requireAuth, async ( req, res ) => {
      //console.log(req.query);  
      const url = req.query.image_url;
      if ( !( url && validateUrl(url) ) ){
        return res.status(400).send({message:"Please send a good url"});
      }
      // validate the image_url query
      // await extracts the payload of the resolved promise
      try{
        // path is assigned if the promise is resolved by Jimp.read(url) finding an image
        var path = await filterImageFromURL(url);
        //console.log('path:', path);
        
      } catch(e){
        // catch a reject() from the promise in filterImageFromUrl()
        // This reject() occurs if Jimp.read(url) throws 'could not find MIME' error,
        // because the url isn't an image, or the url returns 404 not found.
        console.log('catch on server.ts:', e)
        return res.status(422).send("The url does not point to an image")
      } 
      // send response with file, and make callback when file transfer is done.
      // the arg in callback is an error object; if no error, it will be null
      res.status(200).sendFile(path, (err) => {
        if (err) { 
          return res.status(500).send("error in sending file");
        } else{
          // if err is false, the file was sent, so remove file from server
          deleteLocalFiles([path]); 
        }
      });

  });


  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();