# Cloudinary helper functions

import asyncio
import logging
import cloudinary.uploader
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("uvicorn.error")

# Upload image 
#
# From backend to Cloudinary
async def cloudinary_upload(file: UploadFile, folder_name: str = "travel_planner") -> str:
    """
    Input: UploadFile (image)
    Output: Image URL string
    """
    try:
        loop = asyncio.get_running_loop()
        
        # Upload configuration
        options = {
            "folder": folder_name,
            "resource_type": "image",
            "transformation": [
                {"fetch_format": "auto", "quality": "auto"}
            ]
        }
        
        # Upload image and save returned information
        upload_result = await loop.run_in_executor(
            None, 
            lambda: cloudinary.uploader.upload(file.file, **options)
        )
        
        # Extract image URL
        image_url = upload_result.get("secure_url")
        if not image_url:
            raise HTTPException(status_code=500, detail="Cloudinary configuration failure.")
            
        return image_url

    except Exception as e:
        logger.error(f"Cloudinary upload connection failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cloud asset storage error: {str(e)}")
